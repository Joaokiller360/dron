import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Order } from '@prisma/client';
import type { OrderLine } from './store.service';
import { lineTitle } from './product-options';
import { money } from './store-mail.service';

const COPY = {
  es: { freeShipping: 'Gratis', none: '—' },
  en: { freeShipping: 'Free', none: '—' },
};

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

/** Buyer notices through the WhatsApp Cloud API (skipped with a warning when it isn't configured) */
@Injectable()
export class StoreWhatsappService {
  private readonly logger = new Logger(StoreWhatsappService.name);

  constructor(private readonly config: ConfigService) {}

  /** Payment verified: what was bought, shipping and where it goes */
  async orderPaid(order: Order) {
    const c = this.copy(order);
    const lines = order.items as unknown as OrderLine[];
    const items = lines.map((l) => `${l.quantity} × ${lineTitle(l.name, l.options)}`).join(', ');
    // Orders from a store without shipping cities have no shipping charge to show
    const shipping = order.shippingCity
      ? `${order.shippingCity} · ${order.shippingCents ? money(order.shippingCents) : c.freeShipping}`
      : c.none;
    await this.send(order, this.config.get<string>('whatsapp.templatePaid')!, [
      order.name,
      order.code,
      items,
      shipping,
      money(order.totalCents),
      this.address(order),
    ]);
  }

  async orderShipped(order: Order) {
    const c = this.copy(order);
    await this.send(order, this.config.get<string>('whatsapp.templateShipped')!, [
      order.name,
      order.code,
      order.carrier ?? c.none,
      order.trackingNumber ?? c.none,
      order.trackingUrl ?? c.none,
      this.address(order),
    ]);
  }

  private copy(order: Order) {
    return order.locale === 'en' ? COPY.en : COPY.es;
  }

  private address(order: Order) {
    return `${order.address}, ${order.city}`;
  }

  /** Sends an approved template; its body variables {{1}}, {{2}}… are filled in order */
  private async send(order: Order, template: string, values: string[]) {
    const token = this.config.get<string>('whatsapp.token');
    const phoneNumberId = this.config.get<string>('whatsapp.phoneNumberId');
    if (!token || !phoneNumberId) {
      this.logger.warn(
        `WhatsApp "${template}" for ${order.code} not sent: WHATSAPP_TOKEN / WHATSAPP_PHONE_NUMBER_ID missing`,
      );
      return;
    }
    const to = toWaNumber(order.phone, this.config.get<string>('whatsapp.countryCode')!);
    if (!to) {
      // Retrying won't fix a bad number; the email still goes out
      this.logger.warn(`WhatsApp "${template}" for ${order.code} not sent: invalid phone`);
      return;
    }
    const language = this.config.get<string>(
      order.locale === 'en' ? 'whatsapp.langEn' : 'whatsapp.langEs',
    );
    const version = this.config.get<string>('whatsapp.apiVersion');
    const res = await fetch(`https://graph.facebook.com/${version}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
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
      }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
      throw new Error(`WhatsApp ${res.status} for "${template}": ${body?.error?.message ?? '?'}`);
    }
  }
}
