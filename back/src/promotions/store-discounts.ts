import { Promotion } from '@prisma/client';

export type DiscountType = 'PERCENT' | 'FIXED';
export const DISCOUNT_TYPES: DiscountType[] = ['PERCENT', 'FIXED'];

/** A running promotion that lowers store prices */
export interface StoreDiscount {
  promotionId: string;
  title: string;
  badge: string | null;
  type: DiscountType;
  /** Percent (1–90) or cents off each unit */
  value: number;
  /** Empty = every product */
  productIds: string[];
  endsAt: Date | null;
}

export const toStoreDiscount = (p: Promotion): StoreDiscount | null =>
  p.discountType && DISCOUNT_TYPES.includes(p.discountType as DiscountType) && p.discountValue
    ? {
        promotionId: p.id,
        title: p.title,
        badge: p.badge,
        type: p.discountType as DiscountType,
        value: p.discountValue,
        productIds: p.productIds,
        endsAt: p.endsAt,
      }
    : null;

export const discountsFor = (productId: string, all: StoreDiscount[]) =>
  all.filter((d) => !d.productIds.length || d.productIds.includes(productId));

/** Unit price after one discount (never below 0) */
export const applyDiscount = (unitCents: number, d: Pick<StoreDiscount, 'type' | 'value'>) =>
  Math.max(
    0,
    d.type === 'PERCENT' ? Math.round((unitCents * (100 - d.value)) / 100) : unitCents - d.value,
  );

/** Cheapest price among the product's discounts; discounts never stack */
export function bestPrice(unitCents: number, discounts: StoreDiscount[]) {
  let best: { unitCents: number; discount: StoreDiscount } | null = null;
  for (const d of discounts) {
    const price = applyDiscount(unitCents, d);
    if (price < unitCents && (!best || price < best.unitCents))
      best = { unitCents: price, discount: d };
  }
  return best;
}
