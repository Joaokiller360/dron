'use client'

import { useState, FormEvent } from 'react';
import { Copy, Eye, EyeOff, KeyRound, Wand2 } from 'lucide-react';
import { apiFetch, errorMessage, setAccessToken } from './lib/api';
import { Card, ErrorNote, Field, PanelHeader, btn, iconBtnCls, inputCls, useToast } from './ui';

// No look-alikes (0/O, 1/l/I) so it can be typed from a note without mistakes
const ALPHABET = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** 20 random characters from the browser's CSPRNG, in groups of 5 ("xK7pq-…") */
function generatePassword() {
  const bytes = new Uint32Array(20);
  crypto.getRandomValues(bytes);
  const chars = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]);
  // Guarantee letters and digits (the API requires both)
  if (!chars.some((c) => /\d/.test(c))) chars[3] = String(2 + (bytes[3] % 8));
  if (!chars.some((c) => /[a-z]/i.test(c))) chars[0] = 'k';
  return [0, 5, 10, 15].map((i) => chars.slice(i, i + 5).join('')).join('-');
}

/** Rough strength for the meter: length and variety of characters */
function strength(pw: string) {
  if (!pw) return 0;
  const kinds = [/[a-z]/, /[A-Z]/, /\d/, /[^a-zA-Z\d]/].filter((r) => r.test(pw)).length;
  if (pw.length < 12 || !/\d/.test(pw) || !/\p{L}/u.test(pw)) return 1;
  if (pw.length >= 16 && kinds >= 3) return 3;
  return 2;
}
const LEVELS = [
  { label: '', cls: 'bg-white/[.08]' },
  { label: 'Débil: mínimo 12 caracteres con letras y números', cls: 'bg-red-400' },
  { label: 'Aceptable', cls: 'bg-amber-300' },
  { label: 'Fuerte', cls: 'bg-jb-accent' },
];

export default function AccountPanel({ email }: { email: string }) {
  const toast = useToast();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const level = strength(next);

  const generate = () => {
    const pw = generatePassword();
    setNext(pw);
    setConfirm(pw);
    setShow(true);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(next);
      toast.success('Contraseña copiada: guárdala en tu gestor de contraseñas');
    } catch {
      toast.error('No se pudo copiar; selecciónala y cópiala a mano.');
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (level < 2) return setError('La contraseña nueva debe tener al menos 12 caracteres, con letras y números.');
    if (next !== confirm) return setError('La confirmación no coincide con la contraseña nueva.');
    setError('');
    setSaving(true);
    try {
      const data = await apiFetch<{ accessToken: string }>('/auth/password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      // The old session was revoked with the change; keep this one with the new
      // token (the API also set a new refresh cookie)
      setAccessToken(data.accessToken);
      setCurrent('');
      setNext('');
      setConfirm('');
      setShow(false);
      toast.success('Contraseña cambiada. Se cerraron las demás sesiones.');
    } catch (err) {
      setError(errorMessage(err, 'No se pudo cambiar la contraseña.'));
    } finally {
      setSaving(false);
    }
  };

  const type = show ? 'text' : 'password';

  return (
    <div className="flex flex-col gap-6 max-w-[640px]">
      <PanelHeader title="Mi cuenta" subtitle={`Sesión iniciada como ${email}`} />

      <Card className="p-5">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <span className="inline-flex items-center gap-2 text-[14px] font-semibold text-white">
            <KeyRound size={16} className="text-jb-accent" /> Cambiar contraseña
          </span>

          <Field label="Contraseña actual">
            <input type={type} required autoComplete="current-password" maxLength={128} value={current} onChange={(e) => setCurrent(e.target.value)} className={inputCls} />
          </Field>

          <Field label="Contraseña nueva" hint="Mínimo 12 caracteres, con letras y números. Mejor si es larga o generada.">
            <div className="flex gap-2">
              <input
                type={type}
                required
                autoComplete="new-password"
                minLength={12}
                maxLength={128}
                value={next}
                onChange={(e) => setNext(e.target.value)}
                className={`${inputCls} flex-1 font-mono`}
              />
              <button type="button" title={show ? 'Ocultar' : 'Mostrar'} aria-label={show ? 'Ocultar contraseñas' : 'Mostrar contraseñas'} onClick={() => setShow((v) => !v)} className={`${iconBtnCls} self-center`}>
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              {next && (
                <button type="button" title="Copiar" aria-label="Copiar contraseña nueva" onClick={copy} className={`${iconBtnCls} self-center`}>
                  <Copy size={16} />
                </button>
              )}
            </div>
          </Field>

          <div className="flex flex-col gap-1.5 -mt-1">
            <div className="grid grid-cols-3 gap-1.5">
              {[1, 2, 3].map((i) => (
                <span key={i} className={`h-1.5 rounded-full ${level >= i ? LEVELS[level].cls : 'bg-white/[.08]'}`} />
              ))}
            </div>
            {level > 0 && <span className="text-[12px] text-jb-muted">{LEVELS[level].label}</span>}
          </div>

          <Field label="Confirmar contraseña nueva">
            <input type={type} required autoComplete="new-password" maxLength={128} value={confirm} onChange={(e) => setConfirm(e.target.value)} className={`${inputCls} font-mono`} />
          </Field>

          {error && <ErrorNote>{error}</ErrorNote>}

          <div className="flex flex-wrap justify-between gap-2">
            <button type="button" onClick={generate} className={btn.ghost}>
              <Wand2 size={15} /> Generar contraseña segura
            </button>
            <button type="submit" disabled={saving || !current || !next || !confirm} className={btn.primary}>
              {saving ? 'Guardando…' : 'Cambiar contraseña'}
            </button>
          </div>
          <p className="m-0 text-[12.5px] text-jb-muted">
            Al cambiarla se cierran las sesiones abiertas en otros dispositivos. Si la generas, cópiala y guárdala en un gestor de contraseñas antes de guardar.
          </p>
        </form>
      </Card>
    </div>
  );
}
