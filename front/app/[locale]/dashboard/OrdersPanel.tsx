'use client'

import { useMemo, useState } from 'react';
import { Receipt, ChevronDown, Mail, Phone } from 'lucide-react';
import { apiFetch, errorMessage, formatMoney, Order, OrderStatus } from './lib/api';
import { useCollection } from './lib/useCollection';
import { Card, ConfirmDelete, EmptyState, ErrorNote, PanelHeader, Pill, SearchInput, SkeletonList, useToast } from './ui';

const STATUSES: { id: OrderStatus; label: string; tone: 'on' | 'muted' | 'warn' | 'info' }[] = [
  { id: 'PENDING', label: 'Pendiente', tone: 'warn' },
  { id: 'CONFIRMED', label: 'Confirmado', tone: 'info' },
  { id: 'COMPLETED', label: 'Completado', tone: 'on' },
  { id: 'CANCELLED', label: 'Cancelado', tone: 'muted' },
];
const statusOf = (s: OrderStatus) => STATUSES.find((x) => x.id === s)!;

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('es-EC', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

/** wa.me link for a phone as typed ("099 123 4567" → Ecuador +593) */
function whatsappUrl(phone: string) {
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) digits = `593${digits.slice(1)}`;
  return `https://wa.me/${digits}`;
}

export default function OrdersPanel() {
  const toast = useToast();
  const { items, setItems, loading, error, remove } = useCollection<Order>('/orders', { live: 'orders' });
  const [filter, setFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: items.length, PENDING: 0, CONFIRMED: 0, COMPLETED: 0, CANCELLED: 0 };
    items.forEach((o) => c[o.status]++);
    return c;
  }, [items]);

  const visible = items.filter((o) => {
    if (filter !== 'ALL' && o.status !== filter) return false;
    const q = query.trim().toLowerCase();
    return !q || [o.code, o.name, o.email, o.phone].some((f) => f.toLowerCase().includes(q));
  });

  const setStatus = async (o: Order, status: OrderStatus) => {
    const previous = items;
    setItems(items.map((x) => (x.id === o.id ? { ...x, status } : x)));
    try {
      await apiFetch(`/orders/${o.id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
      toast.success(`Pedido ${o.code}: ${statusOf(status).label.toLowerCase()}`);
    } catch (err) {
      setItems(previous);
      toast.error(errorMessage(err, 'No se pudo cambiar el estado.'));
    }
  };

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
        subtitle="Pedidos de la tienda. Confírmalos con el cliente y coordina pago y entrega. Cancelar devuelve las unidades al stock."
        actions={<SearchInput value={query} onChange={setQuery} placeholder="Buscar código, nombre…" />}
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
            return (
              <li key={o.id} className="rounded-2xl border border-white/[.08] bg-jb-card overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : o.id)}
                  aria-expanded={open}
                  className="flex flex-wrap items-center w-full gap-x-4 gap-y-1 px-4 py-3.5 text-left bg-transparent border-0 cursor-pointer hover:bg-white/[.03]"
                >
                  <span className="font-mono text-[13px] font-bold text-white">{o.code}</span>
                  <Pill tone={st.tone}>{st.label}</Pill>
                  <span className="flex-1 min-w-[140px] text-[14px] text-jb-text truncate">{o.name}</span>
                  <span className="text-[12.5px] text-jb-muted">
                    {units} {units === 1 ? 'unidad' : 'unidades'}
                  </span>
                  <span className="font-mono text-[14px] font-bold text-white">{formatMoney(o.totalCents)}</span>
                  <span className="font-mono text-[11.5px] text-jb-muted">{formatDate(o.createdAt)}</span>
                  <ChevronDown size={16} className={`text-jb-muted transition ${open ? 'rotate-180' : ''}`} />
                </button>

                {open && (
                  <div className="grid gap-5 px-4 pt-1 pb-4 border-t border-white/[.07] md:grid-cols-[minmax(0,1fr)_280px]">
                    <div className="pt-3">
                      <table className="w-full text-[13.5px] border-collapse">
                        <tbody>
                          {o.items.map((l) => (
                            <tr key={l.productId} className="border-b border-white/[.06]">
                              <td className="py-2 pr-3 text-jb-muted font-mono whitespace-nowrap">{l.quantity} ×</td>
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
                      {o.note && (
                        <p className="mt-4 mb-0 px-3 py-2.5 rounded-lg bg-white/[.04] text-[13.5px] text-jb-soft whitespace-pre-wrap">{o.note}</p>
                      )}
                    </div>

                    <div className="flex flex-col gap-3 pt-3">
                      <div className="flex flex-col gap-1.5 text-[13.5px]">
                        <a href={`mailto:${o.email}?subject=${encodeURIComponent(`Tu pedido ${o.code}`)}`} className="inline-flex items-center gap-2 text-jb-soft hover:text-white">
                          <Mail size={14} /> {o.email}
                        </a>
                        <a href={whatsappUrl(o.phone)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-jb-soft hover:text-white">
                          <Phone size={14} /> {o.phone}
                        </a>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="font-mono text-[10.5px] font-semibold tracking-[.12em] uppercase text-jb-muted">Estado</span>
                        <div className="grid grid-cols-2 gap-1.5">
                          {STATUSES.map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              disabled={o.status === s.id}
                              onClick={() => setStatus(o, s.id)}
                              className={`px-2.5 py-1.5 rounded-lg border text-[12.5px] font-semibold cursor-pointer transition disabled:cursor-default ${
                                o.status === s.id
                                  ? 'bg-jb-accent border-jb-accent text-jb-ink'
                                  : 'border-white/[.14] text-jb-soft hover:text-white hover:bg-white/[.06]'
                              }`}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <ConfirmDelete onConfirm={() => del(o)} />
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
