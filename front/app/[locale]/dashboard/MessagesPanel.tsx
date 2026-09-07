'use client'

import { useEffect, useState } from 'react';
import { apiFetch, ApiError, ContactMessage, ContactStatus } from './lib/api';

const STATUS_OPTIONS: ContactStatus[] = ['NEW', 'READ', 'ARCHIVED'];

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
    <div className="p-6 space-y-4 rounded-2xl bg-honeydew-800">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Mensajes de contacto ({messages.length})</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as ContactStatus | '')}
          className="px-3 py-1 rounded bg-honeydew-900"
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
        {messages.map((m) => (
          <div key={m.id} className="p-4 rounded-xl bg-honeydew-900">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold">
                  {m.name} · {m.email} · {m.phone}
                </p>
                <p className="mt-1 text-sm text-white/80">{m.message}</p>
                <p className="mt-1 text-xs text-white/50">
                  {new Date(m.createdAt).toLocaleString()} · {m.locale}
                </p>
              </div>
              <select
                value={m.status}
                onChange={(e) => updateStatus(m.id, e.target.value as ContactStatus)}
                className="px-2 py-1 text-sm rounded bg-honeydew-800"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
