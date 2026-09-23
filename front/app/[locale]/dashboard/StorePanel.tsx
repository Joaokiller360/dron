'use client'

import { useCallback, useEffect, useState, FormEvent } from 'react';
import { ShoppingBag, Plus, Pencil, ExternalLink } from 'lucide-react';
import { apiFetch, errorMessage, formatMoney, Product, slugify, StoreSettings } from './lib/api';
import { useCollection } from './lib/useCollection';
import { useDragSort } from './lib/useDragSort';
import { useLive } from './lib/live';
import Modal from './Modal';
import MediaInput, { useUploadTracker } from './MediaInput';
import {
  Card,
  ConfirmDelete,
  EmptyState,
  ErrorNote,
  Field,
  FormActions,
  ListRow,
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
  nameEs: '',
  nameEn: '',
  descriptionEs: '',
  descriptionEn: '',
  price: '',
  compareAt: '',
  stock: '',
  coverUrl: '',
  published: true,
};
type Form = typeof emptyForm;

const orNull = (v: string) => (v.trim() ? v.trim() : null);
/** "25" / "25.5" / "25,50" → 2550; empty → null */
const toCents = (v: string) => (v.trim() ? Math.round(parseFloat(v.replace(',', '.')) * 100) : null);
const fromCents = (c?: number | null) => (c == null ? '' : (c / 100).toFixed(2));

/** Slug from the name, suffixed (-2, -3…) if another product already uses it */
function uniqueSlug(name: string, taken: string[]) {
  const base = slugify(name) || 'producto';
  let slug = base;
  for (let i = 2; taken.includes(slug); i++) slug = `${base}-${i}`;
  return slug;
}

export default function StorePanel() {
  const toast = useToast();
  const { items, loading, error, create, update, remove, moveTo } = useCollection<Product>('/products/admin', {
    live: 'products',
    reorderAs: 'products',
  });
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [notice, setNotice] = useState('');
  const [editing, setEditing] = useState<Product | 'new' | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const { uploading, onBusyChange } = useUploadTracker();

  const loadSettings = useCallback(() => {
    apiFetch<StoreSettings>('/store/settings')
      .then((s) => {
        setSettings(s);
        setNotice(s.pausedNotice);
      })
      .catch(() => {});
  }, []);
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);
  useLive('store', loadSettings);

  const saveSetting = async (patch: Partial<StoreSettings>) => {
    if (!settings) return;
    const previous = settings;
    setSettings({ ...settings, ...patch });
    try {
      setSettings(await apiFetch<StoreSettings>('/store/settings', { method: 'PATCH', body: JSON.stringify(patch) }));
      return true;
    } catch (err) {
      setSettings(previous);
      toast.error(errorMessage(err, 'No se pudo guardar el ajuste.'));
      return false;
    }
  };

  const openNew = () => {
    setForm(emptyForm);
    setFormError('');
    setEditing('new');
  };
  const openEdit = (p: Product) => {
    setForm({
      nameEs: p.nameEs,
      nameEn: p.nameEn ?? '',
      descriptionEs: p.descriptionEs ?? '',
      descriptionEn: p.descriptionEn ?? '',
      price: fromCents(p.priceCents),
      compareAt: fromCents(p.compareAtCents),
      stock: p.stock == null ? '' : String(p.stock),
      coverUrl: p.coverUrl,
      published: p.published,
    });
    setFormError('');
    setEditing(p);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (uploading) return;
    const priceCents = toCents(form.price);
    const compareAtCents = toCents(form.compareAt);
    if (priceCents == null || Number.isNaN(priceCents) || priceCents < 0) {
      setFormError('Escribe un precio válido, por ejemplo 25.00');
      return;
    }
    if (compareAtCents != null && (Number.isNaN(compareAtCents) || compareAtCents <= priceCents)) {
      setFormError('El precio anterior debe ser mayor que el precio actual.');
      return;
    }
    setSaving(true);
    setFormError('');
    const body = {
      nameEs: form.nameEs.trim(),
      nameEn: orNull(form.nameEn),
      descriptionEs: orNull(form.descriptionEs),
      descriptionEn: orNull(form.descriptionEn),
      priceCents,
      compareAtCents,
      stock: form.stock.trim() === '' ? null : Math.max(0, parseInt(form.stock, 10)),
      coverUrl: form.coverUrl.trim(),
      published: form.published,
    };
    try {
      if (editing === 'new') {
        const slug = uniqueSlug(body.nameEs, items.map((p) => p.slug));
        await create({ ...body, slug, sortOrder: items.length });
        toast.success(form.published ? 'Producto publicado en la tienda' : 'Producto guardado');
      } else if (editing) {
        await update(editing.id, body);
        toast.success('Cambios guardados');
      }
      setEditing(null);
    } catch (err) {
      setFormError(errorMessage(err, 'No se pudo guardar el producto.'));
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
  const dragSort = useDragSort((id, to) => run(() => moveTo(id, to), '', 'No se pudo reordenar.'));

  const stockLabel = (p: Product) => (p.stock == null ? 'Stock ilimitado' : `${p.stock} en stock`);

  return (
    <div className="flex flex-col gap-6">
      <PanelHeader
        title="Tienda"
        count={items.length}
        subtitle="Catálogo de productos en /store. Los pedidos llegan a la sección Pedidos."
        actions={
          <>
            {settings?.enabled && (
              <a href="/store" target="_blank" rel="noopener noreferrer" className={btn.ghost}>
                <ExternalLink size={15} /> Ver tienda
              </a>
            )}
            <button type="button" onClick={openNew} className={btn.primary}>
              <Plus size={16} /> Nuevo producto
            </button>
          </>
        }
      />

      <Card className="p-5">
        <Toggle
          checked={settings?.enabled ?? false}
          disabled={!settings}
          onChange={(v) => saveSetting({ enabled: v }).then((ok) => ok && toast.success(v ? 'Tienda visible en el sitio' : 'Tienda oculta'))}
          label="Tienda visible"
          description="Apagada, la página /store y su enlace del menú desaparecen del sitio. Los productos no se borran."
        />
        <div className={`grid gap-1 pt-3 mt-3 border-t border-white/[.07] sm:grid-cols-2 sm:gap-6 ${settings?.enabled ? '' : 'opacity-40'}`}>
          <Toggle
            checked={settings?.sales ?? false}
            disabled={!settings?.enabled}
            onChange={(v) => saveSetting({ sales: v }).then((ok) => ok && toast.success(v ? 'Ventas abiertas' : 'Ventas pausadas'))}
            label="Aceptar pedidos"
            description="Apagado, el catálogo sigue visible pero no se puede comprar."
          />
          <Toggle
            checked={settings?.showPrices ?? false}
            disabled={!settings?.enabled}
            onChange={(v) => saveSetting({ showPrices: v })}
            label="Mostrar precios"
            description="Apagado, los productos muestran «Consultar precio»."
          />
        </div>
        {settings?.enabled && !settings.sales && (
          <form
            className="flex flex-col gap-2 pt-4 mt-3 border-t border-white/[.07] sm:flex-row sm:items-end"
            onSubmit={(e) => {
              e.preventDefault();
              saveSetting({ pausedNotice: notice.trim() }).then((ok) => ok && toast.success('Aviso guardado'));
            }}
          >
            <Field label="Aviso mientras las ventas están pausadas" hint="Opcional. Se muestra arriba del catálogo." className="flex-1">
              <input maxLength={200} value={notice} onChange={(e) => setNotice(e.target.value)} placeholder="Volvemos a vender el lunes." className={inputCls} />
            </Field>
            <button type="submit" disabled={notice.trim() === settings.pausedNotice} className={btn.ghost}>
              Guardar aviso
            </button>
          </form>
        )}
      </Card>

      {error && <ErrorNote>{error}</ErrorNote>}

      {loading ? (
        <SkeletonList rows={3} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag size={20} />}
          title="Sin productos"
          text="Crea un producto con foto, precio y stock; aparecerá en la tienda cuando esté visible."
          action={
            <button type="button" onClick={openNew} className={btn.primary}>
              <Plus size={16} /> Nuevo producto
            </button>
          }
        />
      ) : (
        <ul className="flex flex-col gap-2 p-0 m-0 list-none">
          {items.map((p, index) => (
            <ListRow
              key={p.id}
              drag={{ props: dragSort.itemProps(p.id, index), ...dragSort.itemState(p.id, index) }}
              dimmed={!p.published}
              onOpen={() => openEdit(p)}
              thumb={<Thumb src={p.coverUrl} alt={p.nameEs} className="w-12 h-12" />}
              title={p.nameEs}
              meta={[
                `${formatMoney(p.priceCents)}${p.compareAtCents ? ` (antes ${formatMoney(p.compareAtCents)})` : ''}`,
                stockLabel(p),
              ].join(' · ')}
              pills={
                <>
                  {p.stock === 0 && <Pill tone="warn">Agotado</Pill>}
                  <StatusPill published={p.published} />
                </>
              }
              actions={
                <>
                  <PublishToggle
                    published={p.published}
                    onToggle={() =>
                      run(() => update(p.id, { published: !p.published }), p.published ? 'Producto oculto' : 'Producto publicado', 'No se pudo cambiar el estado.')
                    }
                  />
                  <button type="button" title="Editar" aria-label="Editar" onClick={() => openEdit(p)} className={iconBtnCls}>
                    <Pencil size={15} />
                  </button>
                  <ConfirmDelete onConfirm={() => run(() => remove(p.id), 'Producto eliminado', 'No se pudo eliminar.')} />
                </>
              }
            />
          ))}
        </ul>
      )}

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'Nuevo producto' : 'Editar producto'}
        subtitle="Tienda"
        icon={<ShoppingBag size={19} />}
      >
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre (ES)">
              <input required maxLength={150} value={form.nameEs} onChange={(e) => set('nameEs', e.target.value)} placeholder="Foto aérea impresa A3" className={inputCls} />
            </Field>
            <Field label="Nombre (EN)" hint="Opcional.">
              <input maxLength={150} value={form.nameEn} onChange={(e) => set('nameEn', e.target.value)} placeholder="A3 printed aerial photo" className={inputCls} />
            </Field>
          </div>
          <Field label="Foto">
            <MediaInput onBusyChange={onBusyChange} required folder="products" value={form.coverUrl} onChange={(url) => set('coverUrl', url)} />
          </Field>
          <Field label="Descripción (ES)">
            <textarea rows={3} maxLength={2000} value={form.descriptionEs} onChange={(e) => set('descriptionEs', e.target.value)} className={`${inputCls} resize-y`} />
          </Field>
          <Field label="Descripción (EN)" hint="Opcional.">
            <textarea rows={3} maxLength={2000} value={form.descriptionEn} onChange={(e) => set('descriptionEn', e.target.value)} className={`${inputCls} resize-y`} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Precio (USD)">
              <input required inputMode="decimal" value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="25.00" className={inputCls} />
            </Field>
            <Field label="Precio anterior" hint="Opcional, se muestra tachado.">
              <input inputMode="decimal" value={form.compareAt} onChange={(e) => set('compareAt', e.target.value)} placeholder="30.00" className={inputCls} />
            </Field>
            <Field label="Stock" hint="Vacío = ilimitado.">
              <input type="number" min={0} step={1} value={form.stock} onChange={(e) => set('stock', e.target.value)} placeholder="∞" className={inputCls} />
            </Field>
          </div>
          <Toggle checked={form.published} onChange={(v) => set('published', v)} label="Publicado" description="Visible en la tienda cuando la tienda está activa." />
          {formError && <ErrorNote>{formError}</ErrorNote>}
          <FormActions
            saving={saving}
            uploading={uploading}
            onCancel={() => setEditing(null)}
            submitLabel={editing === 'new' ? 'Crear producto' : 'Guardar cambios'}
          />
        </form>
      </Modal>
    </div>
  );
}
