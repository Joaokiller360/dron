'use client'

import { useEffect, useMemo, useState, FormEvent } from 'react';
import { FileText, ChevronRight, Plus, Trash2, Mail, MessageCircle, ExternalLink, Copy, Check, Clock, Save, BadgeCheck, Ban, RefreshCw } from 'lucide-react';
import { apiFetch, errorMessage, formatMoney, Product, Quote, QuoteItem, QuoteStatus, Service } from './lib/api';
import { useCollection } from './lib/useCollection';
import Modal from './Modal';
import { Card, ConfirmDelete, EmptyState, ErrorNote, Field, PanelHeader, Pill, SearchInput, SkeletonList, btn, inputCls, useToast } from './ui';

const STATUSES: { id: QuoteStatus; label: string; tone: 'on' | 'muted' | 'warn' | 'info' }[] = [
  { id: 'DRAFT', label: 'Borrador', tone: 'muted' },
  { id: 'SENT', label: 'Enviada', tone: 'info' },
  { id: 'ACCEPTED', label: 'Aceptada', tone: 'on' },
  { id: 'REJECTED', label: 'Rechazada', tone: 'warn' },
];
const statusOf = (s: QuoteStatus) => STATUSES.find((x) => x.id === s)!;

const TAX_OPTIONS = [0, 15];
const DEFAULT_NOTES = 'Forma de pago: 50% de anticipo para reservar la fecha y 50% a la entrega del material.';
const DEFAULT_VALID_DAYS = 15;
// Same cap as the API ($10,000,000)
const MAX_SUBTOTAL_CENTS = 1_000_000_000;

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('es-EC', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

/** "12,5" / "12.50" → 1250; NaN when it isn't a number */
const toCents = (v: string) => Math.round(parseFloat(v.replace(',', '.')) * 100);
const fromCents = (c: number) => (c ? (c / 100).toFixed(2) : '');
const lineCents = (l: QuoteItem) => Math.round(l.quantity * l.unitCents);

/** Same formula as the API (which is the one that counts) */
function computeTotals(items: QuoteItem[], discountCents: number, taxPercent: number) {
  const subtotalCents = items.reduce((s, l) => s + lineCents(l), 0);
  const taxCents = Math.round(((subtotalCents - discountCents) * taxPercent) / 100);
  return { subtotalCents, taxCents, totalCents: subtotalCents - discountCents + taxCents };
}

/** wa.me link for a phone as typed ("099 123 4567" → Ecuador +593); no phone = pick the chat in WhatsApp */
function whatsappUrl(phone: string | null | undefined, text: string) {
  let digits = (phone ?? '').replace(/\D/g, '');
  if (digits.startsWith('0')) digits = `593${digits.slice(1)}`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

const publicLink = (q: Quote) => `${window.location.origin}/proforma/${q.token}`;

function whatsappText(q: Quote) {
  const lines = q.items.map((l) => `• ${l.quantity} × ${l.description} — ${formatMoney(lineCents(l))}`);
  const valid = q.validUntil
    ? `\nVálida hasta el ${new Date(q.validUntil).toLocaleDateString('es-EC', { day: 'numeric', month: 'long', timeZone: 'UTC' })}.`
    : '';
  return [
    `Hola ${q.clientName}, te comparto la proforma ${q.code} de JB.SKYLENS:`,
    '',
    ...lines,
    '',
    `*Total: ${formatMoney(q.totalCents)}*${q.taxPercent ? ` (IVA ${q.taxPercent}% incluido)` : ''}${valid}`,
    '',
    `Mírala completa y descárgala en PDF aquí: ${publicLink(q)}`,
  ].join('\n');
}

interface ItemDraft {
  description: string;
  quantity: string;
  price: string;
}

interface Draft {
  clientName: string;
  clientCompany: string;
  clientTaxId: string;
  clientEmail: string;
  clientPhone: string;
  items: ItemDraft[];
  discount: string;
  taxPercent: number;
  validUntil: string;
  notes: string;
}

const emptyItem = (): ItemDraft => ({ description: '', quantity: '1', price: '' });

function draftOf(q: Quote | null): Draft {
  if (!q) {
    const until = new Date(Date.now() + DEFAULT_VALID_DAYS * 86_400_000);
    return {
      clientName: '',
      clientCompany: '',
      clientTaxId: '',
      clientEmail: '',
      clientPhone: '',
      items: [emptyItem()],
      discount: '',
      taxPercent: 15,
      validUntil: until.toISOString().slice(0, 10),
      notes: DEFAULT_NOTES,
    };
  }
  return {
    clientName: q.clientName,
    clientCompany: q.clientCompany ?? '',
    clientTaxId: q.clientTaxId ?? '',
    clientEmail: q.clientEmail ?? '',
    clientPhone: q.clientPhone ?? '',
    items: q.items.map((l) => ({ description: l.description, quantity: String(l.quantity), price: fromCents(l.unitCents) })),
    discount: fromCents(q.discountCents),
    taxPercent: q.taxPercent,
    validUntil: q.validUntil ? q.validUntil.slice(0, 10) : '',
    notes: q.notes ?? '',
  };
}

/** Items that can be priced; rows with an empty description are ignored */
function parseItems(items: ItemDraft[]): QuoteItem[] {
  return items
    .filter((l) => l.description.trim())
    .map((l) => ({
      description: l.description.trim(),
      quantity: Math.round(parseFloat(l.quantity.replace(',', '.')) * 100) / 100 || 0,
      unitCents: toCents(l.price) || 0,
    }));
}

function payloadOf(d: Draft) {
  return {
    clientName: d.clientName.trim(),
    clientCompany: d.clientCompany.trim() || null,
    clientTaxId: d.clientTaxId.trim() || null,
    clientEmail: d.clientEmail.trim() || null,
    clientPhone: d.clientPhone.trim() || null,
    items: parseItems(d.items),
    discountCents: toCents(d.discount) || 0,
    taxPercent: d.taxPercent,
    validUntil: d.validUntil || null,
    notes: d.notes.trim() || null,
  };
}

function SentState({ at, label }: { at?: string | null; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[12px] ${at ? 'text-jb-mint' : 'text-jb-muted'}`}>
      {at ? <Check size={13} /> : <Clock size={13} />}
      {label}: {at ? formatDate(at) : 'sin enviar'}
    </span>
  );
}

/** Create / edit form; `quote` null = new proforma */
function QuoteEditor({
  quote,
  quotes,
  catalog,
  onSaved,
}: {
  quote: Quote | null;
  quotes: Quote[];
  catalog: { label: string; cents: number | null }[];
  onSaved: (q: Quote, created: boolean) => void;
}) {
  const [d, setD] = useState<Draft>(() => draftOf(quote));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setD((prev) => ({ ...prev, [key]: value }));
  const setItem = (i: number, patch: Partial<ItemDraft>) =>
    setD((prev) => ({ ...prev, items: prev.items.map((l, j) => (j === i ? { ...l, ...patch } : l)) }));

  const items = parseItems(d.items);
  const discountCents = toCents(d.discount) || 0;
  const t = computeTotals(items, discountCents, d.taxPercent);
  const dirty = JSON.stringify(payloadOf(d)) !== JSON.stringify(payloadOf(draftOf(quote)));

  // Earlier clients, newest first, to fill their details again
  const pastClients = useMemo(() => {
    const seen = new Map<string, Quote>();
    quotes.forEach((q) => {
      const key = q.clientName.toLowerCase();
      if (!seen.has(key)) seen.set(key, q);
    });
    return [...seen.values()];
  }, [quotes]);

  const onClientName = (name: string) => {
    const past = pastClients.find((q) => q.clientName.toLowerCase() === name.trim().toLowerCase());
    setD((prev) => ({
      ...prev,
      clientName: name,
      // Only fills empty fields, never overwrites what was typed
      ...(past && {
        clientCompany: prev.clientCompany || past.clientCompany || '',
        clientTaxId: prev.clientTaxId || past.clientTaxId || '',
        clientEmail: prev.clientEmail || past.clientEmail || '',
        clientPhone: prev.clientPhone || past.clientPhone || '',
      }),
    }));
  };

  const onDescription = (i: number, description: string) => {
    const match = catalog.find((c) => c.label === description);
    setItem(i, {
      description,
      ...(match?.cents != null && !d.items[i].price && { price: fromCents(match.cents) }),
    });
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!items.length) return setError('Agrega al menos un ítem con descripción.');
    if (items.some((l) => l.quantity <= 0)) return setError('Cada ítem necesita una cantidad mayor que 0.');
    if (t.subtotalCents > MAX_SUBTOTAL_CENTS) return setError(`El subtotal no puede superar ${formatMoney(MAX_SUBTOTAL_CENTS)}.`);
    if (discountCents > t.subtotalCents) return setError('El descuento no puede ser mayor que el subtotal.');
    setSaving(true);
    setError('');
    try {
      const body = JSON.stringify(payloadOf(d));
      const saved = quote
        ? await apiFetch<Quote>(`/quotes/${quote.id}`, { method: 'PATCH', body })
        : await apiFetch<Quote>('/quotes', { method: 'POST', body });
      onSaved(saved, !quote);
    } catch (err) {
      setError(errorMessage(err, 'No se pudo guardar la proforma.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <fieldset className="grid gap-3 p-0 m-0 border-0 sm:grid-cols-2">
        <legend className="mb-3 text-[13.5px] font-semibold text-white">Cliente</legend>
        <Field label="Nombre">
          <input required minLength={2} maxLength={120} list="quote-clients" value={d.clientName} onChange={(e) => onClientName(e.target.value)} className={inputCls} />
          <datalist id="quote-clients">
            {pastClients.map((q) => (
              <option key={q.id} value={q.clientName}>
                {q.clientCompany ?? ''}
              </option>
            ))}
          </datalist>
        </Field>
        <Field label="Empresa" hint="Opcional">
          <input maxLength={120} value={d.clientCompany} onChange={(e) => set('clientCompany', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Cédula o RUC" hint="Opcional">
          <input maxLength={20} pattern="[0-9A-Za-z\-]{5,20}" value={d.clientTaxId} onChange={(e) => set('clientTaxId', e.target.value)} className={`${inputCls} font-mono`} />
        </Field>
        <Field label="Correo">
          <input type="email" maxLength={120} value={d.clientEmail} onChange={(e) => set('clientEmail', e.target.value)} className={inputCls} />
        </Field>
        <Field label="WhatsApp" hint="Ej. 099 123 4567 o +593 99 123 4567">
          <input type="tel" minLength={7} maxLength={20} pattern="\+?[0-9 ()\-]+" value={d.clientPhone} onChange={(e) => set('clientPhone', e.target.value)} className={inputCls} />
        </Field>
      </fieldset>

      <div className="flex flex-col gap-2">
        <span className="text-[13.5px] font-semibold text-white">Ítems</span>
        <datalist id="quote-catalog">
          {catalog.map((c) => (
            <option key={c.label} value={c.label} />
          ))}
        </datalist>
        <div className="hidden sm:grid grid-cols-[minmax(0,1fr)_80px_110px_96px_32px] gap-2 font-mono text-[10.5px] font-semibold tracking-[.12em] uppercase text-jb-muted">
          <span>Descripción</span>
          <span>Cant.</span>
          <span>Precio unit.</span>
          <span className="text-right">Total</span>
          <span />
        </div>
        {d.items.map((l, i) => {
          const parsed = parseItems([l])[0];
          return (
            <div key={i} className="grid grid-cols-[1fr_1fr_auto] sm:grid-cols-[minmax(0,1fr)_80px_110px_96px_32px] gap-2 items-center max-sm:pb-3 max-sm:border-b max-sm:border-white/[.07]">
              <input
                aria-label="Descripción"
                placeholder="Servicio o producto"
                list="quote-catalog"
                maxLength={300}
                value={l.description}
                onChange={(e) => onDescription(i, e.target.value)}
                className={`${inputCls} max-sm:col-span-3`}
              />
              <input aria-label="Cantidad" inputMode="decimal" value={l.quantity} onChange={(e) => setItem(i, { quantity: e.target.value })} className={`${inputCls} font-mono`} />
              <input aria-label="Precio unitario" inputMode="decimal" placeholder="0.00" value={l.price} onChange={(e) => setItem(i, { price: e.target.value })} className={`${inputCls} font-mono`} />
              <span className="font-mono text-[13.5px] text-right text-jb-soft max-sm:hidden">{parsed ? formatMoney(lineCents(parsed)) : '—'}</span>
              <button
                type="button"
                aria-label="Quitar ítem"
                disabled={d.items.length === 1}
                onClick={() => set('items', d.items.filter((_, j) => j !== i))}
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-jb-soft hover:text-red-300 hover:bg-red-500/15 disabled:opacity-30 cursor-pointer"
              >
                <Trash2 size={15} />
              </button>
            </div>
          );
        })}
        <button type="button" onClick={() => set('items', [...d.items, emptyItem()])} className={`${btn.subtle} self-start`}>
          <Plus size={15} /> Agregar ítem
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Descuento ($)" hint="Se resta antes del IVA">
          <input inputMode="decimal" placeholder="0.00" value={d.discount} onChange={(e) => set('discount', e.target.value)} className={`${inputCls} font-mono`} />
        </Field>
        <Field label="IVA">
          <select value={d.taxPercent} onChange={(e) => set('taxPercent', Number(e.target.value))} className={inputCls}>
            {TAX_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p ? `${p}%` : 'Sin IVA'}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Válida hasta" hint="Opcional">
          <input type="date" value={d.validUntil} onChange={(e) => set('validUntil', e.target.value)} className={inputCls} />
        </Field>
      </div>

      <Field label="Condiciones y notas" hint="Forma de pago, tiempo de entrega, qué incluye…">
        <textarea rows={3} maxLength={2000} value={d.notes} onChange={(e) => set('notes', e.target.value)} className={`${inputCls} resize-y`} />
      </Field>

      <table className="self-end w-full max-w-[320px] text-[13.5px] border-collapse">
        <tbody>
          <tr>
            <td className="py-1 text-jb-soft">Subtotal</td>
            <td className="py-1 font-mono text-right text-jb-soft">{formatMoney(t.subtotalCents)}</td>
          </tr>
          {discountCents > 0 && (
            <tr>
              <td className="py-1 text-jb-soft">Descuento</td>
              <td className="py-1 font-mono text-right text-jb-soft">−{formatMoney(discountCents)}</td>
            </tr>
          )}
          {d.taxPercent > 0 && (
            <tr>
              <td className="py-1 text-jb-soft">IVA {d.taxPercent}%</td>
              <td className="py-1 font-mono text-right text-jb-soft">{formatMoney(t.taxCents)}</td>
            </tr>
          )}
          <tr className="border-t border-white/[.1]">
            <td className="pt-2 font-semibold text-white">Total</td>
            <td className="pt-2 font-mono text-[18px] font-bold text-right text-white">{formatMoney(t.totalCents)}</td>
          </tr>
        </tbody>
      </table>

      {error && <ErrorNote>{error}</ErrorNote>}
      <div className="flex justify-end">
        <button type="submit" disabled={saving || (!!quote && !dirty)} className={btn.primary}>
          <Save size={15} /> {saving ? 'Guardando…' : quote ? 'Guardar cambios' : 'Crear proforma'}
        </button>
      </div>
    </form>
  );
}

/** Email / WhatsApp / link actions for a saved proforma */
function SendBox({ quote, onSaved }: { quote: Quote; onSaved: (q: Quote) => void }) {
  const toast = useToast();
  const [to, setTo] = useState(quote.clientEmail ?? '');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const sendEmail = async (e: FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const saved = await apiFetch<Quote>(`/quotes/${quote.id}/email`, {
        method: 'POST',
        body: JSON.stringify({ origin: window.location.origin, to: to.trim(), message: message.trim() || undefined }),
      });
      onSaved(saved);
      toast.success(`Proforma ${quote.code} enviada a ${to.trim()}`);
    } catch (err) {
      toast.error(errorMessage(err, 'No se pudo enviar el correo.'));
    } finally {
      setSending(false);
    }
  };

  const sendWhatsapp = () => {
    // Opened synchronously from the click so the browser doesn't block the tab
    window.open(whatsappUrl(quote.clientPhone, whatsappText(quote)), '_blank', 'noopener,noreferrer');
    apiFetch<Quote>(`/quotes/${quote.id}/whatsapp`, { method: 'POST' })
      .then(onSaved)
      .catch(() => {});
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(publicLink(quote));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('No se pudo copiar el enlace.');
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={sendEmail} className="flex flex-col gap-3 p-4 rounded-xl border border-white/[.08] bg-white/[.02]">
        <span className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-white">
          <Mail size={15} className="text-jb-accent" /> Enviar por correo
        </span>
        <Field label="Para">
          <input type="email" required maxLength={120} value={to} onChange={(e) => setTo(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Mensaje" hint="Opcional. Va arriba de la proforma.">
          <textarea rows={2} maxLength={1000} value={message} onChange={(e) => setMessage(e.target.value)} className={`${inputCls} resize-y`} />
        </Field>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SentState at={quote.emailedAt} label="Correo" />
          <button type="submit" disabled={sending} className={btn.primary}>
            <Mail size={15} /> {sending ? 'Enviando…' : quote.emailedAt ? 'Reenviar' : 'Enviar'}
          </button>
        </div>
      </form>

      <div className="flex flex-col gap-3 p-4 rounded-xl border border-white/[.08] bg-white/[.02]">
        <span className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-white">
          <MessageCircle size={15} className="text-jb-accent" /> Enviar por WhatsApp
        </span>
        <span className="text-[12.5px] text-jb-muted">
          {quote.clientPhone
            ? `Abre el chat con ${quote.clientPhone} con el resumen y el enlace listos. Solo pulsa enviar.`
            : 'Sin teléfono del cliente: WhatsApp te pedirá elegir el chat.'}
        </span>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SentState at={quote.whatsappAt} label="WhatsApp" />
          <button type="button" onClick={sendWhatsapp} className={btn.ghost}>
            <MessageCircle size={15} /> Abrir WhatsApp
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <a href={`/proforma/${quote.token}`} target="_blank" rel="noopener noreferrer" className={btn.subtle}>
          <ExternalLink size={15} /> Ver / PDF
        </a>
        <button type="button" onClick={copy} className={btn.subtle}>
          {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? 'Copiado' : 'Copiar enlace'}
        </button>
        <RegenerateLink quote={quote} onSaved={onSaved} />
      </div>
    </div>
  );
}

/** Two-step: the second click (within 4s) replaces the link, so the old one stops working */
function RegenerateLink({ quote, onSaved }: { quote: Quote; onSaved: (q: Quote) => void }) {
  const toast = useToast();
  const [armed, setArmed] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(t);
  }, [armed]);

  const regenerate = async () => {
    setArmed(false);
    setBusy(true);
    try {
      onSaved(await apiFetch<Quote>(`/quotes/${quote.id}/token`, { method: 'POST' }));
      toast.success('Nuevo enlace creado. El anterior ya no funciona: reenvía la proforma.');
    } catch (err) {
      toast.error(errorMessage(err, 'No se pudo cambiar el enlace.'));
    } finally {
      setBusy(false);
    }
  };

  return armed ? (
    <button type="button" onClick={regenerate} className={btn.danger}>
      <RefreshCw size={15} /> ¿Invalidar el enlace actual?
    </button>
  ) : (
    <button
      type="button"
      disabled={busy}
      onClick={() => setArmed(true)}
      title="Crea un enlace nuevo; el que ya enviaste deja de funcionar"
      className={btn.subtle}
    >
      <RefreshCw size={15} /> {busy ? 'Cambiando…' : 'Nuevo enlace'}
    </button>
  );
}

export default function ProformasPanel() {
  const toast = useToast();
  const { items, setItems, loading, error, update, remove } = useCollection<Quote>('/quotes', { live: 'quotes' });
  const { items: services } = useCollection<Service>('/services/admin', { live: 'services' });
  const { items: products } = useCollection<Product>('/products/admin', { live: 'products' });
  const [filter, setFilter] = useState<QuoteStatus | 'ALL'>('ALL');
  const [query, setQuery] = useState('');
  // null = closed, 'new' = blank editor, otherwise the open quote's id
  const [openId, setOpenId] = useState<string | null>(null);

  const catalog = useMemo(
    () => [
      ...services.map((s) => ({ label: s.titleEs, cents: null })),
      ...products.map((p) => ({ label: p.nameEs, cents: p.priceCents })),
    ],
    [services, products],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: items.length };
    STATUSES.forEach((s) => (c[s.id] = 0));
    items.forEach((q) => c[q.status]++);
    return c;
  }, [items]);

  const visible = items.filter((q) => {
    if (filter !== 'ALL' && q.status !== filter) return false;
    const s = query.trim().toLowerCase();
    return !s || [q.code, q.clientName, q.clientCompany ?? '', q.clientEmail ?? '', q.clientPhone ?? ''].some((f) => f.toLowerCase().includes(s));
  });

  // From the live list, so the open quote reflects realtime updates (and closes if deleted)
  const current = openId && openId !== 'new' ? (items.find((q) => q.id === openId) ?? null) : null;
  const modalOpen = openId === 'new' || current !== null;

  const upsert = (q: Quote) => setItems(items.some((x) => x.id === q.id) ? items.map((x) => (x.id === q.id ? q : x)) : [q, ...items]);

  const onSaved = (q: Quote, created: boolean) => {
    upsert(q);
    toast.success(created ? `Proforma ${q.code} creada. Ya puedes enviarla.` : 'Cambios guardados');
    if (created) setOpenId(q.id);
  };

  const setStatus = async (q: Quote, status: QuoteStatus) => {
    try {
      await update(q.id, { status });
      toast.success(`Proforma ${q.code}: ${statusOf(status).label.toLowerCase()}`);
    } catch (err) {
      toast.error(errorMessage(err, 'No se pudo cambiar el estado.'));
    }
  };

  const del = async (q: Quote) => {
    try {
      await remove(q.id);
      setOpenId(null);
      toast.success('Proforma eliminada');
    } catch (err) {
      toast.error(errorMessage(err, 'No se pudo eliminar la proforma.'));
    }
  };

  const filters: { id: QuoteStatus | 'ALL'; label: string }[] = [{ id: 'ALL', label: 'Todas' }, ...STATUSES];

  return (
    <div>
      <PanelHeader
        title="Proformas"
        count={items.length}
        subtitle="Cotiza servicios o productos y envía la proforma por correo o WhatsApp. El cliente la abre en un enlace y la descarga en PDF."
        actions={
          <>
            <SearchInput value={query} onChange={setQuery} placeholder="Buscar código, cliente…" />
            <button type="button" onClick={() => setOpenId('new')} className={btn.primary}>
              <Plus size={15} /> Nueva proforma
            </button>
          </>
        }
      />

      <div className="flex flex-wrap gap-1.5 mb-4" role="tablist">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-[13px] font-semibold cursor-pointer transition ${
              filter === f.id ? 'bg-jb-accent border-jb-accent text-jb-ink' : 'border-white/[.14] text-jb-soft hover:text-white'
            }`}
          >
            {f.label}
            <span className={`text-[11px] ${filter === f.id ? 'text-jb-ink/70' : 'text-jb-muted'}`}>{counts[f.id]}</span>
          </button>
        ))}
      </div>

      {error && <ErrorNote>{error}</ErrorNote>}

      {loading ? (
        <SkeletonList />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<FileText size={20} />}
          title="Sin proformas"
          text="Crea la primera: elige servicios o productos, ajusta precios y envíala al cliente."
          action={
            <button type="button" onClick={() => setOpenId('new')} className={btn.primary}>
              <Plus size={15} /> Nueva proforma
            </button>
          }
        />
      ) : visible.length === 0 ? (
        <Card className="px-5 py-10 text-center text-[13.5px] text-jb-muted">Nada con este filtro.</Card>
      ) : (
        <ul className="grid gap-3 p-0 m-0 list-none sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((q) => {
            const st = statusOf(q.status);
            return (
              <li key={q.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(q.id)}
                  aria-haspopup="dialog"
                  className={`group flex flex-col w-full h-full gap-4 p-4 text-left rounded-2xl border border-white/[.08] bg-jb-card cursor-pointer transition hover:-translate-y-0.5 hover:border-white/[.18] ${
                    q.status === 'REJECTED' ? 'opacity-70 hover:opacity-100' : ''
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[13px] font-bold text-white">{q.code}</span>
                    <Pill tone={st.tone}>{st.label}</Pill>
                    <span className="flex items-center gap-1.5 ml-auto text-jb-muted">
                      {q.emailedAt && <Mail size={14} aria-label="Enviada por correo" className="text-jb-mint" />}
                      {q.whatsappAt && <MessageCircle size={14} aria-label="Enviada por WhatsApp" className="text-jb-mint" />}
                      <ChevronRight size={16} className="transition group-hover:translate-x-0.5 group-hover:text-white" />
                    </span>
                  </div>
                  <div className="flex flex-col flex-1 min-w-0 gap-1">
                    <span className="text-[15px] font-semibold text-white truncate">
                      {q.clientName}
                      {q.clientCompany && <span className="font-normal text-jb-muted"> · {q.clientCompany}</span>}
                    </span>
                    <span className="text-[12.5px] text-jb-muted truncate">{q.items.map((l) => l.description).join(' · ')}</span>
                  </div>
                  <div className="flex items-end justify-between gap-3 pt-3 border-t border-white/[.07]">
                    <span className="font-mono text-[18px] font-bold text-white">{formatMoney(q.totalCents)}</span>
                    <span className="font-mono text-[11px] text-jb-muted">{formatDate(q.createdAt)}</span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setOpenId(null)}
        title={current ? `Proforma ${current.code}` : 'Nueva proforma'}
        subtitle={current ? `${current.clientName} · ${formatDate(current.createdAt)}` : undefined}
        icon={<FileText size={19} />}
        size="xl"
      >
        {openId === 'new' ? (
          <QuoteEditor key="new" quote={null} quotes={items} catalog={catalog} onSaved={onSaved} />
        ) : current ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            {/* Remounts with the saved version so the form never shows stale values */}
            <QuoteEditor key={current.updatedAt} quote={current} quotes={items} catalog={catalog} onSaved={onSaved} />
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <Pill tone={statusOf(current.status).tone}>{statusOf(current.status).label}</Pill>
                <span className="ml-auto" />
                {current.status !== 'ACCEPTED' && (
                  <button type="button" onClick={() => setStatus(current, 'ACCEPTED')} className={btn.subtle}>
                    <BadgeCheck size={15} /> Aceptada
                  </button>
                )}
                {current.status !== 'REJECTED' && (
                  <button type="button" onClick={() => setStatus(current, 'REJECTED')} className={btn.subtle}>
                    <Ban size={15} /> Rechazada
                  </button>
                )}
                <ConfirmDelete onConfirm={() => del(current)} />
              </div>
              <SendBox key={current.id} quote={current} onSaved={upsert} />
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
