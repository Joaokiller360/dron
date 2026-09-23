'use client'

import { useState, ReactNode } from 'react';
import { Plus, Trash2, ChevronRight } from 'lucide-react';
import type { ServicePageData } from './lib/api';

/**
 * Structured editor for the PageServices prop tree stored on a full service
 * page (isPage). Arrays of strings are edited as textareas (one item per line);
 * arrays of objects use small add/remove repeaters. Mirrors the shape rendered
 * by <PageServices> in app/utils/cards.
 */

type Btn = { label: string; href: string };
type ListItem = { label?: string; text?: string[] };

const input =
  'w-full px-3 py-2 rounded-xl bg-jb-bg border border-white/15 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-jb-accent/60 focus:border-transparent';
const label = 'font-mono text-xs font-semibold uppercase tracking-wide text-white/80';
const card = 'p-4 space-y-3 rounded-xl bg-jb-bg border border-white/10';
const subCard = 'p-3 space-y-2 rounded-lg bg-jb-card border border-white/10';

const linesToArr = (v: string) =>
  v.split('\n').map((l) => l.trim()).filter(Boolean);
const arrToLines = (a?: string[]) => (a ?? []).join('\n');

const linesToBtns = (v: string): Btn[] =>
  v
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [lab, href] = l.split('|').map((s) => s.trim());
      return { label: lab ?? '', href: href ?? '' };
    });
const btnsToLines = (b?: Btn[]) =>
  (b ?? []).map((x) => `${x.label} | ${x.href}`).join('\n');

function AddBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wide text-black transition rounded-full bg-jb-accent hover:bg-white"
    >
      <Plus size={13} />
      {children}
    </button>
  );
}

function DelBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Quitar"
      className="inline-flex items-center justify-center text-red-400 transition rounded-full w-7 h-7 bg-jb-card hover:bg-red-500 hover:text-white shrink-0"
    >
      <Trash2 size={13} />
    </button>
  );
}

// Collapsible section. Starts open when it already holds content, so editing an
// existing page shows what's filled and hides the empty parts.
function Section({
  title,
  action,
  defaultOpen = false,
  children,
}: {
  title: string;
  action?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={card}>
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center flex-1 gap-2 text-left"
        >
          <ChevronRight
            size={14}
            className={`transition-transform shrink-0 ${open ? 'rotate-90' : ''}`}
          />
          <h4 className="font-mono text-sm font-bold uppercase">{title}</h4>
        </button>
        {open && action}
      </div>
      {open && <div className="space-y-3">{children}</div>}
    </div>
  );
}

function Field({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint: string;
}) {
  return (
    <label className="block space-y-1">
      <span className={label}>{hint}</span>
      {children}
    </label>
  );
}

// Repeater of {label?, text?: string[]} — used by Content.list and CalltoAction.list
function ListEditor({
  value,
  onChange,
}: {
  value?: ListItem[];
  onChange: (v: ListItem[]) => void;
}) {
  const items = value ?? [];
  const set = (i: number, patch: Partial<ListItem>) =>
    onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  return (
    <div className="space-y-2">
      <span className={`${label} mr-3`}>sublistas</span>
      {items.map((it, i) => (
        <div key={i} className={subCard}>
          <div className="flex items-start gap-2">
            <input
              className={input}
              placeholder="Título del sublistas (opcional)"
              value={it.label ?? ''}
              onChange={(e) => set(i, { label: e.target.value })}
            />
            <DelBtn onClick={() => onChange(items.filter((_, idx) => idx !== i))} />
          </div>
          <textarea
            className={input}
            rows={3}
            placeholder="Un ítem por línea"
            value={arrToLines(it.text)}
            onChange={(e) => set(i, { text: linesToArr(e.target.value) })}
          />
        </div>
      ))}
      <AddBtn onClick={() => onChange([...items, {}])}>sublista</AddBtn>
    </div>
  );
}

export default function ServicePageEditor({
  value,
  onChange,
}: {
  value: ServicePageData;
  onChange: (v: ServicePageData) => void;
}) {
  const v = value;
  const patch = (p: Partial<ServicePageData>) => onChange({ ...v, ...p });

  const hero = v.D?.[0] ?? {};
  const setHero = (p: Partial<{ imagen: string; label: string; title: string }>) =>
    patch({ D: [{ ...hero, ...p }] });

  const content = v.Content ?? [];
  const setContent = (i: number, p: Partial<(typeof content)[number]>) =>
    patch({ Content: content.map((c, idx) => (idx === i ? { ...c, ...p } : c)) });

  const cta = v.CalltoAction ?? [];
  const setCta = (i: number, p: Partial<(typeof cta)[number]>) =>
    patch({ CalltoAction: cta.map((c, idx) => (idx === i ? { ...c, ...p } : c)) });

  const example = v.Example ?? [];
  const setExample = (i: number, p: Partial<(typeof example)[number]>) =>
    patch({ Example: example.map((c, idx) => (idx === i ? { ...c, ...p } : c)) });

  const galery = v.galery ?? [];
  const setGalery = (i: number, p: Partial<(typeof galery)[number]>) =>
    patch({ galery: galery.map((g, idx) => (idx === i ? { ...g, ...p } : g)) });

  const P = v.P ?? [];
  const setP = (i: number, p: Partial<(typeof P)[number]>) =>
    patch({ P: P.map((x, idx) => (idx === i ? { ...x, ...p } : x)) });

  const anims = v.Animations ?? [];

  return (
    <div className="space-y-3">
      <Section title="Hero" defaultOpen={!!(hero.imagen || hero.title || hero.label)}>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field hint="Imagen (clave Cloudinary)">
            <input
              className={input}
              placeholder="grabacion-cine"
              value={hero.imagen ?? ''}
              onChange={(e) => setHero({ imagen: e.target.value })}
            />
          </Field>
          <Field hint="Label">
            <input
              className={input}
              placeholder="Servicios"
              value={hero.label ?? ''}
              onChange={(e) => setHero({ label: e.target.value })}
            />
          </Field>
          <Field hint="Título">
            <input
              className={input}
              placeholder="grabación de cine, series y películas"
              value={hero.title ?? ''}
              onChange={(e) => setHero({ title: e.target.value })}
            />
          </Field>
        </div>
      </Section>

      <Section
        title="Palabras resaltadas"
        defaultOpen={
          (v.keyword?.length ?? 0) > 0 ||
          Object.keys(v.keywordLink ?? {}).length > 0
        }
      >
        <Field hint="Palabras a resaltar en el texto (una por línea)">
          <textarea
            className={input}
            rows={3}
            value={arrToLines(v.keyword)}
            onChange={(e) => patch({ keyword: linesToArr(e.target.value) })}
          />
        </Field>
        <Field hint="Links de palabras — formato: palabra | https://url (una por línea)">
          <textarea
            className={input}
            rows={3}
            value={Object.entries(v.keywordLink ?? {})
              .map(([k, val]) => `${k} | ${val}`)
              .join('\n')}
            onChange={(e) =>
              patch({
                keywordLink: Object.fromEntries(
                  e.target.value
                    .split('\n')
                    .map((l) => l.split('|').map((s) => s.trim()))
                    .filter((p) => p[0] && p[1])
                    .map((p) => [p[0], p[1]]),
                ),
              })
            }
          />
        </Field>
      </Section>

      <Section
        title="Bloques de contenido"
        defaultOpen={content.length > 0}
        action={<AddBtn onClick={() => patch({ Content: [...content, {}] })}>Bloque</AddBtn>}
      >
        {content.map((c, i) => (
          <div key={i} className={subCard}>
            <div className="flex items-center justify-between">
              <span className={label}>Bloque {i + 1}</span>
              <DelBtn
                onClick={() => patch({ Content: content.filter((_, idx) => idx !== i) })}
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                className={input}
                placeholder="Label"
                value={c.label ?? ''}
                onChange={(e) => setContent(i, { label: e.target.value })}
              />
              <input
                className={input}
                placeholder="Subtítulo"
                value={c.subTitle ?? ''}
                onChange={(e) => setContent(i, { subTitle: e.target.value })}
              />
            </div>
            <textarea
              className={input}
              rows={4}
              placeholder="Párrafos — uno por línea"
              value={arrToLines(c.text)}
              onChange={(e) => setContent(i, { text: linesToArr(e.target.value) })}
            />
            <ListEditor value={c.list} onChange={(list) => setContent(i, { list })} />
          </div>
        ))}
      </Section>

      <Section
        title="Galería principal"
        defaultOpen={galery.length > 0}
        action={<AddBtn onClick={() => patch({ galery: [...galery, {}] })}>Ítem</AddBtn>}
      >
        {galery.map((g, i) => (
          <div key={i} className={`${subCard} grid gap-2 sm:grid-cols-2`}>
            <input
              className={input}
              placeholder="video (clave Cloudinary)"
              value={g.video ?? ''}
              onChange={(e) => setGalery(i, { video: e.target.value })}
            />
            <input
              className={input}
              placeholder="imagen (clave Cloudinary)"
              value={g.imagen ?? ''}
              onChange={(e) => setGalery(i, { imagen: e.target.value })}
            />
            <input
              className={input}
              placeholder="label"
              value={g.label ?? ''}
              onChange={(e) => setGalery(i, { label: e.target.value })}
            />
            <div className="flex items-center gap-2">
              <input
                className={input}
                placeholder="ref (id de Instagram, opcional)"
                value={g.ref ?? ''}
                onChange={(e) => setGalery(i, { ref: e.target.value })}
              />
              <DelBtn
                onClick={() => patch({ galery: galery.filter((_, idx) => idx !== i) })}
              />
            </div>
          </div>
        ))}
      </Section>

      <Section
        title="Párrafos con botones (P)"
        defaultOpen={P.length > 0}
        action={<AddBtn onClick={() => patch({ P: [...P, {}] })}>Bloque</AddBtn>}
      >
        {P.map((x, i) => (
          <div key={i} className={subCard}>
            <div className="flex items-start gap-2">
              <textarea
                className={input}
                rows={2}
                placeholder="Texto (opcional)"
                value={x.text ?? ''}
                onChange={(e) => setP(i, { text: e.target.value })}
              />
              <DelBtn onClick={() => patch({ P: P.filter((_, idx) => idx !== i) })} />
            </div>
            <textarea
              className={input}
              rows={2}
              placeholder="Botones — label | href (uno por línea)"
              value={btnsToLines(x.buttons)}
              onChange={(e) => setP(i, { buttons: linesToBtns(e.target.value) })}
            />
          </div>
        ))}
      </Section>

      <Section
        title="Call to action"
        defaultOpen={cta.length > 0}
        action={<AddBtn onClick={() => patch({ CalltoAction: [...cta, {}] })}>Bloque</AddBtn>}
      >
        {cta.map((c, i) => (
          <div key={i} className={subCard}>
            <div className="flex items-center justify-between">
              <span className={label}>CTA {i + 1}</span>
              <DelBtn
                onClick={() =>
                  patch({ CalltoAction: cta.filter((_, idx) => idx !== i) })
                }
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                className={input}
                placeholder="callToAction (título grande)"
                value={c.callToAction ?? ''}
                onChange={(e) => setCta(i, { callToAction: e.target.value })}
              />
              <input
                className={input}
                placeholder="SubTitle"
                value={c.SubTitle ?? ''}
                onChange={(e) => setCta(i, { SubTitle: e.target.value })}
              />
            </div>
            <textarea
              className={input}
              rows={3}
              placeholder="text — un párrafo por línea"
              value={arrToLines(c.text)}
              onChange={(e) => setCta(i, { text: linesToArr(e.target.value) })}
            />
            <textarea
              className={input}
              rows={2}
              placeholder="text2 — un párrafo por línea (opcional)"
              value={arrToLines(c.text2)}
              onChange={(e) => setCta(i, { text2: linesToArr(e.target.value) })}
            />
            <ListEditor value={c.list} onChange={(list) => setCta(i, { list })} />
            <textarea
              className={input}
              rows={2}
              placeholder="Botones — label | href (uno por línea)"
              value={btnsToLines(c.buttons)}
              onChange={(e) => setCta(i, { buttons: linesToBtns(e.target.value) })}
            />
          </div>
        ))}
      </Section>

      <Section
        title="Ejemplos"
        defaultOpen={example.length > 0}
        action={<AddBtn onClick={() => patch({ Example: [...example, {}] })}>Ejemplo</AddBtn>}
      >
        {example.map((c, i) => {
          const gal = c.Galeria ?? [];
          const setGal = (gi: number, p: Partial<(typeof gal)[number]>) =>
            setExample(i, {
              Galeria: gal.map((g, idx) => (idx === gi ? { ...g, ...p } : g)),
            });
          return (
            <div key={i} className={subCard}>
              <div className="flex items-center justify-between">
                <span className={label}>Ejemplo {i + 1}</span>
                <DelBtn
                  onClick={() =>
                    patch({ Example: example.filter((_, idx) => idx !== i) })
                  }
                />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  className={input}
                  placeholder="label"
                  value={c.label ?? ''}
                  onChange={(e) => setExample(i, { label: e.target.value })}
                />
                <input
                  className={input}
                  placeholder="subTitle"
                  value={c.subTitle ?? ''}
                  onChange={(e) => setExample(i, { subTitle: e.target.value })}
                />
              </div>
              <textarea
                className={input}
                rows={3}
                placeholder="text — un párrafo por línea"
                value={arrToLines(c.text)}
                onChange={(e) => setExample(i, { text: linesToArr(e.target.value) })}
              />
              <textarea
                className={input}
                rows={2}
                placeholder="Botones — label | href (uno por línea)"
                value={btnsToLines(c.buttons)}
                onChange={(e) => setExample(i, { buttons: linesToBtns(e.target.value) })}
              />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={label}>Galería del ejemplo</span>
                  <AddBtn
                    onClick={() => setExample(i, { Galeria: [...gal, {}] })}
                  >
                    Ítem
                  </AddBtn>
                </div>
                {gal.map((g, gi) => (
                  <div key={gi} className="grid gap-2 p-2 rounded-lg bg-jb-bg sm:grid-cols-2">
                    <input
                      className={input}
                      placeholder="video (clave Cloudinary)"
                      value={g.video ?? ''}
                      onChange={(e) => setGal(gi, { video: e.target.value })}
                    />
                    <input
                      className={input}
                      placeholder="urlImg (clave Cloudinary)"
                      value={g.urlImg ?? ''}
                      onChange={(e) => setGal(gi, { urlImg: e.target.value })}
                    />
                    <input
                      className={input}
                      placeholder="label"
                      value={g.label ?? ''}
                      onChange={(e) => setGal(gi, { label: e.target.value })}
                    />
                    <div className="flex items-center gap-2">
                      <input
                        className={input}
                        placeholder="href (opcional)"
                        value={g.href ?? ''}
                        onChange={(e) => setGal(gi, { href: e.target.value })}
                      />
                      <DelBtn
                        onClick={() =>
                          setExample(i, {
                            Galeria: gal.filter((_, idx) => idx !== gi),
                          })
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </Section>

      <Section
        title="Animaciones Lottie"
        defaultOpen={anims.length > 0}
        action={<AddBtn onClick={() => patch({ Animations: [...anims, {}] })}>Animación</AddBtn>}
      >
        {anims.map((a, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              className={input}
              placeholder="src (ej. cityFlight, businessAdvisory)"
              value={a.src ?? ''}
              onChange={(e) =>
                patch({
                  Animations: anims.map((x, idx) =>
                    idx === i ? { src: e.target.value } : x,
                  ),
                })
              }
            />
            <DelBtn
              onClick={() =>
                patch({ Animations: anims.filter((_, idx) => idx !== i) })
              }
            />
          </div>
        ))}
      </Section>
    </div>
  );
}
