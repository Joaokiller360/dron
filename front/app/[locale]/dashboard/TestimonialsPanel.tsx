'use client'

import { useState, FormEvent } from 'react';
import { Quote, Plus, Pencil } from 'lucide-react';
import { Client, errorMessage, Testimonial } from './lib/api';
import { useCollection } from './lib/useCollection';
import MediaInput, { useUploadTracker } from './MediaInput';
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
  Thumb,
  Toggle,
  btn,
  iconBtnCls,
  inputCls,
  useToast,
} from './ui';

const emptyForm = { quote: '', author: '', org: '', photoUrl: '', clientId: '', published: true };
type Form = typeof emptyForm;

export default function TestimonialsPanel() {
  const toast = useToast();
  const { items, loading, error, create, update, remove, move } = useCollection<Testimonial>('/testimonials/admin', {
    // Clients too: a testimonial without its own photo shows the client's
    live: ['testimonials', 'clients'],
    base: '/testimonials',
    reorderAs: 'testimonials',
  });
  const [editing, setEditing] = useState<Testimonial | 'new' | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const { items: clients } = useCollection<Client>('/clients/admin', { live: 'clients' });
  const { uploading, onBusyChange } = useUploadTracker();

  const openNew = () => {
    setForm(emptyForm);
    setFormError('');
    setEditing('new');
  };
  const openEdit = (t: Testimonial) => {
    setForm({ quote: t.quote, author: t.author, org: t.org ?? '', photoUrl: t.photoUrl ?? '', clientId: t.clientId ?? '', published: t.published });
    setFormError('');
    setEditing(t);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (uploading) return;
    setSaving(true);
    setFormError('');
    const body = {
      quote: form.quote.trim(),
      author: form.author.trim(),
      org: form.org.trim() || null,
      photoUrl: form.photoUrl.trim() || null,
      clientId: form.clientId || null,
      published: form.published,
    };
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
  // Picking a client fills the empty fields with its data
  const pickClient = (id: string) => {
    const c = clients.find((x) => x.id === id);
    setForm((f) => ({ ...f, clientId: id, author: f.author || c?.name || '', org: f.org || (c && f.author ? c.name : '') }));
  };
  const formClient = clients.find((c) => c.id === form.clientId);
  const photoOf = (t: Testimonial) => t.photoUrl || t.client?.photoUrl;

  return (
    <div>
      <PanelHeader
        title="Testimonios"
        count={items.length}
        subtitle="Citas reales de clientes, con su foto o la de un cliente ya registrado. Se muestran en el inicio y en /clients cuando hay al menos uno publicado."
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
                photoOf(t) ? (
                  <Thumb src={photoOf(t)} alt={t.author} className="w-10 h-10 rounded-full" />
                ) : (
                  <span className="flex items-center justify-center flex-none w-10 h-10 rounded-full bg-[rgba(52,209,122,.1)] text-jb-accent">
                    <Quote size={17} />
                  </span>
                )
              }
              title={`“${t.quote}”`}
              meta={[t.author, t.org || t.client?.name].filter(Boolean).join(' · ')}
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
          <Field label="Cliente" hint="Opcional. Si no subes foto, se usa la del cliente.">
            <select value={form.clientId} onChange={(e) => pickClient(e.target.value)} className={inputCls}>
              <option value="">Ninguno</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
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
          <div className="flex items-start gap-4">
            <Thumb src={form.photoUrl || formClient?.photoUrl} alt={form.author} className="w-16 h-16 mt-6 rounded-full" />
            <Field label="Foto" hint={formClient ? `Vacío: se usa la foto de ${formClient.name}.` : 'Opcional. Retrato del autor.'} className="flex-1">
              <MediaInput onBusyChange={onBusyChange} folder="clients" value={form.photoUrl} onChange={(url) => set('photoUrl', url)} />
            </Field>
          </div>
          <Toggle checked={form.published} onChange={(v) => set('published', v)} label="Publicado" />
          {formError && <ErrorNote>{formError}</ErrorNote>}
          <FormActions saving={saving} uploading={uploading} onCancel={() => setEditing(null)} submitLabel={editing === 'new' ? 'Añadir' : 'Guardar cambios'} />
        </form>
      </Modal>
    </div>
  );
}
