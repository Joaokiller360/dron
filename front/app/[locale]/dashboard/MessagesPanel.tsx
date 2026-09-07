'use client'

import { useEffect, useState } from 'react';
import { Mail, Inbox } from 'lucide-react';
import { ScrollRevealEffect } from '@/app/utils';
import { apiFetch, ApiError, ContactMessage, ContactStatus } from './lib/api';

const STATUS_OPTIONS: ContactStatus[] = ['NEW', 'READ', 'ARCHIVED'];

const STATUS_STYLES: Record<ContactStatus, string> = {
  NEW: 'bg-honeydew-500 text-black',
  READ: 'bg-honeydew-700 text-white',
  ARCHIVED: 'bg-white/10 text-white/60',
};

export default function MessagesPanel() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<ContactStatus | ''>('');

  const load = async (status?: ContactStatus) => {
    setLoading(true);
    setError('');
    try {
      const query = status ? `?status=${status}` : '';
      const data = await apiFetch<ContactMessage[]>(`/contact-messages${query}`);
      setMessages(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error cargando mensajes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(filter || undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const updateStatus = async (id: string, status: ContactStatus) => {
    try {
      await apiFetch(`/contact-messages/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error actualizando estado.');
    }
  };

  return (
    <div className="p-6 space-y-5 shadow-lg rounded-2xl bg-honeydew-800 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center rounded-full w-14 h-14 bg-honeydew-900 shrink-0">
            <Inbox size={24} strokeWidth={1.5} />
          </div>
          <div>
            <span className="font-mono text-xs font-light tracking-widest uppercase text-honeydew-400">
              - Contacto -
            </span>
            <h2 className="font-mono text-lg font-bold uppercase">
              Mensajes ({messages.length})
            </h2>
          </div>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as ContactStatus | '')}
          className="px-3 py-2 font-mono text-xs uppercase rounded-xl bg-honeydew-900 focus:outline-none focus:ring-2 focus:ring-honeydew-500"
        >
          <option value="">Todos</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-white/60">Cargando...</p>}
      {error && <p className="text-red-400">{error}</p>}

      {!loading && messages.length === 0 && !error && (
        <p className="text-white/60">No hay mensajes.</p>
      )}

      <div className="space-y-3">
        {messages.map((m, index) => (
          <ScrollRevealEffect key={m.id} index={index}>
            <div className="p-4 rounded-xl bg-honeydew-900">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start flex-1 min-w-0 gap-3">
                  <div className="flex items-center justify-center rounded-full w-9 h-9 bg-honeydew-800 shrink-0">
                    <Mail size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">
                      {m.name} · {m.email} · {m.phone}
                    </p>
                    <p className="mt-1 text-sm text-white/80">{m.message}</p>
                    <p className="mt-1 text-xs text-white/50">
                      {new Date(m.createdAt).toLocaleString()} · {m.locale}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-wide ${STATUS_STYLES[m.status]}`}
                  >
                    {m.status}
                  </span>
                  <select
                    value={m.status}
                    onChange={(e) => updateStatus(m.id, e.target.value as ContactStatus)}
                    className="px-2 py-1 text-xs rounded-lg bg-honeydew-800 focus:outline-none focus:ring-2 focus:ring-honeydew-500"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </ScrollRevealEffect>
        ))}
      </div>
    </div>
  );
}
