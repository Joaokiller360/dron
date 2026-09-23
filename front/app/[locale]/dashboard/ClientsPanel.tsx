'use client'

import { useState, FormEvent } from 'react';
import { Handshake, Plus, Pencil, ExternalLink } from 'lucide-react';
import { Client, errorMessage, Link, slugify } from './lib/api';
import { useCollection } from './lib/useCollection';
import CategoryPicker from './CategoryPicker';
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
  PublishToggle,
  StatusPill,
  SearchInput,
  SkeletonList,
  Thumb,
  Toggle,
  btn,
  iconBtnCls,
  inputCls,
  useToast,
} from './ui';

const emptyForm = { name: '', categoryId: '', photoUrl: '', links: [] as Link[], published: true };
type Form = typeof emptyForm;

export default function ClientsPanel() {
  const toast = useToast();
  const { items, loading, error, create, update, remove, move } = useCollection<Client>('/clients/admin', {
    live: ['clients', 'categories'],
    base: '/clients',
    reorderAs: 'clients',
  });
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Client | 'new' | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const q = query.trim().toLowerCase();
  const visible = q ? items.filter((c) => [c.name, c.category?.name ?? ''].some((f) => f.toLowerCase().includes(q))) : items;

  const openNew = () => {
    setForm({ ...emptyForm, categoryId: form.categoryId });
    setFormError('');
    setEditing('new');
  };
  const openEdit = (c: Client) => {
    setForm({ name: c.name, categoryId: c.categoryId, photoUrl: c.photoUrl, links: c.links ?? [], published: c.published });
    setFormError('');
    setEditing(c);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    const body = {
      name: form.name.trim(),
      categoryId: form.categoryId,
      photoUrl: form.photoUrl.trim(),
      links: form.links.filter((l) => l.url.trim()),
      published: form.published,
    };
    try {
      if (editing === 'new') {
        await create({ ...body, slug: slugify(body.name), sortOrder: items.length });
        toast.success('Cliente añadido');
      } else if (editing) {
        await update(editing.id, body);
        toast.success('Cambios guardados');
      }
      setEditing(null);
    } catch (err) {
      setFormError(errorMessage(err, 'No se pudo guardar el cliente.'));
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
        title="Clientes"
        count={items.length}
        subtitle="Marcas e instituciones de /clients. El primer enlace abre al hacer clic en su logo."
        actions={
          <>
            <SearchInput value={query} onChange={setQuery} />
            <button type="button" onClick={openNew} className={btn.primary}>
              <Plus size={16} /> Nuevo cliente
            </button>
          </>
        }
      />

      {error && <ErrorNote>{error}</ErrorNote>}

      {loading ? (
        <SkeletonList />
      ) : items.length === 0 ? (
        <EmptyState icon={<Handshake size={20} />} title="Sin clientes" text="Añade las marcas con las que has trabajado." />
      ) : (
        <ul className="flex flex-col gap-2 p-0 m-0 list-none">
          {visible.map((c) => {
            const index = items.indexOf(c);
            return (
              <ListRow
                key={c.id}
                dimmed={!c.published}
                onOpen={() => openEdit(c)}
                thumb={<Thumb src={c.photoUrl} alt={c.name} className="w-14 h-10" />}
                title={c.name}
                meta={[c.category?.name, c.links?.[0]?.platform].filter(Boolean).join(' · ')}
                pills={<StatusPill published={c.published} />}
                actions={
                  <>
                    <PublishToggle
                      published={c.published}
                      onToggle={() =>
                        run(() => update(c.id, { published: !c.published }), c.published ? 'Oculto del sitio' : 'Publicado', 'No se pudo cambiar la visibilidad.')
                      }
                    />
                    {!q && (
                      <MoveButtons
                        first={index === 0}
                        last={index === items.length - 1}
                        onUp={() => run(() => move(c.id, -1), '', 'No se pudo reordenar.')}
                        onDown={() => run(() => move(c.id, 1), '', 'No se pudo reordenar.')}
                      />
                    )}
                    {c.links?.[0]?.url && (
                      <a href={c.links[0].url} target="_blank" rel="noopener noreferrer" title="Abrir enlace" className={iconBtnCls}>
                        <ExternalLink size={15} />
                      </a>
                    )}
                    <button type="button" title="Editar" aria-label="Editar" onClick={() => openEdit(c)} className={iconBtnCls}>
                      <Pencil size={15} />
                    </button>
                    <ConfirmDelete onConfirm={() => run(() => remove(c.id), 'Cliente eliminado', 'No se pudo eliminar.')} />
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
        title={editing === 'new' ? 'Nuevo cliente' : 'Editar cliente'}
        subtitle="Clientes"
        icon={<Handshake size={19} />}
      >
        <form onSubmit={submit} className="flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-[180px_minmax(0,1fr)]">
            <Thumb src={form.photoUrl} className="w-full aspect-[3/2] sm:w-[180px]" />
            <div className="flex flex-col gap-4">
              <Field label="Nombre">
                <input required value={form.name} onChange={(e) => set('name', e.target.value)} className={inputCls} />
              </Field>
              <CategoryPicker type="CLIENT" value={form.categoryId} onChange={(id) => set('categoryId', id)} />
            </div>
          </div>
          <Field label="Logo o foto (URL)">
            <input required type="url" value={form.photoUrl} onChange={(e) => set('photoUrl', e.target.value)} className={inputCls} />
          </Field>
          <LinksEditor value={form.links} onChange={(links) => set('links', links)} />
          <Toggle checked={form.published} onChange={(v) => set('published', v)} label="Publicado" description="Visible en /clients." />
          {formError && <ErrorNote>{formError}</ErrorNote>}
          <FormActions saving={saving} disabled={!form.categoryId} onCancel={() => setEditing(null)} submitLabel={editing === 'new' ? 'Añadir cliente' : 'Guardar cambios'} />
        </form>
      </Modal>
    </div>
  );
}
