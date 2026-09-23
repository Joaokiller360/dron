'use client'

import { useEffect, useState, KeyboardEvent } from 'react';
import { Plus, X, Pencil, Trash2, Check } from 'lucide-react';
import { apiFetch, ApiError, Category, CategoryType } from './lib/api';

interface Props {
  type: CategoryType;
  value: string;
  onChange: (categoryId: string) => void;
  label?: string;
}

type Mode = 'idle' | 'add' | 'edit';

const inputClass =
  'flex-1 px-3 py-2 rounded-xl bg-jb-bg focus:outline-none focus:ring-2 focus:ring-jb-accent/60';
const iconBtn =
  'inline-flex items-center justify-center w-10 rounded-xl bg-jb-bg hover:bg-white hover:text-black transition shrink-0 disabled:opacity-40 disabled:hover:bg-jb-bg disabled:hover:text-current';

export default function CategoryPicker({ type, value, onChange, label = 'Categoría' }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<Mode>('idle');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  const selected = categories.find((c) => c.id === value) ?? null;

  const load = async (selectId?: string) => {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch<Category[]>(`/categories?type=${type}`);
      setCategories(data);
      if (selectId) {
        onChange(selectId);
      } else if (!data.some((c) => c.id === value)) {
        onChange(data[0]?.id ?? '');
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

  const cancel = () => {
    setMode('idle');
    setName('');
    setError('');
  };

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setBusy(true);
    setError('');
    try {
      if (mode === 'add') {
        const category = await apiFetch<Category>('/categories', {
          method: 'POST',
          body: JSON.stringify({ name: trimmed, type }),
        });
        cancel();
        await load(category.id);
      } else if (mode === 'edit' && selected) {
        await apiFetch<Category>(`/categories/${selected.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ name: trimmed }),
        });
        cancel();
        await load(selected.id);
      }
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : mode === 'add'
            ? 'Error creando categoría.'
            : 'Error editando categoría.',
      );
    } finally {
      setBusy(false);
    }
  };

  // Enter saves the category (instead of submitting the item's form), Escape cancels
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      cancel();
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    if (!window.confirm(`¿Eliminar la categoría "${selected.name}"?`)) return;
    setBusy(true);
    setError('');
    try {
      await apiFetch(`/categories/${selected.id}`, { method: 'DELETE' });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error eliminando categoría.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <label className="block mb-1 font-mono text-xs font-semibold tracking-wide uppercase text-white/70">
        {label}
      </label>

      {mode !== 'idle' ? (
        // Not a <form>: this picker lives inside the item's form, and nested
        // forms are invalid HTML (the browser would submit the outer one)
        <div className="flex gap-2">
          <input
            autoFocus
            placeholder={mode === 'add' ? 'Nombre de la categoría' : 'Nuevo nombre'}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={onKeyDown}
            maxLength={100}
            className={inputClass}
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={busy || !name.trim()}
            className="px-3 rounded-xl bg-jb-accent text-black font-bold hover:bg-white transition disabled:opacity-50"
          >
            {busy ? '...' : mode === 'add' ? 'Crear' : <Check size={16} />}
          </button>
          <button type="button" onClick={cancel} title="Cancelar" className={iconBtn}>
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <select
            required
            value={value}
            disabled={loading || categories.length === 0}
            onChange={(e) => onChange(e.target.value)}
            className={`${inputClass} disabled:opacity-50`}
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
            onClick={() => {
              setName('');
              setMode('add');
            }}
            title="Nueva categoría"
            className={iconBtn}
          >
            <Plus size={16} />
          </button>
          <button
            type="button"
            disabled={!selected || busy}
            onClick={() => {
              setName(selected?.name ?? '');
              setMode('edit');
            }}
            title="Editar categoría"
            className={iconBtn}
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            disabled={!selected || busy}
            onClick={handleDelete}
            title="Eliminar categoría"
            className={`${iconBtn} hover:!bg-red-500 hover:!text-white`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
