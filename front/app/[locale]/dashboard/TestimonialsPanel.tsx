'use client'

import { useState, FormEvent } from 'react';
import { Quote, Plus, Pencil } from 'lucide-react';
import { errorMessage, Testimonial } from './lib/api';
import { useCollection } from './lib/useCollection';
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
  SkeletonList,
  Toggle,
  btn,
  iconBtnCls,
  inputCls,
  useToast,
} from './ui';

const emptyForm = { quote: '', author: '', org: '', published: true };
type Form = typeof emptyForm;

export default function TestimonialsPanel() {
  const toast = useToast();
  const { items, loading, error, create, update, remove, move } = useCollection<Testimonial>('/testimonials/admin', {
    live: 'testimonials',
    base: '/testimonials',
    reorderAs: 'testimonials',
  });
  const [editing, setEditing] = useState<Testimonial | 'new' | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const openNew = () => {
    setForm(emptyForm);
    setFormError('');
    setEditing('new');
  };
  const openEdit = (t: Testimonial) => {
    setForm({ quote: t.quote, author: t.author, org: t.org ?? '', published: t.published });
    setFormError('');
    setEditing(t);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    const body = { quote: form.quote.trim(), author: form.author.trim(), org: form.org.trim() || null, published: form.published };
    try {
      if (editing === 'new') {
        await create({ ...body, sortOrder: items.length });
        toast.success('Testimonio añadido');
      } else if (editing) {
        await update(editing.id, body);
        toast.success('Cambios guardados');
      }
      setEditing(null);
    } catch (err) {
      setFormError(errorMessage(err, 'No se pudo guardar el testimonio.'));
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
        title="Testimonios"
        count={items.length}
        subtitle="Citas reales de clientes. Se muestran en /clients bajo “Lo que dicen” cuando hay al menos uno publicado."
        actions={
          <button type="button" onClick={openNew} className={btn.primary}>
            <Plus size={16} /> Nuevo testimonio
          </button>
        }
      />

      {error && <ErrorNote>{error}</ErrorNote>}

      {loading ? (
        <SkeletonList rows={3} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Quote size={20} />}
          title="Sin testimonios"
          text="Pide a tus clientes una frase sobre su experiencia y añádela aquí con su nombre."
          action={
            <button type="button" onClick={openNew} className={btn.primary}>
              <Plus size={16} /> Nuevo testimonio
            </button>
          }
        />
      ) : (
        <ul className="flex flex-col gap-2 p-0 m-0 list-none">
          {items.map((t, index) => (
            <ListRow
              key={t.id}
              dimmed={!t.published}
              onOpen={() => openEdit(t)}
              thumb={
                <span className="flex items-center justify-center flex-none w-10 h-10 rounded-lg bg-[rgba(52,209,122,.1)] text-jb-accent">
                  <Quote size={17} />
                </span>
              }
              title={`“${t.quote}”`}
              meta={[t.author, t.org].filter(Boolean).join(' · ')}
              pills={<StatusPill published={t.published} />}
              actions={
                <>
                  <PublishToggle
                    published={t.published}
                    onToggle={() => run(() => update(t.id, { published: !t.published }), t.published ? 'Oculto del sitio' : 'Publicado', 'No se pudo cambiar la visibilidad.')}
                  />
                  <MoveButtons
                    first={index === 0}
                    last={index === items.length - 1}
                    onUp={() => run(() => move(t.id, -1), '', 'No se pudo reordenar.')}
                    onDown={() => run(() => move(t.id, 1), '', 'No se pudo reordenar.')}
                  />
                  <button type="button" title="Editar" aria-label="Editar" onClick={() => openEdit(t)} className={iconBtnCls}>
                    <Pencil size={15} />
                  </button>
                  <ConfirmDelete onConfirm={() => run(() => remove(t.id), 'Testimonio eliminado', 'No se pudo eliminar.')} />
                </>
              }
            />
          ))}
        </ul>
      )}

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'Nuevo testimonio' : 'Editar testimonio'}
        subtitle="Clientes"
        icon={<Quote size={19} />}
        size="md"
      >
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Field label="Cita">
            <textarea required minLength={5} maxLength={600} rows={4} value={form.quote} onChange={(e) => set('quote', e.target.value)} className={`${inputCls} resize-y`} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Autor">
              <input required maxLength={100} value={form.author} onChange={(e) => set('author', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Empresa / contexto">
              <input maxLength={120} value={form.org} onChange={(e) => set('org', e.target.value)} placeholder="Hotel · Atacames" className={inputCls} />
            </Field>
          </div>
          <Toggle checked={form.published} onChange={(v) => set('published', v)} label="Publicado" />
          {formError && <ErrorNote>{formError}</ErrorNote>}
          <FormActions saving={saving} onCancel={() => setEditing(null)} submitLabel={editing === 'new' ? 'Añadir' : 'Guardar cambios'} />
        </form>
      </Modal>
    </div>
  );
}
