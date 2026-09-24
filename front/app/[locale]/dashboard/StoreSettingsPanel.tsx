'use client'

import { useCallback, useEffect, useState, FormEvent } from 'react';
import { ExternalLink, CreditCard, AlertTriangle, Landmark } from 'lucide-react';
import { apiFetch, errorMessage, PaymentStatus, StoreSettings } from './lib/api';
import { useLive } from './lib/live';
import { Card, ErrorNote, Field, PanelHeader, Pill, SkeletonList, Toggle, btn, inputCls, useToast } from './ui';

type TransferForm = Pick<
  StoreSettings,
  'bankName' | 'accountType' | 'accountNumber' | 'accountHolder' | 'holderId' | 'transferEmail'
>;
const TRANSFER_FIELDS: (keyof TransferForm)[] = ['bankName', 'accountType', 'accountNumber', 'accountHolder', 'holderId', 'transferEmail'];

/** Account the buyers transfer to; shown on the store while transfer is on */
function TransferCard({ settings, onSave }: { settings: StoreSettings; onSave: (patch: Partial<StoreSettings>) => Promise<boolean | undefined> }) {
  const toast = useToast();
  const [form, setForm] = useState<TransferForm>(() => Object.fromEntries(TRANSFER_FIELDS.map((k) => [k, settings[k] ?? ''])) as TransferForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = <K extends keyof TransferForm>(k: K, v: TransferForm[K]) => setForm((f) => ({ ...f, [k]: v }));
  const complete = !!(settings.bankName && settings.accountNumber && settings.accountHolder && settings.holderId);
  const dirty = TRANSFER_FIELDS.some((k) => form[k].trim() !== (settings[k] ?? ''));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const clean = Object.fromEntries(TRANSFER_FIELDS.map((k) => [k, form[k].trim()])) as TransferForm;
    if (clean.holderId && !/^(\d{10}|\d{13})$/.test(clean.holderId)) {
      setError('La cédula debe tener 10 dígitos o el RUC 13.');
      return;
    }
    if (clean.accountNumber && !/^[0-9-]+$/.test(clean.accountNumber)) {
      setError('El número de cuenta solo lleva dígitos.');
      return;
    }
    setError('');
    setSaving(true);
    if (await onSave(clean)) toast.success('Datos de transferencia guardados');
    setSaving(false);
  };

  return (
    <Card className="p-5">
      <Toggle
        checked={settings.transferEnabled}
        onChange={(v) => onSave({ transferEnabled: v }).then((ok) => ok && toast.success(v ? 'Transferencia activada' : 'Transferencia desactivada'))}
        label="Pago por transferencia bancaria"
        description="El cliente transfiere a tu cuenta y escribe el banco y el código de la transferencia. Tú confirmas el pago en Pedidos cuando veas el dinero."
      />
      {settings.transferEnabled && !complete && (
        <p className="mt-2 mb-0 text-[12.5px] text-amber-300">Completa banco, número de cuenta, titular y cédula/RUC para que aparezca en la tienda.</p>
      )}
      <form onSubmit={submit} className="flex flex-col gap-4 pt-4 mt-3 border-t border-white/[.07]">
        <span className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-white">
          <Landmark size={15} className="text-jb-accent" /> Datos de tu cuenta
        </span>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Banco">
            <input maxLength={80} value={form.bankName} onChange={(e) => set('bankName', e.target.value)} placeholder="Banco Pichincha" className={inputCls} />
          </Field>
          <Field label="Tipo de cuenta">
            <select value={form.accountType} onChange={(e) => set('accountType', e.target.value as TransferForm['accountType'])} className={inputCls}>
              <option value="AHORROS">Ahorros</option>
              <option value="CORRIENTE">Corriente</option>
            </select>
          </Field>
          <Field label="Número de cuenta">
            <input inputMode="numeric" maxLength={30} value={form.accountNumber} onChange={(e) => set('accountNumber', e.target.value)} placeholder="2201234567" className={`${inputCls} font-mono`} />
          </Field>
          <Field label="Titular">
            <input maxLength={100} value={form.accountHolder} onChange={(e) => set('accountHolder', e.target.value)} placeholder="Nombre del titular" className={inputCls} />
          </Field>
          <Field label="Cédula o RUC" hint="10 dígitos (cédula) o 13 (RUC).">
            <input inputMode="numeric" maxLength={13} value={form.holderId} onChange={(e) => set('holderId', e.target.value)} className={`${inputCls} font-mono`} />
          </Field>
          <Field label="Correo para comprobantes" hint="Opcional. Se muestra al cliente.">
            <input type="email" maxLength={120} value={form.transferEmail} onChange={(e) => set('transferEmail', e.target.value)} className={inputCls} />
          </Field>
        </div>
        {error && <ErrorNote>{error}</ErrorNote>}
        <div className="flex justify-end">
          <button type="submit" disabled={saving || !dirty} className={btn.primary}>
            {saving ? 'Guardando…' : 'Guardar datos'}
          </button>
        </div>
      </form>
    </Card>
  );
}

const HEADER_FIELDS = ['heroEyebrowEs', 'heroEyebrowEn', 'heroTitleEs', 'heroTitleEn', 'heroIntroEs', 'heroIntroEn'] as const;
type HeaderForm = Record<(typeof HEADER_FIELDS)[number], string>;

/** Store page header texts (also the landing section) and the landing switch */
function HeaderCard({ settings, onSave }: { settings: StoreSettings; onSave: (patch: Partial<StoreSettings>) => Promise<boolean | undefined> }) {
  const toast = useToast();
  const [form, setForm] = useState<HeaderForm>(() => Object.fromEntries(HEADER_FIELDS.map((k) => [k, settings[k] ?? ''])) as HeaderForm);
  const [saving, setSaving] = useState(false);
  const set = (k: keyof HeaderForm, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const dirty = HEADER_FIELDS.some((k) => form[k].trim() !== (settings[k] ?? ''));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const clean = Object.fromEntries(HEADER_FIELDS.map((k) => [k, form[k].trim()])) as HeaderForm;
    if (await onSave(clean)) toast.success('Textos de la tienda guardados');
    setSaving(false);
  };

  return (
    <Card className="p-5">
      <Toggle
        checked={settings.homeSection}
        onChange={(v) => onSave({ homeSection: v }).then((ok) => ok && toast.success(v ? 'Productos visibles en el inicio' : 'Productos ocultos en el inicio'))}
        label="Mostrar productos en la página de inicio"
        description="Muestra los primeros 4 productos publicados, con los textos de abajo y un enlace a la tienda."
      />
      <form onSubmit={submit} className="flex flex-col gap-4 pt-4 mt-3 border-t border-white/[.07]">
        <div className="flex flex-col gap-1">
          <span className="text-[13.5px] font-semibold text-white">Textos de la tienda</span>
          <span className="text-[12.5px] text-jb-muted">Cabecera de /store y de la sección del inicio. Vacío = texto por defecto.</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Etiqueta (español)">
            <input maxLength={40} value={form.heroEyebrowEs} onChange={(e) => set('heroEyebrowEs', e.target.value)} placeholder="Tienda" className={inputCls} />
          </Field>
          <Field label="Etiqueta (inglés)">
            <input maxLength={40} value={form.heroEyebrowEn} onChange={(e) => set('heroEyebrowEn', e.target.value)} placeholder="Store" className={inputCls} />
          </Field>
          <Field label="Título (español)">
            <input maxLength={100} value={form.heroTitleEs} onChange={(e) => set('heroTitleEs', e.target.value)} placeholder="Productos JB.SKYLENS" className={inputCls} />
          </Field>
          <Field label="Título (inglés)">
            <input maxLength={100} value={form.heroTitleEn} onChange={(e) => set('heroTitleEn', e.target.value)} placeholder="JB.SKYLENS products" className={inputCls} />
          </Field>
          <Field label="Descripción (español)">
            <textarea rows={3} maxLength={300} value={form.heroIntroEs} onChange={(e) => set('heroIntroEs', e.target.value)} placeholder="Elige tus productos y haz el pedido. Te contactamos para confirmar el pago y la entrega." className={`${inputCls} resize-y`} />
          </Field>
          <Field label="Descripción (inglés)">
            <textarea rows={3} maxLength={300} value={form.heroIntroEn} onChange={(e) => set('heroIntroEn', e.target.value)} placeholder="Pick your products and place an order. We'll contact you to confirm payment and delivery." className={`${inputCls} resize-y`} />
          </Field>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={saving || !dirty} className={btn.primary}>
            {saving ? 'Guardando…' : 'Guardar textos'}
          </button>
        </div>
      </form>
    </Card>
  );
}

/** Store switches, payments, texts and the landing section (products are edited in #tienda) */
export default function StoreSettingsPanel() {
  const toast = useToast();
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [notice, setNotice] = useState('');
  const [payments, setPayments] = useState<PaymentStatus | null>(null);

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
    apiFetch<PaymentStatus>('/store/payments').then(setPayments).catch(() => {});
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

  return (
    <div className="flex flex-col gap-6">
      <PanelHeader
        title="Configuración de la tienda"
        subtitle="Visibilidad, ventas, textos, sección del inicio y formas de pago. Los productos se editan en Productos."
        actions={
          settings?.enabled && (
            <a href="/store" target="_blank" rel="noopener noreferrer" className={btn.ghost}>
              <ExternalLink size={15} /> Ver tienda
            </a>
          )
        }
      />

      {!settings && <SkeletonList rows={2} />}

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

      {payments &&
        (payments.configured ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-5 py-3.5 rounded-2xl border border-white/[.08] bg-jb-card text-[13px] text-jb-soft">
            <span className="inline-flex items-center gap-2 font-semibold text-white">
              <CreditCard size={15} className="text-jb-accent" /> PayPal conectado
            </span>
            <Pill tone={payments.mode === 'live' ? 'on' : 'warn'}>{payments.mode === 'live' ? 'Pagos reales' : 'Sandbox (pruebas)'}</Pill>
            <span className={payments.webhook ? 'text-jb-mint' : 'text-amber-300'}>
              {payments.webhook ? 'Webhook verificado activo' : 'Sin webhook: los pagos se confirman al volver del checkout y por la tarea de revisión'}
            </span>
          </div>
        ) : (
          <div className="flex items-start gap-3 px-5 py-4 rounded-2xl border border-amber-400/30 bg-amber-400/[.06] text-[13.5px] text-jb-soft">
            <AlertTriangle size={17} className="flex-none mt-px text-amber-300" />
            <span>
              PayPal no está configurado: solo se puede pagar por transferencia (si la activas abajo). Agrega <code className="font-mono text-[12px]">PAYPAL_CLIENT_ID</code>,{' '}
              <code className="font-mono text-[12px]">PAYPAL_CLIENT_SECRET</code> y <code className="font-mono text-[12px]">PAYPAL_MODE</code> a la API.
            </span>
          </div>
        ))}

      {settings?.enabled && <HeaderCard key={HEADER_FIELDS.map((k) => settings[k]).join('|')} settings={settings} onSave={saveSetting} />}
      {settings && <TransferCard key={TRANSFER_FIELDS.map((k) => settings[k]).join('|')} settings={settings} onSave={saveSetting} />}

    </div>
  );
}
