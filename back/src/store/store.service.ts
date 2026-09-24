import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
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

const SETTINGS_KEY = 'store';

/** What an order stores per line: a snapshot, so later product edits don't change it */
export interface OrderLine {
  productId: string;
  name: string;
  /** Options the buyer picked (size, color…), already priced into unitCents */
  options?: ChosenOption[];
  unitCents: number;
  quantity: number;
}

@Injectable()
export class StoreService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paypal: PaypalService,
  ) {}

  // ── Settings ──────────────────────────────────────────────────────────────

  async getSettings(): Promise<StoreSettings> {
    const row = await this.prisma.siteSetting.findUnique({ where: { key: SETTINGS_KEY } });
    return { ...DEFAULT_STORE_SETTINGS, ...((row?.value as Partial<StoreSettings>) ?? {}) };
  }

  async updateSettings(dto: StoreSettingsDto) {
    // Optional fields accept null in the DTO; null must never overwrite a setting
    const patch = Object.fromEntries(
      Object.entries(dto).filter(([, v]) => v !== null && v !== undefined),
    );
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
    const products = await this.prisma.product.findMany({
      where: { published: true },
      orderBy: { sortOrder: 'asc' },
    });
    return {
      settings,
      payments,
      products: products.map((p) => this.publicProduct(p, settings.showPrices)),
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
    if (!found) throw new NotFoundException(`Product ${id} not found`);
    return found;
  }

  private async ensureSlugFree(slug: string, exceptId?: string) {
    const taken = await this.prisma.product.findUnique({ where: { slug } });
    if (taken && taken.id !== exceptId) {
      throw new ConflictException(`Ya existe un producto con el slug "${slug}"`);
    }
  }
}
