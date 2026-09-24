import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Order } from '@prisma/client';
import { SettingsService } from '../settings/settings.service';
import type { OrderLine } from './store.service';
import { lineTitle } from './product-options';

const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;
const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const COPY = {
  es: {
    paidSubject: (code: string) => `Confirmamos tu compra ${code}`,
    paidIntro: (name: string) =>
      `Hola ${name}, recibimos tu pago. Estamos preparando tu pedido y te avisaremos por correo cuando salga, con la empresa de envío y el número de guía.`,
    shippedSubject: (code: string) => `Tu pedido ${code} está en camino`,
    shippedIntro: (name: string) => `Hola ${name}, tu pedido ya fue enviado.`,
    refundedSubject: (code: string) => `Reembolso de tu pedido ${code}`,
    refundedIntro: (name: string, total: string) =>
      `Hola ${name}, reembolsamos ${total} a tu cuenta de PayPal. Según tu banco, puede tardar unos días en verse.`,
    refundedTransferIntro: (name: string, total: string) =>
      `Hola ${name}, te devolvimos ${total} por transferencia bancaria a la cuenta desde la que pagaste.`,
    transferSubject: (code: string) => `Recibimos tu pedido ${code}`,
    transferIntro: (name: string) =>
      `Hola ${name}, recibimos tu pedido y los datos de tu transferencia. La verificaremos en nuestra cuenta y te confirmaremos por correo en cuanto se acredite.`,
    transferData: 'Transferencia reportada',
    rejectedSubject: (code: string) => `No pudimos verificar tu transferencia (${code})`,
    rejectedIntro: (name: string) =>
      `Hola ${name}, no encontramos tu transferencia en nuestra cuenta, así que cancelamos el pedido. Si ya transferiste, responde a este correo con el comprobante y lo revisamos.`,
    order: 'Pedido',
    shippingCost: 'Envío',
    total: 'Total',
    shipTo: 'Envío a',
    carrier: 'Empresa de envío',
    tracking: 'Número de guía',
    track: 'Rastrear envío',
    thanks: 'Gracias por comprar en JB.SKYLENS.',
    questions: 'Si tienes dudas, responde a este correo.',
  },
  en: {
    paidSubject: (code: string) => `Your purchase ${code} is confirmed`,
    paidIntro: (name: string) =>
      `Hi ${name}, we received your payment. We're preparing your order and will email you when it ships, with the carrier and tracking number.`,
    shippedSubject: (code: string) => `Your order ${code} is on its way`,
    shippedIntro: (name: string) => `Hi ${name}, your order has shipped.`,
    refundedSubject: (code: string) => `Refund for your order ${code}`,
    refundedIntro: (name: string, total: string) =>
      `Hi ${name}, we refunded ${total} to your PayPal account. Depending on your bank it may take a few days to show.`,
    refundedTransferIntro: (name: string, total: string) =>
      `Hi ${name}, we returned ${total} by bank transfer to the account you paid from.`,
    transferSubject: (code: string) => `We received your order ${code}`,
    transferIntro: (name: string) =>
      `Hi ${name}, we received your order and your transfer details. We'll check it in our account and confirm by email as soon as it clears.`,
    transferData: 'Reported transfer',
    rejectedSubject: (code: string) => `We couldn't verify your transfer (${code})`,
    rejectedIntro: (name: string) =>
      `Hi ${name}, we couldn't find your transfer in our account, so the order was cancelled. If you already paid, reply to this email with the receipt and we'll look into it.`,
    order: 'Order',
    shippingCost: 'Shipping',
    total: 'Total',
    shipTo: 'Ship to',
    carrier: 'Carrier',
    tracking: 'Tracking number',
    track: 'Track shipment',
    thanks: 'Thank you for shopping at JB.SKYLENS.',
    questions: 'If you have any questions, just reply to this email.',
  },
};

/** Store emails sent through Resend (skipped with a warning when email isn't configured) */
@Injectable()
export class StoreMailService {
  private readonly logger = new Logger(StoreMailService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly settings: SettingsService,
  ) {}

  /** Buyer receipt after the payment is verified, plus a heads-up to the shop */
  async orderPaid(order: Order) {
    const c = this.copy(order);
    await this.send(
      order.email,
      c.paidSubject(order.code),
      [`<p>${esc(c.paidIntro(order.name))}</p>`, this.summary(order), this.address(order)],
      { buyer: c },
    );
    const { email: shop } = await this.settings.getContact();
    await this.send(
      shop,
      `Nuevo pedido pagado ${order.code} — ${money(order.totalCents)}`,
      [
        `<p>${esc(order.name)} · ${esc(order.email)} · ${esc(order.phone)}</p>`,
        this.summary(order),
        this.address(order),
        order.note ? `<p style="white-space:pre-wrap">${esc(order.note)}</p>` : '',
        '<p>Cuando lo envíes, agrega la empresa y la guía en el dashboard (Pedidos).</p>',
      ],
      { replyTo: order.email },
    );
  }

  async orderShipped(order: Order) {
    const c = this.copy(order);
    const track = order.trackingUrl
      ? `<p><a href="${esc(order.trackingUrl)}" style="display:inline-block;padding:10px 18px;background:#34d17a;color:#0a1c12;border-radius:8px;font-weight:700;text-decoration:none">${c.track}</a></p>`
      : '';
    await this.send(
      order.email,
      c.shippedSubject(order.code),
      [
        `<p>${esc(c.shippedIntro(order.name))}</p>`,
        `<table style="border-collapse:collapse;margin:0 0 16px">
<tr><td style="padding:4px 16px 4px 0;color:#555">${c.carrier}</td><td style="padding:4px 0;font-weight:700">${esc(order.carrier ?? '')}</td></tr>
<tr><td style="padding:4px 16px 4px 0;color:#555">${c.tracking}</td><td style="padding:4px 0;font-weight:700;font-family:monospace">${esc(order.trackingNumber ?? '')}</td></tr>
</table>`,
        track,
        this.summary(order),
        this.address(order),
      ],
      { buyer: c },
    );
  }

  async orderRefunded(order: Order) {
    const c = this.copy(order);
    const intro = order.paymentMethod === 'TRANSFER' ? c.refundedTransferIntro : c.refundedIntro;
    await this.send(
      order.email,
      c.refundedSubject(order.code),
      [`<p>${esc(intro(order.name, money(order.totalCents)))}</p>`, this.summary(order)],
      { buyer: c },
    );
  }

  /** Buyer reported a transfer: acknowledge it, and ask the shop to check the bank */
  async transferReceived(order: Order) {
    const c = this.copy(order);
    const reported = `<p style="margin:16px 0 0;color:#555">${c.transferData}: ${esc(order.transferBank ?? '')} · ${esc(order.transferReference ?? '')}</p>`;
    await this.send(
      order.email,
      c.transferSubject(order.code),
      [
        `<p>${esc(c.transferIntro(order.name))}</p>`,
        this.summary(order),
        reported,
        this.address(order),
      ],
      { buyer: c },
    );
    const { email: shop } = await this.settings.getContact();
    await this.send(
      shop,
      `Transferencia por verificar ${order.code} — ${money(order.totalCents)}`,
      [
        `<p>${esc(order.name)} · ${esc(order.email)} · ${esc(order.phone)}</p>`,
        `<p><strong>Banco:</strong> ${esc(order.transferBank ?? '')}<br><strong>Código:</strong> ${esc(order.transferReference ?? '')}</p>`,
        this.summary(order),
        '<p>Revisa tu cuenta y confirma o rechaza el pago en el dashboard (Pedidos).</p>',
      ],
      { replyTo: order.email },
    );
  }

  async transferRejected(order: Order) {
    const c = this.copy(order);
    await this.send(
      order.email,
      c.rejectedSubject(order.code),
      [`<p>${esc(c.rejectedIntro(order.name))}</p>`, this.summary(order)],
      { buyer: c },
    );
  }

  private copy(order: Order) {
    return order.locale === 'en' ? COPY.en : COPY.es;
  }

  private summary(order: Order) {
    const c = this.copy(order);
    const lines = order.items as unknown as OrderLine[];
    const rows = lines
      .map(
        (l) =>
          `<tr><td style="padding:6px 12px 6px 0">${l.quantity} × ${esc(lineTitle(l.name, l.options))}</td><td style="padding:6px 0;text-align:right">${money(l.unitCents * l.quantity)}</td></tr>`,
      )
      .join('');
    // Orders from before zones (or a store without zones) have no shipping row
    const shipping = order.shippingZone
      ? `<tr><td style="padding:6px 12px 6px 0">${c.shippingCost} · ${esc(order.shippingZone)}</td><td style="padding:6px 0;text-align:right">${money(order.shippingCents)}</td></tr>`
      : '';
    return `<p style="margin:20px 0 6px;font-weight:700">${c.order} ${order.code}</p>
<table style="border-collapse:collapse;width:100%;max-width:460px">${rows}${shipping}
<tr><td style="padding:10px 12px 0 0;font-weight:700;border-top:1px solid #ddd">${c.total}</td><td style="padding:10px 0 0;text-align:right;font-weight:700;border-top:1px solid #ddd">${money(order.totalCents)}</td></tr></table>`;
  }

  private address(order: Order) {
    const c = this.copy(order);
    return `<p style="margin:16px 0 0;color:#555">${c.shipTo}: ${esc(order.address)}, ${esc(order.city)}</p>`;
  }

  /** `buyer` adds the thank-you footer in the buyer's language; `replyTo` defaults to the shop */
  private async send(
    to: string,
    subject: string,
    parts: string[],
    opts: { buyer?: (typeof COPY)['es']; replyTo?: string } = {},
  ) {
    const apiKey = this.config.get<string>('resend.apiKey');
    const from = this.config.get<string>('resend.from');
    if (!apiKey || !from) {
      this.logger.warn(`Email "${subject}" not sent: RESEND_API_KEY / RESEND_FROM missing`);
      return;
    }
    const footer = opts.buyer
      ? `<p style="margin:24px 0 0;color:#555">${opts.buyer.thanks}<br>${opts.buyer.questions}</p>`
      : '';
    const html = `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:#111">${parts.join('\n')}${footer}</div>`;
    const text = html
      .replace(/<br>/g, '\n')
      .replace(/<\/(p|tr|table)>/g, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s+/g, '\n')
      .trim();
    const replyAddress = opts.replyTo ?? (await this.settings.getContact()).email;
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], reply_to: replyAddress, subject, html, text }),
    });
    if (!res.ok) throw new Error(`Resend ${res.status} for "${subject}"`);
  }
}
