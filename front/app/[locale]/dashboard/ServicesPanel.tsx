'use client'

import { useEffect, useState, FormEvent } from 'react';
import { Wrench, Eye, EyeOff, Trash2, PlusCircle, ExternalLink } from 'lucide-react';
import { ScrollRevealEffect } from '@/app/utils';
import { apiFetch, ApiError, Service } from './lib/api';

const emptyForm = {
  slug: '',
  titleEs: '',
  coverUrl: '',
  href: '',
};

export default function ServicesPanel() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch<Service[]>('/services/admin');
      setServices(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error cargando servicios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      await apiFetch<Service>('/services', {
        method: 'POST',
        body: JSON.stringify({
          slug: form.slug,
          titleEs: form.titleEs,
          coverUrl: form.coverUrl,
          href: form.href || undefined,
        }),
      });
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error creando servicio.');
    } finally {
      setCreating(false);
    }
  };

  const togglePublished = async (service: Service) => {
    try {
      await apiFetch(`/services/${service.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ published: !service.published }),
      });
      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? { ...s, published: !s.published } : s)),
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error actualizando servicio.');
    }
  };

  const remove = async (id: string) => {
    try {
      await apiFetch(`/services/${id}`, { method: 'DELETE' });
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error eliminando servicio.');
    }
  };

  return (
    <div className="space-y-5">
      <form
        onSubmit={handleCreate}
        className="p-6 space-y-4 shadow-lg rounded-2xl bg-honeydew-800 sm:p-8"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center rounded-full w-11 h-11 bg-honeydew-900 shrink-0">
            <PlusCircle size={20} strokeWidth={1.5} />
          </div>
          <div>
            <span className="font-mono text-xs font-light tracking-widest uppercase text-honeydew-400">
              - Servicios -
            </span>
            <h2 className="font-mono text-lg font-bold uppercase">Nuevo servicio</h2>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <input
            required
            placeholder="slug-unico"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="px-3 py-2 rounded-xl bg-honeydew-900 focus:outline-none focus:ring-2 focus:ring-honeydew-500"
          />
          <input
            required
            placeholder="Título"
            value={form.titleEs}
            onChange={(e) => setForm({ ...form, titleEs: e.target.value })}
            className="px-3 py-2 rounded-xl bg-honeydew-900 focus:outline-none focus:ring-2 focus:ring-honeydew-500"
          />
          <input
            required
            type="url"
            placeholder="https://.../cover.jpg"
            value={form.coverUrl}
            onChange={(e) => setForm({ ...form, coverUrl: e.target.value })}
            className="px-3 py-2 rounded-xl bg-honeydew-900 focus:outline-none focus:ring-2 focus:ring-honeydew-500"
          />
          <input
            placeholder="/contact (opcional)"
            value={form.href}
            onChange={(e) => setForm({ ...form, href: e.target.value })}
            className="px-3 py-2 rounded-xl bg-honeydew-900 focus:outline-none focus:ring-2 focus:ring-honeydew-500"
          />
        </div>

        <button
          type="submit"
          disabled={creating}
          className="inline-flex items-center gap-2 px-4 py-2 font-bold text-black transition duration-500 rounded-xl bg-honeydew-500 hover:bg-white disabled:opacity-50"
        >
          <PlusCircle size={16} />
          {creating ? 'Creando...' : 'Crear servicio'}
        </button>
      </form>

      <div className="p-6 space-y-4 shadow-lg rounded-2xl bg-honeydew-800 sm:p-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center rounded-full w-11 h-11 bg-honeydew-900 shrink-0">
            <Wrench size={20} strokeWidth={1.5} />
          </div>
          <h2 className="font-mono text-lg font-bold uppercase">Servicios ({services.length})</h2>
        </div>

        {loading && <p className="text-white/60">Cargando...</p>}
        {error && <p className="text-red-400">{error}</p>}
        {!loading && services.length === 0 && !error && (
          <p className="text-white/60">No hay servicios todavía.</p>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {services.map((s, index) => (
            <ScrollRevealEffect key={s.id} index={index}>
              <div className="flex flex-col h-full gap-3 p-4 rounded-xl bg-honeydew-900">
                <div className="flex items-start justify-end gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-wide ${
                      s.published ? 'bg-honeydew-500 text-black' : 'bg-white/10 text-white/60'
                    }`}
                  >
                    {s.published ? 'publicado' : 'oculto'}
                  </span>
                </div>

                <div>
                  <p className="font-semibold">{s.titleEs}</p>
                  <p className="text-sm text-white/50">/{s.slug}</p>
                </div>

                {s.published && (
                  <a
                    href={`/services#${s.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold text-black transition rounded-xl bg-honeydew-500 hover:bg-white w-fit"
                  >
                    <ExternalLink size={14} />
                    Ver publicación
                  </a>
                )}

                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => togglePublished(s)}
                    title={s.published ? 'Ocultar' : 'Publicar'}
                    className="inline-flex items-center justify-center w-9 h-9 transition rounded-full bg-honeydew-800 hover:bg-white hover:text-black"
                  >
                    {s.published ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    onClick={() => remove(s.id)}
                    title="Eliminar"
                    className="inline-flex items-center justify-center w-9 h-9 transition text-red-400 rounded-full bg-honeydew-800 hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </ScrollRevealEffect>
          ))}
        </div>
      </div>
    </div>
  );
}
