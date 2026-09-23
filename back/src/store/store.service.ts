import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { Order, OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { DEFAULT_STORE_SETTINGS, StoreSettings, StoreSettingsDto } from './dto/store-settings.dto';

const SETTINGS_KEY = 'store';

/** What an order stores per line: a snapshot, so later product edits don't change it */
export interface OrderLine {
  productId: string;
  name: string;
  unitCents: number;
  quantity: number;
}

type Tx = Prisma.TransactionClient;

// Orders in these states hold their units out of stock
const RESERVING: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.COMPLETED,
];

const CODE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'; // no 0/O, 1/I/L
const newOrderCode = () =>
  `JB-${Array.from(randomBytes(6), (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('')}`;

const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;
const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

@Injectable()
export class StoreService {
  private readonly logger = new Logger(StoreService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly settings: SettingsService,
  ) {}

  // ── Settings ──────────────────────────────────────────────────────────────

  async getSettings(): Promise<StoreSettings> {
    const row = await this.prisma.siteSetting.findUnique({ where: { key: SETTINGS_KEY } });
    return { ...DEFAULT_STORE_SETTINGS, ...((row?.value as Partial<StoreSettings>) ?? {}) };
  }

  async updateSettings(dto: StoreSettingsDto) {
    const value = { ...(await this.getSettings()), ...dto };
    await this.prisma.siteSetting.upsert({
      where: { key: SETTINGS_KEY },
      update: { value: value as Prisma.InputJsonValue },
      create: { key: SETTINGS_KEY, value: value as Prisma.InputJsonValue },
    });
    return value;
  }

  /** Public payload: switches + published products (none when the store is off) */
  async findPublic() {
    const settings = await this.getSettings();
    if (!settings.enabled) return { settings, products: [] };
    const products = await this.prisma.product.findMany({
      where: { published: true },
      orderBy: { sortOrder: 'asc' },
    });
    return {
      settings,
      products: settings.showPrices
        ? products
        : products.map((p) => ({ ...p, priceCents: null, compareAtCents: null })),
    };
  }

  // ── Products ──────────────────────────────────────────────────────────────

  findAllProducts() {
    return this.prisma.product.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async createProduct(dto: CreateProductDto) {
    await this.ensureSlugFree(dto.slug);
    return this.prisma.product.create({ data: { ...dto, coverUrl: dto.coverUrl ?? '' } });
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    await this.ensureProduct(id);
    if (dto.slug) await this.ensureSlugFree(dto.slug, id);
    return this.prisma.product.update({ where: { id }, data: dto });
  }

  async removeProduct(id: string) {
    await this.ensureProduct(id);
    await this.prisma.product.delete({ where: { id } });
  }

  private async ensureProduct(id: string) {
    const found = await this.prisma.product.findUnique({ where: { id } });
    if (!found) throw new NotFoundException(`Product ${id} not found`);
    return found;
  }

  private async ensureSlugFree(slug: string, exceptId?: string) {
    const taken = await this.prisma.product.findUnique({ where: { slug } });
    if (taken && taken.id !== exceptId) {
      throw new ConflictException(`Ya existe un producto con el slug "${slug}"`);
    }
  }

  // ── Orders ────────────────────────────────────────────────────────────────

  /** Public checkout: validates the cart against live prices/stock and reserves units */
  async createOrder(dto: CreateOrderDto) {
    const settings = await this.getSettings();
    if (!settings.enabled || !settings.sales) {
      throw new ForbiddenException('La tienda no está aceptando pedidos en este momento');
    }

    // Merge repeated products into one line
    const wanted = new Map<string, number>();
    for (const line of dto.items) {
      wanted.set(line.productId, (wanted.get(line.productId) ?? 0) + line.quantity);
    }

    const order = await this.prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: [...wanted.keys()] }, published: true },
      });
      if (products.length !== wanted.size) {
        throw new BadRequestException('Algún producto del carrito ya no está disponible');
      }

      const lines: OrderLine[] = products.map((p) => ({
        productId: p.id,
        name: p.nameEs,
        unitCents: p.priceCents,
        quantity: wanted.get(p.id)!,
      }));
      await this.reserve(tx, lines);

      const totalCents = lines.reduce((sum, l) => sum + l.unitCents * l.quantity, 0);
      return tx.order.create({
        data: {
          code: newOrderCode(),
          name: dto.name,
          email: dto.email,
          phone: dto.phone,
          note: dto.note || null,
          locale: dto.locale ?? 'es',
          items: lines as unknown as Prisma.InputJsonValue,
          totalCents,
        },
      });
    });

    this.notifyNewOrder(order).catch((err) =>
      this.logger.error(`Order ${order.code} notification failed: ${err}`),
    );
    return { code: order.code, totalCents: order.totalCents, status: order.status };
  }

  findAllOrders(status?: OrderStatus) {
    return this.prisma.order.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Cancelling returns the units to stock; reopening a cancelled order takes them again */
  async updateOrderStatus(id: string, status: OrderStatus) {
    const order = await this.ensureOrder(id);
    const lines = order.items as unknown as OrderLine[];
    const wasReserving = RESERVING.includes(order.status);
    const willReserve = RESERVING.includes(status);

    return this.prisma.$transaction(async (tx) => {
      if (wasReserving && !willReserve) await this.release(tx, lines);
      if (!wasReserving && willReserve) await this.reserve(tx, lines);
      return tx.order.update({ where: { id }, data: { status } });
    });
  }

  /** Deleting an open order (not completed or cancelled) gives its units back */
  async removeOrder(id: string) {
    const order = await this.ensureOrder(id);
    const open = order.status === OrderStatus.PENDING || order.status === OrderStatus.CONFIRMED;
    await this.prisma.$transaction(async (tx) => {
      if (open) await this.release(tx, order.items as unknown as OrderLine[]);
      await tx.order.delete({ where: { id } });
    });
  }

  private async ensureOrder(id: string) {
    const found = await this.prisma.order.findUnique({ where: { id } });
    if (!found) throw new NotFoundException(`Order ${id} not found`);
    return found;
  }

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

  /** Emails the shop's contact address about a new order (skipped if email isn't configured) */
  private async notifyNewOrder(order: Order) {
    const { code, name, email, phone, note, totalCents } = order;
    const lines = order.items as unknown as OrderLine[];
    const apiKey = this.config.get<string>('resend.apiKey');
    const from = this.config.get<string>('resend.from');
    if (!apiKey || !from) return;
    const { email: to } = await this.settings.getContact();

    const rows = lines
      .map((l) => `${l.quantity} × ${l.name} — ${money(l.unitCents * l.quantity)}`)
      .join('\n');
    const text = `Nuevo pedido ${code}\n\n${rows}\n\nTotal: ${money(totalCents)}\n\n${name}\n${email}\n${phone}${note ? `\n\nNota: ${note}` : ''}`;
    const html = `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:#111">
<h2 style="margin:0 0 12px">Nuevo pedido ${code}</h2>
<ul style="padding-left:18px;margin:0 0 12px">${lines
      .map(
        (l) =>
          `<li>${l.quantity} × ${escapeHtml(l.name)} — ${money(l.unitCents * l.quantity)}</li>`,
      )
      .join('')}</ul>
<p style="margin:0 0 16px"><strong>Total: ${money(totalCents)}</strong></p>
<p style="margin:0">${escapeHtml(name)}<br>${escapeHtml(email)}<br>${escapeHtml(phone)}</p>
${note ? `<p style="margin:12px 0 0;white-space:pre-wrap">${escapeHtml(note)}</p>` : ''}
</div>`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `Nuevo pedido ${code}`,
        text,
        html,
      }),
    });
    if (!res.ok) throw new Error(`Resend ${res.status}`);
  }
}
