'use client'

// Shared building blocks for the dashboard, in the site's jb-* palette.

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode, type LiHTMLAttributes } from 'react';
import { ArrowDown, ArrowUp, Check, Eye, EyeOff, GripVertical, ImageOff, Search, Trash2, X, AlertTriangle } from 'lucide-react';

/* ---------- class helpers ---------- */

export const inputCls =
  'w-full px-3.5 py-2.5 rounded-[10px] bg-jb-bg border border-white/[.12] text-[14px] text-jb-text placeholder:text-jb-muted/70 outline-none transition focus:border-jb-accent disabled:opacity-50';

const btnBase =
  'inline-flex items-center justify-center gap-2 rounded-[10px] text-[13.5px] font-semibold transition disabled:opacity-50 disabled:pointer-events-none cursor-pointer';
export const btn = {
  primary: `${btnBase} px-4 py-2.5 bg-jb-accent text-jb-ink hover:bg-jb-accent-hi`,
  ghost: `${btnBase} px-4 py-2.5 border border-white/[.14] text-jb-text hover:bg-white/[.06]`,
  subtle: `${btnBase} px-3 py-2 text-jb-soft hover:text-white hover:bg-white/[.06]`,
  danger: `${btnBase} px-4 py-2.5 bg-red-500/90 text-white hover:bg-red-500`,
};

export const iconBtnCls =
  'inline-flex items-center justify-center w-8 h-8 rounded-lg text-jb-soft hover:text-white hover:bg-white/[.08] transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer';

/* ---------- toasts ---------- */

type Tone = 'success' | 'error';
interface ToastItem {
  id: number;
  tone: Tone;
  text: string;
}
const ToastContext = createContext<{ push: (tone: Tone, text: string) => void }>({ push: () => {} });

export function Toaster({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const seq = useRef(0);
  const push = useCallback((tone: Tone, text: string) => {
    const id = ++seq.current;
    setToasts((prev) => [...prev.slice(-3), { id, tone, text }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), tone === 'error' ? 6000 : 2800);
  }, []);
  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div aria-live="polite" className="fixed z-[200] flex flex-col gap-2 bottom-4 right-4 left-4 sm:left-auto sm:w-[360px]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-start gap-2.5 px-4 py-3 rounded-xl border shadow-[0_12px_40px_rgba(0,0,0,.45)] text-[13.5px] animate-jb-fade ${
              t.tone === 'success'
                ? 'bg-jb-card border-[rgba(52,209,122,.35)] text-jb-text'
                : 'bg-[#2a1414] border-red-500/40 text-red-100'
            }`}
          >
            {t.tone === 'success' ? (
              <Check size={16} className="flex-none mt-0.5 text-jb-accent" />
            ) : (
              <AlertTriangle size={16} className="flex-none mt-0.5 text-red-400" />
            )}
            <span className="flex-1">{t.text}</span>
            <button
              type="button"
              aria-label="Cerrar"
              onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              className="text-white/40 hover:text-white"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const { push } = useContext(ToastContext);
  return useMemo(
    () => ({
      success: (text: string) => push('success', text),
      error: (text: string) => push('error', text),
    }),
    [push],
  );
}

/* ---------- layout ---------- */

export function PanelHeader({
  title,
  subtitle,
  count,
  actions,
}: {
  title: string;
  subtitle?: string;
  count?: number;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="m-0 font-mono text-[22px] font-bold tracking-[-.02em] text-white">
          {title}
          {typeof count === 'number' && <span className="ml-2 text-base font-medium text-jb-muted">{count}</span>}
        </h1>
        {subtitle && <p className="mt-1 mb-0 text-[13.5px] text-jb-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-white/[.08] bg-jb-card ${className}`}>{children}</div>;
}

export function Field({
  label,
  hint,
  children,
  className = '',
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="font-mono text-[10.5px] font-semibold tracking-[.12em] uppercase text-jb-muted">{label}</span>
      {children}
      {hint && <span className="text-[12px] text-jb-muted/80">{hint}</span>}
    </label>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between w-full gap-4 py-2 text-left bg-transparent border-0 cursor-pointer disabled:opacity-40"
    >
      <span className="flex flex-col gap-0.5">
        <span className="text-[14px] font-semibold text-white">{label}</span>
        {description && <span className="text-[12.5px] leading-[1.45] text-jb-muted">{description}</span>}
      </span>
      <span
        className={`flex flex-none w-10 h-[22px] p-[3px] rounded-full transition ${
          checked ? 'bg-jb-accent justify-end' : 'bg-white/[.18] justify-start'
        }`}
      >
        <span className="block w-4 h-4 bg-white rounded-full" />
      </span>
    </button>
  );
}

export function Pill({ tone = 'muted', children }: { tone?: 'on' | 'muted' | 'warn' | 'info'; children: ReactNode }) {
  const tones = {
    on: 'bg-[rgba(52,209,122,.14)] text-jb-mint border-[rgba(52,209,122,.3)]',
    muted: 'bg-white/[.05] text-jb-muted border-white/[.1]',
    warn: 'bg-amber-400/10 text-amber-300 border-amber-400/30',
    info: 'bg-sky-400/10 text-sky-300 border-sky-400/30',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border font-mono text-[10.5px] font-semibold uppercase tracking-[.06em] ${tones[tone]}`}>
      {children}
    </span>
  );
}

/** Two-step delete: first click arms it, second (within 3s) confirms. */
export function ConfirmDelete({ onConfirm, label = 'Eliminar' }: { onConfirm: () => void; label?: string }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(t);
  }, [armed]);
  return armed ? (
    <button
      type="button"
      onClick={() => {
        setArmed(false);
        onConfirm();
      }}
      className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-red-500 text-white text-[12px] font-semibold cursor-pointer animate-jb-fade"
    >
      <Trash2 size={13} /> ¿Seguro?
    </button>
  ) : (
    <button type="button" title={label} aria-label={label} onClick={() => setArmed(true)} className={`${iconBtnCls} hover:!text-red-300 hover:!bg-red-500/15`}>
      <Trash2 size={15} />
    </button>
  );
}

export function MoveButtons({
  onUp,
  onDown,
  first,
  last,
}: {
  onUp: () => void;
  onDown: () => void;
  first: boolean;
  last: boolean;
}) {
  return (
    <span className="inline-flex">
      <button type="button" title="Subir" aria-label="Subir" disabled={first} onClick={onUp} className={iconBtnCls}>
        <ArrowUp size={15} />
      </button>
      <button type="button" title="Bajar" aria-label="Bajar" disabled={last} onClick={onDown} className={iconBtnCls}>
        <ArrowDown size={15} />
      </button>
    </span>
  );
}

export function SearchInput({ value, onChange, placeholder = 'Buscar…' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative w-full sm:w-64">
      <Search size={15} className="absolute -translate-y-1/2 pointer-events-none left-3 top-1/2 text-jb-muted" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={`${inputCls} pl-9 py-2`}
      />
    </div>
  );
}

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center border border-dashed rounded-2xl border-white/[.12]">
      <span className="flex items-center justify-center w-12 h-12 rounded-full bg-white/[.05] text-jb-muted">{icon}</span>
      <div>
        <p className="m-0 text-[15px] font-semibold text-white">{title}</p>
        {text && <p className="mt-1 mb-0 text-[13.5px] text-jb-muted max-w-[380px]">{text}</p>}
      </div>
      {action}
    </div>
  );
}

export function SkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2.5" aria-busy="true" aria-label="Cargando">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-[74px] rounded-2xl bg-white/[.04] animate-pulse" />
      ))}
    </div>
  );
}

/** Small thumbnail with a fallback when the URL is empty or broken. */
export function Thumb({ src, alt = '', className = 'w-14 h-14' }: { src?: string | null; alt?: string; className?: string }) {
  const [failed, setFailed] = useState<string | null>(null);
  if (!src || failed === src) {
    return (
      <span className={`flex items-center justify-center flex-none rounded-lg jb-stripes text-jb-muted ${className}`}>
        <ImageOff size={16} />
      </span>
    );
  }
  return <img src={src} alt={alt} onError={() => setFailed(src)} className={`flex-none object-cover rounded-lg bg-jb-well ${className}`} />;
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-2 m-0 px-3.5 py-2.5 rounded-[10px] border border-red-500/30 bg-red-500/10 text-[13px] text-red-200">
      <AlertTriangle size={15} className="flex-none mt-0.5" />
      {children}
    </p>
  );
}

/** One item in a content list: thumbnail, text, status pills and actions. */
export function ListRow({
  thumb,
  title,
  meta,
  pills,
  actions,
  dimmed,
  onOpen,
  drag,
}: {
  thumb?: ReactNode;
  title: ReactNode;
  meta?: ReactNode;
  pills?: ReactNode;
  actions: ReactNode;
  dimmed?: boolean;
  onOpen?: () => void;
  /** Drag & drop reordering (see lib/useDragSort): row props plus its visual state */
  drag?: { props: LiHTMLAttributes<HTMLLIElement>; dragging: boolean; dropTarget: boolean };
}) {
  return (
    <li
      {...drag?.props}
      className={`flex flex-wrap items-center gap-x-3.5 gap-y-2 px-3.5 py-3 rounded-2xl border bg-jb-card transition hover:border-white/[.16] ${
        drag?.dropTarget ? 'border-jb-accent ring-1 ring-jb-accent' : 'border-white/[.08]'
      } ${drag?.dragging ? 'opacity-40' : ''}`}
    >
      {drag?.props.draggable && (
        <span
          title="Arrastra para cambiar el orden"
          aria-hidden
          className="hidden [@media(pointer:fine)]:inline-flex items-center -mx-1.5 text-jb-muted/70 hover:text-white cursor-grab active:cursor-grabbing"
        >
          <GripVertical size={16} />
        </span>
      )}
      <span className={`contents ${dimmed ? '[&>*]:opacity-60' : ''}`}>{thumb}</span>
      <button
        type="button"
        onClick={onOpen}
        disabled={!onOpen}
        className={`flex-1 min-w-[160px] p-0 text-left bg-transparent border-0 cursor-pointer disabled:cursor-default ${dimmed ? 'opacity-60' : ''}`}
      >
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-[14.5px] font-semibold text-white truncate">{title}</span>
          {pills}
        </span>
        {meta && <span className="block mt-0.5 text-[12.5px] text-jb-muted truncate">{meta}</span>}
      </button>
      <span className="flex items-center justify-end flex-none gap-0.5 max-sm:w-full">{actions}</span>
    </li>
  );
}

/**
 * Explicit show/hide action for a list row. Always visible (icon-only on
 * phones); the current state is shown next to the title with <StatusPill>.
 */
export function PublishToggle({
  published,
  onToggle,
  labels = ['Ocultar', 'Publicar'],
}: {
  published: boolean;
  onToggle: () => void;
  /** [action when published, action when hidden] */
  labels?: [string, string];
}) {
  const label = published ? labels[0] : labels[1];
  return (
    <button
      type="button"
      onClick={onToggle}
      title={published ? `${label}: deja de verse en el sitio` : `${label}: se verá en el sitio`}
      aria-label={label}
      className={`inline-flex items-center gap-1.5 h-8 px-2 sm:px-2.5 mr-1 rounded-lg border text-[12px] font-semibold cursor-pointer transition ${
        published
          ? 'border-white/[.14] text-jb-soft hover:text-white hover:border-white/30 hover:bg-white/[.06]'
          : 'border-jb-accent bg-jb-accent text-jb-ink hover:bg-jb-accent-hi'
      }`}
    >
      {published ? <EyeOff size={14} /> : <Eye size={14} />}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

/** Published / hidden status shown next to a row title */
export function StatusPill({ published, labels = ['Publicado', 'Oculto'] }: { published: boolean; labels?: [string, string] }) {
  return published ? (
    <Pill tone="on">
      <span className="w-1.5 h-1.5 rounded-full bg-jb-accent" /> {labels[0]}
    </Pill>
  ) : (
    <Pill>
      <span className="w-1.5 h-1.5 rounded-full bg-white/30" /> {labels[1]}
    </Pill>
  );
}

/** Modal footer with save / cancel buttons */
export function FormActions({
  saving,
  disabled,
  uploading = false,
  onCancel,
  submitLabel,
}: {
  saving: boolean;
  disabled?: boolean;
  /** A photo or video is still uploading: saving now would store an empty URL */
  uploading?: boolean;
  onCancel: () => void;
  submitLabel: string;
}) {
  return (
    <div className="flex flex-wrap justify-end gap-2 pt-5 mt-2 border-t border-white/[.07]">
      <button type="button" onClick={onCancel} className={btn.ghost}>
        Cancelar
      </button>
      <button type="submit" disabled={saving || disabled || uploading} className={btn.primary}>
        {saving ? 'Guardando…' : uploading ? 'Subiendo archivo…' : submitLabel}
      </button>
    </div>
  );
}
