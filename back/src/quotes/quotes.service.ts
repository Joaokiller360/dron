import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, Quote } from '@prisma/client';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { CreateQuoteDto, QuoteItemDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { SendQuoteEmailDto } from './dto/send-quote-email.dto';
import { AcceptQuoteDto } from './dto/accept-quote.dto';
import { RejectQuoteDto } from './dto/reject-quote.dto';

export type QuoteItem = Pick<QuoteItemDto, 'description' | 'quantity' | 'unitCents'>;

/** IVA added when the client asks for an invoice (prices are quoted without it) */
export const INVOICE_TAX_PERCENT = 15;

/** $10,000,000; with 30% tax it still fits a 32-bit cents column */
const MAX_SUBTOTAL_CENTS = 1_000_000_000;

const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;
const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const quoteCode = (number: number) => `PF-${String(number).padStart(4, '0')}`;
const lineCents = (l: QuoteItem) => Math.round(l.quantity * l.unitCents);
const formatDate = (d: Date) =>
  d.toLocaleDateString('es-EC', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

/** Totals are always computed here, never trusted from the dashboard */
function totals(items: QuoteItem[], discountCents: number, taxPercent: number) {
  const subtotalCents = items.reduce((sum, l) => sum + lineCents(l), 0);
  // Amounts are 32-bit integer columns; this cap keeps subtotal + tax inside them
  if (subtotalCents > MAX_SUBTOTAL_CENTS) {
    throw new BadRequestException(`El subtotal no puede superar ${money(MAX_SUBTOTAL_CENTS)}`);
  }
  if (discountCents > subtotalCents) {
    throw new BadRequestException('El descuento no puede ser mayor que el subtotal');
  }
  const taxCents = Math.round(((subtotalCents - discountCents) * taxPercent) / 100);
  return { subtotalCents, taxCents, totalCents: subtotalCents - discountCents + taxCents };
}

/** 144 random bits: the only key to the public page */
const newToken = () => randomBytes(18).toString('base64url');

const withCode = (q: Quote) => ({ ...q, code: quoteCode(q.number) });

/** Valid through the whole last day */
const isExpired = (q: Quote) =>
  q.validUntil ? q.validUntil.getTime() + 86_400_000 < Date.now() : false;

const LOCKED =
  'El cliente ya respondió esta proforma (aceptó o rechazó): no se puede cambiar. Crea una nueva si hace falta.';

/**
 * Fingerprint of what the client signs (who, what, how much, conditions).
 * Sending, viewing or the status don't change it; any content edit does.
 */
const contentVersion = (q: Quote) =>
  createHash('sha256')
    .update(
      JSON.stringify([
        q.clientName,
        q.clientCompany,
        q.clientTaxId,
        q.items,
        q.discountCents,
        q.taxPercent,
        q.totalCents,
        q.notes,
        q.validUntil?.toISOString() ?? null,
      ]),
    )
    .digest('base64url')
    .slice(0, 22);

/** Proformas: made in the dashboard, read by the client through a secret link */
@Injectable()
export class QuotesService {
  private readonly logger = new Logger(QuotesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly settings: SettingsService,
  ) {}

  async findAll() {
    const rows = await this.prisma.quote.findMany({ orderBy: { number: 'desc' } });
    return rows.map(withCode);
  }

  /** What the client sees at /proforma/<token>; no internal fields */
  async findPublic(token: string) {
    const q = await this.prisma.quote.findUnique({ where: { token } });
    if (!q) throw new NotFoundException('La proforma no existe');
    const contact = await this.settings.getContact();
    return {
      code: quoteCode(q.number),
      clientName: q.clientName,
      clientCompany: q.clientCompany,
      clientTaxId: q.clientTaxId,
      clientEmail: q.clientEmail,
      clientPhone: q.clientPhone,
      items: q.items,
      discountCents: q.discountCents,
      taxPercent: q.taxPercent,
      subtotalCents: q.subtotalCents,
      taxCents: q.taxCents,
      totalCents: q.totalCents,
      // Until the client answers, the total is without invoice; asking for one
      // adds IVA, and these say how much it would be
      invoiceTaxPercent: INVOICE_TAX_PERCENT,
      invoiceTotalCents: totals(
        q.items as unknown as QuoteItem[],
        q.discountCents,
        INVOICE_TAX_PERCENT,
      ).totalCents,
      notes: q.notes,
      validUntil: q.validUntil,
      expired: isExpired(q),
      status: q.status,
      acceptedAt: q.acceptedAt,
      acceptedName: q.acceptedName,
      rejectedAt: q.rejectedAt,
      rejectReason: q.rejectReason,
      invoiceRequested: q.invoiceRequested,
      invoiceName: q.invoiceName,
      invoiceTaxId: q.invoiceTaxId,
      // Sent back on accept, so the client signs exactly the version on screen
      version: contentVersion(q),
      createdAt: q.createdAt,
      contact,
    };
  }

  async create(dto: CreateQuoteDto) {
    const discountCents = dto.discountCents ?? 0;
    // Quoted without IVA; it's added on acceptance only if the client wants an invoice
    const taxPercent = 0;
    const created = await this.prisma.quote.create({
      data: {
        ...this.clientFields(dto),
        token: newToken(),
        items: dto.items as unknown as Prisma.InputJsonValue,
        discountCents,
        taxPercent,
        ...totals(dto.items, discountCents, taxPercent),
        notes: dto.notes || null,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
      },
    });
    return withCode(created);
  }

  async update(id: string, dto: UpdateQuoteDto) {
    const current = await this.ensureExists(id);
    if (current.acceptedAt || current.rejectedAt) throw new ConflictException(LOCKED);
    const items = dto.items ?? (current.items as unknown as QuoteItem[]);
    const discountCents = dto.discountCents ?? current.discountCents;
    // Open quotes are always without IVA (see create)
    const taxPercent = 0;
    const updated = await this.prisma.quote
      .update({
        // Not answered by the client in the meantime
        where: { id, acceptedAt: null, rejectedAt: null },
        data: {
          ...this.clientFields(dto),
          ...(dto.items && { items: dto.items as unknown as Prisma.InputJsonValue }),
          discountCents,
          taxPercent,
          ...totals(items, discountCents, taxPercent),
          ...(dto.notes !== undefined && { notes: dto.notes || null }),
          ...(dto.validUntil !== undefined && {
            validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
          }),
          ...(dto.status && { status: dto.status }),
        },
      })
      .catch((err: unknown) => {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
          throw new ConflictException(LOCKED);
        }
        throw err;
      });
    return withCode(updated);
  }

  /**
   * The client accepts on the public page: typed name + terms checkbox, for
   * exactly the version on screen. Only once, and not after it expired.
   */
  async accept(token: string, dto: AcceptQuoteDto, ip: string) {
    const q = await this.findOpen(token);
    const changed = new ConflictException(
      'La proforma cambió mientras la leías. Recarga la página para ver la versión actual.',
    );
    if (dto.version !== contentVersion(q)) throw changed;
    const taxPercent = dto.invoice ? INVOICE_TAX_PERCENT : 0;
    const final = totals(q.items as unknown as QuoteItem[], q.discountCents, taxPercent);
    // Conditional write: not answered twice, and not edited since it was read
    const { count } = await this.prisma.quote.updateMany({
      where: { id: q.id, acceptedAt: null, rejectedAt: null, updatedAt: q.updatedAt },
      data: {
        acceptedAt: new Date(),
        acceptedName: dto.name,
        acceptedIp: ip.slice(0, 64),
        status: 'ACCEPTED',
        taxPercent,
        ...final,
        invoiceRequested: !!dto.invoice,
        invoiceName: dto.invoice?.name ?? null,
        invoiceTaxId: dto.invoice?.taxId ?? null,
        invoiceEmail: dto.invoice?.email ?? null,
        invoiceAddress: dto.invoice?.address ?? null,
      },
    });
    if (!count) throw changed;

    this.notifyShop(
      q,
      `Proforma ${quoteCode(q.number)} ACEPTADA · ${money(final.totalCents)}`,
      `<p><strong>${esc(dto.name)}</strong> aceptó la proforma ${quoteCode(q.number)} por <strong>${money(final.totalCents)}</strong>${taxPercent ? ` (IVA ${taxPercent}% incluido)` : ''}, junto con sus condiciones y los términos y condiciones del sitio.</p>` +
        (dto.invoice
          ? `<p style="margin:16px 0 4px"><strong>Pidió factura</strong> (se emite a fin de mes):</p>
<table style="border-collapse:collapse">
<tr><td style="padding:3px 14px 3px 0;color:#555">Nombre / razón social</td><td>${esc(dto.invoice.name)}</td></tr>
<tr><td style="padding:3px 14px 3px 0;color:#555">Cédula / RUC</td><td style="font-family:monospace">${esc(dto.invoice.taxId)}</td></tr>
<tr><td style="padding:3px 14px 3px 0;color:#555">Correo</td><td>${esc(dto.invoice.email)}</td></tr>
<tr><td style="padding:3px 14px 3px 0;color:#555">Dirección</td><td>${esc(dto.invoice.address)}</td></tr>
</table>`
          : '<p>No pidió factura.</p>'),
    );
    return this.findPublic(token);
  }

  /** The client turns the quote down on the public page, optionally saying why */
  async reject(token: string, dto: RejectQuoteDto) {
    const q = await this.findOpen(token);
    const { count } = await this.prisma.quote.updateMany({
      where: { id: q.id, acceptedAt: null, rejectedAt: null },
      data: { rejectedAt: new Date(), rejectReason: dto.reason ?? null, status: 'REJECTED' },
    });
    if (!count) throw new ConflictException('Esta proforma ya fue respondida');

    this.notifyShop(
      q,
      `Proforma ${quoteCode(q.number)} RECHAZADA · ${money(q.totalCents)}`,
      `<p>El cliente rechazó la proforma ${quoteCode(q.number)} por ${money(q.totalCents)}.</p>` +
        (dto.reason
          ? `<p><strong>Motivo:</strong></p><p style="white-space:pre-wrap;padding:10px 14px;background:#f5f5f5;border-radius:8px">${esc(dto.reason)}</p>`
          : '<p>No dejó un motivo.</p>'),
    );
    return this.findPublic(token);
  }

  /**
   * The public page reports the first time it's opened in a browser (from
   * script, so link previews in WhatsApp/email don't count). Raw SQL keeps
   * updated_at, which the dashboard editor keys on.
   */
  async markViewed(token: string) {
    const q = await this.prisma.quote.findUnique({ where: { token } });
    if (!q) throw new NotFoundException('La proforma no existe');
    const first = await this.prisma.$executeRaw`
      UPDATE "quotes" SET "viewed_at" = NOW() WHERE "id" = ${q.id} AND "viewed_at" IS NULL`;
    if (first) {
      this.notifyShop(
        q,
        `Proforma ${quoteCode(q.number)} abierta por el cliente`,
        `<p>El cliente abrió la proforma ${quoteCode(q.number)} (${money(q.totalCents)}) por primera vez. Aún no la acepta ni la rechaza.</p>`,
      );
    }
  }

  /** Quote the client can still answer: exists, not answered, not expired */
  private async findOpen(token: string) {
    const q = await this.prisma.quote.findUnique({ where: { token } });
    if (!q) throw new NotFoundException('La proforma no existe');
    if (q.acceptedAt) throw new ConflictException('Esta proforma ya fue aceptada');
    if (q.rejectedAt || q.status === 'REJECTED') {
      throw new ConflictException('Esta proforma ya no está disponible');
    }
    if (isExpired(q)) {
      throw new ConflictException('Esta proforma venció. Escríbenos para actualizarla.');
    }
    return q;
  }

  /**
   * Email to the shop about something the client did. Best effort: the
   * client's action stands even if the email fails. Replies go to the client.
   */
  private notifyShop(q: Quote, subject: string, what: string) {
    void (async () => {
      const contact = await this.settings.getContact();
      const who = `${esc(q.clientName)}${q.clientCompany ? ` (${esc(q.clientCompany)})` : ''}`;
      const reach = [q.clientEmail, q.clientPhone]
        .filter((v): v is string => !!v)
        .map(esc)
        .join(' · ');
      await this.send(
        contact.email,
        subject,
        [
          `<p style="margin:0 0 4px;color:#555">Cliente: <strong style="color:#111">${who}</strong>${reach ? ` · ${reach}` : ''}</p>`,
          what,
          '<p style="margin-top:20px;color:#555">Revísala en el dashboard (Proformas).</p>',
        ].join('\n'),
        q.clientEmail || contact.email,
      );
    })().catch((err: unknown) => this.logger.warn(`Email "${subject}" not sent: ${String(err)}`));
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.quote.delete({ where: { id } });
  }

  /** Emails the quote with a link to its printable page; a draft becomes "sent" */
  async sendEmail(id: string, dto: SendQuoteEmailDto) {
    const q = await this.ensureExists(id);
    const to = dto.to || q.clientEmail;
    if (!to) throw new BadRequestException('La proforma no tiene correo del cliente');
    const link = `${this.siteOrigin(dto.origin)}/proforma/${q.token}`;
    const contact = await this.settings.getContact();
    const code = quoteCode(q.number);

    await this.send(
      to,
      `Proforma ${code} · JB.SKYLENS`,
      this.emailHtml(q, link, dto.message),
      contact.email,
    );

    const updated = await this.prisma.quote.update({
      where: { id },
      data: {
        emailedAt: new Date(),
        ...(q.status === 'DRAFT' && { status: 'SENT' }),
        // Keep the address it went to, so the next send defaults to it
        ...(!q.clientEmail && { clientEmail: to }),
      },
    });
    return withCode(updated);
  }

  /** New secret link; the old one stops working (e.g. it was forwarded to the wrong person) */
  async regenerateToken(id: string) {
    await this.ensureExists(id);
    const updated = await this.prisma.quote.update({
      where: { id },
      data: { token: newToken() },
    });
    return withCode(updated);
  }

  /** The dashboard opens WhatsApp itself; this only records that it was sent */
  async markWhatsapp(id: string) {
    const q = await this.ensureExists(id);
    const updated = await this.prisma.quote.update({
      where: { id },
      data: { whatsappAt: new Date(), ...(q.status === 'DRAFT' && { status: 'SENT' }) },
    });
    return withCode(updated);
  }

  private clientFields(dto: UpdateQuoteDto) {
    const opt = (v: string | null | undefined) => (v === undefined ? undefined : v?.trim() || null);
    return {
      ...(dto.clientName !== undefined && { clientName: dto.clientName.trim() }),
      clientCompany: opt(dto.clientCompany),
      clientTaxId: opt(dto.clientTaxId),
      clientEmail: opt(dto.clientEmail),
      clientPhone: opt(dto.clientPhone),
    } as { clientName: string } & Record<string, string | null | undefined>;
  }

  /**
   * Origin of the public link. It comes from the dashboard (dron vs dronprueba),
   * so it must be one of the site origins allowed by CORS_ORIGIN.
   */
  private siteOrigin(raw: string) {
    const origin = new URL(raw).origin;
    const allowed = process.env.CORS_ORIGIN?.split(',').map((o) => o.trim().replace(/\/$/, ''));
    if (allowed && !allowed.includes('*') && !allowed.includes(origin)) {
      throw new BadRequestException(`El sitio ${origin} no está en CORS_ORIGIN`);
    }
    return origin;
  }

  private emailHtml(q: Quote, link: string, message?: string) {
    const items = q.items as unknown as QuoteItem[];
    const row = (label: string, value: string, strong = false) =>
      `<tr><td style="padding:6px 12px 6px 0;${strong ? 'font-weight:700;border-top:1px solid #ddd' : 'color:#555'}">${label}</td><td style="padding:6px 0;text-align:right;${strong ? 'font-weight:700;border-top:1px solid #ddd' : ''}">${value}</td></tr>`;
    const lines = items
      .map(
        (l) =>
          `<tr><td style="padding:6px 12px 6px 0">${l.quantity} × ${esc(l.description)}</td><td style="padding:6px 0;text-align:right;white-space:nowrap">${money(lineCents(l))}</td></tr>`,
      )
      .join('');
    const summary = [
      row('Subtotal', money(q.subtotalCents)),
      q.discountCents ? row('Descuento', `−${money(q.discountCents)}`) : '',
      q.taxPercent ? row(`IVA ${q.taxPercent}%`, money(q.taxCents)) : '',
      row(q.acceptedAt ? 'Total' : 'Total sin factura', money(q.totalCents), true),
    ].join('');
    const withInvoice = q.acceptedAt
      ? ''
      : `<p style="margin:12px 0 0;color:#555">Si necesitas factura se suma el IVA (${INVOICE_TAX_PERCENT}%): <strong style="color:#111">${money(totals(items, q.discountCents, INVOICE_TAX_PERCENT).totalCents)}</strong>. Todas las facturas se emiten a fin de mes.</p>`;
    const valid = q.validUntil
      ? `<p style="margin:12px 0 0;color:#555">Válida hasta el ${formatDate(q.validUntil)}.</p>`
      : '';
    return [
      `<p>Hola ${esc(q.clientName)},</p>`,
      message
        ? `<p style="white-space:pre-wrap">${esc(message)}</p>`
        : '<p>Te enviamos la proforma que nos pediste. Puedes verla completa y descargarla en PDF desde el botón.</p>',
      `<p style="margin:20px 0 6px;font-weight:700">Proforma ${quoteCode(q.number)}</p>`,
      `<table style="border-collapse:collapse;width:100%;max-width:520px">${lines}${summary}</table>`,
      withInvoice,
      valid,
      `<p style="margin:24px 0"><a href="${esc(link)}" style="display:inline-block;padding:11px 20px;background:#34d17a;color:#0a1c12;border-radius:8px;font-weight:700;text-decoration:none">Ver proforma y descargar PDF</a></p>`,
      '<p style="margin:24px 0 0;color:#555">Gracias por confiar en JB.SKYLENS.<br>Si tienes dudas o quieres ajustar algo, responde a este correo.</p>',
    ].join('\n');
  }

  private async send(to: string, subject: string, body: string, replyTo: string) {
    const apiKey = this.config.get<string>('resend.apiKey');
    const from = this.config.get<string>('resend.from');
    if (!apiKey || !from) {
      throw new ServiceUnavailableException(
        'El correo no está configurado en el servidor (RESEND_API_KEY / RESEND_FROM)',
      );
    }
    const html = `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:#111">${body}</div>`;
    const text = html
      .replace(/<br>/g, '\n')
      .replace(/<\/(p|tr|table)>/g, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s+/g, '\n')
      .trim();
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], reply_to: replyTo, subject, html, text }),
    });
    if (!res.ok) {
      throw new ServiceUnavailableException(
        `El servicio de correo rechazó el envío (${res.status})`,
      );
    }
  }

  private async ensureExists(id: string) {
    const found = await this.prisma.quote.findUnique({ where: { id } });
    if (!found) throw new NotFoundException(`La proforma ${id} no existe`);
    return found;
  }
}
