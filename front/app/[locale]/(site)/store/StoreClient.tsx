'use client'

import { useEffect, useMemo, useState, FormEvent, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Minus, Plus, ShoppingBag, X, Trash2, CheckCircle2, PauseCircle } from 'lucide-react';
import { Shot, localized, btnPrimary, btnGhost, inputClass, type PublicProduct, type PublicStore } from '@/app/component';
import { EMAIL_PATTERN, NAME_PATTERN, PHONE_PATTERN, TEXT_PATTERN } from '@/app/utils/formRules';

const CART_KEY = 'jbskylens_cart';

type Cart = Record<string, number>;

function readCart(): Cart {
  try {
    return JSON.parse(window.localStorage.getItem(CART_KEY) ?? '{}') as Cart;
  } catch {
    return {};
  }
}

function writeCart(cart: Cart) {
  try {
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {
    // storage blocked: the cart just won't survive a reload
  }
}

/** Most units of a product that can go in the cart */
const maxUnits = (p: PublicProduct) => Math.min(p.stock ?? 99, 99);

function Field({ label, optional, children }: { label: string; optional?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col min-w-0 gap-1.5">
      <span className="text-[13.5px] font-semibold text-jb-text">
        {label}
        {optional && <span className="ml-1 font-normal text-jb-muted">({optional})</span>}
      </span>
      {children}
    </label>
  );
}

function Stepper({ value, max, onChange, labels }: { value: number; max: number; onChange: (n: number) => void; labels: [string, string] }) {
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

export default function StoreClient({ products, settings }: { products: PublicProduct[]; settings: PublicStore['settings'] }) {
  const t = useTranslations('store');
  const locale = useLocale();
  const router = useRouter();
  const [cart, setCartState] = useState<Cart>({});
  const [panel, setPanel] = useState<'closed' | 'cart' | 'checkout' | 'done'>('closed');
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState('');
  const [doneCode, setDoneCode] = useState('');

  const selling = settings.sales;
  const money = (cents: number) =>
    (cents / 100).toLocaleString(locale === 'en' ? 'en-US' : 'es-EC', { style: 'currency', currency: 'USD' });

  const setCart = (next: Cart) => {
    setCartState(next);
    writeCart(next);
  };

  // Restore the saved cart, keeping only products still on sale and within stock
  useEffect(() => {
    const saved = readCart();
    const valid: Cart = {};
    for (const p of products) {
      const qty = Math.min(saved[p.id] ?? 0, maxUnits(p));
      if (qty > 0) valid[p.id] = qty;
    }
    setCartState(valid);
  }, [products]);

  useEffect(() => {
    if (panel === 'closed') return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPanel('closed');
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [panel]);

  const setQty = (p: PublicProduct, qty: number) => {
    const next = { ...cart };
    const clamped = Math.max(0, Math.min(qty, maxUnits(p)));
    if (clamped === 0) delete next[p.id];
    else next[p.id] = clamped;
    setCart(next);
  };

  const lines = useMemo(
    () => products.filter((p) => cart[p.id]).map((p) => ({ product: p, quantity: cart[p.id] })),
    [products, cart],
  );
  const units = lines.reduce((n, l) => n + l.quantity, 0);
  const showPrices = settings.showPrices && lines.every((l) => l.product.priceCents !== null);
  const totalCents = lines.reduce((sum, l) => sum + (l.product.priceCents ?? 0) * l.quantity, 0);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const field = (k: string) => String(data.get(k) ?? '').trim();
    const body = { name: field('name'), email: field('email'), phone: field('phone'), note: field('note') };
    const ok =
      NAME_PATTERN.test(body.name) &&
      EMAIL_PATTERN.test(body.email) &&
      PHONE_PATTERN.test(body.phone) &&
      (!body.note || TEXT_PATTERN.test(body.note));
    if (!ok) {
      setFormError(t('errorInvalid'));
      return;
    }

    setSending(true);
    setFormError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...body,
          note: body.note || undefined,
          locale,
          items: lines.map((l) => ({ productId: l.product.id, quantity: l.quantity })),
        }),
      });
      const result = await res.json().catch(() => null);
      if (!res.ok) {
        // Stock / closed-store messages come as a string; field validation as a list
        const msg = result?.message?.message ?? result?.message;
        setFormError(typeof msg === 'string' && res.status !== 400 ? msg : res.status === 400 ? t('errorInvalid') : t('errorGeneric'));
        router.refresh();
        return;
      }
      setDoneCode(result.code);
      setCart({});
      setPanel('done');
      router.refresh(); // fresh stock
    } catch {
      setFormError(t('errorGeneric'));
    } finally {
      setSending(false);
    }
  };

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
                const inCart = cart[p.id] ?? 0;
                return (
                  <article key={p.id} id={p.slug} className="flex flex-col overflow-hidden rounded-2xl bg-jb-card border border-white/[.08]">
                    <div className="relative">
                      <Shot src={p.coverUrl} alt={name} label={name} labelPosition="center" className={`aspect-[4/3] ${soldOut ? 'opacity-50' : ''}`} />
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
                    </div>
                    <div className="flex flex-col flex-1 gap-2 p-5">
                      <h2 className="m-0 text-[17px] font-bold leading-snug text-white text-balance">{name}</h2>
                      {description && <p className="m-0 text-[14px] leading-[1.55] text-jb-muted line-clamp-3 text-pretty">{description}</p>}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-auto">
                        {p.priceCents !== null ? (
                          <span className="flex items-baseline gap-2">
                            <span className="font-mono text-[20px] font-bold text-white">{money(p.priceCents)}</span>
                            {p.compareAtCents ? <s className="font-mono text-[13px] text-jb-muted">{money(p.compareAtCents)}</s> : null}
                          </span>
                        ) : (
                          <span className="text-[13.5px] text-jb-soft">{t('askPrice')}</span>
                        )}
                        {selling &&
                          !soldOut &&
                          (inCart > 0 ? (
                            <Stepper value={inCart} max={maxUnits(p)} onChange={(n) => setQty(p, n)} labels={[t('decrease'), t('increase')]} />
                          ) : (
                            <button type="button" onClick={() => setQty(p, 1)} className={`${btnPrimary} inline-flex items-center gap-1.5 text-sm px-4 py-2.5`}>
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

      {/* Floating cart button */}
      {selling && units > 0 && panel === 'closed' && (
        <button
          type="button"
          onClick={() => setPanel('cart')}
          aria-label={t('openCart')}
          className="fixed z-40 inline-flex items-center gap-2.5 px-5 py-3.5 rounded-full shadow-[0_10px_30px_rgba(0,0,0,.4)] bottom-5 right-5 bg-jb-accent hover:bg-jb-accent-hi text-jb-ink font-bold text-[14.5px] transition animate-jb-fade"
        >
          <ShoppingBag size={18} />
          {t('cart')}
          <span className="flex items-center justify-center min-w-6 h-6 px-1.5 rounded-full bg-jb-ink text-jb-accent text-[12px]">{units}</span>
          {showPrices && <span className="font-mono">{money(totalCents)}</span>}
        </button>
      )}

      {/* Cart / checkout drawer */}
      {panel !== 'closed' && (
        <div className="fixed inset-0 z-[100]" onClick={() => setPanel('closed')}>
          <div className="absolute inset-0 bg-black/60" />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label={t('cart')}
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-y-0 right-0 flex flex-col w-full max-w-[420px] bg-jb-band border-l border-white/[.08] animate-jb-fade"
          >
            <header className="flex items-center justify-between gap-3 px-5 h-16 border-b border-white/[.07]">
              <h2 className="m-0 font-mono text-[16px] font-bold text-white">{panel === 'done' ? t('successTitle') : t('cart')}</h2>
              <button type="button" aria-label={t('close')} onClick={() => setPanel('closed')} className="p-2 -mr-2 text-jb-soft hover:text-white">
                <X size={19} />
              </button>
            </header>

            {panel === 'done' ? (
              <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
                <CheckCircle2 size={44} className="text-jb-accent" />
                <p className="m-0 text-[15.5px] leading-[1.6] text-jb-soft">{t('successText', { code: doneCode })}</p>
                <span className="font-mono text-[22px] font-bold tracking-[.06em] text-white">{doneCode}</span>
                <button type="button" onClick={() => setPanel('closed')} className={`${btnGhost} mt-2 text-sm px-5 py-3`}>
                  {t('keepShopping')}
                </button>
              </div>
            ) : lines.length === 0 ? (
              <p className="px-6 py-12 m-0 text-center text-[14.5px] text-jb-muted">{t('cartEmpty')}</p>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto">
                  {panel === 'cart' ? (
                    <ul className="p-0 m-0 list-none divide-y divide-white/[.06]">
                      {lines.map(({ product: p, quantity }) => (
                        <li key={p.id} className="flex gap-3.5 px-5 py-4">
                          <Shot src={p.coverUrl} alt="" className="flex-none w-16 h-16 rounded-lg" />
                          <div className="flex flex-col flex-1 min-w-0 gap-2">
                            <span className="text-[14.5px] font-semibold leading-snug text-white">{localized(locale, p.nameEs, p.nameEn)}</span>
                            <div className="flex items-center justify-between gap-2">
                              <Stepper value={quantity} max={maxUnits(p)} onChange={(n) => setQty(p, n)} labels={[t('decrease'), t('increase')]} />
                              {showPrices && <span className="font-mono text-[14px] text-jb-soft">{money((p.priceCents ?? 0) * quantity)}</span>}
                            </div>
                          </div>
                          <button type="button" aria-label={t('remove')} title={t('remove')} onClick={() => setQty(p, 0)} className="self-start p-1.5 text-jb-muted hover:text-white">
                            <Trash2 size={15} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <form id="checkout" onSubmit={submit} className="flex flex-col gap-4 px-5 py-5">
                      <Field label={t('name')}>
                        <input name="name" required minLength={2} maxLength={100} autoComplete="name" className={inputClass} />
                      </Field>
                      <Field label={t('email')}>
                        <input name="email" type="email" required maxLength={120} autoComplete="email" className={inputClass} />
                      </Field>
                      <Field label={t('phone')}>
                        <input name="phone" type="tel" required minLength={7} maxLength={20} autoComplete="tel" className={inputClass} />
                      </Field>
                      <Field label={t('note')} optional={t('optional')}>
                        <textarea name="note" rows={3} maxLength={1000} placeholder={t('notePlaceholder')} className={`${inputClass} resize-y`} />
                      </Field>
                      <p className="m-0 text-[12.5px] leading-[1.5] text-jb-muted">{t('payNote')}</p>
                      {formError && (
                        <p role="alert" className="m-0 px-3.5 py-2.5 rounded-lg bg-red-500/10 border border-red-400/30 text-[13.5px] text-red-200">
                          {formError}
                        </p>
                      )}
                    </form>
                  )}
                </div>

                <footer className="flex flex-col gap-3 px-5 py-4 border-t border-white/[.07]">
                  {showPrices && (
                    <div className="flex items-baseline justify-between">
                      <span className="text-[14px] text-jb-soft">{t('total')}</span>
                      <span className="font-mono text-[20px] font-bold text-white">{money(totalCents)}</span>
                    </div>
                  )}
                  {panel === 'cart' ? (
                    <button type="button" onClick={() => setPanel('checkout')} className={`${btnPrimary} text-[15px] px-5 py-3.5`}>
                      {t('checkout')}
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setPanel('cart')} className={`${btnGhost} text-sm px-4 py-3`}>
                        {t('back')}
                      </button>
                      <button type="submit" form="checkout" disabled={sending} className={`${btnPrimary} flex-1 text-[15px] px-5 py-3 disabled:opacity-60`}>
                        {sending ? t('sending') : t('placeOrder')}
                      </button>
                    </div>
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
