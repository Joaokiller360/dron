'use client'

import { useState, FormEvent } from 'react';
import { Users, Plus, Pencil, ExternalLink } from 'lucide-react';
import { errorMessage, Link, slugify, TeamMember } from './lib/api';
import { useCollection } from './lib/useCollection';
import LinksEditor from './LinksEditor';
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

const emptyForm = {
  name: '',
  role: '',
  photoUrl: '',
  bio: '',
  story: '',
  stat: '',
  statLabel: '',
  base: '',
  skills: '',
  links: [] as Link[],
  published: true,
};
type Form = typeof emptyForm;

const orNull = (v: string) => (v.trim() ? v.trim() : null);

export default function TeamPanel() {
  const toast = useToast();
  const { items, loading, error, create, update, remove, move } = useCollection<TeamMember>('/team-members/admin', {
    live: 'team-members',
    reorderAs: 'team-members',
  });
  const [editing, setEditing] = useState<TeamMember | 'new' | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const openNew = () => {
    setForm(emptyForm);
    setFormError('');
    setEditing('new');
  };
  const openEdit = (m: TeamMember) => {
    setForm({
      name: m.name,
      role: m.role,
      photoUrl: m.photoUrl,
      bio: m.bio ?? '',
      story: m.story ?? '',
      stat: m.stat ?? '',
      statLabel: m.statLabel ?? '',
      base: m.base ?? '',
      skills: (m.skills ?? []).join(', '),
      links: m.links ?? [],
      published: m.published,
    });
    setFormError('');
    setEditing(m);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    const body = {
      name: form.name.trim(),
      role: form.role.trim(),
      photoUrl: form.photoUrl.trim(),
      bio: orNull(form.bio),
      story: orNull(form.story),
      stat: orNull(form.stat),
      statLabel: orNull(form.statLabel),
      base: orNull(form.base),
      skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
      links: form.links.filter((l) => l.url.trim()),
      published: form.published,
    };
    try {
      if (editing === 'new') {
        await create({ ...body, slug: slugify(body.name), sortOrder: items.length });
        toast.success('Miembro añadido');
      } else if (editing) {
        await update(editing.id, body);
        toast.success('Cambios guardados');
      }
      setEditing(null);
    } catch (err) {
      setFormError(errorMessage(err, 'No se pudo guardar.'));
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
        title="Equipo"
        count={items.length}
        subtitle="Personas de /teams. Al abrir una tarjeta en el sitio se ven bio, dato, base y habilidades."
        actions={
          <button type="button" onClick={openNew} className={btn.primary}>
            <Plus size={16} /> Nuevo miembro
          </button>
        }
      />

      {error && <ErrorNote>{error}</ErrorNote>}

      {loading ? (
        <SkeletonList rows={3} />
      ) : items.length === 0 ? (
        <EmptyState icon={<Users size={20} />} title="Sin miembros" text="Añade a las personas del equipo." />
      ) : (
        <ul className="flex flex-col gap-2 p-0 m-0 list-none">
          {items.map((m, index) => (
            <ListRow
              key={m.id}
              dimmed={!m.published}
              onOpen={() => openEdit(m)}
              thumb={<Thumb src={m.photoUrl} alt={m.name} className="w-12 h-12 !rounded-full" />}
              title={m.name}
              meta={[m.role, m.base].filter(Boolean).join(' · ')}
              pills={
                <>
                  <StatusPill published={m.published} />
                  {!m.bio && !m.story && <Pill tone="warn">Sin bio</Pill>}
                </>
              }
              actions={
                <>
                  <PublishToggle
                    published={m.published}
                    onToggle={() =>
                      run(() => update(m.id, { published: !m.published }), m.published ? 'Oculto del sitio' : 'Publicado', 'No se pudo cambiar la visibilidad.')
                    }
                  />
                  <MoveButtons
                    first={index === 0}
                    last={index === items.length - 1}
                    onUp={() => run(() => move(m.id, -1), '', 'No se pudo reordenar.')}
                    onDown={() => run(() => move(m.id, 1), '', 'No se pudo reordenar.')}
                  />
                  {m.published && (
                    <a href={`/teams#${m.slug}`} target="_blank" rel="noopener noreferrer" title="Ver en el sitio" className={iconBtnCls}>
                      <ExternalLink size={15} />
                    </a>
                  )}
                  <button type="button" title="Editar" aria-label="Editar" onClick={() => openEdit(m)} className={iconBtnCls}>
                    <Pencil size={15} />
                  </button>
                  <ConfirmDelete onConfirm={() => run(() => remove(m.id), 'Miembro eliminado', 'No se pudo eliminar.')} />
                </>
              }
            />
          ))}
        </ul>
      )}

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'Nuevo miembro' : 'Editar miembro'}
        subtitle="Equipo"
        icon={<Users size={19} />}
      >
        <form onSubmit={submit} className="flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-[140px_minmax(0,1fr)]">
            <Thumb src={form.photoUrl} className="w-full aspect-[4/5] sm:w-[140px]" />
            <div className="grid content-start gap-4 sm:grid-cols-2">
              <Field label="Nombre">
                <input required value={form.name} onChange={(e) => set('name', e.target.value)} className={inputCls} />
              </Field>
              <Field label="Rol">
                <input required value={form.role} onChange={(e) => set('role', e.target.value)} placeholder="Piloto principal" className={inputCls} />
              </Field>
              <Field label="Foto (URL)" className="sm:col-span-2">
                <input required type="url" value={form.photoUrl} onChange={(e) => set('photoUrl', e.target.value)} className={inputCls} />
              </Field>
            </div>
          </div>
          <Field label="Bio corta" hint="Se ve en la tarjeta (máx. 300).">
            <input maxLength={300} value={form.bio} onChange={(e) => set('bio', e.target.value)} className={inputCls} />
          </Field>
          <Field label="Historia" hint="Se ve al abrir la tarjeta.">
            <textarea rows={4} maxLength={2000} value={form.story} onChange={(e) => set('story', e.target.value)} className={`${inputCls} resize-y`} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Dato destacado">
              <input maxLength={20} value={form.stat} onChange={(e) => set('stat', e.target.value)} placeholder="+40 h" className={inputCls} />
            </Field>
            <Field label="Etiqueta del dato">
              <input maxLength={60} value={form.statLabel} onChange={(e) => set('statLabel', e.target.value)} placeholder="de vuelo certificadas" className={inputCls} />
            </Field>
            <Field label="Base">
              <input maxLength={60} value={form.base} onChange={(e) => set('base', e.target.value)} placeholder="Esmeraldas" className={inputCls} />
            </Field>
          </div>
          <Field label="Habilidades" hint="Separadas por coma.">
            <input value={form.skills} onChange={(e) => set('skills', e.target.value)} placeholder="Piloto RPAS, Dirección, Vuelo FPV" className={inputCls} />
          </Field>
          <LinksEditor value={form.links} onChange={(links) => set('links', links)} />
          <Toggle checked={form.published} onChange={(v) => set('published', v)} label="Publicado" description="Visible en /teams." />
          {formError && <ErrorNote>{formError}</ErrorNote>}
          <FormActions saving={saving} onCancel={() => setEditing(null)} submitLabel={editing === 'new' ? 'Añadir miembro' : 'Guardar cambios'} />
        </form>
      </Modal>
    </div>
  );
}
