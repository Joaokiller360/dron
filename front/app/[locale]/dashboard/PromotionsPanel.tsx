'use client'

import { useCallback, useEffect, useState, FormEvent } from 'react';
import { BadgePercent, Plus, Pencil } from 'lucide-react';
import { apiFetch, errorMessage, Promotion, PromotionSettings, Service } from './lib/api';
import { useCollection } from './lib/useCollection';
import { useLive } from './lib/live';
import Modal from './Modal';
import {
  Card,
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
  Toggle,
  btn,
  iconBtnCls,
  inputCls,
  useToast,
} from './ui';

const emptyForm = {
  title: '',
  detail: '',
  badge: '',
  untilLabel: '',
  price: '',
  oldPrice: '',
  serviceSlug: '',
  endsAt: '',
  active: true,
};
type Form = typeof emptyForm;

const orNull = (v: string) => (v.trim() ? v.trim() : null);
const isExpired = (p: Promotion) => !!p.endsAt && new Date(p.endsAt).getTime() < Date.now();

export default function PromotionsPanel() {
  const toast = useToast();
  const { items, loading, error, create, update, remove, move } = useCollection<Promotion>('/promotions/admin', {
    live: 'promotions',
    base: '/promotions',
    reorderAs: 'promotions',
  });
  const [settings, setSettings] = useState<PromotionSettings | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [editing, setEditing] = useState<Promotion | 'new' | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const loadSettings = useCallback(() => {
    apiFetch<PromotionSettings>('/promotions/settings').then(setSettings).catch(() => {});
  }, []);
  useEffect(() => {
    loadSettings();
    apiFetch<Service[]>('/services/admin').then(setServices).catch(() => {});
  }, [loadSettings]);
  useLive('promotions', loadSettings);

  const saveSetting = async (patch: Partial<PromotionSettings>) => {
    if (!settings) return;
    const previous = settings;
    setSettings({ ...settings, ...patch });
    try {
      setSettings(await apiFetch<PromotionSettings>('/promotions/settings', { method: 'PATCH', body: JSON.stringify(patch) }));
    } catch (err) {
      setSettings(previous);
      toast.error(errorMessage(err, 'No se pudo guardar el ajuste.'));
    }
  };

  const openNew = () => {
    setForm(emptyForm);
    setFormError('');
    setEditing('new');
  };
  const openEdit = (p: Promotion) => {
    setForm({
      title: p.title,
      detail: p.detail ?? '',
      badge: p.badge ?? '',
      untilLabel: p.untilLabel ?? '',
      price: p.price ?? '',
      oldPrice: p.oldPrice ?? '',
      serviceSlug: p.serviceSlug ?? '',
      endsAt: p.endsAt ? p.endsAt.slice(0, 10) : '',
      active: p.active,
    });
    setFormError('');
    setEditing(p);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    const body = {
      title: form.title.trim(),
      detail: orNull(form.detail),
      badge: orNull(form.badge),
      untilLabel: orNull(form.untilLabel),
      price: orNull(form.price),
      oldPrice: orNull(form.oldPrice),
      serviceSlug: orNull(form.serviceSlug),
      // End of the chosen day, local time
      endsAt: form.endsAt ? new Date(`${form.endsAt}T23:59:59`).toISOString() : null,
      active: form.active,
    };
    try {
      if (editing === 'new') {
        await create({ ...body, sortOrder: items.length });
        toast.success(form.active ? 'Promoción activa en el sitio' : 'Promoción guardada');
      } else if (editing) {
        await update(editing.id, body);
        toast.success('Cambios guardados');
      }
      setEditing(null);
    } catch (err) {
      setFormError(errorMessage(err, 'No se pudo guardar la promoción.'));
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
  const serviceName = (slug?: string | null) => services.find((s) => s.slug === slug)?.titleEs;

  return (
    <div className="flex flex-col gap-6">
      <PanelHeader
        title="Promociones"
        count={items.length}
        subtitle="Ofertas de temporada del inicio: barra superior, sección de ofertas e insignias en servicios."
        actions={
          <button type="button" onClick={openNew} className={btn.primary}>
            <Plus size={16} /> Nueva promoción
          </button>
        }
      />

      <Card className="p-5">
        <Toggle
          checked={settings?.enabled ?? false}
          disabled={!settings}
          onChange={(v) => saveSetting({ enabled: v })}
          label="Módulo de promociones"
          description="Apagado oculta la barra, la sección y las insignias sin borrar las ofertas."
        />
        <div className={`grid gap-1 pt-3 mt-3 border-t border-white/[.07] sm:grid-cols-3 sm:gap-6 ${settings?.enabled ? '' : 'opacity-40'}`}>
          <Toggle checked={settings?.bar ?? false} disabled={!settings?.enabled} onChange={(v) => saveSetting({ bar: v })} label="Barra superior" />
          <Toggle checked={settings?.section ?? false} disabled={!settings?.enabled} onChange={(v) => saveSetting({ section: v })} label="Sección de ofertas" />
          <Toggle checked={settings?.badges ?? false} disabled={!settings?.enabled} onChange={(v) => saveSetting({ badges: v })} label="Insignias en servicios" />
        </div>
      </Card>

      {error && <ErrorNote>{error}</ErrorNote>}

      {loading ? (
        <SkeletonList rows={3} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<BadgePercent size={20} />}
          title="Sin promociones"
          text="Crea una oferta con precio, insignia y fecha de fin; desaparece sola al vencer."
          action={
            <button type="button" onClick={openNew} className={btn.primary}>
              <Plus size={16} /> Nueva promoción
            </button>
          }
        />
      ) : (
        <ul className="flex flex-col gap-2 p-0 m-0 list-none">
          {items.map((p, index) => (
            <ListRow
              key={p.id}
              dimmed={!p.active || isExpired(p)}
              onOpen={() => openEdit(p)}
              thumb={
                <span className="flex items-center justify-center flex-none w-12 h-10 px-1 rounded-lg bg-jb-accent text-jb-ink font-mono text-[11px] font-bold text-center leading-tight">
                  {p.badge || '%'}
                </span>
              }
              title={p.title}
              meta={[p.price && `${p.price}${p.oldPrice ? ` (antes ${p.oldPrice})` : ''}`, p.untilLabel, serviceName(p.serviceSlug)].filter(Boolean).join(' · ')}
              pills={
                <>
                  {isExpired(p) && <Pill tone="warn">Vencida</Pill>}
                  <StatusPill published={p.active} labels={['Activa', 'Pausada']} />
                </>
              }
              actions={
                <>
                  <PublishToggle
                    published={p.active}
                    labels={['Pausar', 'Activar']}
                    onToggle={() => run(() => update(p.id, { active: !p.active }), p.active ? 'Promoción pausada' : 'Promoción activa', 'No se pudo cambiar el estado.')}
                  />
                  <MoveButtons
                    first={index === 0}
                    last={index === items.length - 1}
                    onUp={() => run(() => move(p.id, -1), '', 'No se pudo reordenar.')}
                    onDown={() => run(() => move(p.id, 1), '', 'No se pudo reordenar.')}
                  />
                  <button type="button" title="Editar" aria-label="Editar" onClick={() => openEdit(p)} className={iconBtnCls}>
                    <Pencil size={15} />
                  </button>
                  <ConfirmDelete onConfirm={() => run(() => remove(p.id), 'Promoción eliminada', 'No se pudo eliminar.')} />
                </>
              }
            />
          ))}
        </ul>
      )}

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'Nueva promoción' : 'Editar promoción'}
        subtitle="Promociones"
        icon={<BadgePercent size={19} />}
      >
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_140px]">
            <Field label="Título">
              <input required maxLength={120} value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Pack Boda Completa" className={inputCls} />
            </Field>
            <Field label="Insignia">
              <input maxLength={20} value={form.badge} onChange={(e) => set('badge', e.target.value)} placeholder="-20%" className={inputCls} />
            </Field>
          </div>
          <Field label="Detalle">
            <textarea rows={3} maxLength={600} value={form.detail} onChange={(e) => set('detail', e.target.value)} className={`${inputCls} resize-y`} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Precio">
              <input maxLength={20} value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="$280" className={inputCls} />
            </Field>
            <Field label="Precio anterior">
              <input maxLength={20} value={form.oldPrice} onChange={(e) => set('oldPrice', e.target.value)} placeholder="$350" className={inputCls} />
            </Field>
            <Field label="Texto de vigencia">
              <input maxLength={40} value={form.untilLabel} onChange={(e) => set('untilLabel', e.target.value)} placeholder="Hasta 30 sep" className={inputCls} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Fecha de fin" hint="Opcional. Se oculta sola al terminar ese día.">
              <input type="date" value={form.endsAt} onChange={(e) => set('endsAt', e.target.value)} className={`${inputCls} [color-scheme:dark]`} />
            </Field>
            <Field label="Servicio con insignia" hint="Opcional. Su tarjeta mostrará la insignia.">
              <select value={form.serviceSlug} onChange={(e) => set('serviceSlug', e.target.value)} className={inputCls}>
                <option value="">— Ninguno —</option>
                {services.map((s) => (
                  <option key={s.id} value={s.slug}>
                    {s.titleEs}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Toggle checked={form.active} onChange={(v) => set('active', v)} label="Activa" description="Visible en el sitio mientras no haya vencido." />
          {formError && <ErrorNote>{formError}</ErrorNote>}
          <FormActions saving={saving} onCancel={() => setEditing(null)} submitLabel={editing === 'new' ? 'Crear promoción' : 'Guardar cambios'} />
        </form>
      </Modal>
    </div>
  );
}
