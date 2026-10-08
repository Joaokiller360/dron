'use client'

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

/** Keeps only letters (accents/ñ included) and single spaces between words */
const lettersOnly = (v: string) => v.replace(/[^\p{L}\p{M} ]/gu, '').replace(/^ +/, '').replace(/ {2,}/g, ' ');

/** Client's acceptance: typed name as signature + terms checkbox */
export default function AcceptForm({ token, total, version }: { token: string; total: string; version: string }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [terms, setTerms] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/quotes/public/${encodeURIComponent(token)}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), acceptTerms: terms, version }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const msg = body?.message?.message ?? body?.message;
        throw new Error(Array.isArray(msg) ? msg.join('. ') : typeof msg === 'string' ? msg : '');
      }
      // Re-renders the page from the server, now showing the acceptance
      router.refresh();
    } catch (err) {
      setError((err instanceof Error && err.message) || 'No se pudo registrar tu aceptación. Inténtalo de nuevo.');
      setSending(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 mt-10 p-5 sm:p-6 rounded-xl border-2 border-[#16a34a]/40 bg-[#f0fdf4] print:hidden">
      <div>
        <div className="text-[16px] font-bold">Aceptar proforma</div>
        <p className="mt-1 mb-0 text-[13.5px] text-[#444]">
          Al aceptar confirmas el servicio por <strong>{total}</strong> con las condiciones de esta proforma. Te contactaremos para coordinar.
        </p>
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[11px] font-semibold tracking-[.12em] uppercase text-[#555]">Tu nombre completo (firma, solo letras)</span>
        <input
          required
          minLength={3}
          maxLength={120}
          autoComplete="name"
          value={name}
          onChange={(e) => setName(lettersOnly(e.target.value))}
          title="Solo letras"
          className="w-full px-3.5 py-2.5 rounded-[10px] border border-[#ccc] bg-white text-[15px] text-[#111] outline-none focus:border-[#16a34a]"
        />
      </label>
      <label className="flex items-start gap-2.5 text-[13.5px] text-[#333] cursor-pointer">
        <input
          type="checkbox"
          required
          checked={terms}
          onChange={(e) => setTerms(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-[#16a34a] flex-none"
        />
        <span>
          He leído y acepto las condiciones de esta proforma y los{' '}
          <a href="/legal/terms-and-conditions" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#15803d] underline">
            Términos y condiciones
          </a>
          .
        </span>
      </label>
      {error && <p className="m-0 px-3 py-2 rounded-lg bg-[#fef2f2] text-[13px] text-[#b91c1c]">{error}</p>}
      <button
        type="submit"
        disabled={sending || !terms || name.trim().length < 3}
        className="inline-flex items-center justify-center gap-2 self-start px-5 py-3 rounded-[10px] bg-[#16a34a] text-white text-[15px] font-bold hover:bg-[#15803d] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
      >
        <CheckCircle2 size={18} /> {sending ? 'Registrando…' : 'Acepto la proforma'}
      </button>
    </form>
  );
}
