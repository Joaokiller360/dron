'use client'

import { useEffect, useState, FormEvent } from 'react';
import {
  Scale,
  Trash2,
  PlusCircle,
  ExternalLink,
  Pencil,
  Plus,
} from 'lucide-react';
import { apiFetch, ApiError, LegalPage, LegalSection, slugify } from './lib/api';
import { useLive } from './lib/live';
import Modal from './Modal';
import { ConfirmDelete, EmptyState, ErrorNote, ListRow, PanelHeader, PublishToggle, SkeletonList, StatusPill, btn, iconBtnCls } from './ui';

const linesToArr = (v: string) =>
  v.split('\n').map((l) => l.trimEnd()).filter((l) => l.length > 0);
const arrToLines = (a?: string[]) => (a ?? []).join('\n');

const inputCls =
  'w-full px-3 py-2 rounded-xl bg-jb-bg border border-white/15 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-jb-accent/60 focus:border-transparent';
const labelCls = 'font-mono text-xs font-semibold uppercase tracking-wide text-white/80';

const emptyForm = {
  titleEs: '',
  titleEn: '',
  label: '',
  lastUpdate: '',
  keywords: '',
  metaTitle: '',
  metaDescription: '',
  sortOrder: '0',
  published: true,
  content: [] as LegalSection[],
};

type FormState = typeof emptyForm;

function pageToForm(p: LegalPage): FormState {
  return {
    titleEs: p.titleEs,
    titleEn: p.titleEn ?? '',
    label: p.label ?? '',
    lastUpdate: p.lastUpdate ?? '',
    keywords: (p.keywords ?? []).join('\n'),
    metaTitle: p.metaTitle ?? '',
    metaDescription: p.metaDescription ?? '',
    sortOrder: String(p.sortOrder ?? 0),
    published: p.published,
    content: p.content ?? [],
  };
}

function AddBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wide text-black transition rounded-full bg-jb-accent hover:bg-white"
    >
      <Plus size={13} />
      {children}
    </button>
  );
}

function DelBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Quitar"
      className="inline-flex items-center justify-center text-red-400 transition rounded-full w-7 h-7 bg-jb-card hover:bg-red-500 hover:text-white shrink-0"
    >
      <Trash2 size={13} />
    </button>
  );
}

function ContentEditor({
  value,
  onChange,
}: {
  value: LegalSection[];
  onChange: (v: LegalSection[]) => void;
}) {
  const setSection = (i: number, patch: Partial<LegalSection>) =>
    onChange(value.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className={labelCls}>Secciones ({value.length})</span>
        <AddBtn onClick={() => onChange([...value, { heading: '', text: [] }])}>Sección</AddBtn>
      </div>

      {value.map((section, i) => {
        const lists = section.lists ?? [];
        const setList = (li: number, patch: Partial<NonNullable<LegalSection['lists']>[number]>) =>
          setSection(i, {
            lists: lists.map((l, idx) => (idx === li ? { ...l, ...patch } : l)),
          });
        return (
          <div key={i} className="p-3 space-y-2 border rounded-lg bg-jb-bg border-white/10">
            <div className="flex items-center justify-between gap-2">
              <span className={labelCls}>Sección {i + 1}</span>
              <DelBtn onClick={() => onChange(value.filter((_, idx) => idx !== i))} />
            </div>
            <input
              className={inputCls}
              placeholder="Encabezado (subtítulo)"
              value={section.heading ?? ''}
              onChange={(e) => setSection(i, { heading: e.target.value })}
            />
            <textarea
              className={inputCls}
              rows={4}
              placeholder="Párrafos — uno por línea"
              value={arrToLines(section.text)}
              onChange={(e) => setSection(i, { text: linesToArr(e.target.value) })}
            />

            <div className="pl-3 space-y-2 border-l border-white/10">
              <div className="flex items-center justify-between">
                <span className={labelCls}>Sublistas ({lists.length})</span>
                <AddBtn
                  onClick={() =>
                    setSection(i, { lists: [...lists, { header: '', description: [], items: [] }] })
                  }
                >
                  Sublista
                </AddBtn>
              </div>
              {lists.map((l, li) => (
                <div key={li} className="p-2 space-y-2 rounded-md bg-jb-bg">
                  <div className="flex items-center gap-2">
                    <input
                      className={inputCls}
                      placeholder="Encabezado de la sublista (opcional)"
                      value={l.header ?? ''}
                      onChange={(e) => setList(li, { header: e.target.value })}
                    />
                    <DelBtn
                      onClick={() =>
                        setSection(i, { lists: lists.filter((_, idx) => idx !== li) })
                      }
                    />
                  </div>
                  <textarea
                    className={inputCls}
                    rows={2}
                    placeholder="Descripción — un párrafo por línea (opcional)"
                    value={arrToLines(l.description)}
                    onChange={(e) => setList(li, { description: linesToArr(e.target.value) })}
                  />
                  <textarea
                    className={inputCls}
                    rows={3}
                    placeholder="Ítems de la lista — uno por línea"
                    value={arrToLines(l.items)}
                    onChange={(e) => setList(li, { items: linesToArr(e.target.value) })}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function LegalPanel() {
  const [pages, setPages] = useState<LegalPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

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

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setError('');
  };

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError('');
    setModalOpen(true);
  };

  const startEdit = (p: LegalPage) => {
    setForm(pageToForm(p));
    setEditingId(p.id);
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const body = {
      titleEs: form.titleEs,
      titleEn: form.titleEn || undefined,
      label: form.label || undefined,
      lastUpdate: form.lastUpdate || undefined,
      keywords: form.keywords.split('\n').map((k) => k.trim()).filter(Boolean),
      metaTitle: form.metaTitle || undefined,
      metaDescription: form.metaDescription || undefined,
      sortOrder: Number(form.sortOrder) || 0,
      published: form.published,
      content: form.content,
    };
    try {
      if (editingId) {
        await apiFetch<LegalPage>(`/legal-pages/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        });
      } else {
        await apiFetch<LegalPage>('/legal-pages', {
          method: 'POST',
          body: JSON.stringify({ slug: slugify(form.titleEs), ...body }),
        });
      }
      closeModal();
      await load();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : editingId
            ? 'Error guardando cambios.'
            : 'Error creando página.',
      );
    } finally {
      setSaving(false);
    }
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
      if (editingId === id) closeModal();
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
          <button type="button" onClick={openCreate} className={btn.primary}>
            <PlusCircle size={16} /> Nueva página
          </button>
        }
      />

      {!modalOpen && error && <ErrorNote>{error}</ErrorNote>}

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
              onOpen={() => startEdit(p)}
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
                  <button type="button" title="Editar" aria-label="Editar" onClick={() => startEdit(p)} className={iconBtnCls}>
                    <Pencil size={15} />
                  </button>
                  <ConfirmDelete onConfirm={() => remove(p.id)} />
                </>
              }
            />
          ))}
        </ul>
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingId ? 'Editar página legal' : 'Nueva página legal'}
        subtitle="- Legal -"
        icon={editingId ? <Pencil size={20} strokeWidth={1.5} /> : <PlusCircle size={20} strokeWidth={1.5} />}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              required
              placeholder="Título (es)"
              value={form.titleEs}
              onChange={(e) => setForm({ ...form, titleEs: e.target.value })}
              className={inputCls}
            />
            <input
              placeholder="Title (en) — opcional"
              value={form.titleEn}
              onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
              className={inputCls}
            />
            <input
              placeholder="Label (ej. Nuestros)"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              className={inputCls}
            />
            <input
              placeholder="Última actualización (ej. 01 de Mayo del 2026)"
              value={form.lastUpdate}
              onChange={(e) => setForm({ ...form, lastUpdate: e.target.value })}
              className={inputCls}
            />
            <input
              placeholder="Meta title (SEO) — opcional"
              value={form.metaTitle}
              onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
              className={inputCls}
            />
            <input
              placeholder="Meta description (SEO) — opcional"
              value={form.metaDescription}
              onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
              className={inputCls}
            />
            <textarea
              placeholder="Palabras a resaltar — una por línea"
              value={form.keywords}
              onChange={(e) => setForm({ ...form, keywords: e.target.value })}
              rows={3}
              className={`${inputCls} sm:col-span-2`}
            />
            <label className="flex flex-col gap-1 font-mono text-xs tracking-wide uppercase text-white/80">
              Orden
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                className={inputCls}
              />
            </label>
            <label className="flex items-center gap-2 font-mono text-xs tracking-wide uppercase text-white/80 sm:mt-6">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
                className="w-4 h-4 accent-jb-accent"
              />
              Publicado
            </label>
          </div>

          <div className="pt-2 border-t border-white/10">
            <ContentEditor
              value={form.content}
              onChange={(content) => setForm({ ...form, content })}
            />
          </div>

          {error && <p className="text-red-400">{error}</p>}

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 font-bold text-black transition duration-500 rounded-xl bg-jb-accent hover:bg-white disabled:opacity-50"
            >
              {editingId ? <Pencil size={16} /> : <PlusCircle size={16} />}
              {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear página'}
            </button>
            <button
              type="button"
              onClick={closeModal}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold transition rounded-xl bg-jb-bg hover:bg-white hover:text-black"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
