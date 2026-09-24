'use client'

import { useState, FormEvent, ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, CheckCircle2, Clock, CreditCard, Landmark, MapPin, Pencil, Trash2 } from 'lucide-react';
import { Shot, localized, btnPrimary, btnGhost, inputClass, usePrefix, type PublicProduct, type PublicStore } from '@/app/component';
import { EMAIL_PATTERN, NAME_PATTERN, PLACE_PATTERN, TEXT_PATTERN } from '@/app/utils/formRules';
import PhoneInput, { formatPhone, isValidPhone, type PhoneCountry } from '@/app/component/site/PhoneInput';
import PaypalButtons, { type PaymentOutcome } from '../PaypalButtons';
import TransferPayment from '../TransferPayment';
import { Stepper, optionsText, useCart, useMoney, type CartLine } from '../cart';

const emptyBuyer = { name: '', email: '', phoneCountry: 'EC' as PhoneCountry, phone: '', address: '', city: '', note: '' };
type Buyer = typeof emptyBuyer;
type Done = { status: PaymentOutcome['status'] | 'VERIFYING'; code: string; email: string };

function Field({ label, optional, className = '', children }: { label: string; optional?: string; className?: string; children: ReactNode }) {
  return (
    <label className={`flex flex-col min-w-0 gap-1.5 ${className}`}>
      <span className="text-[13.5px] font-semibold text-jb-text">
        {label}
        {optional && <span className="ml-1 font-normal text-jb-muted">({optional})</span>}
      </span>
      {children}
    </label>
  );
}

function StepCard({ n, title, active, action, children }: { n: number; title: string; active: boolean; action?: ReactNode; children: ReactNode }) {
  return (
    <section className={`rounded-2xl border bg-jb-card transition ${active ? 'border-white/[.12]' : 'border-white/[.06]'}`}>
      <header className="flex items-center gap-3 px-6 pt-5 pb-4">
        <span
          className={`flex items-center justify-center flex-none w-7 h-7 rounded-full font-mono text-[13px] font-bold ${
            active ? 'bg-jb-accent text-jb-ink' : 'bg-white/[.08] text-jb-soft'
          }`}
        >
          {n}
        </span>
        <h2 className="flex-1 m-0 font-mono text-[17px] font-bold text-white">{title}</h2>
        {action}
      </header>
      <div className="px-6 pb-6">{children}</div>
    </section>
  );
}

export default function CheckoutClient({
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
  const router = useRouter();
  const money = useMoney();
  const cart = useCart(products, settings.showPrices);
  const { ready, setLineQty, maxFor, clear } = cart;

  const [step, setStep] = useState<'details' | 'pay'>('details');
  const [buyer, setBuyer] = useState<Buyer>(emptyBuyer);
  const [formError, setFormError] = useState('');
  const [done, setDone] = useState<Done | null>(null);
  // Cart as it was when the buyer went to pay. Starting a payment reserves the
  // units, which can drop live stock to 0 and would otherwise empty this very
  // cart; the order being paid must not change under the buyer.
  const [frozen, setFrozen] = useState<CartLine[] | null>(null);
  const lines = step === 'pay' && frozen ? frozen : cart.lines;
  const units = lines.reduce((n, l) => n + l.quantity, 0);
  const showPrices = settings.showPrices && lines.every((l) => l.unitCents !== null);
  const totalCents = lines.reduce((sum, l) => sum + (l.unitCents ?? 0) * l.quantity, 0);

  const hasPaypal = !!payments?.paypalClientId;
  const transfer = payments?.transfer ?? null;
  const [method, setMethod] = useState<'paypal' | 'transfer'>(hasPaypal ? 'paypal' : 'transfer');

  const setField = (k: Exclude<keyof Buyer, 'phoneCountry'>, v: string) => setBuyer((b) => ({ ...b, [k]: v }));
  const fullPhone = formatPhone(buyer.phoneCountry, buyer.phone);

  const toPayment = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const b = Object.fromEntries(Object.entries(buyer).map(([k, v]) => [k, v.trim()])) as Buyer;
    if (!isValidPhone(b.phoneCountry, b.phone)) {
      setFormError(t('errorPhone'));
      return;
    }
    const ok =
      NAME_PATTERN.test(b.name) &&
      EMAIL_PATTERN.test(b.email) &&
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
    setFrozen(cart.lines);
    setStep('pay');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const orderBody = {
    name: buyer.name,
    email: buyer.email,
    phone: fullPhone,
    address: buyer.address,
    city: buyer.city,
    note: buyer.note || undefined,
    locale,
    items: lines.map((l) => ({ productId: l.product.id, quantity: l.quantity, ...(l.options.length ? { options: l.options } : {}) })),
  };

  const finish = (outcome: { status: Done['status']; code: string }) => {
    setDone({ ...outcome, email: buyer.email });
    clear();
    router.refresh(); // fresh stock
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const backLink = (
    <Link href={`${prefix}/store`} className="inline-flex items-center gap-1.5 text-[13.5px] text-jb-soft hover:text-white">
      <ArrowLeft size={15} /> {t('backToStore')}
    </Link>
  );

  // ── Order placed ──
  if (done) {
    return (
      <section className="px-6 pt-20 pb-24 jb-glow">
        <div className="max-w-[560px] mx-auto flex flex-col items-center gap-5 text-center">
          {done.status === 'PAID' ? <CheckCircle2 size={56} className="text-jb-accent" /> : <Clock size={56} className="text-amber-300" />}
          <h1 className="m-0 font-mono text-[clamp(28px,4vw,40px)] font-bold tracking-[-.02em] text-white">
            {t(done.status === 'PAID' ? 'successTitle' : done.status === 'VERIFYING' ? 'verifyingTitle' : 'pendingTitle')}
          </h1>
          <span className="px-4 py-2 rounded-xl border border-white/[.12] font-mono text-[22px] font-bold tracking-[.06em] text-white">{done.code}</span>
          <p className="m-0 text-[16px] leading-[1.65] text-jb-soft">
            {t(done.status === 'PAID' ? 'successText' : done.status === 'VERIFYING' ? 'verifyingText' : 'pendingText', { code: done.code, email: done.email })}
          </p>
          <Link href={`${prefix}/store`} className={`${btnGhost} mt-2 text-sm px-5 py-3`}>
            {t('keepShopping')}
          </Link>
        </div>
      </section>
    );
  }

  const summary = (
    <aside className="flex flex-col gap-4 p-6 rounded-2xl border border-white/[.08] bg-jb-band lg:sticky lg:top-24">
      <h2 className="m-0 font-mono text-[16px] font-bold text-white">
        {t('summary')} <span className="text-jb-muted">({units})</span>
      </h2>
      <ul className="flex flex-col gap-4 p-0 m-0 list-none">
        {lines.map((line) => {
          const { product: p, quantity } = line;
          return (
          <li key={line.key} className="flex gap-3">
            <Shot src={p.coverUrl} alt="" className="flex-none rounded-lg w-14 h-14" />
            <div className="flex flex-col flex-1 min-w-0 gap-1.5">
              <span className="text-[14px] font-semibold leading-snug text-white">{localized(locale, p.nameEs, p.nameEn)}</span>
              {line.options.length > 0 && <span className="-mt-1 text-[12.5px] text-jb-muted">{optionsText(line.options)}</span>}
              {step === 'details' ? (
                <div className="flex items-center justify-between gap-2">
                  <Stepper value={quantity} max={maxFor(line)} onChange={(n) => setLineQty(line.key, n)} labels={[t('decrease'), t('increase')]} />
                  <button type="button" aria-label={t('remove')} title={t('remove')} onClick={() => setLineQty(line.key, 0)} className="p-1.5 text-jb-muted hover:text-white">
                    <Trash2 size={14} />
                  </button>
                </div>
              ) : (
                <span className="font-mono text-[12.5px] text-jb-muted">× {quantity}</span>
              )}
            </div>
            {showPrices && <span className="font-mono text-[13.5px] text-jb-soft whitespace-nowrap">{money((line.unitCents ?? 0) * quantity)}</span>}
          </li>
          );
        })}
      </ul>
      {showPrices && (
        <div className="flex items-baseline justify-between pt-4 border-t border-white/[.08]">
          <span className="text-[14.5px] font-semibold text-white">{t('total')}</span>
          <span className="font-mono text-[24px] font-bold text-white">{money(totalCents)}</span>
        </div>
      )}
    </aside>
  );

  return (
    <section className="px-6 pt-10 pb-24">
      <div className="max-w-[1180px] mx-auto">
        {backLink}
        <h1 className="mt-4 mb-8 font-mono text-[clamp(28px,4vw,42px)] font-bold tracking-[-.03em] text-white">{t('checkoutTitle')}</h1>

        {!ready ? (
          <div className="h-[420px] rounded-2xl bg-white/[.04] animate-pulse" />
        ) : lines.length === 0 ? (
          <div className="flex flex-col items-start gap-4 p-8 rounded-2xl border border-white/[.08] bg-jb-card">
            <p className="m-0 text-[15px] text-jb-soft">{t('checkoutEmpty')}</p>
            <Link href={`${prefix}/store`} className={`${btnPrimary} text-sm px-5 py-3`}>
              {t('backToStore')}
            </Link>
          </div>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="flex flex-col order-2 gap-4 lg:order-1">
              {/* 1 · Buyer details */}
              <StepCard
                n={1}
                title={t('stepDetails')}
                active={step === 'details'}
                action={
                  step === 'pay' && (
                    <button
                      type="button"
                      onClick={() => {
                        setStep('details');
                        setFrozen(null);
                        router.refresh(); // live stock again
                      }}
                      className="inline-flex items-center gap-1.5 text-[13px] text-jb-soft hover:text-white">
                      <Pencil size={14} /> {t('edit')}
                    </button>
                  )
                }
              >
                {step === 'details' ? (
                  <form onSubmit={toPayment} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-4">
                      <span className="font-mono text-[11px] tracking-[.16em] uppercase text-jb-mint">{t('contact')}</span>
                      <Field label={t('name')}>
                        <input required minLength={2} maxLength={100} autoComplete="name" value={buyer.name} onChange={(e) => setField('name', e.target.value)} className={inputClass} />
                      </Field>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label={t('email')}>
                          <input type="email" required maxLength={120} autoComplete="email" value={buyer.email} onChange={(e) => setField('email', e.target.value)} className={inputClass} />
                        </Field>
                        <div className="flex flex-col min-w-0 gap-1.5">
                          <label htmlFor="checkout-phone" className="text-[13.5px] font-semibold text-jb-text">
                            {t('phone')}
                          </label>
                          <PhoneInput
                            id="checkout-phone"
                            country={buyer.phoneCountry}
                            number={buyer.phone}
                            onChange={(phoneCountry, phone) => setBuyer((b) => ({ ...b, phoneCountry, phone }))}
                            inputClassName={inputClass}
                            countryLabel={t('phoneCountry')}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-4">
                      <span className="font-mono text-[11px] tracking-[.16em] uppercase text-jb-mint">{t('shipping')}</span>
                      <div className="grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                        <Field label={t('address')}>
                          <input required minLength={5} maxLength={200} autoComplete="street-address" placeholder={t('addressPlaceholder')} value={buyer.address} onChange={(e) => setField('address', e.target.value)} className={inputClass} />
                        </Field>
                        <Field label={t('city')}>
                          <input required minLength={2} maxLength={80} autoComplete="address-level2" value={buyer.city} onChange={(e) => setField('city', e.target.value)} className={inputClass} />
                        </Field>
                      </div>
                      <Field label={t('note')} optional={t('optional')}>
                        <textarea rows={2} maxLength={1000} placeholder={t('notePlaceholder')} value={buyer.note} onChange={(e) => setField('note', e.target.value)} className={`${inputClass} resize-y`} />
                      </Field>
                    </div>
                    {formError && (
                      <p role="alert" className="m-0 px-3.5 py-2.5 rounded-lg bg-red-500/10 border border-red-400/30 text-[13.5px] text-red-200">
                        {formError}
                      </p>
                    )}
                    <button type="submit" className={`${btnPrimary} self-start text-[15px] px-6 py-3.5`}>
                      {t('continueToPay')}
                    </button>
                  </form>
                ) : (
                  <div className="flex flex-col gap-1 text-[14px]">
                    <span className="font-semibold text-white">{buyer.name}</span>
                    <span className="text-jb-muted">
                      {buyer.email} · {fullPhone}
                    </span>
                    <span className="inline-flex items-start gap-1.5 mt-1 text-jb-soft">
                      <MapPin size={14} className="flex-none mt-[3px] text-jb-muted" /> {buyer.address}, {buyer.city}
                    </span>
                  </div>
                )}
              </StepCard>

              {/* 2 · Payment */}
              <StepCard n={2} title={t('stepPayment')} active={step === 'pay'}>
                {step === 'details' ? (
                  <p className="m-0 text-[14px] text-jb-muted">{t('paymentLocked')}</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    <p className="m-0 text-[14px] leading-[1.55] text-jb-soft">{t('payText')}</p>
                    {hasPaypal && transfer && (
                      <div role="tablist" className="grid grid-cols-2 gap-1 p-1 rounded-xl border border-white/[.1] max-w-[480px]">
                        {(
                          [
                            ['paypal', t('methodPaypal'), <CreditCard key="i" size={16} />],
                            ['transfer', t('methodTransfer'), <Landmark key="i" size={16} />],
                          ] as const
                        ).map(([id, label, icon]) => (
                          <button
                            key={id}
                            type="button"
                            role="tab"
                            aria-selected={method === id}
                            onClick={() => setMethod(id)}
                            className={`inline-flex items-center justify-center gap-2 px-3 py-3 rounded-lg text-[14px] font-semibold transition ${
                              method === id ? 'bg-jb-accent text-jb-ink' : 'text-jb-soft hover:text-white hover:bg-white/[.06]'
                            }`}
                          >
                            {icon} {label}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="w-auto">
                      {method === 'paypal' && hasPaypal ? (
                        <div className="flex flex-col gap-3">
                          <PaypalButtons
                            clientId={payments.paypalClientId!}
                            locale={locale}
                            order={orderBody}
                            onDone={finish}
                            onStockChanged={() => router.refresh()}
                            texts={{ loadError: t('paypalLoadError'), declined: t('declined'), failed: t('paymentFailed') }}
                          />
                          <p className="m-0 text-[12.5px] leading-[1.5] text-jb-muted">{t('payNote')}</p>
                        </div>
                      ) : transfer ? (
                        <TransferPayment
                          transfer={transfer}
                          total={showPrices ? money(totalCents) : null}
                          order={orderBody}
                          onDone={(code) => finish({ status: 'VERIFYING', code })}
                          onStockChanged={() => router.refresh()}
                        />
                      ) : (
                        <p className="m-0 text-[14px] text-amber-200">{t('paymentsUnavailable')}</p>
                      )}
                    </div>
                  </div>
                )}
              </StepCard>
            </div>

            <div className="order-1 lg:order-2">{summary}</div>
          </div>
        )}
      </div>
    </section>
  );
}
