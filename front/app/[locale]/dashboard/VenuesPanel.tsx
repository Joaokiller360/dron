'use client'

import { useState, FormEvent } from 'react';
import { MapPin, Plus, Pencil } from 'lucide-react';
import { errorMessage, Venue } from './lib/api';
import { useCollection } from './lib/useCollection';
import { CITIES, CITY_PROVINCE, PLACE_PATTERN, cleanInput } from '@/app/utils/formRules';
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
  btn,
  iconBtnCls,
  inputCls,
  useToast,
} from './ui';

const emptyForm = { name: '', city: 'Esmeraldas', published: true };
type Form = typeof emptyForm;

export default function VenuesPanel() {
  const toast = useToast();
  const { items, loading, error, create, update, remove, move } = useCollection<Venue>('/venues/admin', {
    live: 'venues',
    base: '/venues',
    reorderAs: 'venues',
  });
  const [editing, setEditing] = useState<Venue | 'new' | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const openNew = () => {
    setForm(emptyForm);
    setFormError('');
    setEditing('new');
  };
  const openEdit = (v: Venue) => {
    setForm({ name: v.name, city: v.city, published: v.published });
    setFormError('');
    setEditing(v);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const body = { name: form.name.trim(), city: form.city.trim(), published: form.published };
    if (!PLACE_PATTERN.test(body.name) || !PLACE_PATTERN.test(body.city)) {
      setFormError('Usa solo letras, números, espacios y . , \' - ( )');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      if (editing === 'new') {
        await create({ ...body, sortOrder: items.length });
        toast.success('Lugar añadido');
      } else if (editing) {
        await update(editing.id, body);
        toast.success('Cambios guardados');
      }
      setEditing(null);
    } catch (err) {
      setFormError(errorMessage(err, 'No se pudo guardar el lugar.'));
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
        title="Lugares"
        count={items.length}
        subtitle="Lugares que el cliente puede elegir en el formulario de contacto, agrupados por ciudad (ej. Marina Ecovida en Esmeraldas)."
        actions={
          <button type="button" onClick={openNew} className={btn.primary}>
            <Plus size={16} /> Nuevo lugar
          </button>
        }
      />

      {error && <ErrorNote>{error}</ErrorNote>}

      {loading ? (
        <SkeletonList rows={3} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<MapPin size={20} />}
          title="Sin lugares"
          text="Añade salones, hoteles o locaciones frecuentes para que el cliente los elija al pedir presupuesto."
          action={
            <button type="button" onClick={openNew} className={btn.primary}>
              <Plus size={16} /> Nuevo lugar
            </button>
          }
        />
      ) : (
        <ul className="flex flex-col gap-2 p-0 m-0 list-none">
          {items.map((v, index) => (
            <ListRow
              key={v.id}
              dimmed={!v.published}
              onOpen={() => openEdit(v)}
              thumb={
                <span className="flex items-center justify-center flex-none w-10 h-10 rounded-lg bg-[rgba(52,209,122,.1)] text-jb-accent">
                  <MapPin size={17} />
                </span>
              }
              title={v.name}
              meta={v.city}
              pills={<StatusPill published={v.published} />}
              actions={
                <>
                  <PublishToggle
                    published={v.published}
                    onToggle={() => run(() => update(v.id, { published: !v.published }), v.published ? 'Oculto del formulario' : 'Publicado', 'No se pudo cambiar la visibilidad.')}
                  />
                  <MoveButtons
                    first={index === 0}
                    last={index === items.length - 1}
                    onUp={() => run(() => move(v.id, -1), '', 'No se pudo reordenar.')}
                    onDown={() => run(() => move(v.id, 1), '', 'No se pudo reordenar.')}
                  />
                  <button type="button" title="Editar" aria-label="Editar" onClick={() => openEdit(v)} className={iconBtnCls}>
                    <Pencil size={15} />
                  </button>
                  <ConfirmDelete onConfirm={() => run(() => remove(v.id), 'Lugar eliminado', 'No se pudo eliminar.')} />
                </>
              }
            />
          ))}
        </ul>
      )}

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'Nuevo lugar' : 'Editar lugar'}
        subtitle="Formulario de contacto"
        icon={<MapPin size={19} />}
        size="md"
      >
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre del lugar">
              <input required minLength={2} maxLength={80} value={form.name} onChange={(e) => set('name', cleanInput(e.target, 'place'))} placeholder="Marina Ecovida" className={inputCls} />
            </Field>
            <Field label="Ciudad" hint="Ciudades de las 24 provincias: elige de la lista o escribe una nueva.">
              <input required minLength={2} maxLength={60} list="venue-cities" value={form.city} onChange={(e) => set('city', cleanInput(e.target, 'place'))} className={inputCls} />
              <datalist id="venue-cities">
                {CITIES.map((c) => (
                  <option key={c} value={c} label={CITY_PROVINCE[c]} />
                ))}
              </datalist>
            </Field>
          </div>
          {formError && <ErrorNote>{formError}</ErrorNote>}
          <FormActions saving={saving} onCancel={() => setEditing(null)} submitLabel={editing === 'new' ? 'Añadir' : 'Guardar cambios'} />
        </form>
      </Modal>
    </div>
  );
}
