'use client'

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Gift } from 'lucide-react';
import { btnPrimary } from '@/app/component';

/**
 * Order whose total is $0 (100% promotion and free shipping): nothing to pay,
 * the buyer only confirms it. The API checks the total itself.
 */
export default function FreeOrder({
  order,
  onDone,
  onStockChanged,
}: {
  order: Record<string, unknown>;
  onDone: (code: string) => void;
  onStockChanged: () => void;
}) {
  const t = useTranslations('store');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const confirm = async () => {
    setSending(true);
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/free`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        // e.g. the promotion ended or the stock ran out meanwhile
        const m = data?.message?.message ?? data?.message;
        setError(typeof m === 'string' ? m : t('errorGeneric'));
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
    <div className="flex flex-col gap-3">
      <p className="m-0 text-[13.5px] leading-[1.55] text-jb-soft">{t('freeText')}</p>
      <button type="button" disabled={sending} onClick={confirm} className={`${btnPrimary} self-start text-[15px] px-6 py-3.5`}>
        <Gift size={16} /> {sending ? t('sending') : t('confirmFree')}
      </button>
      {error && (
        <p role="alert" className="m-0 px-3.5 py-2.5 rounded-lg bg-red-500/10 border border-red-400/30 text-[13.5px] text-red-200">
          {error}
        </p>
      )}
    </div>
  );
}
