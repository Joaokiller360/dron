'use client'

import { Plus, X } from 'lucide-react';
import { Link, LinkPlatform, LINK_PLATFORMS } from './lib/api';
import { btn, iconBtnCls, inputCls } from './ui';

/** Editable list of social/contact links (platform + URL). */
export default function LinksEditor({ value, onChange }: { value: Link[]; onChange: (links: Link[]) => void }) {
  const setAt = (i: number, patch: Partial<Link>) => onChange(value.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-[10.5px] font-semibold tracking-[.12em] uppercase text-jb-muted">Enlaces</span>
      {value.map((l, i) => (
        <div key={i} className="flex gap-2">
          <select
            aria-label="Plataforma"
            value={l.platform}
            onChange={(e) => setAt(i, { platform: e.target.value as LinkPlatform })}
            className={`${inputCls} !w-36 flex-none`}
          >
            {LINK_PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <input
            required
            type="url"
            aria-label="URL"
            value={l.url}
            onChange={(e) => setAt(i, { url: e.target.value })}
            placeholder="https://…"
            className={inputCls}
          />
          <button type="button" aria-label="Quitar enlace" onClick={() => onChange(value.filter((_, j) => j !== i))} className={`${iconBtnCls} flex-none self-center`}>
            <X size={15} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...value, { platform: 'instagram', url: '' }])}
        className={`${btn.subtle} self-start -ml-2`}
      >
        <Plus size={15} /> Añadir enlace
      </button>
    </div>
  );
}
