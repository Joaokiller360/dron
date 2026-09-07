'use client'

import { useEffect, useState, FormEvent } from 'react';
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
    <div className="space-y-4">
      <form
        onSubmit={handleCreate}
        className="grid gap-3 p-6 rounded-2xl bg-honeydew-800 sm:grid-cols-2"
      >
        <h2 className="text-lg font-bold sm:col-span-2">Nuevo proyecto</h2>

        <input
          required
          placeholder="slug-unico"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          className="px-3 py-2 rounded bg-honeydew-900"
        />
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value as ProjectCategory })}
          className="px-3 py-2 rounded bg-honeydew-900"
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
          className="px-3 py-2 rounded bg-honeydew-900"
        />
        <input
          required
          type="url"
          placeholder="https://.../cover.jpg"
          value={form.coverUrl}
          onChange={(e) => setForm({ ...form, coverUrl: e.target.value })}
          className="px-3 py-2 rounded bg-honeydew-900"
        />

        <button
          type="submit"
          disabled={creating}
          className="px-4 py-2 font-bold text-black transition rounded-xl bg-honeydew-500 hover:bg-white disabled:opacity-50 sm:col-span-2"
        >
          {creating ? 'Creando...' : 'Crear proyecto'}
        </button>
      </form>

      <div className="p-6 space-y-3 rounded-2xl bg-honeydew-800">
        <h2 className="text-lg font-bold">Proyectos ({projects.length})</h2>

        {loading && <p className="text-white/60">Cargando...</p>}
        {error && <p className="text-red-400">{error}</p>}
        {!loading && projects.length === 0 && !error && (
          <p className="text-white/60">No hay proyectos todavía.</p>
        )}

        {projects.map((p) => (
          <div
            key={p.id}
            className="flex flex-wrap items-center justify-between gap-2 p-4 rounded-xl bg-honeydew-900"
          >
            <div>
              <p className="font-semibold">
                {p.titleEs} <span className="text-white/50">/{p.slug}</span>
              </p>
              <p className="text-sm text-white/60">
                {p.category} · {p.published ? 'publicado' : 'oculto'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => togglePublished(p)}
                className="px-3 py-1 text-sm rounded bg-honeydew-800 hover:bg-white hover:text-black"
              >
                {p.published ? 'Ocultar' : 'Publicar'}
              </button>
              <button
                onClick={() => remove(p.id)}
                className="px-3 py-1 text-sm rounded text-red-400 bg-honeydew-800 hover:bg-red-500 hover:text-white"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
