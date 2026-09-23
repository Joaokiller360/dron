'use client'

import { useEffect, useState, FormEvent } from 'react';
import { apiFetch, ContactInfo, errorMessage } from './lib/api';
import { EMAIL_PATTERN, PHONE_PATTERN, cleanInput } from '@/app/utils/formRules';
import { ErrorNote, Field, PanelHeader, btn, inputCls, useToast } from './ui';

// Phone and email shown on the public site (contact page, footer, home,
// WhatsApp buttons). Stored in site_settings under "contact".
export default function ContactPanel() {
  const toast = useToast();
  const [form, setForm] = useState<ContactInfo>({ phone: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch<ContactInfo>('/settings/contact')
      .then(setForm)
      .catch((err) => setError(errorMessage(err, 'No se pudieron cargar los datos de contacto.')))
      .finally(() => setLoading(false));
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const body = { phone: form.phone.trim(), email: form.email.trim() };
    if (!PHONE_PATTERN.test(body.phone) || body.phone.replace(/\D/g, '').length < 7) {
      setError('Escribe un celular válido, por ejemplo +593 98 666 0737.');
      return;
    }
    if (!EMAIL_PATTERN.test(body.email)) {
      setError('Escribe un correo válido, por ejemplo contacto@dominio.com.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      setForm(await apiFetch<ContactInfo>('/settings/contact', { method: 'PATCH', body: JSON.stringify(body) }));
      toast.success('Datos de contacto guardados');
    } catch (err) {
      setError(errorMessage(err, 'No se pudieron guardar los datos de contacto.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PanelHeader
        title="Contacto"
        subtitle="Celular y correo donde los clientes te escriben. Se muestran en la página de contacto, el pie de página, el inicio y los botones de WhatsApp."
      />

      <form onSubmit={submit} className="flex flex-col gap-4 max-w-[560px] p-6 rounded-2xl bg-jb-card border border-white/[.08]">
        <Field label="Celular / WhatsApp" hint="Con código de país para que el enlace de WhatsApp funcione. Ej. +593 98 666 0737">
          <input
            required
            disabled={loading}
            type="tel"
            minLength={7}
            maxLength={20}
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: cleanInput(e.target, 'phone') }))}
            placeholder="+593 98 666 0737"
            className={inputCls}
          />
        </Field>
        <Field label="Correo">
          <input
            required
            disabled={loading}
            type="email"
            maxLength={120}
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: cleanInput(e.target, 'email') }))}
            placeholder="contacto@joaobarres.dev"
            className={inputCls}
          />
        </Field>
        {error && <ErrorNote>{error}</ErrorNote>}
        <div className="flex justify-end">
          <button type="submit" disabled={loading || saving} className={btn.primary}>
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}
