'use client'

import { useEffect, useState, FormEvent } from 'react';
import { Tags, Trash2, PlusCircle } from 'lucide-react';
import { apiFetch, ApiError, Category, CategoryType, CATEGORY_TYPES } from './lib/api';

const TYPE_LABELS: Record<CategoryType, string> = {
  PROJECT: 'Proyectos',
  CLIENT: 'Clientes',
  SERVICE: 'Servicios',
};

const emptyForm = {
  name: '',
  type: CATEGORY_TYPES[0],
};

export default function CategoriesPanel() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch<Category[]>('/categories');
      setCategories(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error cargando categorías.');
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
      await apiFetch<Category>('/categories', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error creando categoría.');
    } finally {
      setCreating(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await apiFetch(`/categories/${id}`, { method: 'DELETE' });
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error eliminando categoría.');
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
              - Organización -
            </span>
            <h2 className="font-mono text-lg font-bold uppercase">Nueva categoría</h2>
          </div>
        </div>

        <p className="text-sm text-white/60">
          Crea categorías aquí antes de crear proyectos, clientes o servicios — cada uno necesita
          elegir una.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <input
            required
            placeholder="Nombre (ej. Bodas, Gobierno)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="px-3 py-2 rounded-xl bg-honeydew-900 focus:outline-none focus:ring-2 focus:ring-honeydew-500"
          />
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as CategoryType })}
            className="px-3 py-2 rounded-xl bg-honeydew-900 focus:outline-none focus:ring-2 focus:ring-honeydew-500"
          >
            {CATEGORY_TYPES.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={creating}
          className="inline-flex items-center gap-2 px-4 py-2 font-bold text-black transition duration-500 rounded-xl bg-honeydew-500 hover:bg-white disabled:opacity-50"
        >
          <PlusCircle size={16} />
          {creating ? 'Creando...' : 'Crear categoría'}
        </button>
      </form>

      <div className="p-6 space-y-4 shadow-lg rounded-2xl bg-honeydew-800 sm:p-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center rounded-full w-11 h-11 bg-honeydew-900 shrink-0">
            <Tags size={20} strokeWidth={1.5} />
          </div>
          <h2 className="font-mono text-lg font-bold uppercase">
            Categorías ({categories.length})
          </h2>
        </div>

        {loading && <p className="text-white/60">Cargando...</p>}
        {error && <p className="text-red-400">{error}</p>}

        {CATEGORY_TYPES.map((type) => {
          const items = categories.filter((c) => c.type === type);
          if (items.length === 0) return null;
          return (
            <div key={type} className="space-y-2">
              <p className="font-mono text-xs font-bold uppercase tracking-wide text-honeydew-400">
                {TYPE_LABELS[type]}
              </p>
              <div className="flex flex-wrap gap-2">
                {items.map((c) => (
                  <div
                    key={c.id}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-full bg-honeydew-900"
                  >
                    <span>{c.name}</span>
                    <button
                      onClick={() => remove(c.id)}
                      title="Eliminar"
                      className="text-white/50 hover:text-red-400"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {!loading && categories.length === 0 && !error && (
          <p className="text-white/60">No hay categorías todavía.</p>
        )}
      </div>
    </div>
  );
}
