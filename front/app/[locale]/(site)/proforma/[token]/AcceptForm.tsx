'use client'

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { quoteAction } from './actions';

/** Keeps only letters (accents/ñ included) and single spaces between words */
const lettersOnly = (v: string) => v.replace(/[^\p{L}\p{M} ]/gu, '').replace(/^ +/, '').replace(/ {2,}/g, ' ');

/** Billing details prefilled from the quote's client data */
export interface InvoiceDefaults {
  name: string;
  taxId: string;
  email: string;
}

const fieldCls =
  'w-full px-3.5 py-2.5 rounded-[10px] border border-[#ccc] bg-white text-[15px] text-[#111] outline-none focus:border-[#16a34a]';
const labelCls = 'font-mono text-[11px] font-semibold tracking-[.12em] uppercase text-[#555]';

/** Cédula (10 digits) or RUC (13) */
const isTaxId = (v: string) => /^\d{10}(\d{3})?$/.test(v);

function TaxIdInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className={labelCls}>Cédula o RUC</span>
      <input
        required
        inputMode="numeric"
        pattern="\d{10}(\d{3})?"
        title="10 dígitos (cédula) o 13 (RUC)"
        maxLength={13}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
        className={`${fieldCls} font-mono`}
      />
    </label>
  );
}

function EmailInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className={labelCls}>Correo para la factura</span>
      <input required type="email" maxLength={120} value={value} onChange={(e) => onChange(e.target.value)} className={fieldCls} />
    </label>
  );
}

function AddressInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className={labelCls}>Dirección</span>
      <input required minLength={5} maxLength={200} autoComplete="street-address" value={value} onChange={(e) => onChange(e.target.value)} className={fieldCls} />
    </label>
  );
}

/** Client's acceptance: typed name as signature + terms checkbox */
export default function AcceptForm({
  token,
  total,
  invoiceTotal,
  invoiceTaxPercent,
  version,
  invoiceDefaults,
}: {
  token: string;
  total: string;
  invoiceTotal: string;
  invoiceTaxPercent: number;
  version: string;
  invoiceDefaults: InvoiceDefaults;
}) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [terms, setTerms] = useState(false);
  const [wantsInvoice, setWantsInvoice] = useState(false);
  // Invoice to the proforma's client (filling only what it lacks) or to someone else
  const [mode, setMode] = useState<'same' | 'other'>('same');
  const knownTaxId = isTaxId(invoiceDefaults.taxId) ? invoiceDefaults.taxId : '';
  const [same, setSame] = useState({ taxId: knownTaxId, email: invoiceDefaults.email, address: '' });
  const [other, setOther] = useState({ name: '', taxId: '', email: '', address: '' });
  const invoice = mode === 'same' ? { name: invoiceDefaults.name, ...same } : other;
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      await quoteAction(token, 'accept', {
        name: name.trim(),
        acceptTerms: terms,
        version,
        ...(wantsInvoice && { invoice }),
      });
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
          Al aceptar confirmas el servicio por <strong>{wantsInvoice ? `${invoiceTotal} (IVA ${invoiceTaxPercent}% incluido, con factura)` : `${total} (sin factura)`}</strong> con las condiciones de esta proforma. Te contactaremos para coordinar.
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
      <div className="flex flex-col gap-3 p-4 rounded-lg border border-[#d4d4d4] bg-white">
        <label className="flex items-start gap-2.5 text-[13.5px] text-[#333] cursor-pointer">
          <input
            type="checkbox"
            checked={wantsInvoice}
            onChange={(e) => setWantsInvoice(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-[#16a34a] flex-none"
          />
          <span>
            <strong>Deseo factura</strong> (se suma el IVA {invoiceTaxPercent}%: total {invoiceTotal}). Todas las facturas se emiten a fin de mes.
          </span>
        </label>
        {wantsInvoice && (
          <>
            <div role="radiogroup" aria-label="Datos de la factura" className="grid gap-2 sm:grid-cols-2">
              {(
                [
                  ['same', 'Con los datos de la proforma'],
                  ['other', 'Con otros datos'],
                ] as const
              ).map(([id, label]) => (
                <label
                  key={id}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-[10px] border text-[13.5px] cursor-pointer ${
                    mode === id ? 'border-[#16a34a] bg-[#f0fdf4] font-semibold text-[#111]' : 'border-[#d4d4d4] text-[#444]'
                  }`}
                >
                  <input type="radio" name="invoice-mode" checked={mode === id} onChange={() => setMode(id)} className="w-4 h-4 accent-[#16a34a]" />
                  {label}
                </label>
              ))}
            </div>

            {mode === 'same' ? (
              <div className="flex flex-col gap-3">
                <dl className="grid gap-x-4 gap-y-1 m-0 px-3.5 py-3 rounded-[10px] bg-[#f5f5f5] text-[13.5px] grid-cols-[auto_1fr]">
                  <dt className="text-[#666]">A nombre de</dt>
                  <dd className="m-0 font-semibold">{invoiceDefaults.name}</dd>
                  {knownTaxId && (
                    <>
                      <dt className="text-[#666]">Cédula / RUC</dt>
                      <dd className="m-0 font-mono">{knownTaxId}</dd>
                    </>
                  )}
                  {invoiceDefaults.email && (
                    <>
                      <dt className="text-[#666]">Correo</dt>
                      <dd className="m-0">{invoiceDefaults.email}</dd>
                    </>
                  )}
                </dl>
                <div className="grid gap-3 sm:grid-cols-2">
                  {!knownTaxId && <TaxIdInput value={same.taxId} onChange={(v) => setSame((p) => ({ ...p, taxId: v }))} />}
                  {!invoiceDefaults.email && (
                    <EmailInput value={same.email} onChange={(v) => setSame((p) => ({ ...p, email: v }))} />
                  )}
                  <AddressInput value={same.address} onChange={(v) => setSame((p) => ({ ...p, address: v }))} />
                </div>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                  <span className={labelCls}>Nombre o razón social</span>
                  <input required minLength={3} maxLength={150} value={other.name} onChange={(e) => setOther((p) => ({ ...p, name: e.target.value }))} className={fieldCls} />
                </label>
                <TaxIdInput value={other.taxId} onChange={(v) => setOther((p) => ({ ...p, taxId: v }))} />
                <EmailInput value={other.email} onChange={(v) => setOther((p) => ({ ...p, email: v }))} />
                <AddressInput value={other.address} onChange={(v) => setOther((p) => ({ ...p, address: v }))} />
              </div>
            )}
          </>
        )}
      </div>
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
