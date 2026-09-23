'use client'

import { useState, FormEvent } from 'react';
import { Wrench, Plus, ExternalLink, Pencil, FileText } from 'lucide-react';
import { errorMessage, Service, ServicePageData, slugify } from './lib/api';
import { useCollection } from './lib/useCollection';
import ServicePageEditor from './ServicePageEditor';
import Modal from './Modal';
import MediaInput from './MediaInput';
import {
  ConfirmDelete,
  EmptyState,
  ErrorNote,
  Field,
  FormActions,
  ListRow,
  MoveButtons,
  PanelHeader,
  Pill,
  PublishToggle,
  StatusPill,
  SkeletonList,
  Thumb,
  Toggle,
  btn,
  iconBtnCls,
  inputCls,
  useToast,
} from './ui';

const emptyPage: ServicePageData = {
  D: [{ imagen: '', label: 'Servicios', title: '' }],
  Content: [],
  keyword: [],
  keywordLink: {},
  galery: [],
  P: [],
  CalltoAction: [],
  Animations: [],
  Example: [],
};

const emptyForm = {
  titleEs: '',
  titleEn: '',
  descriptionEs: '',
  descriptionEn: '',
  coverUrl: '',
  href: '',
  published: true,
  isPage: false,
  metaTitle: '',
  metaDescription: '',
  keywords: '',
  page: emptyPage,
};

type FormState = typeof emptyForm;

function serviceToForm(s: Service): FormState {
  return {
    titleEs: s.titleEs,
    titleEn: s.titleEn ?? '',
    descriptionEs: s.descriptionEs ?? '',
    descriptionEn: s.descriptionEn ?? '',
    coverUrl: s.coverUrl,
    href: s.href ?? '',
    published: s.published,
    isPage: s.isPage,
    metaTitle: s.metaTitle ?? '',
    metaDescription: s.metaDescription ?? '',
    keywords: (s.keywords ?? []).join('\n'),
    page: {
      ...emptyPage,
      ...(s.page ?? {}),
      D:
        s.page?.D && s.page.D.length > 0
          ? s.page.D
          : [{ imagen: '', label: 'Servicios', title: s.titleEs }],
    },
  };
}

export default function ServicesPanel() {
  const toast = useToast();
  const { items, loading, error, create, update, remove, move } = useCollection<Service>('/services/admin', {
    live: ['services', 'categories'],
    base: '/services',
    reorderAs: 'services',
  });
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editing, setEditing] = useState<Service | 'new' | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const openNew = () => {
    setForm(emptyForm);
    setFormError('');
    setEditing('new');
  };
  const openEdit = (s: Service) => {
    setForm(serviceToForm(s));
    setFormError('');
    setEditing(s);
  };

  const orNull = (v: string) => (v.trim() ? v.trim() : null);
  const buildBody = () => {
    const base: Record<string, unknown> = {
      titleEs: form.titleEs.trim(),
      titleEn: orNull(form.titleEn),
      descriptionEs: orNull(form.descriptionEs),
      descriptionEn: orNull(form.descriptionEn),
      coverUrl: form.coverUrl.trim(),
      href: orNull(form.href),
      published: form.published,
      isPage: form.isPage,
    };
    if (form.isPage) {
      base.page = form.page;
      base.metaTitle = orNull(form.metaTitle);
      base.metaDescription = orNull(form.metaDescription);
      base.keywords = form.keywords
        .split('\n')
        .map((k) => k.trim())
        .filter(Boolean);
    }
    return base;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      if (editing === 'new') {
        await create({ slug: slugify(form.titleEs), sortOrder: items.length, ...buildBody() });
        toast.success(form.published ? 'Servicio publicado' : 'Servicio guardado como oculto');
      } else if (editing) {
        await update(editing.id, buildBody());
        toast.success('Cambios guardados');
      }
      setEditing(null);
    } catch (err) {
      setFormError(errorMessage(err, 'No se pudo guardar el servicio.'));
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
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  const heading =
    editing && editing !== 'new'
      ? form.isPage
        ? 'Editar página de servicio'
        : 'Editar servicio'
      : form.isPage
        ? 'Nueva página de servicio'
        : 'Nuevo servicio';

  return (
    <div>
      <PanelHeader
        title="Servicios"
        count={items.length}
        subtitle="Las páginas completas tienen su propia URL (/services/…). El orden aquí es el orden en el sitio."
        actions={
          <button type="button" onClick={openNew} className={btn.primary}>
            <Plus size={16} /> Nuevo servicio
          </button>
        }
      />

      {error && <ErrorNote>{error}</ErrorNote>}

      {loading ? (
        <SkeletonList />
      ) : items.length === 0 ? (
        <EmptyState icon={<Wrench size={20} />} title="Sin servicios" text="Crea tu primer servicio o página de servicio." />
      ) : (
        <ul className="flex flex-col gap-2 p-0 m-0 list-none">
          {items.map((s, index) => (
            <ListRow
              key={s.id}
              dimmed={!s.published}
              onOpen={() => openEdit(s)}
              thumb={<Thumb src={s.coverUrl} alt={s.titleEs} className="w-16 h-12" />}
              title={s.titleEs}
              meta={s.isPage ? `/services/${s.slug}` : s.descriptionEs || s.href || ''}
              pills={
                <>
                  {s.isPage && (
                    <Pill tone="info">
                      <FileText size={11} /> Página
                    </Pill>
                  )}
                  <StatusPill published={s.published} />
                </>
              }
              actions={
                <>
                  <PublishToggle
                    published={s.published}
                    onToggle={() => run(() => update(s.id, { published: !s.published }), s.published ? 'Oculto del sitio' : 'Publicado', 'No se pudo cambiar la visibilidad.')}
                  />
                  <MoveButtons
                    first={index === 0}
                    last={index === items.length - 1}
                    onUp={() => run(() => move(s.id, -1), '', 'No se pudo reordenar.')}
                    onDown={() => run(() => move(s.id, 1), '', 'No se pudo reordenar.')}
                  />
                  {s.published && (
                    <a
                      href={s.isPage ? `/services/${s.slug}` : `/services#${s.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Ver en el sitio"
                      className={iconBtnCls}
                    >
                      <ExternalLink size={15} />
                    </a>
                  )}
                  <button type="button" title="Editar" aria-label="Editar" onClick={() => openEdit(s)} className={iconBtnCls}>
                    <Pencil size={15} />
                  </button>
                  <ConfirmDelete onConfirm={() => run(() => remove(s.id), 'Servicio eliminado', 'No se pudo eliminar.')} />
                </>
              }
            />
          ))}
        </ul>
      )}

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={heading}
        subtitle="Servicios"
        icon={<Wrench size={19} />}
        size={form.isPage ? 'xl' : 'lg'}
      >
        <form onSubmit={submit} className="flex flex-col gap-5">
          <Toggle
            checked={form.isPage}
            onChange={(v) => set('isPage', v)}
            label="Página completa"
            description="Con su propia URL (/services/…) y contenido rico: secciones, videos, ejemplos y llamadas a la acción."
          />

          <div className="grid gap-5 sm:grid-cols-[180px_minmax(0,1fr)]">
            <Thumb src={form.coverUrl} className="w-full aspect-[16/10] sm:w-[180px]" />
            <div className="grid content-start gap-4 sm:grid-cols-2">
              <Field label="Título (ES)">
                <input required value={form.titleEs} onChange={(e) => set('titleEs', e.target.value)} className={inputCls} />
              </Field>
              <Field label="Título (EN)">
                <input value={form.titleEn} onChange={(e) => set('titleEn', e.target.value)} className={inputCls} />
              </Field>
              <Field label="Portada" className="sm:col-span-2">
                <MediaInput required folder="services" value={form.coverUrl} onChange={(url) => set('coverUrl', url)} />
              </Field>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Descripción corta (ES)" hint="Tarjeta en /services.">
              <textarea rows={3} value={form.descriptionEs} onChange={(e) => set('descriptionEs', e.target.value)} className={`${inputCls} resize-y`} />
            </Field>
            <Field label="Descripción corta (EN)">
              <textarea rows={3} value={form.descriptionEn} onChange={(e) => set('descriptionEn', e.target.value)} className={`${inputCls} resize-y`} />
            </Field>
            {!form.isPage && (
              <Field label="Enlace" hint="Opcional: /contact o https://…" className="sm:col-span-2">
                <input value={form.href} onChange={(e) => set('href', e.target.value)} className={inputCls} />
              </Field>
            )}
          </div>

          {form.isPage && (
            <div className="flex flex-col gap-5 pt-5 border-t border-white/[.07]">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Meta title (SEO)">
                  <input value={form.metaTitle} onChange={(e) => set('metaTitle', e.target.value)} className={inputCls} />
                </Field>
                <Field label="Meta description (SEO)">
                  <input value={form.metaDescription} onChange={(e) => set('metaDescription', e.target.value)} className={inputCls} />
                </Field>
                <Field label="Keywords SEO" hint="Una por línea." className="sm:col-span-2">
                  <textarea rows={3} value={form.keywords} onChange={(e) => set('keywords', e.target.value)} className={`${inputCls} resize-y`} />
                </Field>
              </div>
              <ServicePageEditor value={form.page} onChange={(page) => set('page', page)} />
            </div>
          )}

          <Toggle checked={form.published} onChange={(v) => set('published', v)} label="Publicado" description="Visible en el sitio." />
          {formError && <ErrorNote>{formError}</ErrorNote>}
          <FormActions
            saving={saving}
            onCancel={() => setEditing(null)}
            submitLabel={editing === 'new' ? (form.isPage ? 'Crear página' : 'Crear servicio') : 'Guardar cambios'}
          />
        </form>
      </Modal>
    </div>
  );
}
