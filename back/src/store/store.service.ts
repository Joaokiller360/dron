import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Prisma, Product } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  DEFAULT_STORE_SETTINGS,
  StoreSettings,
  StoreSettingsDto,
  transferReady,
} from './dto/store-settings.dto';
import { PaypalService } from './paypal.service';
import { optionsOf, type ChosenOption } from './product-options';
import { PromotionsService } from '../promotions/promotions.service';
import { discountsFor, type StoreDiscount } from '../promotions/store-discounts';

const SETTINGS_KEY = 'store';

/** What an order stores per line: a snapshot, so later product edits don't change it */
export interface OrderLine {
  productId: string;
  name: string;
  /** Options the buyer picked (size, color…), already priced into unitCents */
  options?: ChosenOption[];
  /** Unit price paid (after the promotion, if any) */
  unitCents: number;
  /** Promotion applied: its title and the unit price before it */
  promotion?: string;
  listCents?: number;
  quantity: number;
}

/** What the catalog tells the browser about a promotion (no internals) */
const publicDiscount = (d: StoreDiscount) => ({
  title: d.title,
  badge: d.badge,
  type: d.type,
  value: d.value,
  endsAt: d.endsAt,
});

@Injectable()
export class StoreService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paypal: PaypalService,
    private readonly promotions: PromotionsService,
  ) {}

  // ── Settings ──────────────────────────────────────────────────────────────

  async getSettings(): Promise<StoreSettings> {
    const row = await this.prisma.siteSetting.findUnique({ where: { key: SETTINGS_KEY } });
    const saved = (row?.value ?? {}) as Partial<StoreSettings> & {
      shippingZones?: StoreSettings['shippingCities'];
    };
    // Shipping was first set per zone, with the same fields; those become cities
    const { shippingZones, ...rest } = saved;
    return {
      ...DEFAULT_STORE_SETTINGS,
      ...(shippingZones && !rest.shippingCities ? { shippingCities: shippingZones } : {}),
      ...rest,
    };
  }

  async updateSettings(dto: StoreSettingsDto) {
    // Optional fields accept null in the DTO; null must never overwrite a setting
    const patch: Partial<StoreSettings> = Object.fromEntries(
      Object.entries(dto).filter(([, v]) => v !== null && v !== undefined),
    );
    // Cities keep their id across edits; new ones get one
    if (dto.shippingCities) {
      patch.shippingCities = dto.shippingCities.map((c) => ({
        id: c.id || randomUUID().slice(0, 8),
        name: c.name.trim().replace(/\s+/g, ' '),
        priceCents: c.priceCents,
        freeFromCents: c.freeFromCents ?? null,
        deliveryTime: c.deliveryTime?.trim() ?? '',
      }));
      const names = patch.shippingCities.map((c) => c.name.toLowerCase());
      if (new Set(names).size !== names.length) {
        throw new BadRequestException('Hay ciudades repetidas en la lista de envíos');
      }
    }
    const value = { ...(await this.getSettings()), ...patch };
    await this.prisma.siteSetting.upsert({
      where: { key: SETTINGS_KEY },
      update: { value: value as Prisma.InputJsonValue },
      create: { key: SETTINGS_KEY, value: value as Prisma.InputJsonValue },
    });
    return value;
  }

  /** Checkout availability for the dashboard (secrets never leave the server) */
  paymentStatus() {
    return {
      configured: this.paypal.configured,
      mode: this.paypal.mode,
      webhook: this.paypal.webhookConfigured,
    };
  }

  /** Same as paymentStatus plus a real round trip to PayPal (for /dashboard#estado) */
  async checkPayments() {
    return {
      ...this.paymentStatus(),
      ...(await this.paypal.checkConnection()),
      checkedAt: new Date().toISOString(),
    };
  }

  /** Public payload: switches, PayPal client id and published products (none when the store is off) */
  async findPublic() {
    const all = await this.getSettings();
    // Account details only go out while transfer is offered
    const settings = {
      enabled: all.enabled,
      sales: all.sales,
      showPrices: all.showPrices,
      pausedNotice: all.pausedNotice,
      homeSection: all.homeSection,
      heroEyebrowEs: all.heroEyebrowEs,
      heroEyebrowEn: all.heroEyebrowEn,
      heroTitleEs: all.heroTitleEs,
      heroTitleEn: all.heroTitleEn,
      heroIntroEs: all.heroIntroEs,
      heroIntroEn: all.heroIntroEn,
      shippingCities: all.shippingCities,
    };
    const payments = {
      paypalClientId: this.paypal.clientId,
      currency: 'USD',
      transfer: transferReady(all)
        ? {
            bankName: all.bankName,
            accountType: all.accountType,
            accountNumber: all.accountNumber,
            accountHolder: all.accountHolder,
            holderId: all.holderId,
            email: all.transferEmail,
          }
        : null,
    };
    if (!settings.enabled) return { settings, payments, products: [] };
    const [products, discounts] = await Promise.all([
      this.prisma.product.findMany({ where: { published: true }, orderBy: { sortOrder: 'asc' } }),
      this.promotions.activeStoreDiscounts(),
    ]);
    return {
      settings,
      payments,
      products: products.map((p) => ({
        ...this.publicProduct(p, settings.showPrices),
        // Running promotions for this product; the page picks the best one per price
        discounts: discountsFor(p.id, discounts).map(publicDiscount),
      })),
    };
  }

  private publicProduct(p: Product, showPrices: boolean) {
    if (showPrices) return p;
    // Hidden prices: option extras would give them away too
    const options = optionsOf(p).map((o) => ({
      ...o,
      values: o.values.map((v) => ({ label: v.label, priceCents: null })),
    }));
    return { ...p, priceCents: null, compareAtCents: null, options };
  }

  // ── Products ──────────────────────────────────────────────────────────────

  findAllProducts() {
    return this.prisma.product.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async createProduct(dto: CreateProductDto) {
    await this.ensureSlugFree(dto.slug);
    return this.prisma.product.create({
      data: {
        ...dto,
        coverUrl: dto.coverUrl ?? '',
        specs: (dto.specs ?? []) as unknown as Prisma.InputJsonValue,
        options: (dto.options ?? []) as unknown as Prisma.InputJsonValue,
      },
    });
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    await this.ensureProduct(id);
    if (dto.slug) await this.ensureSlugFree(dto.slug, id);
    const { specs, options, ...rest } = dto;
    return this.prisma.product.update({
      where: { id },
      data: {
        ...rest,
        ...(specs ? { specs: specs as unknown as Prisma.InputJsonValue } : {}),
        ...(options ? { options: options as unknown as Prisma.InputJsonValue } : {}),
      },
    });
  }

  async removeProduct(id: string) {
    await this.ensureProduct(id);
    await this.prisma.product.delete({ where: { id } });
  }

  private async ensureProduct(id: string) {
    const found = await this.prisma.product.findUnique({ where: { id } });
    if (!found) throw new NotFoundException(`El producto ${id} no existe`);
    return found;
  }

  private async ensureSlugFree(slug: string, exceptId?: string) {
    const taken = await this.prisma.product.findUnique({ where: { slug } });
    if (taken && taken.id !== exceptId) {
      throw new ConflictException(`Ya existe un producto con el slug "${slug}"`);
    }
  }
}
