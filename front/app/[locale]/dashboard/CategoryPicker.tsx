'use client'

import { useEffect, useState, FormEvent } from 'react';
import { Plus, X } from 'lucide-react';
import { apiFetch, ApiError, Category, CategoryType } from './lib/api';

interface Props {
  type: CategoryType;
  value: string;
  onChange: (categoryId: string) => void;
  label?: string;
}

export default function CategoryPicker({ type, value, onChange, label = 'Categoría' }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  const load = async (selectId?: string) => {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch<Category[]>(`/categories?type=${type}`);
      setCategories(data);
      if (selectId) {
        onChange(selectId);
      } else if (!value && data[0]) {
        onChange(data[0].id);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error cargando categorías.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setError('');
    try {
      const category = await apiFetch<Category>('/categories', {
        method: 'POST',
        body: JSON.stringify({ name: newName.trim(), type }),
      });
      setNewName('');
      setAdding(false);
      await load(category.id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error creando categoría.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <label className="block mb-1 font-mono text-xs font-semibold tracking-wide uppercase text-white/70">
        {label}
      </label>

      {adding ? (
        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            autoFocus
            required
            placeholder="Nombre de la categoría"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl bg-honeydew-900 focus:outline-none focus:ring-2 focus:ring-honeydew-500"
          />
          <button
            type="submit"
            disabled={creating}
            className="px-3 rounded-xl bg-honeydew-500 text-black font-bold hover:bg-white transition disabled:opacity-50"
          >
            {creating ? '...' : 'Crear'}
          </button>
          <button
            type="button"
            onClick={() => {
              setAdding(false);
              setNewName('');
            }}
            className="inline-flex items-center justify-center w-10 rounded-xl bg-honeydew-900 hover:bg-white hover:text-black transition"
          >
            <X size={16} />
          </button>
        </form>
      ) : (
        <div className="flex gap-2">
          <select
            required
            value={value}
            disabled={loading || categories.length === 0}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl bg-honeydew-900 focus:outline-none focus:ring-2 focus:ring-honeydew-500 disabled:opacity-50"
          >
            {categories.length === 0 && <option value="">Sin categorías todavía</option>}
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setAdding(true)}
            title="Nueva categoría"
            className="inline-flex items-center justify-center w-10 rounded-xl bg-honeydew-900 hover:bg-white hover:text-black transition shrink-0"
          >
            <Plus size={16} />
          </button>
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
