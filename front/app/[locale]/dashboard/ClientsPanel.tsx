'use client'

import { useEffect, useState, FormEvent } from 'react';
import { Handshake, Eye, EyeOff, Trash2, PlusCircle, ExternalLink } from 'lucide-react';
import { ScrollRevealEffect } from '@/app/utils';
import {
  apiFetch,
  ApiError,
  Client,
  Link,
  LinkPlatform,
  LINK_PLATFORMS,
} from './lib/api';

const emptyForm = {
  slug: '',
  name: '',
  organization: '',
  photoUrl: '',
  linkPlatform: LINK_PLATFORMS[0],
  linkUrl: '',
};

export default function ClientsPanel() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch<Client[]>('/clients/admin');
      setClients(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error cargando clientes.');
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
      const links: Link[] = form.linkUrl
        ? [{ platform: form.linkPlatform as LinkPlatform, url: form.linkUrl }]
        : [];
      await apiFetch<Client>('/clients', {
        method: 'POST',
        body: JSON.stringify({
          slug: form.slug,
          name: form.name,
          organization: form.organization,
          photoUrl: form.photoUrl,
          links,
        }),
      });
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error creando cliente.');
    } finally {
      setCreating(false);
    }
  };

  const togglePublished = async (client: Client) => {
    try {
      await apiFetch(`/clients/${client.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ published: !client.published }),
      });
      setClients((prev) =>
        prev.map((c) => (c.id === client.id ? { ...c, published: !c.published } : c)),
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error actualizando cliente.');
    }
  };

  const remove = async (id: string) => {
    try {
      await apiFetch(`/clients/${id}`, { method: 'DELETE' });
      setClients((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error eliminando cliente.');
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
              - Clientes -
            </span>
            <h2 className="font-mono text-lg font-bold uppercase">Nuevo cliente</h2>
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
            placeholder="Nombre del cliente"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="px-3 py-2 rounded-xl bg-honeydew-900 focus:outline-none focus:ring-2 focus:ring-honeydew-500"
          />
          <input
            required
            placeholder="Categoría (ej. Marca, Gobierno)"
            value={form.organization}
            onChange={(e) => setForm({ ...form, organization: e.target.value })}
            className="px-3 py-2 rounded-xl bg-honeydew-900 focus:outline-none focus:ring-2 focus:ring-honeydew-500"
          />
          <input
            required
            type="url"
            placeholder="https://.../foto.jpg"
            value={form.photoUrl}
            onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
            className="px-3 py-2 rounded-xl bg-honeydew-900 focus:outline-none focus:ring-2 focus:ring-honeydew-500"
          />
          <select
            value={form.linkPlatform}
            onChange={(e) => setForm({ ...form, linkPlatform: e.target.value as LinkPlatform })}
            className="px-3 py-2 rounded-xl bg-honeydew-900 focus:outline-none focus:ring-2 focus:ring-honeydew-500"
          >
            {LINK_PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <input
            type="url"
            placeholder="https://... (opcional)"
            value={form.linkUrl}
            onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
            className="px-3 py-2 rounded-xl bg-honeydew-900 focus:outline-none focus:ring-2 focus:ring-honeydew-500"
          />
        </div>

        <button
          type="submit"
          disabled={creating}
          className="inline-flex items-center gap-2 px-4 py-2 font-bold text-black transition duration-500 rounded-xl bg-honeydew-500 hover:bg-white disabled:opacity-50"
        >
          <PlusCircle size={16} />
          {creating ? 'Creando...' : 'Crear cliente'}
        </button>
      </form>

      <div className="p-6 space-y-4 shadow-lg rounded-2xl bg-honeydew-800 sm:p-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center rounded-full w-11 h-11 bg-honeydew-900 shrink-0">
            <Handshake size={20} strokeWidth={1.5} />
          </div>
          <h2 className="font-mono text-lg font-bold uppercase">Clientes ({clients.length})</h2>
        </div>

        {loading && <p className="text-white/60">Cargando...</p>}
        {error && <p className="text-red-400">{error}</p>}
        {!loading && clients.length === 0 && !error && (
          <p className="text-white/60">No hay clientes todavía.</p>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {clients.map((c, index) => (
            <ScrollRevealEffect key={c.id} index={index}>
              <div className="flex flex-col h-full gap-3 p-4 rounded-xl bg-honeydew-900">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-wide bg-honeydew-800 text-honeydew-400">
                    {c.organization}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-wide ${
                      c.published ? 'bg-honeydew-500 text-black' : 'bg-white/10 text-white/60'
                    }`}
                  >
                    {c.published ? 'publicado' : 'oculto'}
                  </span>
                </div>

                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-sm text-white/50">/{c.slug}</p>
                </div>

                {c.published && (
                  <a
                    href={`/clients#${c.slug}`}
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
                    onClick={() => togglePublished(c)}
                    title={c.published ? 'Ocultar' : 'Publicar'}
                    className="inline-flex items-center justify-center w-9 h-9 transition rounded-full bg-honeydew-800 hover:bg-white hover:text-black"
                  >
                    {c.published ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    onClick={() => remove(c.id)}
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
