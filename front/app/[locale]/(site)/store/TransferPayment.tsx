'use client'

import { useState, FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Copy, Check } from 'lucide-react';
import { btnPrimary, inputClass, type PublicStore } from '@/app/component';
import { PLACE_PATTERN } from '@/app/utils/formRules';

type Transfer = NonNullable<PublicStore['payments']['transfer']>;

const CODE_PATTERN = /^[A-Za-z0-9-]{4,40}$/;

function CopyRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  const t = useTranslations('store');
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard
      ?.writeText(value)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {});
  };
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-white/[.06] last:border-0">
      <span className="flex flex-col min-w-0">
        <span className="text-[11.5px] text-jb-muted">{label}</span>
        <span className={`text-[14px] text-white break-all ${mono ? 'font-mono' : 'font-semibold'}`}>{value}</span>
      </span>
      <button type="button" onClick={copy} aria-label={`${t('copy')} ${label}`} title={copied ? t('copied') : t('copy')} className="flex-none p-1.5 rounded-md text-jb-muted hover:text-white hover:bg-white/[.08]">
        {copied ? <Check size={15} className="text-jb-accent" /> : <Copy size={15} />}
      </button>
    </div>
  );
}

/**
 * Bank transfer: shows the shop's account, then the buyer reports the bank
 * they paid from and the transfer code. The owner verifies it in the dashboard.
 */
export default function TransferPayment({
  transfer,
  total,
  order,
  onDone,
  onStockChanged,
}: {
  transfer: Transfer;
  /** Formatted total, when prices are shown */
  total: string | null;
  order: Record<string, unknown>;
  onDone: (code: string) => void;
  onStockChanged: () => void;
}) {
  const t = useTranslations('store');
  const [bank, setBank] = useState('');
  const [code, setCode] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!PLACE_PATTERN.test(bank.trim()) || !CODE_PATTERN.test(code.trim())) {
      setError(t('errorTransfer'));
      return;
    }
    setSending(true);
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...order, transferBank: bank.trim(), transferReference: code.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const m = data?.message?.message ?? data?.message;
        setError(typeof m === 'string' && res.status !== 400 ? m : res.status === 400 ? t('errorTransfer') : t('errorGeneric'));
        onStockChanged();
        return;
      }
      onDone(data.code);
    } catch {
      setError(t('errorGeneric'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="m-0 text-[13.5px] leading-[1.55] text-jb-soft">{t('transferText')}</p>
      <div className="px-4 py-1 rounded-xl border border-white/[.08] bg-white/[.02]">
        <CopyRow label={t('bank')} value={transfer.bankName} />
        <CopyRow label={`${t('accountNumber')} · ${transfer.accountType === 'CORRIENTE' ? t('checking') : t('savings')}`} value={transfer.accountNumber} mono />
        <CopyRow label={t('accountHolder')} value={transfer.accountHolder} />
        <CopyRow label={t('holderId')} value={transfer.holderId} mono />
        {total && <CopyRow label={t('amountToTransfer')} value={total} mono />}
      </div>
      {transfer.email && (
        <p className="m-0 text-[12.5px] text-jb-muted">
          {t('receiptEmail')} <a href={`mailto:${transfer.email}`} className="text-jb-soft hover:text-white">{transfer.email}</a>
        </p>
      )}
      <form onSubmit={submit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-[13.5px] font-semibold text-jb-text">{t('yourBank')}</span>
          <input required minLength={2} maxLength={80} value={bank} onChange={(e) => setBank(e.target.value)} placeholder={t('yourBankPlaceholder')} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[13.5px] font-semibold text-jb-text">{t('transferCode')}</span>
          <input required minLength={4} maxLength={40} value={code} onChange={(e) => setCode(e.target.value)} placeholder={t('transferCodePlaceholder')} className={`${inputClass} font-mono`} />
        </label>
        {error && (
          <p role="alert" className="m-0 px-3.5 py-2.5 rounded-lg bg-red-500/10 border border-red-400/30 text-[13.5px] text-red-200">
            {error}
          </p>
        )}
        <button type="submit" disabled={sending} className={`${btnPrimary} text-[15px] px-5 py-3.5 disabled:opacity-60`}>
          {sending ? t('sending') : t('sendTransfer')}
        </button>
      </form>
    </div>
  );
}
