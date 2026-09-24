'use client'

import { useEffect, useMemo, useState, FormEvent } from 'react';
import { Receipt, ChevronDown, Mail, Phone, MapPin, Truck, CreditCard, CheckCheck, Undo2, Ban, Check, Clock, Landmark, BadgeCheck } from 'lucide-react';
import { apiFetch, errorMessage, formatMoney, Order, OrderStatus } from './lib/api';
import { useCollection } from './lib/useCollection';
import { Card, ConfirmDelete, EmptyState, ErrorNote, Field, PanelHeader, Pill, SearchInput, SkeletonList, btn, inputCls, useToast } from './ui';

const STATUSES: { id: OrderStatus; label: string; tone: 'on' | 'muted' | 'warn' | 'info' }[] = [
  { id: 'PAID', label: 'Por enviar', tone: 'warn' },
  { id: 'SHIPPED', label: 'Enviado', tone: 'info' },
  { id: 'COMPLETED', label: 'Entregado', tone: 'on' },
  { id: 'PENDING_PAYMENT', label: 'Esperando pago', tone: 'muted' },
  { id: 'CANCELLED', label: 'Cancelado', tone: 'muted' },
  { id: 'REFUNDED', label: 'Reembolsado', tone: 'muted' },
];
const statusOf = (s: OrderStatus) => STATUSES.find((x) => x.id === s)!;

// Suggestions for the carrier field (any other name can be typed)
const CARRIERS = ['Servientrega', 'Tramaco Express', 'Laar Courier', 'Correos del Ecuador', 'Urbano Express', 'DHL Express', 'FedEx'];

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('es-EC', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

/** wa.me link for a phone as typed ("099 123 4567" → Ecuador +593) */
function whatsappUrl(phone: string) {
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) digits = `593${digits.slice(1)}`;
  return `https://wa.me/${digits}`;
}

function EmailState({ sent, label }: { sent?: string | null; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[12px] ${sent ? 'text-jb-mint' : 'text-jb-muted'}`}>
      {sent ? <Check size={13} /> : <Clock size={13} />}
      {label}: {sent ? `enviado ${formatDate(sent)}` : 'en cola'}
    </span>
  );
}

/** Carrier + tracking form; saving marks the order shipped and emails the buyer */
function ShipForm({ order, onSaved }: { order: Order; onSaved: (o: Order) => void }) {
  const toast = useToast();
  const [carrier, setCarrier] = useState(order.carrier ?? '');
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber ?? '');
  const [trackingUrl, setTrackingUrl] = useState(order.trackingUrl ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const unchanged =
    carrier.trim() === (order.carrier ?? '') &&
    trackingNumber.trim() === (order.trackingNumber ?? '') &&
    trackingUrl.trim() === (order.trackingUrl ?? '');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const saved = await apiFetch<Order>(`/orders/${order.id}/ship`, {
        method: 'PATCH',
        body: JSON.stringify({ carrier: carrier.trim(), trackingNumber: trackingNumber.trim(), trackingUrl: trackingUrl.trim() || undefined }),
      });
      onSaved(saved);
      toast.success(`Guía guardada. Se enviará el correo a ${order.email}`);
    } catch (err) {
      setError(errorMessage(err, 'No se pudo guardar el envío.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 p-4 rounded-xl border border-white/[.08] bg-white/[.02]">
      <span className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-white">
        <Truck size={15} className="text-jb-accent" /> {order.status === 'SHIPPED' ? 'Datos del envío' : 'Registrar envío'}
      </span>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Empresa de envío">
          <input required minLength={2} maxLength={60} list="carriers" value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder="Servientrega" className={inputCls} />
          <datalist id="carriers">
            {CARRIERS.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>
        <Field label="Número de guía">
          <input required minLength={3} maxLength={60} value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} className={`${inputCls} font-mono`} />
        </Field>
      </div>
      <Field label="Enlace de rastreo" hint="Opcional. El cliente verá un botón «Rastrear envío».">
        <input type="url" maxLength={500} value={trackingUrl} onChange={(e) => setTrackingUrl(e.target.value)} placeholder="https://…" className={inputCls} />
      </Field>
      {error && <ErrorNote>{error}</ErrorNote>}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {order.shippedAt ? <EmailState sent={order.shippedEmailAt} label="Correo de envío" /> : <span />}
        <button type="submit" disabled={saving || unchanged} className={btn.primary}>
          <Mail size={15} /> {saving ? 'Guardando…' : order.status === 'SHIPPED' ? 'Actualizar y avisar' : 'Marcar enviado y avisar'}
        </button>
      </div>
    </form>
  );
}

export default function OrdersPanel() {
  const toast = useToast();
  const { items, setItems, loading, error, remove } = useCollection<Order>('/orders', { live: 'orders' });
  const [filter, setFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: items.length };
    STATUSES.forEach((s) => (c[s.id] = 0));
    items.forEach((o) => c[o.status]++);
    return c;
  }, [items]);

  const visible = items.filter((o) => {
    if (filter !== 'ALL' && o.status !== filter) return false;
    const q = query.trim().toLowerCase();
    return !q || [o.code, o.name, o.email, o.phone, o.trackingNumber ?? '', o.transferReference ?? ''].some((f) => f.toLowerCase().includes(q));
  });

  const replace = (o: Order) => setItems(items.map((x) => (x.id === o.id ? o : x)));

  const act = async (o: Order, key: string, fn: () => Promise<Order>, ok: string, fail: string) => {
    setBusy(`${o.id}:${key}`);
    try {
      replace(await fn());
      toast.success(ok);
    } catch (err) {
      toast.error(errorMessage(err, fail));
    } finally {
      setBusy(null);
    }
  };
  const setStatus = (o: Order, status: OrderStatus, ok: string) =>
    act(o, status, () => apiFetch<Order>(`/orders/${o.id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }), ok, 'No se pudo cambiar el estado.');
  const refund = (o: Order) =>
    act(
      o,
      'refund',
      () => apiFetch<Order>(`/orders/${o.id}/refund`, { method: 'POST' }),
      o.paymentMethod === 'TRANSFER' ? 'Pedido marcado como reembolsado' : `Reembolso de ${formatMoney(o.totalCents)} enviado por PayPal`,
      'No se pudo reembolsar.',
    );
  const confirmTransfer = (o: Order) =>
    act(o, 'confirm', () => apiFetch<Order>(`/orders/${o.id}/confirm-transfer`, { method: 'POST' }), `Pago de ${o.code} confirmado. Se avisará al cliente.`, 'No se pudo confirmar.');

  const del = async (o: Order) => {
    try {
      await remove(o.id);
      toast.success('Pedido eliminado');
    } catch (err) {
      toast.error(errorMessage(err, 'No se pudo eliminar el pedido.'));
    }
  };

  const filters: { id: OrderStatus | 'ALL'; label: string }[] = [{ id: 'ALL', label: 'Todos' }, ...STATUSES];

  return (
    <div>
      <PanelHeader
        title="Pedidos"
        count={items.length}
        subtitle="Pagos por PayPal o transferencia. Confirma las transferencias y registra la empresa de envío y la guía: el cliente recibe un correo en cada paso."
        actions={<SearchInput value={query} onChange={setQuery} placeholder="Buscar código, nombre, guía…" />}
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
        <EmptyState icon={<Receipt size={20} />} title="Sin pedidos" text="Cuando alguien compre en la tienda, el pedido aparecerá aquí sin recargar." />
      ) : visible.length === 0 ? (
        <Card className="px-5 py-10 text-center text-[13.5px] text-jb-muted">Nada con este filtro.</Card>
      ) : (
        <ul className="flex flex-col gap-2 p-0 m-0 list-none">
          {visible.map((o) => {
            const open = openId === o.id;
            const st = statusOf(o.status);
            const units = o.items.reduce((n, l) => n + l.quantity, 0);
            const paid = o.status === 'PAID' || o.status === 'SHIPPED' || o.status === 'COMPLETED';
            const isBusy = (key: string) => busy === `${o.id}:${key}`;
            return (
              <li key={o.id} className="rounded-2xl border border-white/[.08] bg-jb-card overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : o.id)}
                  aria-expanded={open}
                  className="flex flex-wrap items-center w-full gap-x-4 gap-y-1 px-4 py-3.5 text-left bg-transparent border-0 cursor-pointer hover:bg-white/[.03]"
                >
                  <span className="font-mono text-[13px] font-bold text-white">{o.code}</span>
                  {o.paymentMethod === 'TRANSFER' && o.status === 'PENDING_PAYMENT' ? <Pill tone="warn">Transferencia por verificar</Pill> : <Pill tone={st.tone}>{st.label}</Pill>}
                  {o.paymentMethod === 'TRANSFER' && o.status !== 'PENDING_PAYMENT' && <Pill>Transferencia</Pill>}
                  <span className="flex-1 min-w-[140px] text-[14px] text-jb-text truncate">{o.name}</span>
                  <span className="text-[12.5px] text-jb-muted">
                    {units} {units === 1 ? 'unidad' : 'unidades'}
                  </span>
                  <span className="font-mono text-[14px] font-bold text-white">{formatMoney(o.totalCents)}</span>
                  <span className="font-mono text-[11.5px] text-jb-muted">{formatDate(o.createdAt)}</span>
                  <ChevronDown size={16} className={`text-jb-muted transition ${open ? 'rotate-180' : ''}`} />
                </button>

                {open && (
                  <div className="grid gap-5 px-4 pt-1 pb-4 border-t border-white/[.07] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                    <div className="flex flex-col gap-4 pt-3">
                      <table className="w-full text-[13.5px] border-collapse">
                        <tbody>
                          {o.items.map((l) => (
                            <tr key={l.productId} className="border-b border-white/[.06]">
                              <td className="py-2 pr-3 font-mono text-jb-muted whitespace-nowrap">{l.quantity} ×</td>
                              <td className="py-2 pr-3 text-jb-text">{l.name}</td>
                              <td className="py-2 font-mono text-right text-jb-soft whitespace-nowrap">{formatMoney(l.unitCents * l.quantity)}</td>
                            </tr>
                          ))}
                          <tr>
                            <td />
                            <td className="pt-2.5 font-semibold text-white">Total</td>
                            <td className="pt-2.5 font-mono font-bold text-right text-white">{formatMoney(o.totalCents)}</td>
                          </tr>
                        </tbody>
                      </table>

                      <div className="flex flex-col gap-1.5 text-[13.5px]">
                        <span className="inline-flex items-start gap-2 text-jb-text">
                          <MapPin size={14} className="flex-none mt-[3px] text-jb-muted" /> {o.address}, {o.city}
                        </span>
                        <a href={`mailto:${o.email}?subject=${encodeURIComponent(`Tu pedido ${o.code}`)}`} className="inline-flex items-center gap-2 text-jb-soft hover:text-white">
                          <Mail size={14} className="text-jb-muted" /> {o.email}
                        </a>
                        <a href={whatsappUrl(o.phone)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-jb-soft hover:text-white">
                          <Phone size={14} className="text-jb-muted" /> {o.phone}
                        </a>
                      </div>
                      {o.note && <p className="m-0 px-3 py-2.5 rounded-lg bg-white/[.04] text-[13.5px] text-jb-soft whitespace-pre-wrap">{o.note}</p>}
                    </div>

                    <div className="flex flex-col gap-3 pt-3">
                      <div className="flex flex-col gap-1.5 p-4 rounded-xl border border-white/[.08] bg-white/[.02] text-[13px]">
                        <span className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-white">
                          {o.paymentMethod === 'TRANSFER' ? <Landmark size={15} className="text-jb-accent" /> : <CreditCard size={15} className="text-jb-accent" />}
                          {o.paymentMethod === 'TRANSFER' ? 'Transferencia bancaria' : 'Pago PayPal'}
                        </span>
                        {o.paymentMethod === 'TRANSFER' && (
                          <span className="text-jb-soft">
                            Desde <strong className="text-white">{o.transferBank}</strong> · código{' '}
                            <strong className="font-mono text-white">{o.transferReference}</strong>
                          </span>
                        )}
                        {o.paymentMethod === 'TRANSFER' && o.status === 'PENDING_PAYMENT' ? (
                          <>
                            <span className="text-amber-300">Revisa tu cuenta: confirma el pago si llegó {formatMoney(o.totalCents)}, o recházalo (el stock vuelve y se avisa al cliente).</span>
                            <div className="flex flex-wrap gap-2 pt-1.5">
                              <button type="button" disabled={isBusy('confirm')} onClick={() => confirmTransfer(o)} className={btn.primary}>
                                <BadgeCheck size={15} /> Confirmar pago
                              </button>
                              <button type="button" disabled={isBusy('CANCELLED')} onClick={() => setStatus(o, 'CANCELLED', `Transferencia de ${o.code} rechazada`)} className={btn.ghost}>
                                <Ban size={15} /> Rechazar
                              </button>
                            </div>
                          </>
                        ) : o.paidAt ? (
                          <>
                            <span className="text-jb-soft">Verificado el {formatDate(o.paidAt)}</span>
                            {o.paypalCaptureId && <span className="font-mono text-[12px] text-jb-muted break-all">Captura {o.paypalCaptureId}</span>}
                            <EmailState sent={o.paidEmailAt} label="Correo de compra" />
                          </>
                        ) : o.status === 'PENDING_PAYMENT' ? (
                          <span className="text-jb-muted">
                            {o.paypalCaptureId ? 'PayPal está procesando el pago (se revisa solo).' : 'El cliente aún no paga. Si no paga en 30 min, se cancela y el stock vuelve.'}
                          </span>
                        ) : (
                          <span className="text-jb-muted">Sin pago.</span>
                        )}
                        {o.refundedAt && <span className="text-amber-300">Reembolsado el {formatDate(o.refundedAt)}</span>}
                      </div>

                      {(o.status === 'PAID' || o.status === 'SHIPPED') && <ShipForm key={`${o.carrier}|${o.trackingNumber}|${o.trackingUrl}`} order={o} onSaved={replace} />}
                      {o.status === 'COMPLETED' && o.carrier && (
                        <span className="text-[13px] text-jb-soft">
                          Enviado por {o.carrier} · guía <span className="font-mono">{o.trackingNumber}</span>
                        </span>
                      )}

                      <div className="flex flex-wrap items-center justify-end gap-2">
                        {(o.status === 'PAID' || o.status === 'SHIPPED') && (
                          <button type="button" disabled={isBusy('COMPLETED')} onClick={() => setStatus(o, 'COMPLETED', `Pedido ${o.code} entregado`)} className={btn.ghost}>
                            <CheckCheck size={15} /> Marcar entregado
                          </button>
                        )}
                        {paid && (o.paypalCaptureId || o.paymentMethod === 'TRANSFER') && (
                          <RefundButton
                            busy={isBusy('refund')}
                            amount={formatMoney(o.totalCents)}
                            manual={o.paymentMethod === 'TRANSFER'}
                            onConfirm={() => refund(o)}
                          />
                        )}
                        {o.status === 'PENDING_PAYMENT' && o.paymentMethod === 'PAYPAL' && !o.paypalCaptureId && (
                          <button type="button" disabled={isBusy('CANCELLED')} onClick={() => setStatus(o, 'CANCELLED', `Pedido ${o.code} cancelado`)} className={btn.ghost}>
                            <Ban size={15} /> Cancelar
                          </button>
                        )}
                        {(o.status === 'PENDING_PAYMENT' || o.status === 'CANCELLED') && <ConfirmDelete onConfirm={() => del(o)} />}
                      </div>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** Two-step refund: the second click (within 4s) sends it to PayPal */
function RefundButton({ amount, busy, manual, onConfirm }: { amount: string; busy: boolean; manual: boolean; onConfirm: () => void }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(t);
  }, [armed]);
  return armed ? (
    <button
      type="button"
      onClick={() => {
        setArmed(false);
        onConfirm();
      }}
      className={btn.danger}
    >
      <Undo2 size={15} /> {manual ? `¿Ya devolviste ${amount}?` : `¿Reembolsar ${amount}?`}
    </button>
  ) : (
    <button type="button" disabled={busy} onClick={() => setArmed(true)} className={btn.ghost}>
      <Undo2 size={15} /> {busy ? 'Reembolsando…' : manual ? 'Marcar reembolsado' : 'Reembolsar'}
    </button>
  );
}
