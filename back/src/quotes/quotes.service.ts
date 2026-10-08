import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, Quote } from '@prisma/client';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { CreateQuoteDto, QuoteItemDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { SendQuoteEmailDto } from './dto/send-quote-email.dto';

export type QuoteItem = Pick<QuoteItemDto, 'description' | 'quantity' | 'unitCents'>;

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

/** Proformas: made in the dashboard, read by the client through a secret link */
@Injectable()
export class QuotesService {
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
      notes: q.notes,
      validUntil: q.validUntil,
      // Valid through the whole last day
      expired: q.validUntil ? q.validUntil.getTime() + 86_400_000 < Date.now() : false,
      status: q.status,
      createdAt: q.createdAt,
      contact,
    };
  }

  async create(dto: CreateQuoteDto) {
    const discountCents = dto.discountCents ?? 0;
    const taxPercent = dto.taxPercent ?? 0;
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
    const items = dto.items ?? (current.items as unknown as QuoteItem[]);
    const discountCents = dto.discountCents ?? current.discountCents;
    const taxPercent = dto.taxPercent ?? current.taxPercent;
    const updated = await this.prisma.quote.update({
      where: { id },
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
    });
    return withCode(updated);
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
      row('Total', money(q.totalCents), true),
    ].join('');
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
