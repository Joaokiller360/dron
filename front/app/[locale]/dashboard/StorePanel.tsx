'use client'

import { useCallback, useEffect, useState, FormEvent, ReactNode } from 'react';
import { ShoppingBag, Plus, Pencil, ExternalLink, AlertTriangle, ImagePlus, Settings2, X } from 'lucide-react';
import { apiFetch, errorMessage, formatMoney, Product, ProductSpec, slugify, StoreSettings } from './lib/api';
import { useCollection } from './lib/useCollection';
import { useDragSort } from './lib/useDragSort';
import { useLive } from './lib/live';
import Modal from './Modal';
import MediaInput, { useUploadTracker } from './MediaInput';
import {
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
  mediaUrls: [] as string[],
  specs: [] as ProductSpec[],
  // Price extras typed in dollars, like the base price
  options: [] as { name: string; values: { label: string; price: string }[] }[],
  published: true,
};
type Form = typeof emptyForm;

// Quick-add suggestions for the details table and the priced options
const SPEC_SUGGESTIONS = ['Medidas', 'Peso', 'Material', 'Acabado', 'Formato', 'Incluye'];
const OPTION_SUGGESTIONS = ['Medida', 'Color', 'Material'];

const orNull = (v: string) => (v.trim() ? v.trim() : null);
/** "25" / "25.5" / "25,50" → 2550; empty → null */
const toCents = (v: string) => (v.trim() ? Math.round(parseFloat(v.replace(',', '.')) * 100) : null);
const fromCents = (c?: number | null) => (c == null ? '' : (c / 100).toFixed(2));

/** Like <Field>, but a plain group: it holds several inputs and buttons, so it can't be a <label> */
function FieldGroup({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} className="flex flex-col gap-1.5">
      <span className="font-mono text-[10.5px] font-semibold tracking-[.12em] uppercase text-jb-muted">{label}</span>
      {children}
      {hint && <span className="text-[12px] text-jb-muted/80">{hint}</span>}
    </div>
  );
}

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
  const [storeOn, setStoreOn] = useState<boolean | null>(null);
  const [editing, setEditing] = useState<Product | 'new' | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const { uploading, onBusyChange } = useUploadTracker();

  // Only for the "Ver tienda" link and the hidden-store notice; the switches live in #tienda-config
  const loadStatus = useCallback(() => {
    apiFetch<StoreSettings>('/store/settings')
      .then((st) => setStoreOn(st.enabled))
      .catch(() => {});
  }, []);
  useEffect(loadStatus, [loadStatus]);
  useLive('store', loadStatus);

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
      mediaUrls: p.mediaUrls ?? [],
      specs: p.specs ?? [],
      options: (p.options ?? []).map((o) => ({
        name: o.name,
        values: o.values.map((v) => ({ label: v.label, price: v.priceCents ? fromCents(v.priceCents) : '' })),
      })),
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
    const options = form.options
      .map((o) => ({
        name: o.name.trim(),
        values: o.values
          .filter((v) => v.label.trim())
          .map((v) => ({ label: v.label.trim(), priceCents: toCents(v.price) ?? 0 })),
      }))
      .filter((o) => o.name || o.values.length);
    for (const o of options) {
      if (!o.name || o.values.length === 0) {
        setFormError('Cada opción necesita un nombre y al menos un valor.');
        return;
      }
      if (o.values.some((v) => Number.isNaN(v.priceCents) || v.priceCents < 0)) {
        setFormError(`Revisa los precios extra de «${o.name}» (ej. 15.00, o vacío si no cambia el precio).`);
        return;
      }
      if (new Set(o.values.map((v) => v.label.toLowerCase())).size !== o.values.length) {
        setFormError(`«${o.name}» tiene valores repetidos.`);
        return;
      }
    }
    if (new Set(options.map((o) => o.name.toLowerCase())).size !== options.length) {
      setFormError('Hay opciones con el mismo nombre.');
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
      mediaUrls: form.mediaUrls.map((u) => u.trim()).filter(Boolean),
      specs: form.specs.map((x) => ({ label: x.label.trim(), value: x.value.trim() })).filter((x) => x.label && x.value),
      options,
      published: form.published,
    };
    try {
      if (editing === 'new') {
        // "checkout" is the store's checkout page (/store/checkout)
        const slug = uniqueSlug(body.nameEs, [...items.map((p) => p.slug), 'checkout']);
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
        title="Productos"
        count={items.length}
        subtitle="Catálogo de productos en /store. Los pedidos llegan a Pedidos; visibilidad, textos y pagos están en Configuración de la tienda."
        actions={
          <>
            {storeOn && (
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

      {storeOn === false && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 rounded-2xl border border-amber-400/30 bg-amber-400/[.06] text-[13.5px] text-jb-soft">
          <span className="inline-flex items-center gap-2">
            <AlertTriangle size={16} className="flex-none text-amber-300" /> La tienda está oculta en el sitio: los productos no se ven.
          </span>
          <a href="#tienda-config" className={btn.ghost}>
            <Settings2 size={15} /> Configuración de la tienda
          </a>
        </div>
      )}

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
                `${p.options?.length ? 'Desde ' : ''}${formatMoney(p.priceCents)}${p.compareAtCents ? ` (antes ${formatMoney(p.compareAtCents)})` : ''}`,
                stockLabel(p),
                p.options?.length ? p.options.map((o) => `${o.name} (${o.values.length})`).join(', ') : null,
              ]
                .filter(Boolean)
                .join(' · ')}
              pills={
                <>
                  {p.stock !== null && p.stock <= 0 && <Pill tone="warn">{p.stock < 0 ? `Sobrevendido (${-p.stock})` : 'Agotado'}</Pill>}
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
            <Field label="Precio (USD)" hint={form.options.length ? 'Precio base; las opciones suman su extra.' : undefined}>
              <input required inputMode="decimal" value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="25.00" className={inputCls} />
            </Field>
            <Field label="Precio anterior" hint="Opcional, se muestra tachado.">
              <input inputMode="decimal" value={form.compareAt} onChange={(e) => set('compareAt', e.target.value)} placeholder="30.00" className={inputCls} />
            </Field>
            <Field label="Stock" hint="Vacío = ilimitado.">
              <input type="number" min={0} step={1} value={form.stock} onChange={(e) => set('stock', e.target.value)} placeholder="∞" className={inputCls} />
            </Field>
          </div>
          <FieldGroup
            label="Opciones con precio"
            hint="Medida, color, material… El cliente elige un valor de cada opción; su precio extra se suma al precio base (vacío = mismo precio)."
          >
            <div className="flex flex-col gap-3">
              {form.options.map((opt, i) => {
                const setOpt = (next: Form['options'][number]) => set('options', form.options.map((o, j) => (j === i ? next : o)));
                return (
                  <div key={i} className="flex flex-col gap-2 p-3 rounded-xl border border-white/[.08] bg-white/[.02]">
                    <div className="flex items-center gap-2">
                      <input
                        maxLength={40}
                        value={opt.name}
                        onChange={(e) => setOpt({ ...opt, name: e.target.value })}
                        placeholder="Medida"
                        aria-label="Nombre de la opción"
                        className={`${inputCls} font-semibold`}
                      />
                      <button type="button" title="Quitar opción" aria-label="Quitar opción" onClick={() => set('options', form.options.filter((_, j) => j !== i))} className={iconBtnCls}>
                        <X size={15} />
                      </button>
                    </div>
                    {opt.values.map((v, k) => (
                      <div key={k} className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)_auto] gap-2 pl-3 border-l-2 border-white/[.08]">
                        <input
                          maxLength={60}
                          value={v.label}
                          onChange={(e) => setOpt({ ...opt, values: opt.values.map((x, m) => (m === k ? { ...x, label: e.target.value } : x)) })}
                          placeholder={k === 0 ? '30 × 40 cm' : '50 × 70 cm'}
                          aria-label="Valor"
                          className={inputCls}
                        />
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-jb-muted pointer-events-none">+$</span>
                          <input
                            inputMode="decimal"
                            value={v.price}
                            onChange={(e) => setOpt({ ...opt, values: opt.values.map((x, m) => (m === k ? { ...x, price: e.target.value } : x)) })}
                            placeholder="0.00"
                            aria-label="Precio extra"
                            className={`${inputCls} pl-8 font-mono`}
                          />
                        </div>
                        <button
                          type="button"
                          title="Quitar valor"
                          aria-label="Quitar valor"
                          disabled={opt.values.length === 1}
                          onClick={() => setOpt({ ...opt, values: opt.values.filter((_, m) => m !== k) })}
                          className={`${iconBtnCls} self-center`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    {opt.values.length < 20 && (
                      <button type="button" onClick={() => setOpt({ ...opt, values: [...opt.values, { label: '', price: '' }] })} className={`${btn.subtle} self-start ml-3`}>
                        <Plus size={14} /> Añadir valor
                      </button>
                    )}
                  </div>
                );
              })}
              {form.options.length < 5 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <button type="button" onClick={() => set('options', [...form.options, { name: '', values: [{ label: '', price: '' }] }])} className={btn.subtle}>
                    <Plus size={15} /> Añadir opción
                  </button>
                  {OPTION_SUGGESTIONS.filter((n) => !form.options.some((o) => o.name.trim().toLowerCase() === n.toLowerCase())).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => set('options', [...form.options, { name: n, values: [{ label: '', price: '' }] }])}
                      className="px-2.5 py-1 rounded-full border border-white/[.12] text-[12px] text-jb-soft hover:text-white hover:border-white/30 cursor-pointer"
                    >
                      + {n}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </FieldGroup>
          <FieldGroup label="Más fotos" hint="Se muestran en la galería de la página del producto (máx. 12).">
            <div className="flex flex-col gap-2">
              {form.mediaUrls.map((url, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Thumb src={url} className="flex-none w-11 h-11" />
                  <div className="flex-1 min-w-0">
                    <MediaInput
                      onBusyChange={onBusyChange}
                      folder="products"
                      value={url}
                      onChange={(next) => set('mediaUrls', form.mediaUrls.map((u, j) => (j === i ? next : u)))}
                    />
                  </div>
                  <button type="button" title="Quitar foto" aria-label="Quitar foto" onClick={() => set('mediaUrls', form.mediaUrls.filter((_, j) => j !== i))} className={iconBtnCls}>
                    <X size={15} />
                  </button>
                </div>
              ))}
              {form.mediaUrls.length < 12 && (
                <button type="button" onClick={() => set('mediaUrls', [...form.mediaUrls, ''])} className={`${btn.subtle} self-start`}>
                  <ImagePlus size={15} /> Añadir foto
                </button>
              )}
            </div>
          </FieldGroup>
          <FieldGroup label="Detalles del producto" hint="Medidas, peso, material… Se muestran como tabla en la página del producto.">
            <div className="flex flex-col gap-2">
              {form.specs.map((spec, i) => (
                <div key={i} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)_auto] gap-2">
                  <input
                    maxLength={60}
                    value={spec.label}
                    onChange={(e) => set('specs', form.specs.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
                    placeholder="Medidas"
                    aria-label="Nombre del detalle"
                    className={inputCls}
                  />
                  <input
                    maxLength={200}
                    value={spec.value}
                    onChange={(e) => set('specs', form.specs.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))}
                    placeholder="30 × 40 cm"
                    aria-label="Valor"
                    className={inputCls}
                  />
                  <button type="button" title="Quitar" aria-label="Quitar detalle" onClick={() => set('specs', form.specs.filter((_, j) => j !== i))} className={`${iconBtnCls} self-center`}>
                    <X size={15} />
                  </button>
                </div>
              ))}
              {form.specs.length < 20 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <button type="button" onClick={() => set('specs', [...form.specs, { label: '', value: '' }])} className={btn.subtle}>
                    <Plus size={15} /> Añadir detalle
                  </button>
                  {SPEC_SUGGESTIONS.filter((l) => !form.specs.some((x) => x.label.trim().toLowerCase() === l.toLowerCase())).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => set('specs', [...form.specs, { label: l, value: '' }])}
                      className="px-2.5 py-1 rounded-full border border-white/[.12] text-[12px] text-jb-soft hover:text-white hover:border-white/30 cursor-pointer"
                    >
                      + {l}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </FieldGroup>
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
