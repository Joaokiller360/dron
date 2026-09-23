'use client'

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { PageHero, Shot, usePrefix, localized, btnPrimary, type PublicProject } from '@/app/component';

const UNCATEGORIZED = '__uncat__';

function youtubeEmbed(url: string) {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}?autoplay=1` : null;
}

function isVideoFile(url: string) {
  return /\.(mp4|webm|mov)(\?|$)/i.test(url) || /\/video\/upload\//.test(url);
}

function Media({ project, title }: { project: PublicProject; title: string }) {
  const href = project.href ?? '';
  const embed = href ? youtubeEmbed(href) : null;
  if (embed) {
    return (
      <iframe
        src={embed}
        title={title}
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        className="w-full border-0 aspect-video"
      />
    );
  }
  if (href && isVideoFile(href)) {
    return <video src={href} poster={project.coverUrl} controls autoPlay playsInline className="w-full bg-black aspect-video" />;
  }
  return <Shot src={project.coverUrl} alt={title} label={title} labelPosition="center" className="aspect-video" />;
}

export default function PortfolioClient({ projects }: { projects: PublicProject[] }) {
  const t = useTranslations('site.portfolio');
  const c = useTranslations('site.common');
  const locale = useLocale();
  const prefix = usePrefix();
  const [filter, setFilter] = useState<string>('all');
  const [open, setOpen] = useState<PublicProject | null>(null);

  // Categories in dashboard order; projects whose category was deleted go to "Otros"
  const categories = useMemo(() => {
    const map = new Map<string, { id: string; name: string; sortOrder: number }>();
    for (const p of projects) {
      const cat = p.category ?? { id: UNCATEGORIZED, name: t('other'), sortOrder: 9999 };
      if (!map.has(cat.id)) map.set(cat.id, cat);
    }
    return [...map.values()].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [projects, t]);

  const list =
    filter === 'all' ? projects : projects.filter((p) => (p.category?.id ?? UNCATEGORIZED) === filter);

  // Deep links (/portfolio#slug, used from the home page) open that project
  useEffect(() => {
    const fromHash = () => {
      const slug = decodeURIComponent(window.location.hash.slice(1));
      const match = slug && projects.find((p) => p.slug === slug);
      if (match) setOpen(match);
    };
    const frame = requestAnimationFrame(fromHash);
    window.addEventListener('hashchange', fromHash);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('hashchange', fromHash);
    };
  }, [projects]);

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

  const filters = [{ id: 'all', name: t('all') }, ...categories];
  const openTitle = open ? localized(locale, open.titleEs, open.titleEn) : '';
  const openDesc = open ? localized(locale, open.descriptionEs ?? '', open.descriptionEn) : '';

  return (
    <div className="bg-jb-bg">
      <PageHero eyebrow={t('eyebrow')} title={t('title')} className="pb-9">
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2 mt-7">
            {filters.map((f) => {
              const on = f.id === filter;
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setFilter(f.id)}
                  className={`border text-sm font-semibold px-4 py-[9px] rounded-full cursor-pointer transition ${
                    on ? 'bg-jb-accent border-jb-accent text-jb-ink' : 'bg-transparent border-white/[.16] text-jb-soft hover:text-white'
                  }`}
                >
                  {f.name}
                </button>
              );
            })}
          </div>
        )}
      </PageHero>

      <section className="px-6 pt-3 pb-[88px]">
        {list.length > 0 ? (
          <div className="max-w-[1180px] mx-auto grid grid-cols-[repeat(auto-fill,minmax(min(280px,100%),1fr))] gap-4">
            {list.map((p) => {
              const title = localized(locale, p.titleEs, p.titleEn);
              return (
                <button
                  key={p.id}
                  id={p.slug}
                  type="button"
                  onClick={() => setOpen(p)}
                  className="p-0 text-left rounded-[14px] overflow-hidden border border-white/[.09] bg-jb-card cursor-pointer hover:border-[rgba(52,209,122,.5)] transition"
                >
                  <Shot src={p.coverUrl} alt={title} label={title} labelPosition="center" className="aspect-[16/10]" />
                  <div className="flex items-center justify-between gap-3 px-4 py-3.5">
                    <span className="flex flex-col min-w-0 gap-1">
                      <span className="text-[15px] font-semibold text-white">{title}</span>
                      {p.descriptionEs && (
                        <span className="font-mono text-[11.5px] text-jb-muted truncate">
                          {localized(locale, p.descriptionEs, p.descriptionEn)}
                        </span>
                      )}
                    </span>
                    <span className="flex-none font-mono text-[10.5px] tracking-[.08em] uppercase text-jb-mint border border-[rgba(52,209,122,.3)] rounded-[5px] px-[7px] py-[3px]">
                      {p.category?.name ?? t('other')}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-white/60">{t('empty')}</p>
        )}
      </section>

      {open && (
        <div
          onClick={() => setOpen(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[rgba(4,12,8,.86)]"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={openTitle}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[960px] max-h-[calc(100vh-48px)] overflow-y-auto rounded-[18px] bg-jb-card border border-white/[.12]"
          >
            <Media project={open} title={openTitle} />
            <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
              <div className="min-w-0">
                <div className="text-[19px] font-bold text-white">{openTitle}</div>
                <div className="font-mono text-xs text-jb-muted mt-1">
                  {[openDesc, open.category?.name ?? t('other')].filter(Boolean).join(' · ')}
                </div>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {open.href && !youtubeEmbed(open.href) && !isVideoFile(open.href) && (
                  <a
                    href={open.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-jb-text hover:text-white border border-white/20 text-sm px-[18px] py-[11px] rounded-[10px] hover:bg-white/[.07]"
                  >
                    {t('watch')}
                  </a>
                )}
                <Link href={`${prefix}/contact`} className={`${btnPrimary} text-sm px-[18px] py-[11px]`}>
                  {t('want')}
                </Link>
                <button
                  type="button"
                  onClick={() => setOpen(null)}
                  className="bg-transparent text-jb-text border border-white/20 text-sm px-[18px] py-[11px] rounded-[10px] cursor-pointer hover:bg-white/[.07]"
                >
                  {c('close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
