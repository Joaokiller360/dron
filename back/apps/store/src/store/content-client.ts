import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { InternalClient } from '@app/common/internal/internal-client';
import type { StoreDiscount } from '@app/common/store-discounts';

/** Shop contact shown on the site; the fallback when content can't be reached */
export interface ContactInfo {
  phone: string;
  email: string;
}
const DEFAULT_CONTACT_INFO: ContactInfo = {
  phone: '+593 98 666 0737',
  email: 'contacto@joaobarres.dev',
};

/** Contact rarely changes; emails reuse it this long */
const CONTACT_CACHE_MS = 5 * 60_000;

type WireDiscount = Omit<StoreDiscount, 'endsAt'> & { endsAt: string | null };

/** What the store reads from the content service (promotions, contact settings) */
@Injectable()
export class ContentClient {
  private readonly logger = new Logger(ContentClient.name);
  private contact?: { at: number; value: ContactInfo };

  constructor(private readonly internal: InternalClient) {}

  /**
   * Discounts running now. At checkout (strict) a failure stops the sale: the
   * buyer must never pay a price other than the one the store showed. The
   * catalog (lenient) falls back to list prices so the store stays browsable.
   */
  async activeStoreDiscounts({ strict = true } = {}): Promise<StoreDiscount[]> {
    try {
      const items = await this.internal.get<WireDiscount[]>('content', 'content/store-discounts');
      return items.map((d) => ({ ...d, endsAt: d.endsAt ? new Date(d.endsAt) : null }));
    } catch (error) {
      this.logger.error(`Promotions unavailable: ${(error as Error).message}`);
      if (strict) {
        throw new ServiceUnavailableException(
          'No pudimos confirmar los precios en este momento. Inténtalo de nuevo en unos minutos.',
        );
      }
      return [];
    }
  }

  /** Shop email/phone (cached; last known or default value if content is down) */
  async getContact(): Promise<ContactInfo> {
    if (this.contact && Date.now() - this.contact.at < CONTACT_CACHE_MS) return this.contact.value;
    try {
      const value = await this.internal.get<ContactInfo>('content', 'content/contact');
      this.contact = { at: Date.now(), value };
      return value;
    } catch (error) {
      this.logger.warn(`Contact settings unavailable: ${(error as Error).message}`);
      return this.contact?.value ?? DEFAULT_CONTACT_INFO;
    }
  }
}
