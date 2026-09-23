'use client'

import { useEffect, useMemo, useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent, type ReactNode } from 'react';
import { AlertCircle, ArrowDown, ArrowUp, Check, ChevronDown, Pencil, Plus, PlusCircle, Trash2, X } from 'lucide-react';
import { ApiError, type LegalPage, type LegalSection, slugify } from './lib/api';

/* ---------- limits (mirror back/src/legal-pages/dto/create-legal-page.dto.ts) ---------- */

const MAX = {
  title: 200,
  label: 120,
  lastUpdate: 120,
  metaTitle: 200,
  metaDescription: 500,
  keyword: 120,
  keywords: 200,
  sections: 100,
  heading: 300,
  paragraphs: 100,
  paragraph: 10000,
  lists: 50,
  items: 200,
  item: 5000,
};
// Search engines cut longer titles / descriptions (a warning, not an error)
const SEO_SOFT = { title: 60, description: 160 };
const SITE_HOST = 'dron.joaobarres.dev';

/* ---------- draft model: textareas keep raw text, converted to arrays on save ---------- */

interface SubDraft {
  key: string;
  header: string;
  description: string;
  items: string;
}
interface SectionDraft {
  key: string;
  heading: string;
  text: string;
  lists: SubDraft[];
}
interface Draft {
  titleEs: string;
  titleEn: string;
  label: string;
  lastUpdate: string;
  metaTitle: string;
  metaDescription: string;
  sortOrder: string;
  published: boolean;
  keywords: string[];
  sections: SectionDraft[];
}

export interface LegalPageBody {
  titleEs: string;
  titleEn: string | null;
  label: string | null;
  lastUpdate: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  keywords: string[];
  sortOrder: number;
  published: boolean;
  content: LegalSection[];
}

let seq = 0;
const newKey = () => `k${++seq}`;
const toText = (v?: string[] | string) => (Array.isArray(v) ? v : v ? [v] : []).join('\n');
const toLines = (t: string) =>
  t
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
const countLines = (t: string) => toLines(t).length;
// Textarea height follows its content (about 88 characters per visual line)
const rowsFor = (t: string, min: number, max: number) =>
  Math.min(max, Math.max(min, t.split('\n').reduce((n, l) => n + Math.max(1, Math.ceil(l.length / 88)), 0)));

const emptySection = (): SectionDraft => ({ key: newKey(), heading: '', text: '', lists: [] });
const emptySub = (): SubDraft => ({ key: newKey(), header: '', description: '', items: '' });

function pageToDraft(p: LegalPage | null): Draft {
  return {
    titleEs: p?.titleEs ?? '',
    titleEn: p?.titleEn ?? '',
    label: p?.label ?? '',
    lastUpdate: p?.lastUpdate ?? '',
    metaTitle: p?.metaTitle ?? '',
    metaDescription: p?.metaDescription ?? '',
    sortOrder: String(p?.sortOrder ?? 0),
    published: p?.published ?? true,
    keywords: p?.keywords ?? [],
    sections: p
      ? (p.content ?? []).map((s) => ({
          key: newKey(),
          heading: s.heading ?? '',
          text: toText(s.text),
          lists: (s.lists ?? []).map((l) => ({
            key: newKey(),
            header: l.header ?? '',
            description: toText(l.description),
            items: toText(l.items),
          })),
        }))
      : [emptySection()],
  };
}

const orNull = (v: string) => v.trim() || null;

function draftToBody(d: Draft): LegalPageBody {
  return {
    titleEs: d.titleEs.trim(),
    titleEn: orNull(d.titleEn),
    label: orNull(d.label),
    lastUpdate: orNull(d.lastUpdate),
    metaTitle: orNull(d.metaTitle),
    metaDescription: orNull(d.metaDescription),
    keywords: d.keywords,
    sortOrder: Number(d.sortOrder),
    published: d.published,
    content: d.sections.map((s) => {
      const section: LegalSection = {};
      if (s.heading.trim()) section.heading = s.heading.trim();
      const text = toLines(s.text);
      if (text.length) section.text = text;
      if (s.lists.length) {
        section.lists = s.lists.map((l) => ({
          ...(l.header.trim() ? { header: l.header.trim() } : {}),
          ...(countLines(l.description) ? { description: toLines(l.description) } : {}),
          items: toLines(l.items),
        }));
      }
      return section;
    }),
  };
}

/* ---------- validation ---------- */

interface SectionErrors {
  heading?: string;
  text?: string;
  empty?: string;
  lists: Record<string, string>;
}
interface Errors {
  fields: Partial<Record<'titleEs' | 'titleEn' | 'label' | 'lastUpdate' | 'metaTitle' | 'metaDescription' | 'sortOrder' | 'keywords' | 'sections', string>>;
  sections: Record<string, SectionErrors>;
  count: number;
}

const tooLong = (v: string, max: number, what: string) => (v.trim().length > max ? `${what}: máximo ${max} caracteres` : undefined);

function validate(d: Draft, isNew: boolean, takenSlugs: string[]): Errors {
  const fields: Errors['fields'] = {};
  const title = d.titleEs.trim();
  if (!title) fields.titleEs = 'El título es obligatorio';
  else if (title.length > MAX.title) fields.titleEs = `Máximo ${MAX.title} caracteres`;
  else if (isNew) {
    const slug = slugify(title);
    if (!slug) fields.titleEs = 'El título debe tener letras o números';
    else if (takenSlugs.includes(slug)) fields.titleEs = `Ya existe una página en /legal/${slug}`;
  }
  fields.titleEn = tooLong(d.titleEn, MAX.title, 'Título en inglés');
  fields.label = tooLong(d.label, MAX.label, 'Etiqueta');
  fields.lastUpdate = tooLong(d.lastUpdate, MAX.lastUpdate, 'Última actualización');
  fields.metaTitle = tooLong(d.metaTitle, MAX.metaTitle, 'Meta title');
  fields.metaDescription = tooLong(d.metaDescription, MAX.metaDescription, 'Meta description');
  if (!/^\d{1,4}$/.test(d.sortOrder.trim())) fields.sortOrder = 'Número entero entre 0 y 9999';
  if (d.keywords.length > MAX.keywords) fields.keywords = `Máximo ${MAX.keywords} palabras`;
  if (d.sections.length === 0) fields.sections = 'Añade al menos una sección';
  else if (d.sections.length > MAX.sections) fields.sections = `Máximo ${MAX.sections} secciones`;

  const sections: Errors['sections'] = {};
  let count = Object.values(fields).filter(Boolean).length;
  for (const s of d.sections) {
    const e: SectionErrors = { lists: {} };
    const paras = toLines(s.text);
    if (s.heading.trim().length > MAX.heading) e.heading = `Máximo ${MAX.heading} caracteres`;
    if (paras.length > MAX.paragraphs) e.text = `Máximo ${MAX.paragraphs} párrafos`;
    else if (paras.some((p) => p.length > MAX.paragraph)) e.text = `Cada párrafo admite hasta ${MAX.paragraph} caracteres`;
    if (!s.heading.trim() && !paras.length && !s.lists.length) e.empty = 'La sección está vacía: escribe un encabezado o contenido, o quítala';
    if (s.lists.length > MAX.lists) e.empty = `Máximo ${MAX.lists} sublistas por sección`;
    for (const l of s.lists) {
      const items = toLines(l.items);
      const desc = toLines(l.description);
      if (!l.header.trim() && !desc.length && !items.length) e.lists[l.key] = 'Sublista vacía: complétala o quítala';
      else if (l.header.trim().length > MAX.heading) e.lists[l.key] = `Encabezado: máximo ${MAX.heading} caracteres`;
      else if (items.length > MAX.items) e.lists[l.key] = `Máximo ${MAX.items} ítems`;
      else if (items.some((i) => i.length > MAX.item)) e.lists[l.key] = `Cada ítem admite hasta ${MAX.item} caracteres`;
      else if (desc.some((p) => p.length > MAX.paragraph)) e.lists[l.key] = `Cada párrafo admite hasta ${MAX.paragraph} caracteres`;
    }
    const n = [e.heading, e.text, e.empty].filter(Boolean).length + Object.keys(e.lists).length;
    if (n) {
      sections[s.key] = e;
      count += n;
    }
  }
  return { fields, sections, count };
}

const NO_ERRORS: Errors = { fields: {}, sections: {}, count: 0 };

/* ---------- small UI pieces ---------- */

// Fields sit inside mono/uppercase labels, so they reset font, case and tracking.
// Text is 16px on phones: iOS zooms into smaller fields on focus.
const fieldBase =
  'w-full px-3 rounded-[10px] bg-jb-bg border font-sans normal-case tracking-normal text-white placeholder:text-white/30 outline-none transition focus:border-jb-accent focus:shadow-[0_0_0_3px_rgba(52,209,122,.18)]';
const inputCls = `${fieldBase} py-2.5 text-base sm:text-[14px]`;
// Textareas grow with their content where field-sizing is supported (rows is the fallback)
const growCls = '[field-sizing:content] min-h-[76px] max-h-[65vh]';
const areaCls = `${fieldBase} ${growCls} py-2.5 text-base sm:text-[13.5px] leading-[1.6] text-jb-text resize-y`;
const subFieldCls = `${fieldBase} py-2 text-base sm:text-[13px]`;
const borderFor = (err?: string) => (err ? 'border-red-400/70' : 'border-white/[.1]');
const labelCls = 'flex flex-col gap-1.5 font-mono text-[10.5px] tracking-[.1em] uppercase text-jb-muted';

function FieldError({ children }: { children?: string }) {
  if (!children) return null;
  return (
    <span role="alert" className="flex items-start gap-1.5 font-sans text-[12px] tracking-normal normal-case text-red-300">
      <AlertCircle size={13} className="mt-px shrink-0" />
      {children}
    </span>
  );
}

function Counter({ value, soft, max }: { value: number; soft?: number; max: number }) {
  const color = value > max ? 'text-red-300' : soft && value > soft ? 'text-amber-300' : 'text-jb-muted/70';
  return <span className={`normal-case tracking-normal ${color}`}>{value} / {soft ?? max}</span>;
}

function Group({ id, title, hint, aside, children }: { id: string; title: string; hint?: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} className="flex flex-col gap-4 p-4 sm:p-5 border border-white/[.08] rounded-[14px] bg-white/[.015] scroll-mt-16 lg:scroll-mt-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h3 className="m-0 text-[14px] font-semibold text-white">{title}</h3>
          {hint && <p className="m-0 text-[12.5px] text-jb-muted">{hint}</p>}
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

const iconBtn =
  'inline-flex items-center justify-center w-9 h-9 sm:w-[30px] sm:h-[30px] rounded-lg text-jb-muted transition hover:bg-white/[.07] hover:text-white disabled:opacity-30 disabled:pointer-events-none';
const dangerBtn =
  'inline-flex items-center justify-center w-9 h-9 sm:w-[30px] sm:h-[30px] rounded-lg text-jb-muted transition hover:bg-red-400/15 hover:text-red-400';

/* ---------- editor ---------- */

/**
 * Full-screen editor for a legal page: index of sections (sidebar on desktop,
 * "Ir a" picker on phones), collapsible sections, chip input for highlighted
 * words, SEO preview and validation that mirrors the API.
 */
export default function LegalPageEditor({
  page,
  takenSlugs,
  onClose,
  onSave,
}: {
  /** null = new page */
  page: LegalPage | null;
  /** slugs already used by other pages */
  takenSlugs: string[];
  onClose: () => void;
  onSave: (body: LegalPageBody) => Promise<void>;
}) {
  const isNew = page === null;
  const [draft, setDraft] = useState<Draft>(() => pageToDraft(page));
  // Snapshot of what was loaded, to tell whether anything changed
  const [initial] = useState(() => JSON.stringify(draftToBody(draft)));
  const [open, setOpen] = useState<Record<string, boolean>>(() => (isNew ? { [draft.sections[0]?.key]: true } : {}));
  const [attempted, setAttempted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [kwDraft, setKwDraft] = useState('');
  const [kwError, setKwError] = useState('');
  const [active, setActive] = useState<string>('grp-general');
  const scrollRef = useRef<HTMLDivElement>(null);

  const errors = useMemo(() => validate(draft, isNew, takenSlugs), [draft, isNew, takenSlugs]);
  // Errors show up after the first save attempt, then update live
  const shown: Errors = attempted ? errors : NO_ERRORS;
  const dirty = JSON.stringify(draftToBody(draft)) !== initial;

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setDraft((d) => ({ ...d, [k]: v }));
    setSaveError('');
  };
  const setSection = (key: string, patch: Partial<SectionDraft>) =>
    set('sections', draft.sections.map((s) => (s.key === key ? { ...s, ...patch } : s)));
  const setSub = (sKey: string, lKey: string, patch: Partial<SubDraft>) =>
    set(
      'sections',
      draft.sections.map((s) => (s.key === sKey ? { ...s, lists: s.lists.map((l) => (l.key === lKey ? { ...l, ...patch } : l)) } : s)),
    );

  const requestClose = () => {
    if (saving) return;
    if (dirty && !window.confirm('Hay cambios sin guardar. ¿Salir y descartarlos?')) return;
    onClose();
  };

  // Esc closes, Ctrl/Cmd+S saves; the page behind does not scroll
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') requestClose();
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        (document.getElementById('legal-editor-form') as HTMLFormElement | null)?.requestSubmit();
      }
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  });

  // Warn before leaving the page (reload, closing the tab) with unsaved changes
  useEffect(() => {
    if (!dirty) return;
    const onUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, [dirty]);

  const goTo = (id: string) => {
    const c = scrollRef.current;
    const el = document.getElementById(id);
    if (c && el) c.scrollTo({ top: el.getBoundingClientRect().top - c.getBoundingClientRect().top + c.scrollTop - 12, behavior: 'smooth' });
  };
  const openAndGo = (key: string) => {
    setOpen((o) => ({ ...o, [key]: true }));
    setTimeout(() => goTo(`sec-${key}`), 40);
  };

  // Highlights the index entry of the section being read
  const onScroll = () => {
    const c = scrollRef.current;
    if (!c) return;
    const top = c.getBoundingClientRect().top + 60;
    let current = 'grp-general';
    for (const id of ['grp-general', 'grp-seo', 'grp-hl', ...draft.sections.map((s) => `sec-${s.key}`)]) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= top) current = id;
    }
    if (current !== active) setActive(current);
  };

  /* sections */
  const addSection = () => {
    const s = emptySection();
    set('sections', [...draft.sections, s]);
    openAndGo(s.key);
  };
  const moveSection = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= draft.sections.length) return;
    const next = [...draft.sections];
    [next[i], next[j]] = [next[j], next[i]];
    set('sections', next);
  };
  const removeSection = (s: SectionDraft, i: number) => {
    const hasContent = s.heading.trim() || s.text.trim() || s.lists.length;
    if (hasContent && !window.confirm(`¿Eliminar la sección "${s.heading.trim() || i + 1}"?`)) return;
    set('sections', draft.sections.filter((x) => x.key !== s.key));
  };

  /* highlighted words */
  const addKeywords = (raw: string) => {
    const lower = draft.keywords.map((k) => k.toLowerCase());
    const add: string[] = [];
    let problem = '';
    for (const t of raw.split(/\n|,/).map((x) => x.trim()).filter(Boolean)) {
      if (t.length > MAX.keyword) problem = `"${t.slice(0, 24)}…" supera ${MAX.keyword} caracteres`;
      else if (!lower.includes(t.toLowerCase()) && !add.some((a) => a.toLowerCase() === t.toLowerCase())) add.push(t);
    }
    if (draft.keywords.length + add.length > MAX.keywords) problem = `Máximo ${MAX.keywords} palabras`;
    else if (add.length) set('keywords', [...draft.keywords, ...add]);
    setKwError(problem);
    setKwDraft('');
  };
  const onKwKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addKeywords(kwDraft);
    } else if (e.key === 'Backspace' && !kwDraft && draft.keywords.length) {
      set('keywords', draft.keywords.slice(0, -1));
    }
  };
  const onKwPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const t = e.clipboardData.getData('text');
    if (/\n|,/.test(t)) {
      e.preventDefault();
      addKeywords(t);
    }
  };

  /* save */
  const submit = async (e?: FormEvent) => {
    e?.preventDefault();
    if (saving) return;
    setAttempted(true);
    setSaveError('');
    if (errors.count > 0) {
      // Open every section with a problem and bring the first one into view
      const bad = draft.sections.filter((s) => errors.sections[s.key]).map((s) => s.key);
      setOpen((o) => ({ ...o, ...Object.fromEntries(bad.map((k) => [k, true])) }));
      const firstField = (['titleEs', 'titleEn', 'label', 'lastUpdate', 'sortOrder'] as const).find((f) => errors.fields[f]);
      const target = firstField
        ? 'grp-general'
        : errors.fields.metaTitle || errors.fields.metaDescription
          ? 'grp-seo'
          : errors.fields.keywords
            ? 'grp-hl'
            : bad[0]
              ? `sec-${bad[0]}`
              : 'grp-sections';
      setTimeout(() => goTo(target), 40);
      return;
    }
    setSaving(true);
    try {
      await onSave(draftToBody(draft));
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'No se pudo guardar. Revisa tu conexión e inténtalo de nuevo.');
      setSaving(false);
    }
  };

  const slug = isNew ? slugify(draft.titleEs) : page.slug;
  const status = saving
    ? { dot: 'bg-jb-accent animate-pulse', text: 'Guardando…' }
    : saveError
      ? { dot: 'bg-red-400', text: saveError }
      : shown.count
        ? { dot: 'bg-red-400', text: shown.count === 1 ? '1 campo por corregir' : `${shown.count} campos por corregir` }
        : dirty
          ? { dot: 'bg-amber-300', text: 'Cambios sin guardar' }
          : { dot: 'bg-white/25', text: isNew ? 'Página nueva' : 'Sin cambios' };

  const index = [
    { id: 'grp-general', label: 'General', err: !!(shown.fields.titleEs || shown.fields.titleEn || shown.fields.label || shown.fields.lastUpdate || shown.fields.sortOrder) },
    { id: 'grp-seo', label: 'SEO', err: !!(shown.fields.metaTitle || shown.fields.metaDescription) },
    { id: 'grp-hl', label: 'Palabras a resaltar', err: !!shown.fields.keywords },
  ];

  return (
    <div className="fixed inset-0 z-[120] flex sm:items-center sm:justify-center sm:p-6 bg-[rgba(4,12,8,.8)] backdrop-blur-sm" onClick={requestClose}>
      <form
        id="legal-editor-form"
        role="dialog"
        aria-modal="true"
        aria-label={isNew ? 'Nueva página legal' : 'Editar página legal'}
        noValidate
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col w-full h-[100dvh] sm:h-[calc(100dvh-48px)] sm:max-w-[1040px] sm:rounded-[20px] border-white/[.1] sm:border bg-jb-card text-jb-text shadow-[0_30px_80px_rgba(0,0,0,.55)] overflow-hidden animate-jb-fade"
      >
        {/* header */}
        <header className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 sm:py-[18px] border-b border-white/[.07]">
          <div className="flex items-center min-w-0 gap-3 sm:gap-3.5">
            <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-[rgba(52,209,122,.12)] text-jb-accent shrink-0">
              {isNew ? <PlusCircle size={19} strokeWidth={1.6} /> : <Pencil size={19} strokeWidth={1.6} />}
            </div>
            <div className="min-w-0">
              <div className="font-mono text-[10.5px] tracking-[.16em] uppercase text-jb-mint">
                Legal · {isNew ? 'Nueva página' : 'Editar página'}
              </div>
              <h2 className="m-0 mt-0.5 text-[16px] sm:text-lg font-bold text-white truncate">
                {draft.titleEs.trim() || (isNew ? 'Sin título' : page.titleEs)}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[11px] tracking-[.08em] uppercase ${
                draft.published ? 'bg-[rgba(52,209,122,.12)] text-jb-accent' : 'bg-white/[.06] text-jb-muted'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${draft.published ? 'bg-jb-accent' : 'bg-jb-muted'}`} />
              {draft.published ? 'Publicado' : 'Borrador'}
            </span>
            <button type="button" onClick={requestClose} aria-label="Cerrar" className="inline-flex items-center justify-center w-10 h-10 sm:w-9 sm:h-9 rounded-[10px] text-jb-soft hover:bg-white/[.08] hover:text-white transition">
              <X size={18} />
            </button>
          </div>
        </header>

        <div className="flex flex-1 min-h-0">
          {/* index (desktop) */}
          <nav aria-label="Índice" className="hidden lg:flex flex-col gap-0.5 w-[236px] shrink-0 px-3 py-[18px] overflow-y-auto border-r border-white/[.07]">
            <div className="px-2.5 pb-2 font-mono text-[10px] tracking-[.14em] uppercase text-jb-muted/70">Página</div>
            {index.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => goTo(n.id)}
                className={`flex items-center justify-between text-left text-[13px] px-2.5 py-[7px] rounded-lg transition hover:bg-white/[.05] hover:text-white ${
                  active === n.id ? 'bg-[rgba(52,209,122,.08)] text-white' : 'text-jb-soft'
                }`}
              >
                {n.label}
                {n.err && <AlertCircle size={13} className="text-red-300" />}
              </button>
            ))}
            <div className="flex items-center justify-between px-2.5 pt-4 pb-2 font-mono text-[10px] tracking-[.14em] uppercase text-jb-muted/70">
              <span>Secciones</span>
              <span>{draft.sections.length}</span>
            </div>
            {draft.sections.map((s, i) => (
              <button
                key={s.key}
                type="button"
                onClick={() => openAndGo(s.key)}
                className={`flex items-baseline gap-2.5 text-left text-[12.5px] leading-[1.35] px-2.5 py-[7px] rounded-lg transition hover:bg-white/[.05] hover:text-white ${
                  active === `sec-${s.key}` ? 'bg-[rgba(52,209,122,.08)] text-white' : 'text-jb-soft/90'
                }`}
              >
                <span className={`font-mono text-[10.5px] shrink-0 ${shown.sections[s.key] ? 'text-red-300' : 'text-jb-accent'}`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="line-clamp-2">{s.heading.trim() || 'Sin encabezado'}</span>
              </button>
            ))}
          </nav>

          <div ref={scrollRef} onScroll={onScroll} className="flex-1 min-w-0 overflow-y-auto overscroll-contain">
            {/* index (phones and tablets) */}
            <div className="sticky top-0 z-10 px-4 py-2.5 lg:hidden bg-jb-card/95 backdrop-blur border-b border-white/[.06]">
              <label className="sr-only" htmlFor="legal-jump">Ir a</label>
              <select
                id="legal-jump"
                value=""
                onChange={(e) => {
                  const v = e.target.value;
                  if (v.startsWith('sec-')) openAndGo(v.slice(4));
                  else if (v) goTo(v);
                }}
                className={`${fieldBase} ${borderFor()} py-2 text-base sm:text-[13px]`}
              >
                <option value="">Ir a… ({draft.sections.length} secciones)</option>
                {index.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.err ? '⚠ ' : ''}
                    {n.label}
                  </option>
                ))}
                {draft.sections.map((s, i) => (
                  <option key={s.key} value={`sec-${s.key}`}>
                    {shown.sections[s.key] ? '⚠ ' : ''}
                    {String(i + 1).padStart(2, '0')} · {(s.heading.trim() || 'Sin encabezado').slice(0, 60)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-4 sm:gap-5 max-w-[720px] mx-auto p-4 sm:p-6">
              {/* general */}
              <Group id="grp-general" title="General" hint="Título y datos visibles en la cabecera de la página.">
                <div className="grid gap-3.5 sm:grid-cols-2">
                  <label className={labelCls}>
                    <span>
                      Título (ES) <span className="text-jb-accent">*</span>
                    </span>
                    <input
                      value={draft.titleEs}
                      onChange={(e) => set('titleEs', e.target.value)}
                      aria-invalid={!!shown.fields.titleEs}
                      className={`${inputCls} ${borderFor(shown.fields.titleEs)}`}
                    />
                    <FieldError>{shown.fields.titleEs}</FieldError>
                    {isNew && slug && !shown.fields.titleEs && (
                      <span className="font-sans text-[11.5px] tracking-normal normal-case text-jb-muted/80">Dirección: /legal/{slug}</span>
                    )}
                  </label>
                  <label className={labelCls}>
                    Title (EN) · opcional
                    <input
                      value={draft.titleEn}
                      onChange={(e) => set('titleEn', e.target.value)}
                      placeholder="Terms & Conditions"
                      className={`${inputCls} ${borderFor(shown.fields.titleEn)}`}
                    />
                    <FieldError>{shown.fields.titleEn}</FieldError>
                  </label>
                  <label className={labelCls}>
                    Etiqueta · opcional
                    <input
                      value={draft.label}
                      onChange={(e) => set('label', e.target.value)}
                      placeholder="ej. Nuestros"
                      className={`${inputCls} ${borderFor(shown.fields.label)}`}
                    />
                    <FieldError>{shown.fields.label}</FieldError>
                  </label>
                  <label className={labelCls}>
                    Última actualización
                    <input
                      value={draft.lastUpdate}
                      onChange={(e) => set('lastUpdate', e.target.value)}
                      placeholder="ej. 01 de Mayo del 2026"
                      className={`${inputCls} ${borderFor(shown.fields.lastUpdate)}`}
                    />
                    <FieldError>{shown.fields.lastUpdate}</FieldError>
                  </label>
                </div>
                <div className="flex flex-wrap items-start gap-3.5 pt-3.5 border-t border-white/[.06]">
                  <label className={`${labelCls} w-[96px] sm:w-[120px]`}>
                    Orden
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={9999}
                      value={draft.sortOrder}
                      onChange={(e) => set('sortOrder', e.target.value)}
                      className={`${inputCls} ${borderFor(shown.fields.sortOrder)}`}
                    />
                  </label>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={draft.published}
                    onClick={() => set('published', !draft.published)}
                    className="flex items-center gap-3 h-[46px] sm:h-[42px] mt-[22px] pl-2 pr-3.5 rounded-[10px] border border-white/[.1] bg-jb-bg text-[13.5px] text-jb-text whitespace-nowrap"
                  >
                    <span className={`relative w-9 h-5 rounded-full transition ${draft.published ? 'bg-jb-accent' : 'bg-white/[.14]'}`}>
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${draft.published ? 'left-[18px] bg-jb-ink' : 'left-0.5 bg-jb-muted'}`} />
                    </span>
                    Publicada en el sitio
                  </button>
                  {shown.fields.sortOrder && (
                    <div className="w-full">
                      <FieldError>{shown.fields.sortOrder}</FieldError>
                    </div>
                  )}
                </div>
              </Group>

              {/* seo */}
              <Group id="grp-seo" title="SEO" hint="Opcional. Si se deja vacío se usa el título de la página.">
                <label className={labelCls}>
                  <span className="flex justify-between">
                    <span>Meta title</span>
                    <Counter value={draft.metaTitle.trim().length} soft={SEO_SOFT.title} max={MAX.metaTitle} />
                  </span>
                  <input
                    value={draft.metaTitle}
                    onChange={(e) => set('metaTitle', e.target.value)}
                    className={`${inputCls} ${borderFor(shown.fields.metaTitle)}`}
                  />
                  <FieldError>{shown.fields.metaTitle}</FieldError>
                </label>
                <label className={labelCls}>
                  <span className="flex justify-between">
                    <span>Meta description</span>
                    <Counter value={draft.metaDescription.trim().length} soft={SEO_SOFT.description} max={MAX.metaDescription} />
                  </span>
                  <textarea
                    rows={3}
                    value={draft.metaDescription}
                    onChange={(e) => set('metaDescription', e.target.value)}
                    className={`${areaCls} ${borderFor(shown.fields.metaDescription)}`}
                  />
                  <FieldError>{shown.fields.metaDescription}</FieldError>
                </label>
                <div className="flex flex-col gap-[3px] px-4 py-3.5 rounded-[10px] bg-jb-bg border border-dashed border-white/[.1]">
                  <span className="mb-1 font-mono text-[10px] tracking-[.12em] uppercase text-jb-muted/70">Vista previa en buscador</span>
                  <span className="text-[12px] text-jb-muted truncate">
                    {SITE_HOST} › legal › {slug || '…'}
                  </span>
                  <span className="text-[17px] text-[#8ab4f8] truncate">{draft.metaTitle.trim() || draft.titleEs.trim() || 'Título de la página'}</span>
                  <span className="text-[13px] leading-[1.5] text-[#bdc1c6] line-clamp-2">{draft.metaDescription.trim() || '—'}</span>
                </div>
              </Group>

              {/* highlighted words */}
              <Group
                id="grp-hl"
                title="Palabras a resaltar"
                hint="Se marcan en negrita dentro del texto. Enter o coma para añadir; pega varias líneas para añadir en lote."
                aside={<span className="font-mono text-[11px] text-jb-muted/70 shrink-0">{draft.keywords.length}</span>}
              >
                <div className={`flex flex-wrap gap-1.5 p-2.5 rounded-[10px] bg-jb-bg border ${borderFor(shown.fields.keywords)}`}>
                  {draft.keywords.map((k, i) => (
                    <span
                      key={`${k}-${i}`}
                      className="inline-flex items-center gap-1 max-w-full py-1 pl-2.5 pr-1 rounded-full bg-[rgba(52,209,122,.1)] border border-[rgba(52,209,122,.22)] text-[12.5px] text-jb-text"
                    >
                      <span className="truncate">{k}</span>
                      <button
                        type="button"
                        onClick={() => set('keywords', draft.keywords.filter((_, x) => x !== i))}
                        aria-label={`Quitar ${k}`}
                        className="inline-flex items-center justify-center w-6 h-6 sm:w-[18px] sm:h-[18px] rounded-full text-jb-mint hover:bg-white/[.12] hover:text-white"
                      >
                        <X size={11} strokeWidth={2.4} />
                      </button>
                    </span>
                  ))}
                  <span className="flex flex-1 min-w-[160px] gap-1.5">
                    <input
                      value={kwDraft}
                      onChange={(e) => {
                        setKwDraft(e.target.value);
                        setKwError('');
                      }}
                      onKeyDown={onKwKey}
                      onPaste={onKwPaste}
                      enterKeyHint="done"
                      placeholder="Añadir palabra…"
                      className="flex-1 min-w-0 px-1.5 py-1 bg-transparent border-0 outline-none text-base sm:text-[13px] text-white placeholder:text-white/30"
                    />
                    {kwDraft.trim() && (
                      <button type="button" onClick={() => addKeywords(kwDraft)} className="px-2.5 rounded-lg bg-jb-accent text-jb-ink text-[12px] font-semibold">
                        Añadir
                      </button>
                    )}
                  </span>
                </div>
                <FieldError>{kwError || shown.fields.keywords}</FieldError>
              </Group>

              {/* sections */}
              <div id="grp-sections" className="flex flex-col gap-2.5 scroll-mt-16 lg:scroll-mt-4">
                <div className="flex flex-wrap items-center justify-between gap-3 px-0.5 py-1">
                  <div className="flex items-baseline gap-2.5">
                    <h3 className="m-0 text-[14px] font-semibold text-white">Secciones</h3>
                    <span className="font-mono text-[11px] text-jb-muted/70">{draft.sections.length}</span>
                  </div>
                  <div className="flex gap-1.5">
                    {(['Expandir', 'Contraer'] as const).map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setOpen(l === 'Expandir' ? Object.fromEntries(draft.sections.map((s) => [s.key, true])) : {})}
                        className="px-3 py-2 sm:py-1.5 rounded-lg border border-white/[.1] font-mono text-[10.5px] tracking-[.08em] uppercase text-jb-soft hover:text-white hover:border-white/25"
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <FieldError>{shown.fields.sections}</FieldError>

                {draft.sections.map((s, i) => {
                  const isOpen = !!open[s.key];
                  const err = shown.sections[s.key];
                  const pc = countLines(s.text);
                  const sc = s.lists.length;
                  const summary = [pc && `${pc} ${pc === 1 ? 'párrafo' : 'párrafos'}`, sc && `${sc} ${sc === 1 ? 'sublista' : 'sublistas'}`].filter(Boolean).join(' · ');
                  return (
                    <div
                      key={s.key}
                      id={`sec-${s.key}`}
                      className={`rounded-[14px] bg-jb-band overflow-hidden border scroll-mt-16 lg:scroll-mt-4 ${
                        err ? 'border-red-400/60' : isOpen ? 'border-[rgba(52,209,122,.3)]' : 'border-white/[.08]'
                      }`}
                    >
                      <div className="flex items-center gap-2 py-2.5 pl-3.5 pr-2 sm:py-3 sm:pl-4 sm:pr-3">
                        <button
                          type="button"
                          onClick={() => setOpen((o) => ({ ...o, [s.key]: !isOpen }))}
                          aria-expanded={isOpen}
                          className="flex items-center flex-1 min-w-0 gap-3 text-left"
                        >
                          <span className={`w-[22px] font-mono text-[12px] shrink-0 ${err ? 'text-red-300' : 'text-jb-accent'}`}>{String(i + 1).padStart(2, '0')}</span>
                          <span className="flex flex-col flex-1 min-w-0 gap-[3px]">
                            <span className="text-[14px] font-semibold text-white truncate">{s.heading.trim() || 'Sin encabezado'}</span>
                            <span className={`font-mono text-[10.5px] tracking-[.06em] uppercase ${err ? 'text-red-300' : summary ? 'text-jb-muted' : 'text-amber-300'}`}>
                              {err ? 'Revisar' : summary || 'Sin contenido'}
                            </span>
                          </span>
                          <ChevronDown size={16} className={`text-jb-muted shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <div className="flex gap-0.5 shrink-0">
                          <button type="button" title="Subir" aria-label="Subir sección" disabled={i === 0} onClick={() => moveSection(i, -1)} className={iconBtn}>
                            <ArrowUp size={14} />
                          </button>
                          <button type="button" title="Bajar" aria-label="Bajar sección" disabled={i === draft.sections.length - 1} onClick={() => moveSection(i, 1)} className={iconBtn}>
                            <ArrowDown size={14} />
                          </button>
                          <button type="button" title="Eliminar sección" aria-label="Eliminar sección" onClick={() => removeSection(s, i)} className={dangerBtn}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {isOpen && (
                        <div className="flex flex-col gap-3.5 px-3.5 pt-4 pb-[18px] sm:pl-[52px] sm:pr-4 border-t border-white/[.06]">
                          {err?.empty && <FieldError>{err.empty}</FieldError>}
                          <label className={labelCls}>
                            <span className="flex justify-between gap-2">
                              <span>Encabezado</span>
                              {s.heading.trim().length > MAX.heading * 0.8 && <Counter value={s.heading.trim().length} max={MAX.heading} />}
                            </span>
                            <input
                              value={s.heading}
                              onChange={(e) => setSection(s.key, { heading: e.target.value })}
                              placeholder="ej. 2. OBJETO DEL CONTRATO"
                              className={`${inputCls} ${borderFor(err?.heading)} font-semibold`}
                            />
                            <FieldError>{err?.heading}</FieldError>
                          </label>
                          <label className={labelCls}>
                            <span className="flex justify-between gap-2">
                              <span>Párrafos</span>
                              <span className="normal-case tracking-normal text-jb-muted/70">Un párrafo por línea</span>
                            </span>
                            <textarea
                              rows={rowsFor(s.text, 3, 14)}
                              value={s.text}
                              onChange={(e) => setSection(s.key, { text: e.target.value })}
                              placeholder="Escribe el contenido de la sección…"
                              className={`${areaCls} ${borderFor(err?.text)}`}
                            />
                            <FieldError>{err?.text}</FieldError>
                          </label>

                          <div className="flex flex-col gap-2.5">
                            <span className="font-mono text-[10.5px] tracking-[.1em] uppercase text-jb-muted">Sublistas · {sc}</span>
                            {s.lists.map((l) => {
                              const lErr = err?.lists[l.key];
                              return (
                                <div key={l.key} className={`flex flex-col gap-2.5 p-3 rounded-xl bg-jb-card border ${lErr ? 'border-red-400/60' : 'border-white/[.07]'}`}>
                                  <div className="flex items-center gap-2">
                                    <input
                                      value={l.header}
                                      onChange={(e) => setSub(s.key, l.key, { header: e.target.value })}
                                      placeholder="Encabezado de la sublista (opcional)"
                                      aria-label="Encabezado de la sublista"
                                      className={`${subFieldCls} ${borderFor()} font-semibold`}
                                    />
                                    <button
                                      type="button"
                                      title="Quitar sublista"
                                      aria-label="Quitar sublista"
                                      onClick={() => {
                                        const has = l.header.trim() || l.description.trim() || l.items.trim();
                                        if (!has || window.confirm('¿Quitar esta sublista?')) setSection(s.key, { lists: s.lists.filter((x) => x.key !== l.key) });
                                      }}
                                      className={`${dangerBtn} shrink-0`}
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                  <label className={`${labelCls} text-[10px]`}>
                                    Descripción
                                    <textarea
                                      rows={rowsFor(l.description, 2, 12)}
                                      value={l.description}
                                      onChange={(e) => setSub(s.key, l.key, { description: e.target.value })}
                                      placeholder="Un párrafo por línea (opcional)"
                                      className={`${subFieldCls} ${growCls} ${borderFor()} leading-[1.6] text-jb-text resize-y`}
                                    />
                                  </label>
                                  <label className={`${labelCls} text-[10px]`}>
                                    Ítems de lista · {countLines(l.items)}
                                    <textarea
                                      rows={rowsFor(l.items, 2, 12)}
                                      value={l.items}
                                      onChange={(e) => setSub(s.key, l.key, { items: e.target.value })}
                                      placeholder="Un ítem por línea (opcional)"
                                      className={`${subFieldCls} ${growCls} ${borderFor()} leading-[1.6] text-jb-text resize-y`}
                                    />
                                  </label>
                                  <FieldError>{lErr}</FieldError>
                                </div>
                              );
                            })}
                            <button
                              type="button"
                              onClick={() => setSection(s.key, { lists: [...s.lists, emptySub()] })}
                              className="flex items-center justify-center gap-1.5 p-3 sm:p-2.5 rounded-[10px] border border-dashed border-white/[.14] font-mono text-[11px] tracking-[.08em] uppercase text-jb-muted hover:border-jb-accent hover:text-jb-accent transition"
                            >
                              <Plus size={13} /> Añadir sublista
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={addSection}
                  className="flex items-center justify-center gap-2 p-3.5 rounded-[14px] border border-dashed border-[rgba(52,209,122,.35)] bg-[rgba(52,209,122,.04)] font-mono text-[11.5px] font-semibold tracking-[.1em] uppercase text-jb-accent hover:bg-[rgba(52,209,122,.1)] transition"
                >
                  <Plus size={14} /> Añadir sección
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* footer */}
        <footer className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 px-4 sm:px-6 pt-3 sm:py-3.5 pb-[max(12px,env(safe-area-inset-bottom))] border-t border-white/[.07] bg-jb-band">
          <span role="status" className={`flex items-center gap-2 min-w-0 text-[12.5px] ${saveError || shown.count ? 'text-red-300' : 'text-jb-muted'}`}>
            <span className={`w-[7px] h-[7px] rounded-full shrink-0 ${status.dot}`} />
            <span className="truncate">{status.text}</span>
          </span>
          <div className="flex w-full gap-2 sm:w-auto">
            <button
              type="button"
              onClick={requestClose}
              disabled={saving}
              className="flex-1 sm:flex-none px-4 py-3 sm:py-2.5 rounded-[10px] border border-white/[.12] text-[13.5px] font-semibold text-jb-text hover:bg-white/[.06] disabled:opacity-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-[2] sm:flex-none inline-flex items-center justify-center gap-2 px-[18px] py-3 sm:py-2.5 rounded-[10px] bg-jb-accent text-jb-ink text-[13.5px] font-bold hover:bg-jb-accent-hi disabled:opacity-60 transition"
            >
              <Check size={15} strokeWidth={2.2} />
              {saving ? 'Guardando…' : isNew ? 'Crear página' : 'Guardar cambios'}
            </button>
          </div>
        </footer>
      </form>
    </div>
  );
}
