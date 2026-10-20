import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { StoreDiscount, toStoreDiscount } from './store-discounts';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import {
  DEFAULT_PROMOTION_SETTINGS,
  PromotionSettings,
  PromotionSettingsDto,
} from './dto/promotion-settings.dto';

const SETTINGS_KEY = 'promotions';

/** A running coupon and its limits (null = unlimited) */
export interface Coupon {
  code: string;
  discount: StoreDiscount;
  maxUses: number | null;
  maxPerCustomer: number | null;
}

/** Orders holding a use of a coupon: any not cancelled or refunded */
const usesOf = (code: string): Prisma.OrderWhereInput => ({
  couponCode: code,
  status: { notIn: [OrderStatus.CANCELLED, OrderStatus.REFUNDED] },
});

/** Phones typed differently ("+593 98…" / "098…") still match on their last 9 digits */
const phoneKey = (phone: string) => phone.replace(/\D/g, '').slice(-9);

@Injectable()
export class PromotionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings(): Promise<PromotionSettings> {
    const row = await this.prisma.siteSetting.findUnique({ where: { key: SETTINGS_KEY } });
    return { ...DEFAULT_PROMOTION_SETTINGS, ...((row?.value as Partial<PromotionSettings>) ?? {}) };
  }

  async updateSettings(dto: PromotionSettingsDto) {
    const value = { ...(await this.getSettings()), ...dto };
    await this.prisma.siteSetting.upsert({
      where: { key: SETTINGS_KEY },
      update: { value: value as Prisma.InputJsonValue },
      create: { key: SETTINGS_KEY, value: value as Prisma.InputJsonValue },
    });
    return value;
  }

  /**
   * Public payload: switches + active, non-expired offers (empty when the
   * module is off). Coupon codes stay secret: buyers only learn them from the shop.
   */
  async findPublic() {
    const settings = await this.getSettings();
    if (!settings.enabled) return { settings, items: [] };
    const items = await this.prisma.promotion.findMany({
      where: { active: true, OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }] },
      orderBy: { sortOrder: 'asc' },
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return { settings, items: items.map(({ couponCode, ...item }) => item) };
  }

  /**
   * Discounts running now for everyone (module and store switch on, active,
   * not expired); coupons only apply once typed, see couponDiscount
   */
  async activeStoreDiscounts(): Promise<StoreDiscount[]> {
    const settings = await this.getSettings();
    if (!settings.enabled || !settings.store) return [];
    const items = await this.prisma.promotion.findMany({
      where: {
        active: true,
        discountType: { not: null },
        couponCode: null,
        OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }],
      },
      orderBy: { sortOrder: 'asc' },
    });
    return items.map(toStoreDiscount).filter((d): d is StoreDiscount => d !== null);
  }

  /** The coupon behind a code, while it runs under the same rules as other discounts; null otherwise */
  async findCoupon(code: string): Promise<Coupon | null> {
    const settings = await this.getSettings();
    if (!settings.enabled || !settings.store) return null;
    const promotion = await this.prisma.promotion.findFirst({
      where: {
        couponCode: code,
        active: true,
        discountType: { not: null },
        OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }],
      },
    });
    const discount = promotion && toStoreDiscount(promotion);
    return discount
      ? {
          code,
          discount,
          maxUses: promotion.couponMaxUses,
          maxPerCustomer: promotion.couponMaxPerCustomer,
        }
      : null;
  }

  /**
   * Throws when the coupon has no uses left, in total or for this buyer (same
   * email, or same phone on its last 9 digits). Inside an order transaction it
   * first locks the promotion, so concurrent checkouts can't both take the
   * last use; the order must be created in that same transaction.
   */
  async assertCouponAvailable(
    coupon: Coupon,
    buyer?: { email: string; phone: string },
    tx?: Prisma.TransactionClient,
  ) {
    if (coupon.maxUses === null && (coupon.maxPerCustomer === null || !buyer)) return;
    const db = tx ?? this.prisma;
    if (tx) {
      await tx.$queryRaw`SELECT 1 FROM "promotions" WHERE "id" = ${coupon.discount.promotionId} FOR UPDATE`;
    }
    if (
      coupon.maxUses !== null &&
      (await db.order.count({ where: usesOf(coupon.code) })) >= coupon.maxUses
    ) {
      throw new ConflictException('Este cupón ya alcanzó su límite de usos');
    }
    if (coupon.maxPerCustomer === null || !buyer) return;
    const email = buyer.email.trim();
    const phone = phoneKey(buyer.phone);
    const candidates = await db.order.findMany({
      where: {
        ...usesOf(coupon.code),
        OR: [
          { email: { equals: email, mode: 'insensitive' } },
          ...(phone.length >= 7 ? [{ phone: { endsWith: phone.slice(-4) } }] : []),
        ],
      },
      select: { email: true, phone: true },
    });
    const used = candidates.filter(
      (o) =>
        o.email.trim().toLowerCase() === email.toLowerCase() ||
        (phone.length >= 7 && phoneKey(o.phone) === phone),
    ).length;
    if (used >= coupon.maxPerCustomer) {
      throw new ConflictException(
        coupon.maxPerCustomer === 1
          ? 'Ya usaste este cupón'
          : `Ya usaste este cupón ${coupon.maxPerCustomer} veces, el máximo permitido`,
      );
    }
  }

  /**
   * Pauses the coupon's promotion once its last use is taken. Call it in the
   * order transaction, after creating the order and with the lock from
   * assertCouponAvailable. It stays paused even if a use comes back later:
   * the owner reactivates it (raising the limit if needed).
   */
  async pauseIfSoldOut(coupon: Coupon, tx: Prisma.TransactionClient) {
    if (coupon.maxUses === null) return false;
    if ((await tx.order.count({ where: usesOf(coupon.code) })) < coupon.maxUses) return false;
    await tx.promotion.update({
      where: { id: coupon.discount.promotionId },
      data: { active: false },
    });
    return true;
  }

  /** All offers, with how many orders hold a use of each coupon */
  async findAllForAdmin() {
    const [items, uses] = await Promise.all([
      this.prisma.promotion.findMany({ orderBy: { sortOrder: 'asc' } }),
      this.prisma.order.groupBy({
        by: ['couponCode'],
        where: {
          couponCode: { not: null },
          status: { notIn: [OrderStatus.CANCELLED, OrderStatus.REFUNDED] },
        },
        _count: { _all: true },
      }),
    ]);
    return items.map((p) => ({
      ...p,
      couponUses: p.couponCode
        ? (uses.find((u) => u.couponCode === p.couponCode)?._count._all ?? 0)
        : 0,
    }));
  }

  create(dto: CreatePromotionDto) {
    return this.uniqueCoupon(this.prisma.promotion.create({ data: this.withDiscount(dto) }));
  }

  async update(id: string, dto: UpdatePromotionDto) {
    const current = await this.ensureExists(id);
    return this.uniqueCoupon(
      this.prisma.promotion.update({ where: { id }, data: this.withDiscount(dto, current) }),
    );
  }

  /** Two promotions can't share a coupon code */
  private async uniqueCoupon<T>(write: Promise<T>) {
    try {
      return await write;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('Ese código de cupón ya lo usa otra promoción');
      }
      throw err;
    }
  }

  /**
   * Keeps type and value consistent: no type = no value (and no coupon, which
   * would have nothing to give); a percent tops out at 100
   */
  private withDiscount<T extends UpdatePromotionDto>(
    dto: T,
    current?: {
      discountType: string | null;
      discountValue: number | null;
      couponCode: string | null;
    },
  ): T {
    const type = dto.discountType !== undefined ? dto.discountType : current?.discountType;
    const value = dto.discountValue !== undefined ? dto.discountValue : current?.discountValue;
    const noCoupon = { couponCode: null, couponMaxUses: null, couponMaxPerCustomer: null };
    if (!type) {
      if (dto.couponCode) {
        throw new BadRequestException('Un cupón necesita un descuento en la tienda');
      }
      return { ...dto, discountType: null, discountValue: null, ...noCoupon };
    }
    // Limits only mean something on a coupon
    const code = dto.couponCode !== undefined ? dto.couponCode : current?.couponCode;
    if (!code) dto = { ...dto, ...noCoupon };
    if (!value) throw new BadRequestException('Indica el valor del descuento');
    if (type === 'PERCENT' && value > 100) {
      throw new BadRequestException('El descuento en porcentaje admite hasta 100%');
    }
    return dto;
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.promotion.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const found = await this.prisma.promotion.findUnique({ where: { id } });
    if (!found) throw new NotFoundException(`La promoción ${id} no existe`);
    return found;
  }
}
