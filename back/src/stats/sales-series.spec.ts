import { OrderStatus } from '@prisma/client';
import { dayKey, salesSeries } from './sales-series';

describe('salesSeries', () => {
  // 2026-10-20 10:00 in Ecuador
  const now = new Date('2026-10-20T15:00:00Z');

  it('has one entry per day, oldest first, ending today in the shop time zone', () => {
    const { days } = salesSeries([], 7, now);
    expect(days.map((d) => d.date)).toEqual([
      '2026-10-14',
      '2026-10-15',
      '2026-10-16',
      '2026-10-17',
      '2026-10-18',
      '2026-10-19',
      '2026-10-20',
    ]);
  });

  it('counts sales on the Ecuador day they were paid and shipments on theirs', () => {
    const { days, totals } = salesSeries(
      [
        // 23:30 in Ecuador on the 19th, already the 20th in UTC
        {
          paidAt: new Date('2026-10-20T04:30:00Z'),
          shippedAt: new Date('2026-10-20T14:00:00Z'),
          totalCents: 5000,
          status: OrderStatus.SHIPPED,
        },
        {
          paidAt: new Date('2026-10-19T15:00:00Z'),
          shippedAt: null,
          totalCents: 2500,
          status: OrderStatus.PAID,
        },
        // Refunded and unpaid orders are not sales
        {
          paidAt: new Date('2026-10-19T16:00:00Z'),
          shippedAt: null,
          totalCents: 9900,
          status: OrderStatus.REFUNDED,
        },
        { paidAt: null, shippedAt: null, totalCents: 100, status: OrderStatus.PENDING_PAYMENT },
        // Older than the range
        {
          paidAt: new Date('2026-09-01T15:00:00Z'),
          shippedAt: null,
          totalCents: 100,
          status: OrderStatus.PAID,
        },
      ],
      7,
      now,
    );
    const day = (date: string) => days.find((d) => d.date === date);
    expect(day('2026-10-19')).toEqual({
      date: '2026-10-19',
      salesCents: 7500,
      orders: 2,
      shipped: 0,
    });
    expect(day('2026-10-20')).toEqual({ date: '2026-10-20', salesCents: 0, orders: 0, shipped: 1 });
    expect(totals).toEqual({ salesCents: 7500, orders: 2, shipped: 1 });
  });

  it('formats days in the shop time zone', () => {
    expect(dayKey(new Date('2026-10-20T04:59:00Z'))).toBe('2026-10-19');
    expect(dayKey(new Date('2026-10-20T05:00:00Z'))).toBe('2026-10-20');
  });
});
