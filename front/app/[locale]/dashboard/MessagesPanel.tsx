'use client'

import { useMemo, useState } from 'react';
import { Inbox } from 'lucide-react';
import { apiFetch, ContactMessage, ContactStatus, errorMessage } from './lib/api';
import { useCollection } from './lib/useCollection';
import { Card, EmptyState, ErrorNote, PanelHeader, SearchInput, SkeletonList, useToast } from './ui';
import MessageDetail, { parseMessage } from './MessageDetail';

const FILTERS: { id: ContactStatus | 'ALL'; label: string }[] = [
  { id: 'ALL', label: 'Todos' },
  { id: 'NEW', label: 'Nuevos' },
  { id: 'READ', label: 'Leídos' },
  { id: 'ARCHIVED', label: 'Archivados' },
];

const STATUS_LABEL: Record<ContactStatus, string> = { NEW: 'Nuevo', READ: 'Leído', ARCHIVED: 'Archivado' };

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('es-EC', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function MessagesPanel() {
  const toast = useToast();
  const { items, setItems, loading, error, remove } = useCollection<ContactMessage>('/contact-messages', {
    live: 'contact-messages',
  });
  const [filter, setFilter] = useState<ContactStatus | 'ALL'>('ALL');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: items.length, NEW: 0, READ: 0, ARCHIVED: 0 };
    items.forEach((m) => c[m.status]++);
    return c;
  }, [items]);

  const visible = items.filter((m) => {
    if (filter !== 'ALL' && m.status !== filter) return false;
    const q = query.trim().toLowerCase();
    return !q || [m.name, m.email, m.phone, m.message].some((f) => f.toLowerCase().includes(q));
  });
  const selected = items.find((m) => m.id === selectedId) ?? null;

  const setStatus = async (m: ContactMessage, status: ContactStatus, notify = true) => {
    const previous = items;
    setItems(items.map((x) => (x.id === m.id ? { ...x, status } : x)));
    try {
      await apiFetch(`/contact-messages/${m.id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
      if (notify) toast.success(status === 'ARCHIVED' ? 'Mensaje archivado' : `Marcado como ${STATUS_LABEL[status].toLowerCase()}`);
    } catch (err) {
      setItems(previous);
      toast.error(errorMessage(err, 'No se pudo actualizar el mensaje.'));
    }
  };

  const open = (m: ContactMessage) => {
    setSelectedId(m.id);
    if (m.status === 'NEW') setStatus(m, 'READ', false);
  };

  const del = async (m: ContactMessage) => {
    try {
      await remove(m.id);
      if (selectedId === m.id) setSelectedId(null);
      toast.success('Mensaje eliminado');
    } catch (err) {
      toast.error(errorMessage(err, 'No se pudo eliminar el mensaje.'));
    }
  };

  return (
    <div>
      <PanelHeader
        title="Mensajes"
        count={items.length}
        subtitle="Solicitudes del formulario de contacto. Llegan aquí en cuanto alguien las envía."
        actions={<SearchInput value={query} onChange={setQuery} placeholder="Buscar nombre, correo…" />}
      />

      <div className="flex flex-wrap gap-1.5 mb-4" role="tablist">
        {FILTERS.map((f) => (
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
        <EmptyState icon={<Inbox size={20} />} title="Bandeja vacía" text="Cuando alguien envíe el formulario de contacto, aparecerá aquí sin recargar." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
          {/* List */}
          <Card className={`overflow-hidden ${selected ? 'hidden lg:block' : ''}`}>
            {visible.length === 0 ? (
              <p className="px-5 py-10 m-0 text-center text-[13.5px] text-jb-muted">Nada con este filtro.</p>
            ) : (
              <ul className="p-0 m-0 list-none divide-y divide-white/[.06] max-h-[70vh] overflow-y-auto">
                {visible.map((m) => (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => open(m)}
                      className={`flex flex-col w-full gap-1 px-4 py-3.5 text-left cursor-pointer transition ${
                        selectedId === m.id ? 'bg-[rgba(52,209,122,.1)]' : 'hover:bg-white/[.03]'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {m.status === 'NEW' && <span className="flex-none w-2 h-2 rounded-full bg-jb-accent" aria-label="Nuevo" />}
                        <span className={`flex-1 truncate text-[14px] ${m.status === 'NEW' ? 'font-bold text-white' : 'font-medium text-jb-text'}`}>
                          {m.name}
                        </span>
                        <span className="flex-none font-mono text-[11px] text-jb-muted">{formatDate(m.createdAt)}</span>
                      </span>
                      <span className="text-[13px] text-jb-muted line-clamp-2">{(parseMessage(m.message).body || m.message).replace(/\s+/g, ' ')}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Detail */}
          {selected ? (
            <MessageDetail
              key={selected.id}
              message={selected}
              onBack={() => setSelectedId(null)}
              onStatus={(status) => setStatus(selected, status)}
              onDelete={() => del(selected)}
              onReply={async (subject, body) => {
                await apiFetch(`/contact-messages/${selected.id}/reply`, { method: 'POST', body: JSON.stringify({ subject, body }) });
                if (selected.status === 'NEW') setItems(items.map((x) => (x.id === selected.id ? { ...x, status: 'READ' } : x)));
                toast.success(`Correo enviado a ${selected.email}`);
              }}
            />
          ) : (
            <Card className="items-center justify-center hidden p-10 text-center lg:flex">
              <p className="m-0 text-[13.5px] text-jb-muted">Selecciona un mensaje para leerlo.</p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
