'use client'

import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, BadgePercent, ChevronLeft, ChevronRight, PauseCircle, ShoppingBag } from 'lucide-react';
import { Shot, localized, dealBadge, btnPrimary, btnGhost, usePrefix, type PublicProduct, type PublicStore } from '@/app/component';
import { Stepper, unitPrice, useCart, useMoney, type ChosenOption } from '../cart';
import CartDrawer from '../CartDrawer';

export default function ProductClient({
  product: p,
  products,
  settings,
  payments,
}: {
  product: PublicProduct;
  products: PublicProduct[];
  settings: PublicStore['settings'];
  payments: PublicStore['payments'];
}) {
  const t = useTranslations('store');
  const locale = useLocale();
  const prefix = usePrefix();
  const money = useMoney();
  const { lines, add, setLineQty, maxFor, keyOf, unitsOf } = useCart(products, settings.showPrices);
  const [cartOpen, setCartOpen] = useState(false);
  const [index, setIndex] = useState(0);
  // One value per option; starts on the first value of each
  const [picked, setPicked] = useState<Record<string, string>>(() =>
    Object.fromEntries((p.options ?? []).map((o) => [o.name, o.values[0]?.label ?? ''])),
  );
  const chosen: ChosenOption[] = (p.options ?? []).map((o) => ({ name: o.name, value: picked[o.name] }));
  const { unitCents: price, listCents, discount } = unitPrice(p, chosen);
  const extras = listCents !== null && p.priceCents !== null ? listCents - p.priceCents : 0;
  // A running promotion shows the price it lowers; otherwise the manual "before" price
  const before = discount ? listCents : p.compareAtCents ? p.compareAtCents + extras : null;
  const line = lines.find((l) => l.key === keyOf(p.id, chosen));
  const noRoom = p.stock !== null && unitsOf(p.id) >= p.stock;

  const name = localized(locale, p.nameEs, p.nameEn);
  const description = localized(locale, p.descriptionEs ?? '', p.descriptionEn);
  const photos = [p.coverUrl, ...(p.mediaUrls ?? [])].filter(Boolean);
  const current = photos[Math.min(index, photos.length - 1)] ?? '';
  const specs = (p.specs ?? []).filter((s) => s.label && s.value);
  // Below zero = oversold: also unavailable
  const soldOut = p.stock !== null && p.stock <= 0;
  const go = (step: number) => setIndex((i) => (i + step + photos.length) % photos.length);

  return (
    <section className="px-6 pt-10 pb-24">
      <div className="max-w-[1180px] mx-auto">
        <Link href={`${prefix}/store`} className="inline-flex items-center gap-1.5 text-[13.5px] text-jb-soft hover:text-white">
          <ArrowLeft size={15} /> {t('backToStore')}
        </Link>

        <div className="grid gap-10 mt-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] items-start">
          {/* Gallery */}
          <div className="flex flex-col gap-3">
            <div className="relative overflow-hidden rounded-2xl border border-white/[.08] bg-jb-band">
              <Shot key={current} src={current} alt={name} label={name} labelPosition="center" fit="contain" className={`aspect-square ${soldOut ? 'opacity-60' : ''}`} />
              {photos.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label={t('prevPhoto')}
                    onClick={() => go(-1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-black/55 text-white hover:bg-black/75 backdrop-blur"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    aria-label={t('nextPhoto')}
                    onClick={() => go(1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-black/55 text-white hover:bg-black/75 backdrop-blur"
                  >
                    <ChevronRight size={20} />
                  </button>
                  <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/60 font-mono text-[11.5px] text-white">
                    {Math.min(index, photos.length - 1) + 1}/{photos.length}
                  </span>
                </>
              )}
            </div>
            {photos.length > 1 && (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(72px,1fr))] gap-2">
                {photos.map((src, i) => (
                  <button
                    key={`${src}-${i}`}
                    type="button"
                    aria-label={t('photo', { n: i + 1 })}
                    aria-current={i === index ? 'true' : undefined}
                    onClick={() => setIndex(i)}
                    className={`overflow-hidden rounded-lg border-2 transition ${i === index ? 'border-jb-accent' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  >
                    <Shot src={src} alt="" className="aspect-square" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-6 lg:sticky lg:top-24">
            <div className="flex flex-col gap-3">
              <h1 className="m-0 font-mono text-[clamp(28px,3.6vw,40px)] leading-[1.1] font-bold tracking-[-.02em] text-white text-balance">{name}</h1>
              {price !== null ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-[30px] font-bold text-white">{money(price)}</span>
                    {before ? <s className="font-mono text-[16px] text-jb-muted">{money(before)}</s> : null}
                  </div>
                  {discount && (
                    <span className="inline-flex items-center self-start gap-2 px-2.5 py-1 rounded-lg bg-jb-accent/[.12] text-[13px] font-semibold text-jb-mint">
                      <BadgePercent size={15} /> {dealBadge(discount, money)} · {discount.title}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-[15px] text-jb-soft">{t('askPrice')}</span>
              )}
              <span className={`text-[13.5px] font-semibold ${soldOut ? 'text-red-300' : p.stock !== null && p.stock <= 5 ? 'text-amber-300' : 'text-jb-mint'}`}>
                {soldOut ? t('soldOut') : p.stock === null ? t('inStockUnlimited') : t('available', { count: p.stock })}
              </span>
            </div>

            {/* Options that change the price */}
            {(p.options ?? []).map((o) => (
              <fieldset key={o.name} className="flex flex-col gap-2.5 p-0 m-0 border-0">
                <legend className="mb-2.5 text-[13.5px] font-semibold text-jb-text">
                  {o.name}: <span className="font-normal text-jb-soft">{picked[o.name]}</span>
                </legend>
                <div className="flex flex-wrap gap-2">
                  {o.values.map((v) => {
                    const active = picked[o.name] === v.label;
                    return (
                      <button
                        key={v.label}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setPicked((cur) => ({ ...cur, [o.name]: v.label }))}
                        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-[10px] border text-[14px] transition ${
                          active ? 'border-jb-accent bg-[rgba(52,209,122,.12)] text-white font-semibold' : 'border-white/[.14] text-jb-soft hover:text-white hover:border-white/30'
                        }`}
                      >
                        {v.label}
                        {v.priceCents ? <span className="font-mono text-[12px] text-jb-muted">+{money(v.priceCents)}</span> : null}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}

            {/* Buy */}
            {!settings.sales ? (
              <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl border border-amber-300/25 bg-amber-300/[.06] text-[14px] text-jb-soft">
                <PauseCircle size={18} className="flex-none mt-px text-amber-300" />
                <span>{settings.pausedNotice || t('paused')}</span>
              </div>
            ) : (
              !soldOut &&
              (line ? (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[13.5px] text-jb-soft">{t('inCart')}</span>
                  <Stepper value={line.quantity} max={maxFor(line)} onChange={(n) => setLineQty(line.key, n)} labels={[t('decrease'), t('increase')]} />
                  <button type="button" onClick={() => setCartOpen(true)} className={`${btnGhost} inline-flex items-center gap-2 text-sm px-4 py-2.5`}>
                    <ShoppingBag size={16} /> {t('openCart')}
                  </button>
                  <Link href={`${prefix}/store/checkout`} className={`${btnPrimary} text-sm px-5 py-2.5`}>
                    {t('checkout')}
                  </Link>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={noRoom}
                  onClick={() => {
                    add(p, chosen);
                    setCartOpen(true);
                  }}
                  className={`${btnPrimary} inline-flex items-center justify-center gap-2 text-[15px] px-6 py-3.5 sm:self-start disabled:opacity-50`}
                >
                  <ShoppingBag size={17} /> {t('addToCart')}
                </button>
              ))
            )}

            {description && <p className="m-0 text-[15.5px] leading-[1.7] text-jb-soft whitespace-pre-line text-pretty">{description}</p>}

            {specs.length > 0 && (
              <div className="flex flex-col gap-3">
                <h2 className="m-0 font-mono text-[11.5px] tracking-[.18em] uppercase text-jb-mint">{t('details')}</h2>
                <dl className="m-0 overflow-hidden rounded-xl border border-white/[.08] divide-y divide-white/[.06]">
                  {specs.map((s, i) => (
                    <div key={i} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 px-4 py-3 text-[14px]">
                      <dt className="text-jb-muted">{s.label}</dt>
                      <dd className="m-0 font-semibold text-white">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>
      </div>

      <CartDrawer products={products} settings={settings} payments={payments} open={cartOpen} onOpenChange={setCartOpen} />
    </section>
  );
}
