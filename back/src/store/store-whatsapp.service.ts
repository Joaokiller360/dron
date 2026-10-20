import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Order } from '@prisma/client';
import type { OrderLine } from './store.service';
import { lineTitle } from './product-options';
import { money } from './store-mail.service';

type BuyerNotice = 'paid' | 'shipped';
type ShopNotice = 'shopSale' | 'shopTransfer';
type Notice = BuyerNotice | ShopNotice;

/**
 * Wording of each notice; {{n}} are its values in order. Templates approved in
 * WhatsApp Manager must keep this text and variable order (see
 * WHATSAPP-TEMPLATES.md); the same text goes out as a plain message while no
 * template is configured.
 */
const COPY = {
  es: {
    freeShipping: 'Gratis',
    none: '—',
    paid: [
      'Hola {{1}}, confirmamos tu pedido {{2}} en JB.SKYLENS 🚁',
      '',
      'Productos: {{3}}',
      'Envío: {{4}}',
      'Total: {{5}}',
      'Entrega en: {{6}}',
      '',
      'Te avisaremos por aquí cuando salga, con la empresa de envío y el número de guía.',
    ],
    shipped: [
      'Tu pedido {{1}} ya fue enviado.',
      '',
      'Empresa de envío: {{2}}',
      'Número de guía: {{3}}',
      'Entrega en: {{4}}',
      'Web de rastreo: {{5}}',
      '',
      'Gracias por comprar en JB.SKYLENS.',
    ],
  },
  en: {
    freeShipping: 'Free',
    none: '—',
    paid: [
      'Hi {{1}}, your order {{2}} at JB.SKYLENS is confirmed 🚁',
      '',
      'Products: {{3}}',
      'Shipping: {{4}}',
      'Total: {{5}}',
      'Delivery to: {{6}}',
      '',
      "We'll message you here when it ships, with the carrier and tracking number.",
    ],
    shipped: [
      'Your order {{1}} has shipped.',
      '',
      'Carrier: {{2}}',
      'Tracking number: {{3}}',
      'Delivery to: {{4}}',
      'Tracking website: {{5}}',
      '',
      'Thank you for shopping at JB.SKYLENS.',
    ],
  },
};

/** Heads-ups for the shop owner (always in Spanish), same rules as the buyer notices */
const SHOP_COPY: Record<ShopNotice, string[]> = {
  shopSale: [
    '🛒 Nueva venta {{1}} por {{2}}',
    '',
    'Cliente: {{3}}',
    'Productos: {{4}}',
    'Entrega: {{5}}',
    'Pago: {{6}}',
    '',
    'Gestiónala en el dashboard (Pedidos).',
  ],
  shopTransfer: [
    '🏦 Transferencia por verificar {{1}} por {{2}}',
    '',
    'Cliente: {{3}}',
    'Transferencia: {{4}}',
    '',
    'Confírmala o recházala en el dashboard (Pedidos).',
  ],
};

/** Config key holding each notice's template name */
const TEMPLATE_KEY: Record<Notice, string> = {
  paid: 'whatsapp.templatePaid',
  shipped: 'whatsapp.templateShipped',
  shopSale: 'whatsapp.templateShopSale',
  shopTransfer: 'whatsapp.templateShopTransfer',
};

const PAYMENT_LABEL: Record<Order['paymentMethod'], string> = {
  PAYPAL: 'PayPal',
  TRANSFER: 'Transferencia',
  FREE: 'Gratis',
};

/** Fills {{1}}, {{2}}… of a notice with its values */
export const fill = (lines: string[], values: string[]) =>
  lines.join('\n').replace(/\{\{(\d+)\}\}/g, (_, n: string) => param(values[Number(n) - 1] ?? ''));

/**
 * Phone typed at checkout → WhatsApp id (country code + number, digits only).
 * "+…" / "00…" are taken as international; local numbers get the store's
 * country code (0987654321 → 593987654321). Null when it can't be a phone.
 */
export function toWaNumber(phone: string, countryCode: string) {
  const intl = /^\s*(\+|00)/.test(phone);
  let digits = phone.replace(/\D/g, '');
  if (intl) digits = digits.replace(/^00/, '');
  else if (digits.startsWith('0')) digits = countryCode + digits.slice(1);
  else if (!digits.startsWith(countryCode) || digits.length < countryCode.length + 8)
    digits = countryCode + digits;
  return digits.length >= 10 && digits.length <= 15 ? digits : null;
}

/** Template variables can't hold line breaks, tabs or long runs of spaces, nor be empty */
export function param(value: string) {
  const text = value.replace(/\s+/g, ' ').trim().slice(0, 300);
  return text || '—';
}

/**
 * Buyer notices and shop heads-ups through the WhatsApp Cloud API (skipped
 * with a warning when it isn't configured)
 */
@Injectable()
export class StoreWhatsappService {
  private readonly logger = new Logger(StoreWhatsappService.name);

  constructor(private readonly config: ConfigService) {}

  /** Payment verified: what was bought, shipping and where it goes */
  async orderPaid(order: Order) {
    await this.send(order, 'paid', [
      order.name,
      order.code,
      this.items(order),
      this.shipping(order),
      money(order.totalCents),
      this.address(order),
    ]);
  }

  /** Tells the shop about a paid order, so it can be prepared and shipped */
  async shopSale(order: Order) {
    const coupon = order.couponCode ? ` · cupón ${order.couponCode}` : '';
    const bank =
      order.paymentMethod === 'TRANSFER' && order.transferBank ? ` (${order.transferBank})` : '';
    await this.toShop(order, 'shopSale', [
      order.code,
      money(order.totalCents),
      this.buyer(order),
      this.items(order),
      `${this.address(order)} · ${this.shipping(order, COPY.es)}`,
      `${PAYMENT_LABEL[order.paymentMethod]}${bank}${coupon}`,
    ]);
  }

  /** Tells the shop a buyer reported a transfer that must be checked in the bank */
  async shopTransfer(order: Order) {
    await this.toShop(order, 'shopTransfer', [
      order.code,
      money(order.totalCents),
      this.buyer(order),
      `${order.transferBank ?? '—'} · código ${order.transferReference ?? '—'}`,
    ]);
  }

  async orderShipped(order: Order) {
    const c = this.copy(order);
    await this.send(order, 'shipped', [
      order.code,
      order.carrier ?? c.none,
      order.trackingNumber ?? c.none,
      this.address(order),
      order.trackingUrl ?? c.none,
    ]);
  }

  private copy(order: Order) {
    return order.locale === 'en' ? COPY.en : COPY.es;
  }

  private address(order: Order) {
    return `${order.address}, ${order.city}`;
  }

  private buyer(order: Order) {
    return `${order.name} · ${order.phone} · ${order.email}`;
  }

  private items(order: Order) {
    const lines = order.items as unknown as OrderLine[];
    return lines.map((l) => `${l.quantity} × ${lineTitle(l.name, l.options)}`).join(', ');
  }

  /** City and cost; orders from a store without shipping cities have none to show */
  private shipping(order: Order, c = this.copy(order)) {
    return order.shippingCity
      ? `${order.shippingCity} · ${order.shippingCents ? money(order.shippingCents) : c.freeShipping}`
      : c.none;
  }

  /** Sends a shop notice to every number in WHATSAPP_SHOP_NOTIFY_TO; one failing never stops the rest */
  private async toShop(order: Order, notice: ShopNotice, values: string[]) {
    const numbers = (this.config.get<string>('whatsapp.shopNotifyTo') ?? '')
      .split(',')
      .map((n) => n.trim())
      .filter(Boolean);
    for (const phone of numbers) {
      await this.send(order, notice, values, phone).catch((err) =>
        this.logger.warn(`WhatsApp "${notice}" for ${order.code} to the shop failed: ${err}`),
      );
    }
  }

  /**
   * Sends the notice as its approved template ({{1}}, {{2}}… filled in order)
   * or, until templates are turned on, as a plain text message. Meta
   * only delivers plain text to buyers who wrote to the shop's number in the
   * last 24 hours, so templates are needed to reach everyone.
   */
  private async send(order: Order, notice: Notice, values: string[], phone = order.phone) {
    const shop = notice === 'shopSale' || notice === 'shopTransfer';
    const template = this.config.get<boolean>('whatsapp.useTemplates')
      ? this.config.get<string>(TEMPLATE_KEY[notice])
      : undefined;
    const label = template ?? `${notice} (text)`;
    const token = this.config.get<string>('whatsapp.token');
    const phoneNumberId = this.config.get<string>('whatsapp.phoneNumberId');
    if (!token || !phoneNumberId) {
      this.logger.warn(
        `WhatsApp "${label}" for ${order.code} not sent: WHATSAPP_TOKEN / WHATSAPP_PHONE_NUMBER_ID missing`,
      );
      return;
    }
    const to = toWaNumber(phone, this.config.get<string>('whatsapp.countryCode')!);
    if (!to) {
      // Retrying won't fix a bad number; the email still goes out
      this.logger.warn(`WhatsApp "${label}" for ${order.code} not sent: invalid phone`);
      return;
    }
    const english = !shop && order.locale === 'en';
    const language = this.config.get<string>(english ? 'whatsapp.langEn' : 'whatsapp.langEs');
    const text = shop ? SHOP_COPY[notice] : this.copy(order)[notice];
    const message = template
      ? {
          type: 'template',
          template: {
            name: template,
            language: { code: language },
            components: [
              {
                type: 'body',
                parameters: values.map((v) => ({ type: 'text', text: param(v) })),
              },
            ],
          },
        }
      : { type: 'text', text: { body: fill(text, values) } };
    const version = this.config.get<string>('whatsapp.apiVersion');
    const res = await fetch(`https://graph.facebook.com/${version}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', to, ...message }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
      throw new Error(`WhatsApp ${res.status} for "${label}": ${body?.error?.message ?? '?'}`);
    }
  }
}
