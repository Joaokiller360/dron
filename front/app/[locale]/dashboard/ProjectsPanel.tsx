'use client'

import { useState, FormEvent } from 'react';
import { FolderKanban, Plus, Pencil, ExternalLink } from 'lucide-react';
import { errorMessage, Project, slugify } from './lib/api';
import { useCollection } from './lib/useCollection';
import CategoryPicker from './CategoryPicker';
import Modal from './Modal';
import {
  ConfirmDelete,
  EmptyState,
  ErrorNote,
  Field,
  FormActions,
  ListRow,
  MoveButtons,
  PanelHeader,
  PublishToggle,
  StatusPill,
  SearchInput,
  SkeletonList,
  Thumb,
  btn,
  iconBtnCls,
  inputCls,
  useToast,
} from './ui';

const emptyForm = {
  categoryId: '',
  titleEs: '',
  titleEn: '',
  descriptionEs: '',
  descriptionEn: '',
  coverUrl: '',
  href: '',
  published: true,
};
type Form = typeof emptyForm;

const orNull = (v: string) => (v.trim() ? v.trim() : null);

export default function ProjectsPanel() {
  const toast = useToast();
  const { items, loading, error, create, update, remove, move } = useCollection<Project>('/projects/admin', {
    live: ['projects', 'categories'],
    base: '/projects',
    reorderAs: 'projects',
  });
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Project | 'new' | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const q = query.trim().toLowerCase();
  const visible = q
    ? items.filter((p) => [p.titleEs, p.titleEn ?? '', p.category?.name ?? ''].some((f) => f.toLowerCase().includes(q)))
    : items;

  const openNew = () => {
    setForm({ ...emptyForm, categoryId: form.categoryId });
    setFormError('');
    setEditing('new');
  };
  const openEdit = (p: Project) => {
    setForm({
      categoryId: p.categoryId,
      titleEs: p.titleEs,
      titleEn: p.titleEn ?? '',
      descriptionEs: p.descriptionEs ?? '',
      descriptionEn: p.descriptionEn ?? '',
      coverUrl: p.coverUrl,
      href: p.href ?? '',
      published: p.published,
    });
    setFormError('');
    setEditing(p);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    const body = {
      categoryId: form.categoryId,
      titleEs: form.titleEs.trim(),
      titleEn: orNull(form.titleEn),
      descriptionEs: orNull(form.descriptionEs),
      descriptionEn: orNull(form.descriptionEn),
      coverUrl: form.coverUrl.trim(),
      href: orNull(form.href),
      published: form.published,
    };
    try {
      if (editing === 'new') {
        await create({ ...body, slug: slugify(body.titleEs), sortOrder: items.length });
        toast.success(form.published ? 'Proyecto publicado' : 'Proyecto guardado como oculto');
      } else if (editing) {
        await update(editing.id, body);
        toast.success('Cambios guardados');
      }
      setEditing(null);
    } catch (err) {
      setFormError(errorMessage(err, 'No se pudo guardar el proyecto.'));
    } finally {
      setSaving(false);
    }
  };

  const run = async (fn: () => Promise<unknown>, ok: string, fail: string) => {
    try {
      await fn();
      if (ok) toast.success(ok);
    } catch (err) {
      toast.error(errorMessage(err, fail));
    }
  };

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div>
      <PanelHeader
        title="Proyectos"
        count={items.length}
        subtitle="Trabajos del portafolio. El orden de la lista es el orden en el sitio."
        actions={
          <>
            <SearchInput value={query} onChange={setQuery} />
            <button type="button" onClick={openNew} className={btn.primary}>
              <Plus size={16} /> Nuevo proyecto
            </button>
          </>
        }
      />

      {error && <ErrorNote>{error}</ErrorNote>}

      {loading ? (
        <SkeletonList />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<FolderKanban size={20} />}
          title="Sin proyectos"
          text="Añade tu primer trabajo; aparecerá en /portfolio al publicarlo."
          action={
            <button type="button" onClick={openNew} className={btn.primary}>
              <Plus size={16} /> Nuevo proyecto
            </button>
          }
        />
      ) : (
        <ul className="flex flex-col gap-2 p-0 m-0 list-none">
          {visible.map((p) => {
            const index = items.indexOf(p);
            return (
              <ListRow
                key={p.id}
                dimmed={!p.published}
                onOpen={() => openEdit(p)}
                thumb={<Thumb src={p.coverUrl} alt={p.titleEs} className="w-16 h-12" />}
                title={p.titleEs}
                meta={[p.category?.name, p.descriptionEs].filter(Boolean).join(' · ')}
                pills={<StatusPill published={p.published} />}
                actions={
                  <>
                    <PublishToggle
                      published={p.published}
                      onToggle={() =>
                        run(
                          () => update(p.id, { published: !p.published }),
                          p.published ? 'Oculto del sitio' : 'Publicado en el sitio',
                          'No se pudo cambiar la visibilidad.',
                        )
                      }
                    />
                    {!q && (
                      <MoveButtons
                        first={index === 0}
                        last={index === items.length - 1}
                        onUp={() => run(() => move(p.id, -1), '', 'No se pudo reordenar.')}
                        onDown={() => run(() => move(p.id, 1), '', 'No se pudo reordenar.')}
                      />
                    )}
                    {p.published && (
                      <a href={`/portfolio#${p.slug}`} target="_blank" rel="noopener noreferrer" title="Ver en el sitio" className={iconBtnCls}>
                        <ExternalLink size={15} />
                      </a>
                    )}
                    <button type="button" title="Editar" aria-label="Editar" onClick={() => openEdit(p)} className={iconBtnCls}>
                      <Pencil size={15} />
                    </button>
                    <ConfirmDelete onConfirm={() => run(() => remove(p.id), 'Proyecto eliminado', 'No se pudo eliminar.')} />
                  </>
                }
              />
            );
          })}
          {visible.length === 0 && <p className="py-8 m-0 text-center text-[13.5px] text-jb-muted">Sin resultados para “{query}”.</p>}
        </ul>
      )}

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'Nuevo proyecto' : 'Editar proyecto'}
        subtitle="Portafolio"
        icon={<FolderKanban size={19} />}
      >
        <form onSubmit={submit} className="flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-[180px_minmax(0,1fr)]">
            <Thumb src={form.coverUrl} className="w-full aspect-[16/10] sm:w-[180px]" />
            <div className="flex flex-col gap-4">
              <CategoryPicker type="PROJECT" value={form.categoryId} onChange={(id) => set('categoryId', id)} />
              <Field label="Portada (URL de imagen)">
                <input required type="url" value={form.coverUrl} onChange={(e) => set('coverUrl', e.target.value)} placeholder="https://res.cloudinary.com/…/cover.jpg" className={inputCls} />
              </Field>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Título (ES)">
              <input required value={form.titleEs} onChange={(e) => set('titleEs', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Título (EN)" hint="Opcional; si falta se usa el español.">
              <input value={form.titleEn} onChange={(e) => set('titleEn', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Subtítulo / cliente (ES)">
              <input value={form.descriptionEs} onChange={(e) => set('descriptionEs', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Subtítulo / cliente (EN)">
              <input value={form.descriptionEn} onChange={(e) => set('descriptionEn', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Enlace del video" hint="YouTube o .mp4 se reproducen en el sitio; otros enlaces abren aparte." className="sm:col-span-2">
              <input type="url" value={form.href} onChange={(e) => set('href', e.target.value)} placeholder="https://www.instagram.com/reel/…" className={inputCls} />
            </Field>
          </div>
          {formError && <ErrorNote>{formError}</ErrorNote>}
          <FormActions saving={saving} disabled={!form.categoryId} onCancel={() => setEditing(null)} submitLabel={editing === 'new' ? 'Crear proyecto' : 'Guardar cambios'} />
        </form>
      </Modal>
    </div>
  );
}
