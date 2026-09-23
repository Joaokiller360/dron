'use client'

import { useEffect, useRef, useState, FormEvent } from 'react';
import { Mail, MessageCircle, Archive, MailOpen, ArrowLeft, Inbox, Trash2, Send } from 'lucide-react';
import { ContactMessage, ContactStatus, errorMessage } from './lib/api';
import { ErrorNote, btn, inputCls } from './ui';

// Message view from the claude.ai/design project (Mensaje Detalle.dc.html),
// using the dashboard's jb-* colors.

const STATUS_LABEL: Record<ContactStatus, string> = { NEW: 'Nuevo', READ: 'Leído', ARCHIVED: 'Archivado' };
const LOCALE_LABEL: Record<string, string> = { es: 'Español', en: 'English' };
// Labels the contact form writes for the project type, in both languages
const TYPE_LABELS = ['Tipo de proyecto', 'Project type'];

const labelCls = 'font-mono text-[10.5px] uppercase tracking-[.08em] text-jb-muted';
const iconBtn =
  'flex items-center justify-center w-9 h-9 rounded-[10px] text-jb-soft cursor-pointer transition hover:bg-white/[.06] hover:text-white';

// Ecuadorian numbers are usually typed as 09xxxxxxxx; wa.me needs 5939xxxxxxxx
function whatsappUrl(phone: string) {
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) digits = `593${digits.slice(1)}`;
  return `https://wa.me/${digits}`;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const day = d.toLocaleDateString('es-EC', { day: 'numeric', month: 'short' }).replace('.', '');
  const time = d.toLocaleTimeString('es-EC', { hour: 'numeric', minute: '2-digit' });
  return `${day} · ${time}`;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase() || '?';
}

/**
 * The contact form prepends "Label: value" lines (type, date, city, venue)
 * and a blank line before the client's text. Split them so they can be shown
 * as fields; messages without that header come back as body only.
 */
export function parseMessage(message: string) {
  const split = message.indexOf('\n\n');
  const head = split === -1 ? message : message.slice(0, split);
  const lines = head.split('\n');
  const fields = lines.map((l) => /^([^:\n]{2,30}): (.+)$/.exec(l));
  if (fields.some((f) => !f)) return { fields: [] as { label: string; value: string }[], body: message.trim() };
  return {
    fields: fields.map((f) => ({ label: f![1], value: formatField(f![2]) })),
    body: split === -1 ? '' : message.slice(split + 2).trim(),
  };
}

// ISO dates from the date picker → "1 oct 2026"
function formatField(value: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return value;
  return new Date(+m[1], +m[2] - 1, +m[3]).toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' }).replace('.', '');
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(text).catch(() => {});
        setCopied(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), 1400);
      }}
      className="flex-none ml-auto px-2 py-1 rounded-md bg-white/[.05] font-mono text-[11px] text-jb-soft cursor-pointer transition hover:bg-white/[.1] hover:text-white"
    >
      {copied ? 'Copiado' : 'Copiar'}
    </button>
  );
}

export default function MessageDetail({
  message: m,
  onBack,
  onStatus,
  onDelete,
  onReply,
}: {
  message: ContactMessage;
  onBack: () => void;
  onStatus: (status: ContactStatus) => void;
  onDelete: () => void;
  onReply: (subject: string, body: string) => Promise<void>;
}) {
  const [confirming, setConfirming] = useState(false);
  const [replying, setReplying] = useState(false);
  const [subject, setSubject] = useState('Tu solicitud a JB.SKYLENS');
  const [reply, setReply] = useState(`Hola ${m.name.trim().split(/\s+/)[0]},\n\n`);
  const [sending, setSending] = useState(false);
  const [replyError, setReplyError] = useState('');

  const sendReply = async (e: FormEvent) => {
    e.preventDefault();
    setSending(true);
    setReplyError('');
    try {
      await onReply(subject.trim(), reply.trim());
      setReplying(false);
    } catch (err) {
      setReplyError(errorMessage(err, 'No se pudo enviar el correo.'));
    } finally {
      setSending(false);
    }
  };
  const { fields, body } = parseMessage(m.message);
  const typeField = fields.find((f) => TYPE_LABELS.includes(f.label));
  const otherFields = fields.filter((f) => f !== typeField);
  const isNew = m.status === 'NEW';

  return (
    <article className="overflow-hidden border rounded-[20px] bg-jb-card border-white/[.07] animate-jb-fade">
      <button type="button" onClick={onBack} className={`${btn.subtle} mt-3 ml-4 lg:hidden`}>
        <ArrowLeft size={15} /> Volver
      </button>

      <header className="flex items-center gap-4 px-6 py-5 border-b border-white/[.06]">
        <div className="flex items-center justify-center flex-none w-11 h-11 rounded-xl bg-[rgba(52,209,122,.16)] text-jb-mint text-[15px] font-semibold tracking-[.02em]">
          {initials(m.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="m-0 text-lg font-semibold tracking-[-.01em] text-white break-words">{m.name}</h2>
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-mono text-[10.5px] font-medium uppercase tracking-[.06em] ${
                isNew ? 'bg-[rgba(52,209,122,.16)] text-jb-accent' : 'bg-white/[.06] text-jb-soft'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {STATUS_LABEL[m.status]}
            </span>
          </div>
          <p className="mt-1 mb-0 font-mono text-[12px] text-jb-muted">
            {formatDate(m.createdAt)} · {LOCALE_LABEL[m.locale] ?? m.locale.toUpperCase()}
          </p>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            title={isNew ? 'Marcar como leído' : 'Marcar como no leído'}
            aria-label={isNew ? 'Marcar como leído' : 'Marcar como no leído'}
            onClick={() => onStatus(isNew ? 'READ' : 'NEW')}
            className={iconBtn}
          >
            <MailOpen size={16} />
          </button>
          <button
            type="button"
            title={m.status === 'ARCHIVED' ? 'Desarchivar' : 'Archivar'}
            aria-label={m.status === 'ARCHIVED' ? 'Desarchivar' : 'Archivar'}
            onClick={() => onStatus(m.status === 'ARCHIVED' ? 'READ' : 'ARCHIVED')}
            className={iconBtn}
          >
            {m.status === 'ARCHIVED' ? <Inbox size={16} /> : <Archive size={16} />}
          </button>
          <button
            type="button"
            title="Eliminar"
            aria-label="Eliminar"
            onClick={() => setConfirming(true)}
            className={`${iconBtn} hover:!bg-red-500/15 hover:!text-red-300`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </header>

      {confirming && (
        <div className="flex flex-wrap items-center gap-3 px-6 py-3 bg-red-500/[.08] border-b border-red-500/[.18] text-[13.5px] text-red-200">
          <span className="flex-1 min-w-[200px]">¿Eliminar este mensaje? No se puede deshacer.</span>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="px-2.5 py-1.5 rounded-lg font-medium text-jb-text cursor-pointer hover:bg-white/[.06]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              setConfirming(false);
              onDelete();
            }}
            className="px-3 py-1.5 rounded-lg font-semibold text-white bg-red-500 cursor-pointer hover:bg-red-600"
          >
            Eliminar
          </button>
        </div>
      )}

      <div className="flex flex-col gap-6 p-6">
        <dl className="m-0 grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-px overflow-hidden rounded-[14px] border border-white/[.06] bg-white/[.06]">
          <div className="flex flex-col gap-1.5 px-4 py-3.5 bg-jb-bg">
            <dt className={labelCls}>Correo</dt>
            <dd className="flex items-center min-w-0 gap-2 m-0">
              <a href={`mailto:${m.email}`} title={m.email} className="min-w-0 text-[14px] text-jb-text [overflow-wrap:anywhere] hover:text-jb-mint">
                {m.email}
              </a>
              <CopyButton text={m.email} />
            </dd>
          </div>
          <div className="flex flex-col gap-1.5 px-4 py-3.5 bg-jb-bg">
            <dt className={labelCls}>Teléfono</dt>
            <dd className="flex items-center gap-2 m-0">
              <a href={`tel:${m.phone}`} className="text-[14px] text-jb-text tabular-nums hover:text-jb-mint">
                {m.phone}
              </a>
              <CopyButton text={m.phone} />
            </dd>
          </div>
          {typeField && (
            <div className="col-span-full flex flex-col gap-1.5 px-4 py-3.5 bg-jb-bg">
              <dt className={labelCls}>{typeField.label}</dt>
              <dd className="m-0">
                <span className="inline-flex px-2.5 py-[3px] rounded-full bg-[rgba(52,209,122,.16)] text-jb-mint text-[13px] font-medium">
                  {typeField.value}
                </span>
              </dd>
            </div>
          )}
          {otherFields.map((f) => (
            <div key={f.label} className="flex flex-col gap-1.5 px-4 py-3.5 bg-jb-bg">
              <dt className={labelCls}>{f.label}</dt>
              <dd className="m-0 text-[14px] text-jb-text">{f.value}</dd>
            </div>
          ))}
        </dl>

        {body && (
          <section className="flex flex-col gap-2.5">
            <h3 className={`m-0 font-medium ${labelCls}`}>Mensaje</h3>
            <p className="m-0 text-[16px] leading-[1.65] text-jb-text whitespace-pre-wrap [text-wrap:pretty]">{body}</p>
          </section>
        )}

        {replying && (
          <form onSubmit={sendReply} className="flex flex-col gap-3 p-4 rounded-[14px] border border-white/[.08] bg-jb-bg animate-jb-fade">
            <div className="flex items-center gap-2 text-[13px] text-jb-muted">
              <span className={labelCls}>Para</span>
              <span className="text-jb-text [overflow-wrap:anywhere]">{m.email}</span>
            </div>
            <input
              required
              maxLength={150}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              aria-label="Asunto"
              placeholder="Asunto"
              className={inputCls}
            />
            <textarea
              required
              autoFocus
              maxLength={5000}
              rows={7}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              aria-label="Respuesta"
              className={`${inputCls} resize-y`}
            />
            <p className="m-0 text-[12px] text-jb-muted">Se envía desde el backend con Resend. Su mensaje original va citado debajo y, si responde, llega a tu correo de contacto.</p>
            {replyError && <ErrorNote>{replyError}</ErrorNote>}
            <div className="flex flex-wrap justify-end gap-2">
              <button type="button" onClick={() => setReplying(false)} className={btn.ghost}>
                Cancelar
              </button>
              <button type="submit" disabled={sending || !reply.trim() || !subject.trim()} className={btn.primary}>
                <Send size={15} /> {sending ? 'Enviando…' : 'Enviar correo'}
              </button>
            </div>
          </form>
        )}
      </div>

      <footer className="flex flex-wrap gap-2.5 px-6 py-4 border-t border-white/[.06] bg-jb-band">
        <a href={whatsappUrl(m.phone)} target="_blank" rel="noopener noreferrer" className={btn.primary}>
          <MessageCircle size={16} /> Responder por WhatsApp
        </a>
        <button type="button" onClick={() => setReplying(true)} disabled={replying} className={btn.ghost}>
          <Mail size={16} /> Responder por correo
        </button>
      </footer>
    </article>
  );
}
