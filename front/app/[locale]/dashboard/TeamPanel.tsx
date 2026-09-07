'use client'

import { useEffect, useState, FormEvent } from 'react';
import { Users, Eye, EyeOff, Trash2, PlusCircle, ExternalLink } from 'lucide-react';
import { ScrollRevealEffect } from '@/app/utils';
import {
  apiFetch,
  ApiError,
  TeamMember,
  Link,
  LinkPlatform,
  LINK_PLATFORMS,
} from './lib/api';

const emptyForm = {
  slug: '',
  name: '',
  role: '',
  photoUrl: '',
  linkPlatform: LINK_PLATFORMS[0],
  linkUrl: '',
};

export default function TeamPanel() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch<TeamMember[]>('/team-members/admin');
      setMembers(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error cargando el equipo.');
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
      await apiFetch<TeamMember>('/team-members', {
        method: 'POST',
        body: JSON.stringify({
          slug: form.slug,
          name: form.name,
          role: form.role,
          photoUrl: form.photoUrl,
          links,
        }),
      });
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error creando miembro.');
    } finally {
      setCreating(false);
    }
  };

  const togglePublished = async (member: TeamMember) => {
    try {
      await apiFetch(`/team-members/${member.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ published: !member.published }),
      });
      setMembers((prev) =>
        prev.map((m) => (m.id === member.id ? { ...m, published: !m.published } : m)),
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error actualizando miembro.');
    }
  };

  const remove = async (id: string) => {
    try {
      await apiFetch(`/team-members/${id}`, { method: 'DELETE' });
      setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error eliminando miembro.');
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
              - Equipo -
            </span>
            <h2 className="font-mono text-lg font-bold uppercase">Nuevo miembro</h2>
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
            placeholder="Nombre"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="px-3 py-2 rounded-xl bg-honeydew-900 focus:outline-none focus:ring-2 focus:ring-honeydew-500"
          />
          <input
            required
            placeholder="Rol (ej. Piloto)"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
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
            placeholder="https://instagram.com/... (opcional)"
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
          {creating ? 'Creando...' : 'Crear miembro'}
        </button>
      </form>

      <div className="p-6 space-y-4 shadow-lg rounded-2xl bg-honeydew-800 sm:p-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center rounded-full w-11 h-11 bg-honeydew-900 shrink-0">
            <Users size={20} strokeWidth={1.5} />
          </div>
          <h2 className="font-mono text-lg font-bold uppercase">Equipo ({members.length})</h2>
        </div>

        {loading && <p className="text-white/60">Cargando...</p>}
        {error && <p className="text-red-400">{error}</p>}
        {!loading && members.length === 0 && !error && (
          <p className="text-white/60">No hay miembros todavía.</p>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {members.map((m, index) => (
            <ScrollRevealEffect key={m.id} index={index}>
              <div className="flex flex-col h-full gap-3 p-4 rounded-xl bg-honeydew-900">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-wide bg-honeydew-800 text-honeydew-400">
                    {m.role}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-wide ${
                      m.published ? 'bg-honeydew-500 text-black' : 'bg-white/10 text-white/60'
                    }`}
                  >
                    {m.published ? 'publicado' : 'oculto'}
                  </span>
                </div>

                <div>
                  <p className="font-semibold">{m.name}</p>
                  <p className="text-sm text-white/50">/{m.slug}</p>
                </div>

                {m.published && (
                  <a
                    href={`/teams#${m.slug}`}
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
                    onClick={() => togglePublished(m)}
                    title={m.published ? 'Ocultar' : 'Publicar'}
                    className="inline-flex items-center justify-center w-9 h-9 transition rounded-full bg-honeydew-800 hover:bg-white hover:text-black"
                  >
                    {m.published ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    onClick={() => remove(m.id)}
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
