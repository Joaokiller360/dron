'use client'

import { useEffect, useMemo, useState, useSyncExternalStore, FormEvent, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Minus, Plus, ShoppingBag, X, Trash2, CheckCircle2, PauseCircle, Clock, MapPin, CreditCard, Landmark } from 'lucide-react';
import { Shot, localized, btnPrimary, btnGhost, inputClass, type PublicProduct, type PublicStore } from '@/app/component';
import { EMAIL_PATTERN, NAME_PATTERN, PHONE_PATTERN, PLACE_PATTERN, TEXT_PATTERN } from '@/app/utils/formRules';
import PaypalButtons, { type PaymentOutcome } from './PaypalButtons';
import TransferPayment from './TransferPayment';

const CART_KEY = 'jbskylens_cart';

type Cart = Record<string, number>;

const emptyBuyer = { name: '', email: '', phone: '', address: '', city: '', note: '' };
type Buyer = typeof emptyBuyer;

// The cart lives in localStorage (kept across reloads and tabs); a copy in
// memory covers browsers where storage is blocked
const CART_EVENT = 'jbskylens:cart';
let memoryCart = '{}';

function readCartRaw(): string {
  try {
    return window.localStorage.getItem(CART_KEY) ?? memoryCart;
  } catch {
    return memoryCart;
  }
}

function writeCart(cart: Cart) {
  memoryCart = JSON.stringify(cart);
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

function parseCart(raw: string): Cart {
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as Cart) : {};
  } catch {
    return {};
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
  const router = useRouter();
  const cartRaw = useSyncExternalStore(subscribeCart, readCartRaw, () => '{}');
  // Saved cart limited to products still on sale and to their stock
  const cart = useMemo(() => {
    const saved = parseCart(cartRaw);
    const valid: Cart = {};
    for (const p of products) {
      const qty = Math.min(Number(saved[p.id]) || 0, maxUnits(p));
      if (qty > 0) valid[p.id] = qty;
    }
    return valid;
  }, [cartRaw, products]);
  const [panel, setPanel] = useState<'closed' | 'cart' | 'checkout' | 'pay' | 'done'>('closed');
  const [buyer, setBuyer] = useState<Buyer>(emptyBuyer);
  const [formError, setFormError] = useState('');
  const [done, setDone] = useState<{ status: PaymentOutcome['status'] | 'VERIFYING'; code: string; email: string }>({
    status: 'PAID',
    code: '',
    email: '',
  });
  const hasPaypal = !!payments?.paypalClientId;
  const transfer = payments?.transfer ?? null;
  const canPay = hasPaypal || !!transfer;
  const [method, setMethod] = useState<'paypal' | 'transfer'>(hasPaypal ? 'paypal' : 'transfer');

  const selling = settings.sales;
  const money = (cents: number) =>
    (cents / 100).toLocaleString(locale === 'en' ? 'en-US' : 'es-EC', { style: 'currency', currency: 'USD' });

  const setCart = (next: Cart) => writeCart(next);

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

  const setField = (k: keyof Buyer, v: string) => setBuyer((b) => ({ ...b, [k]: v }));

  /** Checks the buyer details, then shows the PayPal buttons */
  const toPayment = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const b = Object.fromEntries(Object.entries(buyer).map(([k, v]) => [k, v.trim()])) as Buyer;
    const ok =
      NAME_PATTERN.test(b.name) &&
      EMAIL_PATTERN.test(b.email) &&
      PHONE_PATTERN.test(b.phone) &&
      b.address.length >= 5 &&
      TEXT_PATTERN.test(b.address) &&
      PLACE_PATTERN.test(b.city) &&
      (!b.note || TEXT_PATTERN.test(b.note));
    if (!ok) {
      setFormError(t('errorInvalid'));
      return;
    }
    setFormError('');
    setBuyer(b);
    setPanel('pay');
  };

  const orderBody = {
    ...buyer,
    note: buyer.note || undefined,
    locale,
    items: lines.map((l) => ({ productId: l.product.id, quantity: l.quantity })),
  };

  const onPaid = (outcome: { status: PaymentOutcome['status'] | 'VERIFYING'; code: string }) => {
    setDone({ ...outcome, email: buyer.email });
    setCart({});
    setPanel('done');
    router.refresh(); // fresh stock
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
              <h2 className="m-0 font-mono text-[16px] font-bold text-white">
                {panel === 'done'
                  ? t(done.status === 'PAID' ? 'successTitle' : done.status === 'VERIFYING' ? 'verifyingTitle' : 'pendingTitle')
                  : panel === 'pay'
                    ? t('payTitle')
                    : t('cart')}
              </h2>
              <button type="button" aria-label={t('close')} onClick={() => setPanel('closed')} className="p-2 -mr-2 text-jb-soft hover:text-white">
                <X size={19} />
              </button>
            </header>

            {panel === 'done' ? (
              <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
                {done.status === 'PAID' ? <CheckCircle2 size={44} className="text-jb-accent" /> : <Clock size={44} className="text-amber-300" />}
                <p className="m-0 text-[15.5px] leading-[1.6] text-jb-soft">
                  {t(done.status === 'PAID' ? 'successText' : done.status === 'VERIFYING' ? 'verifyingText' : 'pendingText', {
                    code: done.code,
                    email: done.email,
                  })}
                </p>
                <span className="font-mono text-[22px] font-bold tracking-[.06em] text-white">{done.code}</span>
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
                  ) : panel === 'checkout' ? (
                    <form id="checkout" onSubmit={toPayment} className="flex flex-col gap-4 px-5 py-5">
                      <Field label={t('name')}>
                        <input required minLength={2} maxLength={100} autoComplete="name" value={buyer.name} onChange={(e) => setField('name', e.target.value)} className={inputClass} />
                      </Field>
                      <Field label={t('email')}>
                        <input type="email" required maxLength={120} autoComplete="email" value={buyer.email} onChange={(e) => setField('email', e.target.value)} className={inputClass} />
                      </Field>
                      <Field label={t('phone')}>
                        <input type="tel" required minLength={7} maxLength={20} autoComplete="tel" value={buyer.phone} onChange={(e) => setField('phone', e.target.value)} className={inputClass} />
                      </Field>
                      <Field label={t('address')}>
                        <input required minLength={5} maxLength={200} autoComplete="street-address" placeholder={t('addressPlaceholder')} value={buyer.address} onChange={(e) => setField('address', e.target.value)} className={inputClass} />
                      </Field>
                      <Field label={t('city')}>
                        <input required minLength={2} maxLength={80} autoComplete="address-level2" value={buyer.city} onChange={(e) => setField('city', e.target.value)} className={inputClass} />
                      </Field>
                      <Field label={t('note')} optional={t('optional')}>
                        <textarea rows={2} maxLength={1000} placeholder={t('notePlaceholder')} value={buyer.note} onChange={(e) => setField('note', e.target.value)} className={`${inputClass} resize-y`} />
                      </Field>
                      {formError && (
                        <p role="alert" className="m-0 px-3.5 py-2.5 rounded-lg bg-red-500/10 border border-red-400/30 text-[13.5px] text-red-200">
                          {formError}
                        </p>
                      )}
                    </form>
                  ) : (
                    <div className="flex flex-col gap-4 px-5 py-5">
                      <p className="m-0 text-[13.5px] leading-[1.55] text-jb-soft">{t('payText')}</p>
                      <div className="flex flex-col gap-1 px-4 py-3 rounded-xl border border-white/[.08] text-[13.5px]">
                        <span className="font-semibold text-white">{buyer.name}</span>
                        <span className="text-jb-muted">{buyer.email} · {buyer.phone}</span>
                        <span className="inline-flex items-start gap-1.5 mt-1 text-jb-soft">
                          <MapPin size={14} className="flex-none mt-[3px] text-jb-muted" /> {buyer.address}, {buyer.city}
                        </span>
                      </div>
                      {hasPaypal && transfer && (
                        <div role="tablist" className="grid grid-cols-2 gap-1 p-1 rounded-xl border border-white/[.1]">
                          {(
                            [
                              ['paypal', t('methodPaypal'), <CreditCard key="i" size={15} />],
                              ['transfer', t('methodTransfer'), <Landmark key="i" size={15} />],
                            ] as const
                          ).map(([id, label, icon]) => (
                            <button
                              key={id}
                              type="button"
                              role="tab"
                              aria-selected={method === id}
                              onClick={() => setMethod(id)}
                              className={`inline-flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-lg text-[13px] font-semibold transition ${
                                method === id ? 'bg-jb-accent text-jb-ink' : 'text-jb-soft hover:text-white hover:bg-white/[.06]'
                              }`}
                            >
                              {icon} {label}
                            </button>
                          ))}
                        </div>
                      )}
                      {method === 'paypal' && hasPaypal ? (
                        <>
                          <PaypalButtons
                            clientId={payments.paypalClientId!}
                            locale={locale}
                            order={orderBody}
                            onDone={onPaid}
                            onStockChanged={() => router.refresh()}
                            texts={{ loadError: t('paypalLoadError'), declined: t('declined'), failed: t('paymentFailed') }}
                          />
                          <p className="m-0 text-[12px] leading-[1.5] text-jb-muted">{t('payNote')}</p>
                        </>
                      ) : (
                        transfer && (
                          <TransferPayment
                            transfer={transfer}
                            total={showPrices ? money(totalCents) : null}
                            order={orderBody}
                            onDone={(code) => onPaid({ status: 'VERIFYING', code })}
                            onStockChanged={() => router.refresh()}
                          />
                        )
                      )}
                    </div>
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
                    canPay ? (
                      <button type="button" onClick={() => setPanel('checkout')} className={`${btnPrimary} text-[15px] px-5 py-3.5`}>
                        {t('checkout')}
                      </button>
                    ) : (
                      <p className="m-0 text-[13px] leading-[1.5] text-amber-200">{t('paymentsUnavailable')}</p>
                    )
                  ) : panel === 'checkout' ? (
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setPanel('cart')} className={`${btnGhost} text-sm px-4 py-3`}>
                        {t('back')}
                      </button>
                      <button type="submit" form="checkout" className={`${btnPrimary} flex-1 text-[15px] px-5 py-3`}>
                        {t('continueToPay')}
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setPanel('checkout')} className={`${btnGhost} text-sm px-4 py-3`}>
                      {t('editDetails')}
                    </button>
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
