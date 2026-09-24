'use client'

import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Plus, PauseCircle, SlidersHorizontal } from 'lucide-react';
import { Shot, localized, btnPrimary, usePrefix, type PublicProduct, type PublicStore } from '@/app/component';
import { Stepper, useCart, useMoney } from './cart';
import CartDrawer from './CartDrawer';

export default function StoreClient({
  products,
  settings,
  payments,
}: {
  products: PublicProduct[];
  settings: PublicStore['settings'];
  payments: PublicStore['payments'];
}) {
  const t = useTranslations('store');
  const locale = useLocale();
  const prefix = usePrefix();
  const money = useMoney();
  const { lines, add, setLineQty, maxFor, keyOf } = useCart(products, settings.showPrices);
  const [cartOpen, setCartOpen] = useState(false);

  const selling = settings.sales;

  return (
    <>
      <section className="px-6 pt-2 pb-24">
        <div className="max-w-[1180px] mx-auto">
          {!selling && (
            <div className="flex items-start gap-3 px-5 py-4 mb-8 rounded-2xl border border-amber-300/25 bg-amber-300/[.06] text-[14.5px] text-jb-soft">
              <PauseCircle size={19} className="flex-none mt-px text-amber-300" />
              <span>{settings.pausedNotice || t('paused')}</span>
            </div>
          )}

          {products.length === 0 ? (
            <p className="text-center text-white/60">{t('empty')}</p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(260px,100%),1fr))] gap-4">
              {products.map((p) => {
                const name = localized(locale, p.nameEs, p.nameEn);
                const description = localized(locale, p.descriptionEs ?? '', p.descriptionEn);
                const soldOut = p.stock === 0;
                const hasOptions = !!p.options?.length;
                // Products with options are added from their page, where the buyer picks them
                const line = hasOptions ? undefined : lines.find((l) => l.key === keyOf(p.id, []));
                const href = `${prefix}/store/${p.slug}`;
                return (
                  <article key={p.id} id={p.slug} className="group flex flex-col overflow-hidden rounded-2xl bg-jb-card border border-white/[.08] hover:border-white/[.16] transition">
                    <Link href={href} className="relative block overflow-hidden">
                      <Shot
                        src={p.coverUrl}
                        alt={name}
                        label={name}
                        labelPosition="center"
                        className={`aspect-[4/3] ${soldOut ? 'opacity-50' : ''}`}
                        imgClassName="transition-transform duration-300 group-hover:scale-[1.03]"
                      />
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
                    </Link>
                    <div className="flex flex-col flex-1 gap-2 p-5">
                      <h2 className="m-0 text-[17px] font-bold leading-snug text-balance">
                        <Link href={href} className="text-white hover:text-jb-mint">
                          {name}
                        </Link>
                      </h2>
                      {description && <p className="m-0 text-[14px] leading-[1.55] text-jb-muted line-clamp-3 text-pretty">{description}</p>}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-auto">
                        {p.priceCents !== null ? (
                          <span className="flex items-baseline gap-2">
                            {hasOptions && <span className="text-[12.5px] text-jb-muted">{t('from')}</span>}
                            <span className="font-mono text-[20px] font-bold text-white">{money(p.priceCents)}</span>
                            {p.compareAtCents ? <s className="font-mono text-[13px] text-jb-muted">{money(p.compareAtCents)}</s> : null}
                          </span>
                        ) : (
                          <span className="text-[13.5px] text-jb-soft">{t('askPrice')}</span>
                        )}
                        {selling &&
                          !soldOut &&
                          (hasOptions ? (
                            <Link href={href} className={`${btnPrimary} inline-flex items-center gap-1.5 text-sm px-4 py-2.5`}>
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
              })}
            </div>
          )}
        </div>
      </section>

      <CartDrawer products={products} settings={settings} payments={payments} open={cartOpen} onOpenChange={setCartOpen} />
    </>
  );
}
