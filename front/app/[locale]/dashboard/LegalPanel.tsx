'use client'

import { useEffect, useState } from 'react';
import { Scale, PlusCircle, ExternalLink, Pencil } from 'lucide-react';
import { apiFetch, ApiError, LegalPage, slugify } from './lib/api';
import { useLive } from './lib/live';
import LegalPageEditor, { type LegalPageBody } from './LegalPageEditor';
import { ConfirmDelete, EmptyState, ErrorNote, ListRow, PanelHeader, PublishToggle, SkeletonList, StatusPill, btn, iconBtnCls } from './ui';

export default function LegalPanel() {
  const [pages, setPages] = useState<LegalPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // null = closed, 'new' = creating, otherwise the page being edited
  const [editing, setEditing] = useState<LegalPage | 'new' | null>(null);
  // Initial state is loading=true; later reloads (live events) swap data silently
  const load = async () => {
    setError('');
    try {
      setPages(await apiFetch<LegalPage[]>('/legal-pages/admin'));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error cargando páginas legales.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);
  useLive('legal-pages', load);

  // Throws on failure so the editor can show the API's message
  const save = async (body: LegalPageBody) => {
    if (editing === 'new') {
      await apiFetch<LegalPage>('/legal-pages', {
        method: 'POST',
        body: JSON.stringify({ slug: slugify(body.titleEs), ...body }),
      });
    } else if (editing) {
      await apiFetch<LegalPage>(`/legal-pages/${editing.id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
    }
    setEditing(null);
    await load();
  };

  const togglePublished = async (p: LegalPage) => {
    try {
      await apiFetch(`/legal-pages/${p.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ published: !p.published }),
      });
      setPages((prev) =>
        prev.map((x) => (x.id === p.id ? { ...x, published: !x.published } : x)),
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error actualizando página.');
    }
  };

  const remove = async (id: string) => {
    try {
      await apiFetch(`/legal-pages/${id}`, { method: 'DELETE' });
      setPages((prev) => prev.filter((x) => x.id !== id));
      if (editing !== 'new' && editing?.id === id) setEditing(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error eliminando página.');
    }
  };

  return (
    <div>
      <PanelHeader
        title="Legal"
        count={pages.length}
        subtitle="Términos, privacidad y otras páginas en /legal/…"
        actions={
          <button type="button" onClick={() => setEditing('new')} className={btn.primary}>
            <PlusCircle size={16} /> Nueva página
          </button>
        }
      />

      {error && <ErrorNote>{error}</ErrorNote>}

      {loading ? (
        <SkeletonList rows={2} />
      ) : pages.length === 0 ? (
        <EmptyState icon={<Scale size={20} />} title="Sin páginas legales" />
      ) : (
        <ul className="flex flex-col gap-2 p-0 m-0 list-none">
          {pages.map((p) => (
            <ListRow
              key={p.id}
              dimmed={!p.published}
              onOpen={() => setEditing(p)}
              thumb={
                <span className="flex items-center justify-center flex-none w-10 h-10 rounded-lg bg-white/[.05] text-jb-muted">
                  <Scale size={17} />
                </span>
              }
              title={p.titleEs}
              meta={[`/legal/${p.slug}`, `${p.content?.length ?? 0} secciones`, p.lastUpdate && `Actualizado: ${p.lastUpdate}`]
                .filter(Boolean)
                .join(' · ')}
              pills={<StatusPill published={p.published} />}
              actions={
                <>
                  <PublishToggle published={p.published} onToggle={() => togglePublished(p)} />
                  {p.published && (
                    <a href={`/legal/${p.slug}`} target="_blank" rel="noopener noreferrer" title="Ver en el sitio" className={iconBtnCls}>
                      <ExternalLink size={15} />
                    </a>
                  )}
                  <button type="button" title="Editar" aria-label="Editar" onClick={() => setEditing(p)} className={iconBtnCls}>
                    <Pencil size={15} />
                  </button>
                  <ConfirmDelete onConfirm={() => remove(p.id)} />
                </>
              }
            />
          ))}
        </ul>
      )}

      {editing && (
        <LegalPageEditor
          key={editing === 'new' ? 'new' : editing.id}
          page={editing === 'new' ? null : editing}
          takenSlugs={pages.filter((p) => editing === 'new' || p.id !== editing.id).map((p) => p.slug)}
          onClose={() => setEditing(null)}
          onSave={save}
        />
      )}
    </div>
  );
}
