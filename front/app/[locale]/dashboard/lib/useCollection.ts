'use client'

import { useCallback, useEffect, useRef, useState } from 'react';
import { apiFetch, errorMessage, reorder, ReorderResource } from './api';
import { useLive } from './live';

interface Options {
  /** Server resource name(s) whose change events trigger a silent reload */
  live: string | string[];
  /** Base path for PATCH/DELETE (`${base}/${id}`); defaults to the resource name */
  base?: string;
  /** Enables `move()` via PATCH /reorder/:resource */
  reorderAs?: ReorderResource;
}

/**
 * List state for a dashboard panel: first load shows a skeleton, later reloads
 * (live events, own writes) swap data in place without a spinner. Writes are
 * optimistic and roll back if the API refuses them.
 */
export function useCollection<T extends { id: string }>(listPath: string, opts: Options) {
  const base = opts.base ?? `/${Array.isArray(opts.live) ? opts.live[0] : opts.live}`;
  const [items, setItemsState] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Mirror of `items` that is current synchronously, so optimistic writes can
  // compute the next list and keep the previous one for rollback.
  const current = useRef<T[]>([]);
  const setItems = useCallback((next: T[]) => {
    current.current = next;
    setItemsState(next);
  }, []);

  const reload = useCallback(async () => {
    try {
      const data = await apiFetch<T[]>(listPath);
      setItems(data);
      setError('');
    } catch (err) {
      setError(errorMessage(err, 'No se pudo cargar la lista.'));
    } finally {
      setLoading(false);
    }
  }, [listPath, setItems]);

  useEffect(() => {
    // async fetch; state is only set after the request resolves
    reload();
  }, [reload]);

  useLive(opts.live, reload);

  const create = useCallback(
    async (body: unknown) => {
      const created = await apiFetch<T>(base, { method: 'POST', body: JSON.stringify(body) });
      setItems([...current.current, created]);
      return created;
    },
    [base, setItems],
  );

  const update = useCallback(
    async (id: string, patch: Record<string, unknown>) => {
      const previous = current.current;
      setItems(previous.map((it) => (it.id === id ? ({ ...it, ...patch } as T) : it)));
      try {
        const saved = await apiFetch<T>(`${base}/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
        setItems(current.current.map((it) => (it.id === id ? { ...it, ...saved } : it)));
        return saved;
      } catch (err) {
        setItems(previous);
        throw err;
      }
    },
    [base, setItems],
  );

  const remove = useCallback(
    async (id: string) => {
      const previous = current.current;
      setItems(previous.filter((it) => it.id !== id));
      try {
        await apiFetch(`${base}/${id}`, { method: 'DELETE' });
      } catch (err) {
        setItems(previous);
        throw err;
      }
    },
    [base, setItems],
  );

  const move = useCallback(
    async (id: string, direction: -1 | 1) => {
      if (!opts.reorderAs) return;
      const previous = current.current;
      const i = previous.findIndex((it) => it.id === id);
      const j = i + direction;
      if (i < 0 || j < 0 || j >= previous.length) return;
      const next = [...previous];
      [next[i], next[j]] = [next[j], next[i]];
      setItems(next);
      try {
        await reorder(opts.reorderAs, next.map((it) => it.id));
      } catch (err) {
        setItems(previous);
        throw err;
      }
    },
    [opts.reorderAs, setItems],
  );

  return { items, setItems, loading, error, reload, create, update, remove, move };
}
