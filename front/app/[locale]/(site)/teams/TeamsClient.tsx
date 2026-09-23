'use client'
import { useEffect, useState, MouseEvent } from 'react';
import { useTranslations } from 'next-intl';
import { PageHero, Shot, usePrefix, btnPrimary } from '@/app/component';

export interface DbTeamMember {
  id: string;
  slug: string;
  name: string;
  role: string;
  photoUrl: string;
  bio?: string | null;
  story?: string | null;
  stat?: string | null;
  statLabel?: string | null;
  base?: string | null;
  skills?: string[];
  links: { platform: string; url: string }[];
}

export default function TeamsClient({ dbMembers = [] }: { dbMembers?: DbTeamMember[] }) {
  const t = useTranslations('teams.page');
  const c = useTranslations('teams.certs');
  const prefix = usePrefix();
  const certs = c.raw('items') as string[];
  const [open, setOpen] = useState<DbTeamMember | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="min-h-screen bg-jb-bg text-jb-text">
      <PageHero eyebrow={t('eyebrow')} title={t('title')} intro={t('intro')} />

      <section className="px-6 pt-6 pb-20">
        {dbMembers.length > 0 ? (
          <div className="max-w-[1180px] mx-auto grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-[18px]">
            {dbMembers.map((m) => (
              <article
                key={m.id}
                id={m.slug}
                role="button"
                tabIndex={0}
                onClick={() => setOpen(m)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setOpen(m);
                  }
                }}
                className="rounded-2xl overflow-hidden border border-white/[.09] bg-jb-card cursor-pointer transition duration-[180ms] hover:border-[rgba(52,209,122,.5)] hover:-translate-y-[3px] focus-visible:outline-2 focus-visible:outline-jb-accent"
              >
                <Shot src={m.photoUrl} alt={m.name} label={t('portrait')} className="aspect-[4/5]" />
                <div className="flex flex-col gap-1.5 px-5 pt-[18px] pb-[22px]">
                  <h2 className="m-0 text-lg font-bold text-white">{m.name}</h2>
                  <span className="font-mono text-xs text-jb-mint">{m.role}</span>
                  {m.bio && (
                    <p className="mt-1.5 mb-0 text-sm leading-[1.55] text-jb-soft text-pretty">{m.bio}</p>
                  )}
                  <span className="mt-2 font-mono text-[11.5px] tracking-[.08em] uppercase text-jb-mint">
                    {t('more')}
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-center text-white/60">{t('empty')}</p>
        )}
      </section>

      <section className="px-6 py-[72px] bg-jb-band border-t border-white/[.06]">
        <div className="max-w-[1180px] mx-auto grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-10 items-center">
          <div>
            <h2 className="m-0 mb-3.5 font-mono text-[clamp(24px,3.2vw,34px)] font-bold tracking-[-.02em] text-white">
              {c('title')}
            </h2>
            <p className="m-0 max-w-[460px] text-[15.5px] leading-[1.65] text-jb-soft">{c('text')}</p>
          </div>
          <div className="flex flex-col gap-2.5">
            {certs.map((cert) => (
              <div
                key={cert}
                className="flex items-center gap-3.5 px-[18px] py-4 rounded-xl border border-white/[.08] bg-jb-card"
              >
                <span className="w-[9px] h-[9px] rounded-full bg-jb-accent flex-none" />
                <span className="text-[14.5px] text-jb-text">{cert}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {open && (
        <div
          onClick={() => setOpen(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[rgba(4,12,8,.86)] backdrop-blur-md"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={open.name}
            onClick={(e: MouseEvent) => e.stopPropagation()}
            className="relative w-full max-w-[820px] max-h-[calc(100vh-48px)] overflow-y-auto overflow-x-hidden rounded-[20px] bg-jb-card border border-white/[.12] grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] shadow-[0_30px_80px_rgba(0,0,0,.55)]"
          >
            <Shot src={open.photoUrl} alt={open.name} label={`${t('portrait')} · ${open.name}`} className="min-w-0 min-h-[320px]" />
            <div className="flex flex-col min-w-0 gap-4 px-[30px] py-8">
              <div>
                <span className="font-mono text-xs text-jb-mint">{open.role}</span>
                <h2 className="mt-1.5 mb-0 font-mono text-[28px] font-bold tracking-[-.02em] text-white">{open.name}</h2>
              </div>
              {(open.story || open.bio) && (
                <p className="m-0 text-[15px] leading-[1.65] text-jb-soft text-pretty">{open.story || open.bio}</p>
              )}
              {(open.stat || open.base) && (
                <div className="grid grid-cols-2 gap-px overflow-hidden border rounded-xl bg-white/[.08] border-white/[.08]">
                  <div className="bg-jb-band px-4 py-3.5">
                    <div className="font-mono text-xl font-bold text-white">{open.stat || '—'}</div>
                    <div className="mt-0.5 text-xs text-jb-muted">{open.statLabel}</div>
                  </div>
                  <div className="bg-jb-band px-4 py-3.5">
                    <div className="font-mono text-xl font-bold text-white">{open.base || '—'}</div>
                    <div className="mt-0.5 text-xs text-jb-muted">{t('base')}</div>
                  </div>
                </div>
              )}
              {!!open.skills?.length && (
                <div className="flex flex-wrap gap-2">
                  {open.skills.map((sk) => (
                    <span
                      key={sk}
                      className="whitespace-nowrap text-[12.5px] text-jb-text border border-white/[.14] rounded-full px-[11px] py-[5px]"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              )}
              {open.links.length > 0 && (
                <div className="flex flex-wrap gap-3 font-mono text-xs uppercase tracking-[.08em]">
                  {open.links.map((l) => (
                    <a
                      key={l.url}
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-jb-accent-hi hover:text-[#86efac]"
                    >
                      {l.platform} ↗
                    </a>
                  ))}
                </div>
              )}
              <a
                href={`${prefix}/contact`}
                className={`${btnPrimary} mt-1 text-sm p-3`}
              >
                {t('cta')}
              </a>
            </div>
            <button
              type="button"
              onClick={() => setOpen(null)}
              aria-label={t('close')}
              className="absolute top-3 right-3 w-[34px] h-[34px] rounded-full border-0 bg-[rgba(10,28,18,.8)] text-white text-lg cursor-pointer hover:bg-jb-accent hover:text-jb-ink transition"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
