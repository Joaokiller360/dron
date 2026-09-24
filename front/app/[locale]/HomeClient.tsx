'use client'

import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import {
  Eyebrow,
  SectionTitle,
  Shot,
  ContactForm,
  usePrefix,
  localized,
  btnPrimary,
  btnGhost,
  useContactInfo,
  ProjectShot,
  storeHeader,
  bestDeal,
  dealBadge,
  type PublicService,
  type PublicProject,
  type PublicPromotions,
  type PublicStore,
} from '@/app/component';
import { useMoney } from './(site)/store/cart';

const BAR_KEY = 'jb-promo-bar-dismissed';
const SSR = '__ssr__';
const noopSubscribe = () => () => {};
const readDismissed = () => {
  try {
    return window.sessionStorage.getItem(BAR_KEY);
  } catch {
    return null; // storage blocked: just show the bar
  }
};

export default function HomeClient({
  services,
  projects,
  promotions,
  store,
}: {
  services: PublicService[];
  projects: PublicProject[];
  promotions: PublicPromotions | null;
  /** Store settings and the first products; null hides the section */
  store: Pick<PublicStore, 'settings' | 'products'> | null;
}) {
  const t = useTranslations('site.home');
  const c = useTranslations('site.common');
  const locale = useLocale();
  const prefix = usePrefix();
  const contact = useContactInfo();
  const stats = t.raw('stats') as { value: string; label: string }[];
  const reasons = t.raw('reasons') as { title: string; body: string }[];

  const st = useTranslations('store');
  const money = useMoney();
  const storeText = store ? storeHeader(store.settings, locale, st) : null;

  const p = useTranslations('site.home.promo');
  const promos = promotions?.settings.enabled ? promotions.items : [];
  const settings = promotions?.settings;
  const badgeBySlug = new Map(
    settings?.badges ? promos.filter((x) => x.serviceSlug && x.badge).map((x) => [x.serviceSlug!, x.badge!]) : [],
  );
  const lead = promos[0];

  // The bar stays closed for the session once dismissed, until the lead offer
  // changes. Server render keeps it hidden so dismissed visitors never see a flash.
  const dismissedId = useSyncExternalStore(noopSubscribe, readDismissed, () => SSR);
  const [closedNow, setClosedNow] = useState(false);
  const barClosed = closedNow || dismissedId === SSR || (!!lead && dismissedId === lead.id);
  const closeBar = () => {
    setClosedNow(true);
    try {
      if (lead) window.sessionStorage.setItem(BAR_KEY, lead.id);
    } catch {
      // ignore
    }
  };
  const showBar = !!settings?.bar && !!lead && !barClosed;

  const serviceHref = (s: PublicService) =>
    s.isPage ? `${prefix}/services/${s.slug}` : s.href || `${prefix}/services#${s.slug}`;

  return (
    <div className="overflow-x-hidden bg-jb-bg">
      {showBar && lead && (
        <div className="relative flex flex-wrap items-center justify-center gap-x-[18px] gap-y-2 py-[11px] pl-5 pr-14 bg-jb-accent text-jb-ink animate-jb-fade">
          <span className="font-mono text-[11px] font-bold tracking-[.14em] uppercase px-2 py-[3px] border border-[rgba(5,24,13,.45)] rounded">
            {p('tag')}
          </span>
          <span className="text-[14.5px] font-semibold">
            {lead.title}
            {lead.price && ` — ${lead.price}`}
            {lead.oldPrice && ` (${p('before')} ${lead.oldPrice})`}
          </span>
          {settings?.section && (
            <a href="#promociones" className="font-mono text-xs font-bold tracking-[.08em] uppercase text-jb-ink hover:text-jb-ink border-b-2 border-[rgba(5,24,13,.5)] hover:opacity-70">
              {p('see')}
            </a>
          )}
          <button
            type="button"
            onClick={closeBar}
            aria-label={p('close')}
            className="absolute flex items-center justify-center -translate-y-1/2 border-0 rounded-full cursor-pointer right-3.5 top-1/2 w-[26px] h-[26px] bg-[rgba(5,24,13,.14)] hover:bg-[rgba(5,24,13,.3)] text-jb-ink"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* HERO */}
      <section
        id="inicio"
        className="px-6 pt-[92px] pb-20 bg-[radial-gradient(900px_420px_at_50%_-10%,rgba(52,209,122,.15),transparent_70%)]"
      >
        <div className="max-w-[1180px] mx-auto grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] gap-14 items-center">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 font-mono text-[11.5px] tracking-[.2em] uppercase text-jb-mint border border-[rgba(111,227,163,.3)] rounded-full px-3.5 py-1.5 mb-[26px]">
              {t('location')}
            </div>
            <h1 className="m-0 mb-5 font-mono text-[clamp(32px,5vw,56px)] leading-[1.05] font-bold tracking-[-.03em] text-white text-balance">
              {t('title')}
            </h1>
            <p className="m-0 mb-8 text-[17px] leading-[1.65] text-jb-soft max-w-[520px] text-pretty">{t('intro')}</p>
            <div className="flex flex-wrap gap-3 mb-[38px]">
              <a href="#contacto" className={`${btnPrimary} text-[15px] px-6 py-3.5 rounded-[11px]`}>
                {t('ctaQuote')}
              </a>
              <Link href={`${prefix}/portfolio`} className={`${btnGhost} text-[15px] px-6 py-3.5`}>
                {t('ctaReel')}
              </Link>
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(110px,1fr))] gap-5 border-t border-white/[.09] pt-6 max-w-[520px]">
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="font-mono text-[26px] font-bold text-white">{s.value}</div>
                  <div className="text-[12.5px] text-jb-muted leading-[1.4]">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative min-w-0">
            <div className="relative aspect-[4/3] rounded-[20px] overflow-hidden border border-white/10 jb-stripes flex items-end p-5">
              <DotLottieReact src="/animation/dron_animate.json" loop autoplay className="absolute inset-0 w-full h-full" />
              <span className="relative font-mono text-[11.5px] tracking-[.12em] uppercase text-jb-muted bg-[rgba(10,28,18,.75)] px-[11px] py-[7px] rounded-[7px]">
                {t('frame')}
              </span>
            </div>
            <div className="absolute -bottom-[22px] -left-3.5 bg-jb-card border border-white/10 rounded-[14px] px-[18px] py-3.5 flex items-center gap-3 animate-jb-float">
              <span className="w-[9px] h-[9px] rounded-full bg-jb-accent" />
              <span className="font-mono text-xs text-jb-text">{t('badge')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* PROMOCIONES */}
      {settings?.section && promos.length > 0 && (
        <section id="promociones" className="px-6 py-[74px] bg-jb-band border-y border-white/[.06] scroll-mt-16">
          <div className="max-w-[1180px] mx-auto">
            <div className="flex flex-wrap items-end justify-between gap-6 mb-[34px]">
              <div>
                <Eyebrow className="mb-3">{p('eyebrow')}</Eyebrow>
                <SectionTitle>{p('title')}</SectionTitle>
              </div>
              <div className="flex items-center gap-2.5 font-mono text-[12.5px] text-jb-soft">
                <span className="w-2 h-2 rounded-full bg-jb-accent" />
                {p('count', { count: promos.length })}
              </div>
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(275px,100%),1fr))] gap-[18px]">
              {promos.map((promo) => (
                <article
                  key={promo.id}
                  className="flex flex-col gap-3.5 p-[26px] rounded-2xl bg-jb-card border border-[rgba(52,209,122,.22)] animate-jb-fade"
                >
                  <div className="flex items-center justify-between gap-3">
                    {promo.badge ? (
                      <span className="font-mono text-[10.5px] font-bold tracking-[.14em] uppercase text-jb-ink bg-jb-accent px-[9px] py-1 rounded-[5px]">
                        {promo.badge}
                      </span>
                    ) : (
                      <span />
                    )}
                    {promo.untilLabel && <span className="font-mono text-[11.5px] text-jb-muted">{promo.untilLabel}</span>}
                  </div>
                  <h3 className="m-0 text-xl font-bold text-white tracking-[-.01em]">{promo.title}</h3>
                  {promo.detail && <p className="m-0 flex-1 text-[14.5px] leading-[1.6] text-jb-soft text-pretty">{promo.detail}</p>}
                  {promo.price && (
                    <div className="flex items-baseline gap-2.5">
                      <span className="font-mono text-[27px] font-bold text-white">{promo.price}</span>
                      {promo.oldPrice && <span className="text-sm line-through text-jb-muted">{promo.oldPrice}</span>}
                    </div>
                  )}
                  <a
                    href="#contacto"
                    className="text-center bg-[rgba(52,209,122,.14)] text-jb-mint hover:bg-jb-accent hover:text-jb-ink font-bold text-sm p-3 rounded-[10px] border border-[rgba(52,209,122,.3)] transition"
                  >
                    {p('book')}
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SERVICIOS */}
      {services.length > 0 && (
        <section id="servicios" className="px-6 py-[86px]">
          <div className="max-w-[1180px] mx-auto">
            <Eyebrow className="mb-3">{t('servicesEyebrow')}</Eyebrow>
            <SectionTitle className="mb-3">{t('servicesTitle')}</SectionTitle>
            <p className="m-0 mb-9 text-base text-jb-soft max-w-[560px] leading-[1.6]">{t('servicesIntro')}</p>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
              {services.map((s) => {
                const title = localized(locale, s.titleEs, s.titleEn);
                return (
                  <Link
                    key={s.id}
                    href={serviceHref(s)}
                    className="relative flex flex-col overflow-hidden border rounded-2xl border-white/[.09] bg-jb-card hover:border-[rgba(52,209,122,.45)] transition"
                  >
                    <Shot src={s.coverUrl} alt={title} label={title} className="aspect-[4/3]" />
                    {badgeBySlug.get(s.slug) && (
                      <span className="absolute top-3 right-3 font-mono text-[11px] font-bold tracking-[.06em] text-jb-ink bg-jb-accent px-2.5 py-[5px] rounded-md">
                        {badgeBySlug.get(s.slug)}
                      </span>
                    )}
                    <div className="flex flex-col flex-1 gap-2 px-5 pt-[18px] pb-[22px]">
                      <h3 className="m-0 text-lg font-bold text-white">{title}</h3>
                      <p className="m-0 flex-1 text-sm leading-[1.55] text-jb-soft text-pretty line-clamp-3">
                        {localized(locale, s.descriptionEs ?? '', s.descriptionEn)}
                      </p>
                      <span className="font-mono text-xs text-jb-mint">{c('viewMore')} →</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* PRODUCTOS: follows the services grid without a second gap (full padding when there are no services) */}
      {store && storeText && (
        <section id="productos" className={`px-6 pb-[86px] ${services.length > 0 ? 'pt-0' : 'pt-[86px]'}`}>
          <div className="max-w-[1180px] mx-auto">
            <Eyebrow className="mb-3">{storeText.eyebrow}</Eyebrow>
            <div className="flex flex-wrap items-end justify-between gap-4 mb-3">
              <SectionTitle>{storeText.title}</SectionTitle>
              <Link href={`${prefix}/store`} className="font-mono text-xs tracking-[.08em] uppercase text-jb-mint hover:text-jb-accent-hi">
                {t('storeAll')}
              </Link>
            </div>
            <p className="m-0 mb-9 text-base text-jb-soft max-w-[560px] leading-[1.6] text-pretty">{storeText.intro}</p>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(230px,100%),1fr))] gap-4">
              {store.products.map((pr) => {
                const name = localized(locale, pr.nameEs, pr.nameEn);
                const soldOut = pr.stock !== null && pr.stock <= 0;
                const deal = pr.priceCents !== null ? bestDeal(pr.priceCents, pr.discounts) : null;
                const before = deal ? pr.priceCents : pr.compareAtCents;
                return (
                  <Link
                    key={pr.id}
                    href={`${prefix}/store/${pr.slug}`}
                    className="group flex flex-col overflow-hidden border rounded-[14px] border-white/[.09] bg-jb-card hover:border-[rgba(52,209,122,.5)] transition"
                  >
                    <div className="relative overflow-hidden">
                      <Shot
                        src={pr.coverUrl}
                        alt={name}
                        label={name}
                        labelPosition="center"
                        className={`aspect-[4/3] ${soldOut ? 'opacity-50' : ''}`}
                        imgClassName="transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                      {soldOut && (
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 font-mono text-[11px] font-bold tracking-[.08em] uppercase text-white">
                          {st('soldOut')}
                        </span>
                      )}
                      {deal && (
                        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-jb-accent font-mono text-[11px] font-bold tracking-[.06em] text-jb-ink">
                          {dealBadge(deal.discount, money)}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col flex-1 gap-1.5 px-4 py-3.5">
                      <div className="text-[15px] font-semibold leading-snug text-white">{name}</div>
                      <div className="mt-auto">
                        {pr.priceCents !== null ? (
                          <span className="flex items-baseline gap-2">
                            {!!pr.options?.length && <span className="text-[12px] text-jb-muted">{st('from')}</span>}
                            <span className="font-mono text-[16px] font-bold text-white">{money(deal?.unitCents ?? pr.priceCents)}</span>
                            {before ? <s className="font-mono text-[12px] text-jb-muted">{money(before)}</s> : null}
                          </span>
                        ) : (
                          <span className="text-[13px] text-jb-soft">{st('askPrice')}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* POR QUÉ */}
      <section id="porque" className="px-6 py-[86px] bg-jb-band border-y border-white/[.06]">
        <div className="max-w-[1180px] mx-auto">
          <SectionTitle className="mb-3.5 max-w-[820px]">{t('whyTitle')}</SectionTitle>
          <p className="m-0 mb-10 text-base leading-[1.65] text-jb-soft max-w-[700px] text-pretty">{t('whyIntro')}</p>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
            {reasons.map((r, i) => (
              <div key={r.title} className="flex flex-col gap-2.5 p-6 rounded-[14px] bg-jb-card border border-white/[.08]">
                <span className="font-mono text-xs text-jb-accent tracking-[.1em]">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="m-0 text-[16.5px] font-bold text-white">{r.title}</h3>
                <p className="m-0 text-sm leading-[1.55] text-jb-soft text-pretty">{r.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRABAJOS */}
      {projects.length > 0 && (
        <section id="trabajos" className="px-6 py-[86px]">
          <div className="max-w-[1180px] mx-auto">
            <Eyebrow className="mb-3">{t('worksEyebrow')}</Eyebrow>
            <div className="flex flex-wrap items-end justify-between gap-4 mb-9">
              <SectionTitle>{t('worksTitle')}</SectionTitle>
              <Link href={`${prefix}/portfolio`} className="font-mono text-xs tracking-[.08em] uppercase text-jb-mint hover:text-jb-accent-hi">
                {t('worksAll')}
              </Link>
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-4">
              {projects.map((p) => {
                const title = localized(locale, p.titleEs, p.titleEn);
                return (
                  <Link
                    key={p.id}
                    href={`${prefix}/portfolio#${p.slug}`}
                    className="overflow-hidden border rounded-[14px] border-white/[.09] hover:border-[rgba(52,209,122,.5)] transition"
                  >
                    <ProjectShot project={p} title={title} className="aspect-[16/10]" />
                    <div className="px-4 py-3.5 bg-jb-card">
                      <div className="text-[15px] font-semibold text-white">{title}</div>
                      {p.category && <div className="font-mono text-[11.5px] text-jb-muted mt-1">{p.category.name}</div>}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CONTACTO */}
      <section id="contacto" className="px-6 py-[86px] bg-jb-band border-t border-white/[.06] scroll-mt-16">
        <div className="max-w-[1180px] mx-auto grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-12">
          <div className="min-w-0">
            <h2 className="m-0 mb-3.5 font-mono text-[clamp(26px,3.6vw,36px)] font-bold tracking-[-.02em] text-white">
              {t('contactTitle')}
            </h2>
            <p className="m-0 mb-7 text-base leading-[1.65] text-jb-soft max-w-[440px] text-pretty">{t('contactIntro')}</p>
            <div className="flex flex-col gap-3.5 font-mono text-[13.5px] text-jb-text">
              <a href={`mailto:${contact.email}`} className="text-jb-text hover:text-white">{contact.email}</a>
              <div>{contact.phone}</div>
              <div className="text-jb-muted">{t('contactArea')}</div>
            </div>
          </div>
          <ContactForm variant="compact" />
        </div>
      </section>
    </div>
  );
}
