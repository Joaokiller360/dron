'use client'

import { ViewTransition } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Plus, SlidersHorizontal } from 'lucide-react';
import { Shot, localized, bestDeal, dealBadge, btnPrimary, usePrefix, type PublicProduct } from '@/app/component';
import { Stepper, useCart, useMoney } from './cart';

/**
 * View transition name shared by a product's card photo and the main photo
 * of its page: on navigation the browser zooms one into the other.
 */
export const productPhotoName = (id: string) => `product-photo-${id}`;

/** Catalog card: photo, name, price and the add-to-cart control. */
export default function ProductCard({
  product: p,
  cart,
  selling,
  heading: Heading = 'h2',
  zoom = true,
}: {
  product: PublicProduct;
  cart: ReturnType<typeof useCart>;
  selling: boolean;
  heading?: 'h2' | 'h3';
  /** Photo zooms into the product page on click; off where another photo of the same product may be on screen */
  zoom?: boolean;
}) {
  const t = useTranslations('store');
  const locale = useLocale();
  const prefix = usePrefix();
  const money = useMoney();
  const { lines, add, setLineQty, maxFor, keyOf } = cart;

  const name = localized(locale, p.nameEs, p.nameEn);
  const description = localized(locale, p.descriptionEs ?? '', p.descriptionEn);
  // Below zero = oversold: also unavailable
  const soldOut = p.stock !== null && p.stock <= 0;
  const hasOptions = !!p.options?.length;
  // Products with options are added from their page, where the buyer picks them
  const line = hasOptions ? undefined : lines.find((l) => l.key === keyOf(p.id, []));
  const href = `${prefix}/store/${p.slug}`;
  const deal = p.priceCents !== null ? bestDeal(p.priceCents, p.discounts) : null;
  const before = deal ? p.priceCents : p.compareAtCents;
  const photo = (
    <Shot
      src={p.coverUrl}
      alt={name}
      label={name}
      labelPosition="center"
      className={`aspect-[4/3] ${soldOut ? 'opacity-50' : ''}`}
      imgClassName="transition-transform duration-300 group-hover:scale-[1.03]"
    />
  );

  return (
    <article id={p.slug} className="group flex flex-col overflow-hidden rounded-2xl bg-jb-card border border-white/[.08] hover:border-white/[.16] transition">
      {/* Full prefetch: the product page is ready on click, so the photo can zoom into it */}
      <Link href={href} prefetch className="relative block overflow-hidden">
        {zoom ? <ViewTransition name={productPhotoName(p.id)} share="product-zoom" default="none">{photo}</ViewTransition> : photo}
        {soldOut ? (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 font-mono text-[11px] font-bold tracking-[.08em] uppercase text-white">
            {t('soldOut')}
          </span>
        ) : (
          p.stock !== null &&
          p.stock <= 5 && (
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-amber-300 font-mono text-[11px] font-bold text-jb-ink">
              {t('onlyLeft', { count: p.stock })}
            </span>
          )
        )}
        {deal && (
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-jb-accent font-mono text-[11px] font-bold tracking-[.06em] text-jb-ink">
            {dealBadge(deal.discount, money)}
          </span>
        )}
      </Link>
      <div className="flex flex-col flex-1 gap-2 p-5">
        <Heading className="m-0 text-[17px] font-bold leading-snug text-balance">
          <Link href={href} prefetch className="text-white hover:text-jb-mint">
            {name}
          </Link>
        </Heading>
        {description && <p className="m-0 text-[14px] leading-[1.55] text-jb-muted line-clamp-3 text-pretty">{description}</p>}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-auto">
          {p.priceCents !== null ? (
            <span className="flex items-baseline gap-2">
              {hasOptions && <span className="text-[12.5px] text-jb-muted">{t('from')}</span>}
              <span className="font-mono text-[20px] font-bold text-white">{money(deal?.unitCents ?? p.priceCents)}</span>
              {before ? <s className="font-mono text-[13px] text-jb-muted">{money(before)}</s> : null}
            </span>
          ) : (
            <span className="text-[13.5px] text-jb-soft">{t('askPrice')}</span>
          )}
          {selling &&
            !soldOut &&
            (hasOptions ? (
              <Link href={href} prefetch className={`${btnPrimary} inline-flex items-center gap-1.5 text-sm px-4 py-2.5`}>
                <SlidersHorizontal size={15} /> {t('chooseOptions')}
              </Link>
            ) : line ? (
              <Stepper value={line.quantity} max={maxFor(line)} onChange={(n) => setLineQty(line.key, n)} labels={[t('decrease'), t('increase')]} />
            ) : (
              <button type="button" onClick={() => add(p, [])} className={`${btnPrimary} inline-flex items-center gap-1.5 text-sm px-4 py-2.5`}>
                <Plus size={15} /> {t('add')}
              </button>
            ))}
        </div>
      </div>
    </article>
  );
}
