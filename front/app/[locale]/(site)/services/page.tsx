import Link from 'next/link';
import { getLocale, getMessages, getTranslations } from 'next-intl/server';
import { ArrowUpRight, Users, LifeBuoy, ShieldCheck, Palette } from 'lucide-react';
import {
  PageHero,
  Shot,
  fetchPublic,
  localized,
  btnPrimary,
  btnGhost,
  getContactInfo,
  whatsappUrl,
  type PublicService,
} from '@/app/component';

export async function generateMetadata() {
  const messages = await getMessages();
  return {
    title: messages.services?.metadeta?.TitleMeta || 'Servicios con drones | JB.SKYLENS',
    description:
      messages.services?.metadeta?.DescriptionMeta || 'Explora el portafolio de JB.SKYLENS con proyectos reales de fotografía aérea, video con drones, eventos e inspecciones en Ecuador.',
    keywords: [
      messages.services?.metadeta?.keywords
    ],
    canonical: 'https://dron.joaobarres.dev/services',
  };
}

const includedIcons = [Users, LifeBuoy, ShieldCheck, Palette];

export default async function Services() {
  const services = (await fetchPublic<PublicService[]>('/services')) ?? [];
  const t = await getTranslations('site.services');
  const c = await getTranslations('site.common');
  const locale = await getLocale();
  const contact = await getContactInfo();

  // Solo agregar prefijo de idioma si NO es el idioma por defecto (es)
  const prefix = locale === 'es' ? '' : `/${locale}`;
  const steps = t.raw('steps') as { t: string; b: string }[];
  const included = t.raw('included') as { t: string; b: string }[];

  // Full service pages open their own route; simple ones link out (if they have a link)
  const hrefOf = (s: PublicService) => (s.isPage ? `${prefix}/services/${s.slug}` : s.href || null);

  return (
    <div className="bg-jb-bg">
      <PageHero eyebrow={t('eyebrow')} title={t('title')} intro={t('intro')} className="pb-10" />

      {/* Incluido en todos los servicios */}
      <section className="px-6 pb-12">
        <div className="max-w-[1180px] mx-auto">
          <h2 className="sr-only">{t('includedTitle')}</h2>
          <ul className="m-0 p-0 list-none grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-px bg-white/[.08] border border-white/[.08] rounded-2xl overflow-hidden">
            {included.map((item, i) => {
              const Icon = includedIcons[i % includedIcons.length];
              return (
                <li key={item.t} className="flex gap-3.5 p-5 bg-jb-band">
                  <span className="flex items-center justify-center flex-none w-9 h-9 rounded-[10px] bg-[rgba(52,209,122,.12)] text-jb-accent">
                    <Icon size={18} strokeWidth={1.8} />
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <span className="text-[14.5px] font-semibold text-white">{item.t}</span>
                    <span className="text-[13px] leading-[1.5] text-jb-muted">{item.b}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Servicios */}
      <section className="px-6 pb-20">
        {services.length > 0 ? (
          <div className="max-w-[1180px] mx-auto grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => {
              const title = localized(locale, s.titleEs, s.titleEn);
              const description = localized(locale, s.descriptionEs ?? '', s.descriptionEn);
              const href = hrefOf(s);
              const featured = i === 0;
              const body = (
                <>
                  <div className="relative overflow-hidden">
                    <Shot
                      src={s.coverUrl}
                      alt={title}
                      label={title}
                      className={featured ? 'aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-[340px]' : 'aspect-[16/10]'}
                      imgClassName="transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                    />
                    <span className="absolute top-3.5 left-3.5 font-mono text-[11px] font-bold tracking-[.1em] text-white bg-[rgba(10,28,18,.72)] backdrop-blur-sm rounded-md px-2 py-1">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className={`flex flex-col flex-1 gap-2.5 ${featured ? 'p-7 lg:p-9 lg:justify-center' : 'p-6'}`}>
                    <h2
                      className={`m-0 font-bold text-white tracking-[-.01em] ${
                        featured ? 'text-[clamp(22px,2.6vw,30px)] leading-[1.15]' : 'text-[19px] leading-[1.25]'
                      }`}
                    >
                      {title}
                    </h2>
                    {description && (
                      <p
                        className={`m-0 text-jb-soft text-pretty ${
                          featured ? 'text-[15.5px] leading-[1.65]' : 'text-[14px] leading-[1.6] line-clamp-3'
                        }`}
                      >
                        {description}
                      </p>
                    )}
                    {href && (
                      <span className="inline-flex items-center gap-1.5 mt-auto pt-2 font-mono text-xs tracking-[.08em] uppercase text-jb-mint group-hover:text-jb-accent-hi">
                        {t('open')}
                        <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    )}
                  </div>
                </>
              );
              const cardClass = `group scroll-mt-24 flex flex-col overflow-hidden rounded-[18px] border border-white/[.09] bg-jb-card transition duration-200 ${
                featured ? 'sm:col-span-2 lg:col-span-3 lg:grid lg:grid-cols-[1.35fr_1fr]' : ''
              } ${href ? 'hover:border-[rgba(52,209,122,.5)] hover:-translate-y-[3px] focus-visible:outline-2 focus-visible:outline-jb-accent' : ''}`;
              return href ? (
                <Link key={s.id} id={s.slug} href={href} className={cardClass}>
                  {body}
                </Link>
              ) : (
                <article key={s.id} id={s.slug} className={cardClass}>
                  {body}
                </article>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-white/60">{c('empty')}</p>
        )}
      </section>

      {/* Cómo trabajamos */}
      <section className="px-6 py-20 bg-jb-band border-t border-white/[.06]">
        <div className="max-w-[1180px] mx-auto">
          <h2 className="m-0 mb-10 font-mono text-[clamp(26px,3.4vw,36px)] font-bold tracking-[-.02em] text-white">
            {t('stepsTitle')}
          </h2>
          <ol className="relative m-0 p-0 list-none grid gap-8 md:gap-5 md:grid-cols-4">
            {/* Línea que une los pasos (desktop) */}
            <span aria-hidden className="hidden md:block absolute top-[21px] left-[22px] right-[22px] h-px bg-gradient-to-r from-jb-accent/60 via-white/15 to-white/5" />
            {steps.map((st, i) => (
              <li key={st.t} className="relative flex gap-4 md:flex-col md:gap-4">
                <span className="relative z-10 flex items-center justify-center flex-none w-11 h-11 rounded-full border border-[rgba(52,209,122,.45)] bg-jb-band font-mono text-sm font-bold text-jb-accent">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="flex flex-col gap-1.5">
                  <span className="text-[17px] font-bold text-white">{st.t}</span>
                  <span className="text-sm leading-[1.55] text-jb-soft">{st.b}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA final */}
      <section className="px-6 py-20">
        <div className="max-w-[1180px] mx-auto relative overflow-hidden rounded-[22px] border border-[rgba(52,209,122,.28)] bg-jb-card px-7 py-12 sm:px-12 jb-glow">
          <div className="relative flex flex-wrap items-center justify-between gap-8">
            <div className="max-w-[560px]">
              <h2 className="m-0 mb-3 font-mono text-[clamp(22px,3vw,32px)] font-bold tracking-[-.02em] text-white text-balance">
                {t('ctaTitle')}
              </h2>
              <p className="m-0 text-[15.5px] leading-[1.65] text-jb-soft text-pretty">{t('ctaText')}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={`${prefix}/contact`} className={`${btnPrimary} text-[15px] px-6 py-3.5 rounded-[11px]`}>
                {t('ctaButton')}
              </Link>
              <a href={whatsappUrl(contact.phone)} target="_blank" rel="noopener noreferrer" className={`${btnGhost} text-[15px] px-6 py-3.5`}>
                {t('whatsapp')}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
