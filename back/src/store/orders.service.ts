import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { Order, OrderStatus, PaymentMethod, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateTransferOrderDto } from './dto/create-transfer-order.dto';
import { transferReady } from './dto/store-settings.dto';
import { ShipOrderDto } from './dto/ship-order.dto';
import { StoreService, OrderLine } from './store.service';
import { lineTitle, priceWithOptions } from './product-options';
import { PaypalError, PaypalOrder, PaypalService } from './paypal.service';
import { StoreMailService } from './store-mail.service';

type Tx = Prisma.TransactionClient;

const { PENDING_PAYMENT, PAID, SHIPPED, COMPLETED, CANCELLED, REFUNDED } = OrderStatus;

// Orders whose payment went through
const PAID_STATES: OrderStatus[] = [PAID, SHIPPED, COMPLETED];

/** Unpaid checkouts give their units back after this long */
const CHECKOUT_TTL_MS = 30 * 60_000;
/**
 * Reported transfers the owner hasn't confirmed are cancelled after this long,
 * so fake reports can't keep stock reserved forever
 */
const TRANSFER_TTL_MS = 72 * 60 * 60_000;
/** How often the background tasks run */
const TASK_INTERVAL_MS = 2 * 60_000;
/** Emails that keep failing stop being retried after this long */
const EMAIL_RETRY_WINDOW_MS = 3 * 24 * 60 * 60_000;

const CODE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'; // no 0/O, 1/I/L
const newOrderCode = () =>
  `JB-${Array.from(randomBytes(6), (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('')}`;

const toCents = (value?: string) => Math.round(parseFloat(value ?? 'NaN') * 100);

/** What the buyer's browser learns after approving a payment */
export type PaymentResult = 'PAID' | 'PENDING' | 'DECLINED';

/**
 * Store orders paid through PayPal.
 *
 * Checkout reserves stock and creates a PayPal order for the exact server-side
 * total; the buyer approves it in the PayPal window and the API captures it.
 * A payment only counts once PayPal's capture response (or a signature-verified
 * webhook) says COMPLETED for this order's id, amount and currency.
 *
 * Background tasks, every couple of minutes:
 * - reconcile / expire unpaid checkouts (capture approved ones, release the rest)
 * - send pending buyer emails (purchase confirmation, shipping), retrying failures
 */
@Injectable()
export class OrdersService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OrdersService.name);
  private timer?: ReturnType<typeof setInterval>;
  private running = new Set<string>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly store: StoreService,
    private readonly paypal: PaypalService,
    private readonly mail: StoreMailService,
    private readonly events: EventsService,
  ) {}

  onModuleInit() {
    if (process.env.NODE_ENV === 'test') return;
    this.timer = setInterval(() => this.runTasks(), TASK_INTERVAL_MS);
    this.timer.unref();
  }

  onModuleDestroy() {
    clearInterval(this.timer);
  }

  // ── Checkout (public) ─────────────────────────────────────────────────────

  /** Validates the cart against live prices/stock, reserves units and opens a PayPal order */
  async checkout(dto: CreateOrderDto) {
    await this.ensureSelling();
    if (!this.paypal.configured) {
      throw new ServiceUnavailableException('Los pagos no están disponibles en este momento');
    }
    const order = await this.createReserved(dto, { paymentMethod: PaymentMethod.PAYPAL });

    try {
      const pp = await this.paypal.createOrder({
        orderId: order.id,
        code: order.code,
        items: (order.items as unknown as OrderLine[]).map((l) => ({
          name: lineTitle(l.name, l.options),
          unitCents: l.unitCents,
          quantity: l.quantity,
        })),
        totalCents: order.totalCents,
      });
      await this.prisma.order.update({ where: { id: order.id }, data: { paypalOrderId: pp.id } });
      return { code: order.code, paypalOrderId: pp.id };
    } catch (err) {
      await this.cancelUnpaid(order.id);
      this.logger.error(`PayPal order for ${order.code} failed: ${err}`);
      throw new BadGatewayException('No se pudo iniciar el pago con PayPal. Inténtalo de nuevo.');
    }
  }

  /**
   * Bank transfer checkout: the buyer already transferred and reports the bank
   * and transfer code. Units stay reserved until the owner confirms the money
   * arrived (or rejects it) in the dashboard.
   */
  async checkoutTransfer(dto: CreateTransferOrderDto) {
    const settings = await this.ensureSelling();
    if (!transferReady(settings)) {
      throw new ForbiddenException('El pago por transferencia no está disponible');
    }
    const reference = dto.transferReference.trim().toUpperCase();
    const reused = await this.prisma.order.findFirst({
      where: {
        paymentMethod: PaymentMethod.TRANSFER,
        transferReference: reference,
        status: { notIn: [CANCELLED] },
      },
    });
    if (reused) {
      throw new ConflictException('Ese código de transferencia ya fue usado en otro pedido');
    }
    const order = await this.createReserved(dto, {
      paymentMethod: PaymentMethod.TRANSFER,
      transferBank: dto.transferBank.trim(),
      transferReference: reference,
    });
    this.mail
      .transferReceived(order)
      .catch((err) => this.logger.error(`Transfer email ${order.code}: ${err}`));
    return { code: order.code, status: 'VERIFYING' as const };
  }

  private async ensureSelling() {
    const settings = await this.store.getSettings();
    if (!settings.enabled || !settings.sales) {
      throw new ForbiddenException('La tienda no está aceptando pedidos en este momento');
    }
    return settings;
  }

  /** Prices the cart from the database, reserves the units and stores the order */
  private async createReserved(
    dto: CreateOrderDto,
    extra: { paymentMethod: PaymentMethod; transferBank?: string; transferReference?: string },
  ) {
    const order = await this.prisma.$transaction(async (tx) => {
      const ids = [...new Set(dto.items.map((l) => l.productId))];
      const products = await tx.product.findMany({ where: { id: { in: ids }, published: true } });
      if (products.length !== ids.length) {
        throw new BadRequestException('Algún producto del carrito ya no está disponible');
      }
      // Price every line from the database; same product + same options = one line
      const byKey = new Map<string, OrderLine>();
      for (const item of dto.items) {
        const product = products.find((p) => p.id === item.productId)!;
        const { unitCents, options } = priceWithOptions(product, item.options);
        const key = `${product.id}|${JSON.stringify(options)}`;
        const line = byKey.get(key);
        if (line) line.quantity += item.quantity;
        else
          byKey.set(key, {
            productId: product.id,
            name: product.nameEs,
            ...(options.length ? { options } : {}),
            unitCents,
            quantity: item.quantity,
          });
      }
      const lines = [...byKey.values()];
      const totalCents = lines.reduce((sum, l) => sum + l.unitCents * l.quantity, 0);
      if (totalCents <= 0) throw new BadRequestException('El total del pedido debe ser mayor a 0');
      await this.reserve(tx, lines);

      return tx.order.create({
        data: {
          code: newOrderCode(),
          name: dto.name,
          email: dto.email,
          phone: dto.phone,
          address: dto.address,
          city: dto.city,
          note: dto.note || null,
          locale: dto.locale ?? 'es',
          items: lines as unknown as Prisma.InputJsonValue,
          totalCents,
          ...extra,
        },
      });
    });
    this.events.emit('products', 'update'); // stock changed
    return order;
  }

  /** Buyer approved in PayPal: capture on the server and verify it before marking paid */
  async capture(paypalOrderId: string): Promise<{ code: string; status: PaymentResult }> {
    const order = await this.byPaypalId(paypalOrderId);
    if (order.status !== PENDING_PAYMENT) {
      if (PAID_STATES.includes(order.status)) return { code: order.code, status: 'PAID' };
      throw new ConflictException(
        'Este pedido expiró o fue cancelado. No se realizó ningún cobro.',
      );
    }

    let pp: PaypalOrder;
    try {
      pp = await this.paypal.captureOrder(paypalOrderId);
    } catch (err) {
      if (err instanceof PaypalError && err.issue === 'ORDER_ALREADY_CAPTURED') {
        pp = await this.paypal.getOrder(paypalOrderId);
      } else if (err instanceof PaypalError && err.issue === 'INSTRUMENT_DECLINED') {
        // The buyer can pick another funding source in the same PayPal window
        return { code: order.code, status: 'DECLINED' };
      } else {
        throw new BadGatewayException('PayPal no confirmó el pago. Inténtalo de nuevo.');
      }
    }
    return { code: order.code, status: await this.settle(order, pp) };
  }

  /** Buyer closed the PayPal window: release the reserved units right away */
  async cancelCheckout(paypalOrderId: string) {
    const order = await this.byPaypalId(paypalOrderId);
    if (order.status === PENDING_PAYMENT && !order.paypalCaptureId)
      await this.cancelUnpaid(order.id);
    return { code: order.code };
  }

  // ── Webhook (PayPal → API) ────────────────────────────────────────────────

  async handleWebhook(headers: Record<string, string | string[] | undefined>, event: WebhookEvent) {
    const trusted = await this.paypal.verifyWebhook(headers, event).catch(() => false);
    if (!trusted) {
      this.logger.warn(`Rejected PayPal webhook ${event?.id ?? '?'} (${event?.event_type ?? '?'})`);
      throw new UnauthorizedException('Invalid webhook signature');
    }
    // Signed by PayPal, but still only strings reach the database queries
    const raw = event.resource ?? {};
    const str = (v: unknown) => (typeof v === 'string' && v.length <= 64 ? v : undefined);
    const r = {
      id: str(raw.id),
      links: Array.isArray(raw.links)
        ? raw.links.filter((l) => typeof l?.rel === 'string' && typeof l?.href === 'string')
        : undefined,
      supplementary_data: {
        related_ids: { order_id: str(raw.supplementary_data?.related_ids?.order_id) },
      },
    };
    switch (event.event_type) {
      case 'CHECKOUT.ORDER.APPROVED': {
        // Approved but the buyer's browser never reached /capture (closed tab…)
        const order = r.id
          ? await this.prisma.order.findUnique({ where: { paypalOrderId: r.id } })
          : null;
        if (order?.status === PENDING_PAYMENT && !order.paypalCaptureId) await this.capture(r.id!);
        break;
      }
      case 'PAYMENT.CAPTURE.COMPLETED':
      case 'PAYMENT.CAPTURE.PENDING':
      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.DECLINED': {
        const paypalOrderId = r.supplementary_data?.related_ids?.order_id;
        const order = paypalOrderId
          ? await this.prisma.order.findUnique({ where: { paypalOrderId } })
          : null;
        if (order && paypalOrderId)
          await this.settle(order, await this.paypal.getOrder(paypalOrderId));
        break;
      }
      case 'PAYMENT.CAPTURE.REFUNDED':
      case 'PAYMENT.CAPTURE.REVERSED': {
        // REFUNDED carries the refund (its "up" link is the capture); REVERSED carries the capture
        const up = r.links?.find((l) => l.rel === 'up')?.href;
        const captureId =
          event.event_type === 'PAYMENT.CAPTURE.REFUNDED' ? up?.split('/').pop() : r.id;
        const order = captureId
          ? await this.prisma.order.findUnique({ where: { paypalCaptureId: captureId } })
          : null;
        if (order) await this.markRefunded(order, false);
        break;
      }
    }
    return { received: true };
  }

  // ── Admin ─────────────────────────────────────────────────────────────────

  findAll(status?: OrderStatus) {
    return this.prisma.order.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Sets carrier + tracking and emails them to the buyer (again if they change) */
  async ship(id: string, dto: ShipOrderDto) {
    const order = await this.ensure(id);
    if (order.status !== PAID && order.status !== SHIPPED) {
      throw new BadRequestException('Solo se pueden enviar pedidos pagados');
    }
    const updated = await this.prisma.order.update({
      where: { id },
      data: {
        status: SHIPPED,
        carrier: dto.carrier,
        trackingNumber: dto.trackingNumber,
        trackingUrl: dto.trackingUrl || null,
        shippedAt: order.shippedAt ?? new Date(),
        shippedEmailAt: null,
      },
    });
    this.kick('emails', () => this.sendPendingEmails());
    return updated;
  }

  /** Owner saw the transfer in the bank account: the order becomes paid (buyer is emailed) */
  async confirmTransfer(id: string) {
    const order = await this.ensure(id);
    if (order.paymentMethod !== PaymentMethod.TRANSFER || order.status !== PENDING_PAYMENT) {
      throw new BadRequestException('Solo se confirman transferencias pendientes de verificar');
    }
    await this.markPaid(order, null);
    return this.ensure(id);
  }

  /** Manual moves: delivered, or cancelling a checkout that was never paid */
  async updateStatus(id: string, status: OrderStatus) {
    const order = await this.ensure(id);
    if (status === COMPLETED && (order.status === PAID || order.status === SHIPPED)) {
      return this.prisma.order.update({ where: { id }, data: { status } });
    }
    if (status === CANCELLED && order.status === PENDING_PAYMENT && !order.paypalCaptureId) {
      await this.cancelUnpaid(id);
      if (order.paymentMethod === PaymentMethod.TRANSFER) {
        // Transfer not found in the account: tell the buyer
        this.mail
          .transferRejected(order)
          .catch((err) => this.logger.error(`Transfer rejected email ${order.code}: ${err}`));
      }
      return this.ensure(id);
    }
    throw new BadRequestException(
      order.status === PAID || order.status === SHIPPED
        ? 'Un pedido pagado se cancela con un reembolso'
        : 'Ese cambio de estado no está permitido',
    );
  }

  /** Refunds the full PayPal capture and emails the buyer */
  async refund(id: string) {
    const order = await this.ensure(id);
    if (!PAID_STATES.includes(order.status)) {
      throw new BadRequestException('Este pedido no tiene un pago para reembolsar');
    }
    // Transfers are returned by the owner from the bank; here it's only recorded
    if (order.paymentMethod === PaymentMethod.TRANSFER) return this.markRefunded(order, true);
    if (!order.paypalCaptureId) {
      throw new BadRequestException('Este pedido no tiene un pago para reembolsar');
    }
    try {
      await this.paypal.refundCapture(order.paypalCaptureId);
    } catch (err) {
      throw new BadGatewayException(
        err instanceof PaypalError
          ? `PayPal rechazó el reembolso: ${err.message}`
          : 'PayPal no respondió',
      );
    }
    return this.markRefunded(order, true);
  }

  /** Only unpaid or cancelled orders can be deleted; paid ones stay as records */
  async remove(id: string) {
    const order = await this.ensure(id);
    if (order.status !== PENDING_PAYMENT && order.status !== CANCELLED) {
      throw new BadRequestException(
        'Los pedidos pagados no se pueden borrar (quedan como registro)',
      );
    }
    if (order.status === PENDING_PAYMENT) await this.cancelUnpaid(id);
    await this.prisma.order.delete({ where: { id } });
  }

  // ── Background tasks ──────────────────────────────────────────────────────

  runTasks() {
    this.kick('checkouts', () => this.reconcileCheckouts());
    this.kick('transfers', () => this.expireTransfers());
    this.kick('emails', () => this.sendPendingEmails());
  }

  /** Runs a task unless the same one is still going; errors are logged, never thrown */
  private kick(name: string, task: () => Promise<void>) {
    if (this.running.has(name)) return;
    this.running.add(name);
    task()
      .catch((err) => this.logger.error(`Task ${name} failed: ${err}`))
      .finally(() => this.running.delete(name));
  }

  /**
   * Unpaid checkouts older than the TTL: ask PayPal what happened. Approved →
   * capture now; captured → settle; anything else → cancel and release stock.
   * Pending captures (e.g. eChecks) are re-checked until PayPal decides.
   */
  private async reconcileCheckouts() {
    const stale = await this.prisma.order.findMany({
      where: {
        status: PENDING_PAYMENT,
        paymentMethod: PaymentMethod.PAYPAL, // transfers wait for the owner
        createdAt: { lt: new Date(Date.now() - CHECKOUT_TTL_MS) },
      },
      take: 50,
    });
    for (const order of stale) {
      try {
        if (!order.paypalOrderId) {
          await this.cancelUnpaid(order.id);
          continue;
        }
        const pp = await this.paypal.getOrder(order.paypalOrderId);
        if (pp.status === 'APPROVED') await this.capture(order.paypalOrderId);
        else if (pp.status === 'COMPLETED' || order.paypalCaptureId) await this.settle(order, pp);
        else await this.cancelUnpaid(order.id);
      } catch (err) {
        // PayPal forgets abandoned orders after a while
        if (err instanceof PaypalError && err.status === 404) await this.cancelUnpaid(order.id);
        else this.logger.warn(`Could not reconcile ${order.code}: ${err}`);
      }
    }
  }

  /** Unconfirmed transfer reports older than the TTL: cancel, release stock, tell the buyer */
  private async expireTransfers() {
    const stale = await this.prisma.order.findMany({
      where: {
        status: PENDING_PAYMENT,
        paymentMethod: PaymentMethod.TRANSFER,
        createdAt: { lt: new Date(Date.now() - TRANSFER_TTL_MS) },
      },
      take: 50,
    });
    for (const order of stale) {
      await this.cancelUnpaid(order.id);
      this.logger.log(`Transfer ${order.code} expired without confirmation`);
      this.mail
        .transferRejected(order)
        .catch((err) => this.logger.error(`Transfer expired email ${order.code}: ${err}`));
    }
  }

  /** Purchase confirmations and shipping notices not yet delivered */
  private async sendPendingEmails() {
    const since = new Date(Date.now() - EMAIL_RETRY_WINDOW_MS);
    const paid = await this.prisma.order.findMany({
      where: {
        paidEmailAt: null,
        paidAt: { gt: since },
        status: { in: PAID_STATES },
      },
      take: 20,
    });
    for (const order of paid) {
      await this.mail.orderPaid(order);
      await this.prisma.order.update({
        where: { id: order.id },
        data: { paidEmailAt: new Date() },
      });
    }
    const shipped = await this.prisma.order.findMany({
      where: {
        shippedEmailAt: null,
        shippedAt: { gt: since },
        status: { in: [SHIPPED, COMPLETED] },
      },
      take: 20,
    });
    for (const order of shipped) {
      await this.mail.orderShipped(order);
      await this.prisma.order.update({
        where: { id: order.id },
        data: { shippedEmailAt: new Date() },
      });
    }
  }

  // ── Payment state ─────────────────────────────────────────────────────────

  /**
   * Applies what PayPal reports for an order. The capture must belong to this
   * order (custom_id) and match its total in USD; otherwise nothing changes.
   */
  private async settle(order: Order, pp: PaypalOrder): Promise<PaymentResult> {
    const capture = PaypalService.captureOf(pp);
    if (!capture) return 'PENDING';

    const customId = capture.custom_id ?? pp.purchase_units?.[0]?.custom_id;
    const amountOk =
      capture.amount?.currency_code === 'USD' && toCents(capture.amount.value) === order.totalCents;
    if (customId !== order.id || !amountOk) {
      this.logger.error(
        `Payment for ${order.code} does not match (custom_id=${customId}, amount=${capture.amount?.value} ${capture.amount?.currency_code})`,
      );
      return 'PENDING';
    }

    if (capture.status === 'COMPLETED') {
      await this.markPaid(order, capture.id);
      return 'PAID';
    }
    if (capture.status === 'PENDING') {
      await this.prisma.order.updateMany({
        where: { id: order.id, paypalCaptureId: null },
        data: { paypalCaptureId: capture.id },
      });
      return 'PENDING';
    }
    // DECLINED / FAILED
    await this.cancelUnpaid(order.id, true);
    return 'DECLINED';
  }

  private async markPaid(order: Order, captureId: string | null) {
    const paid = await this.prisma.$transaction(async (tx) => {
      const current = await tx.order.findUniqueOrThrow({ where: { id: order.id } });
      if (current.status === PENDING_PAYMENT) {
        await tx.order.update({
          where: { id: order.id },
          data: { status: PAID, paidAt: new Date(), paypalCaptureId: captureId },
        });
        return true;
      }
      if (current.status === CANCELLED) {
        // Money arrived for a checkout that had expired: take the units again if possible
        try {
          await this.reserve(tx, current.items as unknown as OrderLine[]);
        } catch {
          this.logger.error(
            `${order.code} was paid after expiring and stock ran out: refund or restock`,
          );
        }
        await tx.order.update({
          where: { id: order.id },
          data: { status: PAID, paidAt: new Date(), paypalCaptureId: captureId },
        });
        return true;
      }
      return false; // already paid
    });
    if (paid) {
      this.logger.log(
        `Order ${order.code} paid (${captureId ? `capture ${captureId}` : 'transfer confirmed'})`,
      );
      this.announce();
      this.kick('emails', () => this.sendPendingEmails());
    }
  }

  private async markRefunded(order: Order, notify: boolean) {
    if (order.status === REFUNDED) return order;
    const updated = await this.prisma.$transaction(async (tx) => {
      // Units that never left can be sold again
      if (order.status === PAID) await this.release(tx, order.items as unknown as OrderLine[]);
      return tx.order.update({
        where: { id: order.id },
        data: { status: REFUNDED, refundedAt: new Date() },
      });
    });
    this.announce();
    if (notify) {
      this.mail
        .orderRefunded(updated)
        .catch((err) => this.logger.error(`Refund email ${order.code}: ${err}`));
    }
    return updated;
  }

  /** Cancels an unpaid order once and gives its units back */
  private async cancelUnpaid(id: string, evenWithCapture = false) {
    const cancelled = await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.order.updateMany({
        where: {
          id,
          status: PENDING_PAYMENT,
          ...(evenWithCapture ? {} : { paypalCaptureId: null }),
        },
        data: { status: CANCELLED },
      });
      if (count === 0) return false;
      const order = await tx.order.findUniqueOrThrow({ where: { id } });
      await this.release(tx, order.items as unknown as OrderLine[]);
      return true;
    });
    if (cancelled) this.announce();
  }

  // ── Stock ─────────────────────────────────────────────────────────────────

  /** Takes units out of stock; products with unlimited stock (null) are skipped */
  private async reserve(tx: Tx, lines: OrderLine[]) {
    for (const l of lines) {
      const product = await tx.product.findUnique({ where: { id: l.productId } });
      if (!product) throw new ConflictException(`"${l.name}" ya no existe`);
      if (product.stock === null) continue;
      const { count } = await tx.product.updateMany({
        where: { id: l.productId, stock: { gte: l.quantity } },
        data: { stock: { decrement: l.quantity } },
      });
      if (count === 0) {
        throw new ConflictException(
          `No hay stock suficiente de "${product.nameEs}" (quedan ${product.stock})`,
        );
      }
    }
  }

  private async release(tx: Tx, lines: OrderLine[]) {
    for (const l of lines) {
      // Deleted products or unlimited stock: nothing to give back
      await tx.product.updateMany({
        where: { id: l.productId, stock: { not: null } },
        data: { stock: { increment: l.quantity } },
      });
    }
  }

  /** Tells the dashboard and the public store (stock) that orders changed */
  private announce() {
    this.events.emit('orders', 'update');
    this.events.emit('products', 'update');
  }

  private async ensure(id: string) {
    const found = await this.prisma.order.findUnique({ where: { id } });
    if (!found) throw new NotFoundException(`Order ${id} not found`);
    return found;
  }

  private async byPaypalId(paypalOrderId: string) {
    const found = await this.prisma.order.findUnique({ where: { paypalOrderId } });
    if (!found) throw new NotFoundException('Pedido no encontrado');
    return found;
  }
}

/** Fields of PayPal webhook events we read */
export interface WebhookEvent {
  id?: string;
  event_type?: string;
  resource?: {
    id?: string;
    status?: string;
    links?: { rel: string; href: string }[];
    supplementary_data?: { related_ids?: { order_id?: string } };
  };
}
