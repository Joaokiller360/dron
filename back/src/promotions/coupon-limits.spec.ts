import { ConflictException } from '@nestjs/common';
import { Coupon, PromotionsService } from './promotions.service';
import type { PrismaService } from '../prisma/prisma.service';

const coupon = (limits: Partial<Coupon>): Coupon => ({
  code: 'BODA2026',
  discount: {
    promotionId: 'p1',
    title: 'Boda',
    badge: null,
    type: 'PERCENT',
    value: 100,
    productIds: [],
    endsAt: null,
  },
  maxUses: null,
  maxPerCustomer: null,
  ...limits,
});

/** Prisma stand-in holding the orders that already used the coupon */
function fakeDb(orders: { email: string; phone: string }[]) {
  const db = {
    order: {
      count: jest.fn(async () => orders.length),
      findMany: jest.fn(async () => orders),
    },
    $queryRaw: jest.fn(async () => []),
  };
  return db;
}

describe('pauseIfSoldOut', () => {
  const tx = (uses: number) => ({
    order: { count: jest.fn(async () => uses) },
    promotion: { update: jest.fn(async () => ({})) },
  });
  const service = new PromotionsService({} as PrismaService);

  it('pauses the promotion when the last use is taken', async () => {
    const db = tx(2);
    await expect(service.pauseIfSoldOut(coupon({ maxUses: 2 }), db as never)).resolves.toBe(true);
    expect(db.promotion.update).toHaveBeenCalledWith({
      where: { id: 'p1' },
      data: { active: false },
    });
  });

  it('leaves it running while uses remain, or without a limit', async () => {
    const db = tx(1);
    await expect(service.pauseIfSoldOut(coupon({ maxUses: 2 }), db as never)).resolves.toBe(false);
    await expect(service.pauseIfSoldOut(coupon({}), db as never)).resolves.toBe(false);
    expect(db.promotion.update).not.toHaveBeenCalled();
  });
});

describe('assertCouponAvailable', () => {
  const buyer = { email: 'Ana@Mail.com', phone: '0987654321' };

  it('lets unlimited coupons through without querying', async () => {
    const db = fakeDb([]);
    const service = new PromotionsService(db as unknown as PrismaService);
    await service.assertCouponAvailable(coupon({}), buyer);
    expect(db.order.count).not.toHaveBeenCalled();
  });

  it('stops a coupon that reached its total uses, locking it inside a transaction', async () => {
    const db = fakeDb([{ email: 'x@y.com', phone: '1' }]);
    const service = new PromotionsService(db as unknown as PrismaService);
    await expect(
      service.assertCouponAvailable(coupon({ maxUses: 1 }), buyer, db as never),
    ).rejects.toThrow(ConflictException);
    expect(db.$queryRaw).toHaveBeenCalled();
  });

  it('counts the same buyer by email (any case) or phone (any format)', async () => {
    const service = (orders: { email: string; phone: string }[]) =>
      new PromotionsService(fakeDb(orders) as unknown as PrismaService);
    const once = coupon({ maxPerCustomer: 1 });
    await expect(
      service([{ email: 'ana@mail.com', phone: '0999999999' }]).assertCouponAvailable(once, buyer),
    ).rejects.toThrow('Ya usaste este cupón');
    await expect(
      service([{ email: 'otro@mail.com', phone: '+593 98 765 4321' }]).assertCouponAvailable(
        once,
        buyer,
      ),
    ).rejects.toThrow('Ya usaste este cupón');
    await expect(
      service([{ email: 'otro@mail.com', phone: '0991234321' }]).assertCouponAvailable(once, buyer),
    ).resolves.toBeUndefined();
  });
});
