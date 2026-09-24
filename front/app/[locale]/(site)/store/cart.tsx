'use client'

// Store cart shared by the catalog, product pages and the checkout page. It
// lives in localStorage so it survives reloads and is shared between tabs; a
// copy in memory covers browsers that block storage. Each line is a product
// plus the options picked for it (size, color…), so the same product can be in
// the cart twice with different options.

import { useMemo, useSyncExternalStore } from 'react';
import { useLocale } from 'next-intl';
import { Minus, Plus } from 'lucide-react';
import { bestDeal, type PublicDiscount, type PublicProduct } from '@/app/component';

const CART_KEY = 'jbskylens_cart';
const CART_EVENT = 'jbskylens:cart';

export type ChosenOption = { name: string; value: string };
type SavedLine = { productId: string; options: ChosenOption[]; qty: number };

let memoryCart = '[]';

function readCartRaw(): string {
  try {
    return window.localStorage.getItem(CART_KEY) ?? memoryCart;
  } catch {
    return memoryCart;
  }
}

function writeCart(lines: SavedLine[]) {
  memoryCart = JSON.stringify(lines);
  try {
    window.localStorage.setItem(CART_KEY, memoryCart);
  } catch {
    // storage blocked: the cart just won't survive a reload
  }
  window.dispatchEvent(new Event(CART_EVENT));
}

function subscribeCart(onChange: () => void) {
  window.addEventListener(CART_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(CART_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

function parseCart(raw: string): SavedLine[] {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((l) => l && typeof l.productId === 'string' && Number(l.qty) > 0);
    }
    // Older carts: { [productId]: quantity }
    if (parsed && typeof parsed === 'object') {
      return Object.entries(parsed).map(([productId, qty]) => ({ productId, options: [], qty: Number(qty) || 0 }));
    }
  } catch {
    // corrupted: start empty
  }
  return [];
}

const lineKey = (productId: string, options: ChosenOption[]) => `${productId}|${options.map((o) => `${o.name}=${o.value}`).join('|')}`;

/** Most units of a product the cart may hold (all its lines together) */
export const maxUnits = (p: PublicProduct) => Math.min(p.stock ?? 99, 99);

/** Base price + the extras of the chosen values, before promotions; null while prices are hidden */
export function listPrice(p: PublicProduct, options: ChosenOption[]) {
  if (p.priceCents === null) return null;
  return options.reduce((sum, c) => {
    const value = p.options?.find((o) => o.name === c.name)?.values.find((v) => v.label === c.value);
    return sum + (value?.priceCents ?? 0);
  }, p.priceCents);
}

/** What the buyer pays per unit: list price with the best running promotion (the API prices it the same way) */
export function unitPrice(p: PublicProduct, options: ChosenOption[]) {
  const list = listPrice(p, options);
  if (list === null) return { unitCents: null, listCents: null, discount: null };
  const deal = bestDeal(list, p.discounts);
  return { unitCents: deal?.unitCents ?? list, listCents: list, discount: deal?.discount ?? null };
}

/** True when `options` answers every option of the product with a value that still exists */
const validChoice = (p: PublicProduct, options: ChosenOption[]) =>
  (p.options ?? []).every((o) => options.some((c) => c.name === o.name && o.values.some((v) => v.label === c.value))) &&
  options.every((c) => p.options?.some((o) => o.name === c.name));

export interface CartLine {
  key: string;
  product: PublicProduct;
  options: ChosenOption[];
  quantity: number;
  /** null while prices are hidden */
  unitCents: number | null;
  /** Price before the promotion; equals unitCents without one */
  listCents: number | null;
  discount: PublicDiscount | null;
}

/**
 * The saved cart, limited to products still on sale, with options that still
 * exist and within stock. `ready` is false during server rendering /
 * hydration, before the browser's saved cart has been read.
 */
export function useCart(products: PublicProduct[], showPrices: boolean) {
  const raw = useSyncExternalStore(subscribeCart, readCartRaw, () => '');
  const ready = raw !== '';

  const lines: CartLine[] = useMemo(() => {
    const used = new Map<string, number>(); // units per product so far
    const merged = new Map<string, CartLine>();
    for (const saved of parseCart(raw || '[]')) {
      const product = products.find((p) => p.id === saved.productId);
      const options = Array.isArray(saved.options) ? saved.options : [];
      if (!product || !validChoice(product, options)) continue;
      const room = maxUnits(product) - (used.get(product.id) ?? 0);
      const qty = Math.min(Number(saved.qty) || 0, room);
      if (qty <= 0) continue;
      used.set(product.id, (used.get(product.id) ?? 0) + qty);
      const key = lineKey(product.id, options);
      const existing = merged.get(key);
      if (existing) existing.quantity += qty;
      else merged.set(key, { key, product, options, quantity: qty, ...unitPrice(product, options) });
    }
    return [...merged.values()];
  }, [raw, products]);

  const save = (next: CartLine[]) => writeCart(next.map((l) => ({ productId: l.product.id, options: l.options, qty: l.quantity })));
  const unitsOf = (productId: string) => lines.filter((l) => l.product.id === productId).reduce((n, l) => n + l.quantity, 0);

  /** Most units this line can have, leaving the other lines of the same product as they are */
  const maxFor = (line: Pick<CartLine, 'key' | 'product'>) =>
    maxUnits(line.product) - lines.filter((l) => l.product.id === line.product.id && l.key !== line.key).reduce((n, l) => n + l.quantity, 0);

  const setLineQty = (key: string, qty: number) => {
    const line = lines.find((l) => l.key === key);
    if (!line) return;
    const clamped = Math.max(0, Math.min(qty, maxFor(line)));
    save(clamped === 0 ? lines.filter((l) => l.key !== key) : lines.map((l) => (l.key === key ? { ...l, quantity: clamped } : l)));
  };

  /** Adds units of a product with the given options (merges with an identical line) */
  const add = (product: PublicProduct, options: ChosenOption[], qty = 1) => {
    const key = lineKey(product.id, options);
    const existing = lines.find((l) => l.key === key);
    if (existing) return setLineQty(key, existing.quantity + qty);
    const room = maxUnits(product) - unitsOf(product.id);
    if (room <= 0) return;
    save([...lines, { key, product, options, quantity: Math.min(qty, room), ...unitPrice(product, options) }]);
  };

  const pricesKnown = showPrices && lines.every((l) => l.unitCents !== null);
  return {
    ready,
    lines,
    add,
    setLineQty,
    maxFor,
    unitsOf,
    keyOf: lineKey,
    clear: () => writeCart([]),
    units: lines.reduce((n, l) => n + l.quantity, 0),
    showPrices: pricesKnown,
    totalCents: lines.reduce((sum, l) => sum + (l.unitCents ?? 0) * l.quantity, 0),
  };
}

/** "50 × 70 cm · Negro" */
export const optionsText = (options: ChosenOption[]) => options.map((o) => o.value).join(' · ');

/** USD formatter in the page language */
export function useMoney() {
  const locale = useLocale();
  return (cents: number) =>
    (cents / 100).toLocaleString(locale === 'en' ? 'en-US' : 'es-EC', { style: 'currency', currency: 'USD' });
}

export function Stepper({ value, max, onChange, labels }: { value: number; max: number; onChange: (n: number) => void; labels: [string, string] }) {
  const cls = 'flex items-center justify-center w-8 h-8 rounded-lg text-jb-soft hover:text-white hover:bg-white/[.08] disabled:opacity-30 disabled:hover:bg-transparent transition';
  return (
    <span className="inline-flex items-center gap-1 p-0.5 rounded-[10px] border border-white/[.14]">
      <button type="button" aria-label={labels[0]} onClick={() => onChange(value - 1)} className={cls}>
        <Minus size={14} />
      </button>
      <span className="min-w-6 font-mono text-[14px] font-bold text-center text-white">{value}</span>
      <button type="button" aria-label={labels[1]} disabled={value >= max} onClick={() => onChange(value + 1)} className={cls}>
        <Plus size={14} />
      </button>
    </span>
  );
}
