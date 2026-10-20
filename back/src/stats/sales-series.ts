import { OrderStatus } from '@prisma/client';

/** Days the sales chart can show */
export const SALES_RANGES = [7, 30, 90] as const;
export type SalesRange = (typeof SALES_RANGES)[number];

/** Store days follow the shop's clock, not the server's */
export const SHOP_TIME_ZONE = 'America/Guayaquil';

// Orders whose payment went through (refunded ones no longer count as a sale)
const SOLD: OrderStatus[] = [OrderStatus.PAID, OrderStatus.SHIPPED, OrderStatus.COMPLETED];

const dayFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: SHOP_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** "YYYY-MM-DD" of a moment in the shop's time zone */
export const dayKey = (date: Date) => dayFormat.format(date);

export interface SalesDay {
  date: string;
  /** Paid total of the orders paid that day */
  salesCents: number;
  /** Orders paid that day */
  orders: number;
  /** Orders shipped that day */
  shipped: number;
}

/**
 * Sales and shipments per day for the last `days` days (today included), with
 * empty days filled in so the chart has one bar per day.
 */
export function salesSeries(
  orders: {
    paidAt: Date | null;
    shippedAt: Date | null;
    totalCents: number;
    status: OrderStatus;
  }[],
  days: number,
  now = new Date(),
) {
  const series: SalesDay[] = [];
  const byDay = new Map<string, SalesDay>();
  for (let i = days - 1; i >= 0; i--) {
    // Noon UTC never falls on another calendar day in UTC-5
    const date = dayKey(new Date(now.getTime() - i * 86_400_000));
    if (byDay.has(date)) continue;
    const day = { date, salesCents: 0, orders: 0, shipped: 0 };
    byDay.set(date, day);
    series.push(day);
  }
  for (const o of orders) {
    const paid = o.paidAt && SOLD.includes(o.status) ? byDay.get(dayKey(o.paidAt)) : undefined;
    if (paid) {
      paid.salesCents += o.totalCents;
      paid.orders += 1;
    }
    const shipped = o.shippedAt ? byDay.get(dayKey(o.shippedAt)) : undefined;
    if (shipped) shipped.shipped += 1;
  }
  return {
    days: series,
    totals: series.reduce(
      (t, d) => ({
        salesCents: t.salesCents + d.salesCents,
        orders: t.orders + d.orders,
        shipped: t.shipped + d.shipped,
      }),
      { salesCents: 0, orders: 0, shipped: 0 },
    ),
  };
}
