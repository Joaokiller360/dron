'use client'

import { useEffect } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ShoppingBag, X, Trash2 } from 'lucide-react';
import { Shot, localized, btnPrimary, usePrefix, type PublicProduct, type PublicStore } from '@/app/component';
import { Stepper, optionsText, useCart, useMoney } from './cart';

/**
 * Floating cart button + cart drawer, shared by the catalog and product pages.
 * Paying happens on /store/checkout. The page owns `open`, so it can also
 * open the drawer (e.g. after "Add to cart").
 */
export default function CartDrawer({
  products,
  settings,
  payments,
  open,
  onOpenChange,
}: {
  products: PublicProduct[];
  settings: PublicStore['settings'];
  payments: PublicStore['payments'];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations('store');
  const locale = useLocale();
  const prefix = usePrefix();
  const money = useMoney();
  const { lines, setLineQty, maxFor, units, showPrices, totalCents } = useCart(products, settings.showPrices);
  const canPay = !!payments?.paypalClientId || !!payments?.transfer;
  const close = () => onOpenChange(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onOpenChange(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  if (!settings.sales) return null;

  return (
    <>
      {units > 0 && !open && (
        <button
          type="button"
          onClick={() => onOpenChange(true)}
          aria-label={t('openCart')}
          className="fixed z-40 inline-flex items-center gap-2.5 px-5 py-3.5 rounded-full shadow-[0_10px_30px_rgba(0,0,0,.4)] bottom-5 right-5 bg-jb-accent hover:bg-jb-accent-hi text-jb-ink font-bold text-[14.5px] transition animate-jb-fade"
        >
          <ShoppingBag size={18} />
          {t('cart')}
          <span className="flex items-center justify-center min-w-6 h-6 px-1.5 rounded-full bg-jb-ink text-jb-accent text-[12px]">{units}</span>
          {showPrices && <span className="font-mono">{money(totalCents)}</span>}
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-[100]" onClick={close}>
          <div className="absolute inset-0 bg-black/60" />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label={t('cart')}
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-y-0 right-0 flex flex-col w-full max-w-[420px] bg-jb-band border-l border-white/[.08] animate-jb-fade"
          >
            <header className="flex items-center justify-between gap-3 px-5 h-16 border-b border-white/[.07]">
              <h2 className="m-0 font-mono text-[16px] font-bold text-white">{t('cart')}</h2>
              <button type="button" aria-label={t('close')} onClick={close} className="p-2 -mr-2 text-jb-soft hover:text-white">
                <X size={19} />
              </button>
            </header>

            {lines.length === 0 ? (
              <p className="px-6 py-12 m-0 text-center text-[14.5px] text-jb-muted">{t('cartEmpty')}</p>
            ) : (
              <>
                <ul className="flex-1 p-0 m-0 overflow-y-auto list-none divide-y divide-white/[.06]">
                  {lines.map((line) => {
                    const { product: p, quantity } = line;
                    return (
                    <li key={line.key} className="flex gap-3.5 px-5 py-4">
                      <Link href={`${prefix}/store/${p.slug}`} onClick={close} className="flex-none">
                        <Shot src={p.coverUrl} alt="" className="w-16 h-16 rounded-lg" />
                      </Link>
                      <div className="flex flex-col flex-1 min-w-0 gap-2">
                        <Link href={`${prefix}/store/${p.slug}`} onClick={close} className="text-[14.5px] font-semibold leading-snug text-white hover:text-jb-mint">
                          {localized(locale, p.nameEs, p.nameEn)}
                        </Link>
                        {line.options.length > 0 && <span className="-mt-1.5 text-[12.5px] text-jb-muted">{optionsText(line.options)}</span>}
                        <div className="flex items-center justify-between gap-2">
                          <Stepper value={quantity} max={maxFor(line)} onChange={(n) => setLineQty(line.key, n)} labels={[t('decrease'), t('increase')]} />
                          {showPrices && <span className="font-mono text-[14px] text-jb-soft">{money((line.unitCents ?? 0) * quantity)}</span>}
                        </div>
                      </div>
                      <button type="button" aria-label={t('remove')} title={t('remove')} onClick={() => setLineQty(line.key, 0)} className="self-start p-1.5 text-jb-muted hover:text-white">
                        <Trash2 size={15} />
                      </button>
                    </li>
                    );
                  })}
                </ul>

                <footer className="flex flex-col gap-3 px-5 py-4 border-t border-white/[.07]">
                  {showPrices && (
                    <div className="flex items-baseline justify-between">
                      <span className="text-[14px] text-jb-soft">{t('total')}</span>
                      <span className="font-mono text-[20px] font-bold text-white">{money(totalCents)}</span>
                    </div>
                  )}
                  {canPay ? (
                    <Link href={`${prefix}/store/checkout`} className={`${btnPrimary} text-[15px] px-5 py-3.5`}>
                      {t('checkout')}
                    </Link>
                  ) : (
                    <p className="m-0 text-[13px] leading-[1.5] text-amber-200">{t('paymentsUnavailable')}</p>
                  )}
                </footer>
              </>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
