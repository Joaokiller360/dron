'use client'

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { XCircle } from 'lucide-react';
import { quoteAction } from './actions';

/** Drops characters the API refuses in free text (markup, symbols, emoji) */
const plainText = (v: string) => v.replace(/[^\p{L}\p{M}0-9\s.,;:¿?¡!()'"%$/+-]/gu, '');

/** Client turning the quote down, with an optional reason; collapsed until asked */
export default function RejectForm({ token }: { token: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      await quoteAction(token, 'reject', { reason: reason.trim() || undefined });
      router.refresh();
    } catch (err) {
      setError((err instanceof Error && err.message) || 'No se pudo registrar tu respuesta. Inténtalo de nuevo.');
      setSending(false);
    }
  };

  if (!open) {
    return (
      <div className="mt-4 text-center print:hidden">
        <button type="button" onClick={() => setOpen(true)} className="text-[13.5px] text-[#666] underline hover:text-[#b91c1c] cursor-pointer">
          No me interesa, rechazar la proforma
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 mt-4 p-5 sm:p-6 rounded-xl border border-[#fca5a5] bg-[#fef2f2] print:hidden">
      <div className="text-[15px] font-bold">Rechazar proforma</div>
      <label className="flex flex-col gap-1.5">
        <span className="text-[13.5px] text-[#444]">¿Nos cuentas por qué? (opcional) Nos ayuda a mejorar o a ajustar la propuesta.</span>
        <textarea
          rows={3}
          maxLength={1000}
          value={reason}
          onChange={(e) => setReason(plainText(e.target.value))}
          className="w-full px-3.5 py-2.5 rounded-[10px] border border-[#ccc] bg-white text-[14px] text-[#111] outline-none focus:border-[#b91c1c] resize-y"
        />
      </label>
      {error && <p className="m-0 px-3 py-2 rounded-lg bg-white text-[13px] text-[#b91c1c]">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={sending}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-[#b91c1c] text-white text-[14px] font-semibold hover:bg-[#991b1b] disabled:opacity-50 cursor-pointer"
        >
          <XCircle size={16} /> {sending ? 'Enviando…' : 'Confirmar rechazo'}
        </button>
        <button type="button" disabled={sending} onClick={() => setOpen(false)} className="px-4 py-2.5 rounded-[10px] text-[14px] text-[#444] hover:bg-white cursor-pointer">
          Cancelar
        </button>
      </div>
    </form>
  );
}
