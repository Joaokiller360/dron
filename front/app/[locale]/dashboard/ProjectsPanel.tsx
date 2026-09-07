'use client'

import { useEffect, useState, FormEvent } from 'react';
import { FolderKanban, Eye, EyeOff, Trash2, PlusCircle } from 'lucide-react';
import { ScrollRevealEffect } from '@/app/utils';
import { apiFetch, ApiError, Project, PROJECT_CATEGORIES, ProjectCategory } from './lib/api';

const emptyForm = {
  slug: '',
  category: PROJECT_CATEGORIES[0],
  titleEs: '',
  coverUrl: '',
};

export default function ProjectsPanel() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState<{
    slug: string;
    category: ProjectCategory;
    titleEs: string;
    coverUrl: string;
  }>(emptyForm);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch<Project[]>('/projects/admin');
      setProjects(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error cargando proyectos.');
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
      await apiFetch<Project>('/projects', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error creando proyecto.');
    } finally {
      setCreating(false);
    }
  };

  const togglePublished = async (project: Project) => {
    try {
      await apiFetch(`/projects/${project.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ published: !project.published }),
      });
      setProjects((prev) =>
        prev.map((p) => (p.id === project.id ? { ...p, published: !p.published } : p)),
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error actualizando proyecto.');
    }
  };

  const remove = async (id: string) => {
    try {
      await apiFetch(`/projects/${id}`, { method: 'DELETE' });
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error eliminando proyecto.');
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
              - Portafolio -
            </span>
            <h2 className="font-mono text-lg font-bold uppercase">Nuevo proyecto</h2>
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
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as ProjectCategory })}
            className="px-3 py-2 rounded-xl bg-honeydew-900 focus:outline-none focus:ring-2 focus:ring-honeydew-500"
          >
            {PROJECT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            required
            placeholder="Título (es)"
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
        </div>

        <button
          type="submit"
          disabled={creating}
          className="inline-flex items-center gap-2 px-4 py-2 font-bold text-black transition duration-500 rounded-xl bg-honeydew-500 hover:bg-white disabled:opacity-50"
        >
          <PlusCircle size={16} />
          {creating ? 'Creando...' : 'Crear proyecto'}
        </button>
      </form>

      <div className="p-6 space-y-4 shadow-lg rounded-2xl bg-honeydew-800 sm:p-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center rounded-full w-11 h-11 bg-honeydew-900 shrink-0">
            <FolderKanban size={20} strokeWidth={1.5} />
          </div>
          <h2 className="font-mono text-lg font-bold uppercase">
            Proyectos ({projects.length})
          </h2>
        </div>

        {loading && <p className="text-white/60">Cargando...</p>}
        {error && <p className="text-red-400">{error}</p>}
        {!loading && projects.length === 0 && !error && (
          <p className="text-white/60">No hay proyectos todavía.</p>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {projects.map((p, index) => (
            <ScrollRevealEffect key={p.id} index={index}>
              <div className="flex flex-col h-full gap-3 p-4 rounded-xl bg-honeydew-900">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-wide bg-honeydew-800 text-honeydew-400">
                    {p.category}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-wide ${
                      p.published ? 'bg-honeydew-500 text-black' : 'bg-white/10 text-white/60'
                    }`}
                  >
                    {p.published ? 'publicado' : 'oculto'}
                  </span>
                </div>

                <div>
                  <p className="font-semibold">{p.titleEs}</p>
                  <p className="text-sm text-white/50">/{p.slug}</p>
                </div>

                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => togglePublished(p)}
                    title={p.published ? 'Ocultar' : 'Publicar'}
                    className="inline-flex items-center justify-center w-9 h-9 transition rounded-full bg-honeydew-800 hover:bg-white hover:text-black"
                  >
                    {p.published ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    onClick={() => remove(p.id)}
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
