import Link from 'next/link';
import type { ReactNode } from 'react';
import { getLocale, getTranslations } from 'next-intl/server';
import { Check, ChevronRight, ArrowUpRight } from 'lucide-react';
import { highlightText } from '@/app/utils';
import {
  Eyebrow,
  Shot,
  localized,
  btnPrimary,
  btnGhost,
  getContactInfo,
  whatsappUrl,
  type PublicService,
} from '@/app/component';
import LottieClip from './LottieClip';
import MediaGallery, { type GalleryItem } from './MediaGallery';

// Shapes of the `page` JSON edited in the dashboard (ServicePageEditor). Kept
// identical to the old PageServices props so no data migration is needed.
interface ButtonItem { label: string; href: string; target?: '_self' | '_blank' }
interface ListBlock { label?: string; text?: string[] }
interface ContentBlock { label?: string; subTitle?: string; text?: string[]; list?: ListBlock[] }
interface MediaItem { video?: string; imagen?: string; urlImg?: string; label?: string; ref?: string; href?: string }
interface CtaBlock {
  callToAction?: string;
  SubTitle?: string;
  text?: string[];
  text2?: string[];
  buttons?: ButtonItem[];
  list?: ListBlock[];
  Animations?: { src?: string }[];
}
interface ExampleBlock { label?: string; subTitle?: string; text?: string[]; buttons?: ButtonItem[]; Galeria?: MediaItem[] }
export interface ServicePageData {
  D?: { imagen?: string; title?: string; label?: string }[];
  Content?: ContentBlock[];
  keyword?: string[];
  keywordLink?: Record<string, string>;
  galery?: MediaItem[];
  P?: { text?: string; buttons?: ButtonItem[] }[];
  CalltoAction?: CtaBlock[];
  Animations?: { src?: string }[];
  Example?: ExampleBlock[];
}

export interface DetailService extends PublicService {
  page?: ServicePageData | null;
}

const CLOUDINARY = 'https://res.cloudinary.com/dzlavqhid';
const videoUrl = (name: string) => (/^https?:/.test(name) ? name : `${CLOUDINARY}/video/upload/${name}.mp4`);
// First frame of a Cloudinary video as its poster (only for bare Cloudinary ids)
const posterUrl = (name: string) => (/^https?:/.test(name) ? undefined : `${CLOUDINARY}/video/upload/so_0/${name}.jpg`);
const imageUrl = (name: string) => (/^https?:/.test(name) ? name : `${CLOUDINARY}/image/upload/${name}.jpg`);

const arr = <T,>(v: T[] | undefined | null): T[] => (Array.isArray(v) ? v : []);

function SectionHeading({ eyebrow, title }: { eyebrow?: string; title?: string }) {
  return (
    <header className="flex flex-col gap-3">
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      {title && (
        <h2 className="m-0 font-mono text-[clamp(22px,2.8vw,30px)] leading-[1.2] font-bold tracking-[-.02em] text-white text-balance first-letter:uppercase">
          {title}
        </h2>
      )}
    </header>
  );
}

export default async function ServiceDetail({
  service,
  others,
}: {
  service: DetailService;
  others: PublicService[];
}) {
  const t = await getTranslations('site.services.detail');
  const locale = await getLocale();
  const whatsapp = whatsappUrl((await getContactInfo()).phone);
  // Solo agregar prefijo de idioma si NO es el idioma por defecto (es)
  const prefix = locale === 'es' ? '' : `/${locale}`;

  const page = service.page ?? {};
  const keywords = arr(page.keyword).filter(Boolean);
  const links = page.keywordLink ?? {};
  const title = localized(locale, service.titleEs, service.titleEn);
  const lead = localized(locale, service.descriptionEs ?? '', service.descriptionEn);
  const label = page.D?.[0]?.label || t('breadcrumb');
  const cover = service.coverUrl || (page.D?.[0]?.imagen ? imageUrl(page.D[0].imagen) : null);
  const points = t.raw('quotePoints') as string[];

  const rich = (text: string, withLinks = true): ReactNode =>
    keywords.length ? highlightText(text, keywords, withLinks ? links : undefined) : text;
  // Internal links from the page JSON get the locale prefix; external ones open a new tab
  const linkProps = (b: ButtonItem) =>
    b.href.startsWith('/')
      ? { href: `${prefix}${b.href}`, target: b.target }
      : { href: b.href, target: b.target ?? '_blank', rel: 'noopener noreferrer' };

  // "Ahorro de tiempo y dinero: los drones..." → bold lead-in before the colon
  const benefit = (text: string) => {
    const i = text.indexOf(':');
    if (i > 0 && i < 70) {
      return (
        <>
          <strong className="font-semibold text-white">{text.slice(0, i)}.</strong> {rich(text.slice(i + 1).trim())}
        </>
      );
    }
    return rich(text);
  };

  const paragraphs = (items?: string[]) =>
    arr(items).length ? (
      <div className="flex flex-col gap-4">
        {arr(items).map((p, i) => (
          <p key={i} className="m-0 text-[16.5px] leading-[1.75] text-jb-soft text-pretty max-w-[68ch]">
            {rich(p)}
          </p>
        ))}
      </div>
    ) : null;

  const buttons = (items?: ButtonItem[]) =>
    arr(items).length ? (
      <div className="flex flex-wrap gap-3">
        {arr(items).map((b, i) => (
          <a
            key={`${b.href}-${i}`}
            {...linkProps(b)}
            className={`${i === 0 ? btnPrimary : btnGhost} text-sm px-5 py-3 rounded-[10px]`}
          >
            {b.label}
          </a>
        ))}
      </div>
    ) : null;

  // Benefit lists: short items become check chips, long ones check cards
  const lists = (blocks?: ListBlock[]) =>
    arr(blocks).length ? (
      <div className="flex flex-col gap-6">
        {arr(blocks).map((l, i) => {
          const items = arr(l.text);
          const short = items.every((x) => x.length < 60);
          return (
            <div key={i} className="flex flex-col gap-3">
              {l.label && <h3 className="m-0 text-[17px] font-bold text-white">{l.label}</h3>}
              {short ? (
                <ul className="flex flex-wrap gap-2 p-0 m-0 list-none">
                  {items.map((x, j) => (
                    <li key={j} className="inline-flex items-center gap-2 text-[14px] text-jb-text border border-white/[.12] bg-jb-card rounded-full pl-2 pr-3.5 py-1.5">
                      <Check size={14} className="text-jb-accent" strokeWidth={2.5} />
                      {x}
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="grid gap-3 p-0 m-0 list-none md:grid-cols-2">
                  {items.map((x, j) => (
                    <li key={j} className="flex gap-3 p-5 rounded-[14px] bg-jb-card border border-white/[.08]">
                      <span className="flex items-center justify-center flex-none w-6 h-6 mt-0.5 rounded-full bg-[rgba(52,209,122,.14)] text-jb-accent">
                        <Check size={14} strokeWidth={2.5} />
                      </span>
                      <span className="text-[15px] leading-[1.6] text-jb-soft">{benefit(x)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    ) : null;

  const media = (items?: MediaItem[]) => {
    const gallery: GalleryItem[] = arr(items).flatMap((m): GalleryItem[] => {
      const credit = m.ref
        ? `https://www.instagram.com/${m.ref}`
        : m.href
          ? `https://www.instagram.com/reel/${m.href}`
          : null;
      const base = { label: m.label, credit, creditLabel: m.label || t('credit') };
      const img = m.urlImg || m.imagen;
      if (m.video) return [{ ...base, kind: 'video', src: videoUrl(m.video), poster: posterUrl(m.video) }];
      if (img) return [{ ...base, kind: 'image', src: imageUrl(img) }];
      return [];
    });
    return gallery.length ? <MediaGallery items={gallery} /> : null;
  };

  const content = arr(page.Content);
  const examples = arr(page.Example);
  const ctas = arr(page.CalltoAction);
  const hasMedia = arr(page.galery).length > 0 || arr(page.Animations).length > 0;

  return (
    <div className="bg-jb-bg [&_p_a]:text-jb-mint [&_p_a]:decoration-jb-mint/40 [&_p_a:hover]:text-jb-accent-hi">
      {/* HERO */}
      <section className="px-6 pt-8 pb-14 jb-glow">
        <div className="max-w-[1180px] mx-auto">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 mb-10 font-mono text-xs text-jb-muted">
            <Link href={`${prefix}/services`} className="text-jb-muted hover:text-jb-mint">
              {t('breadcrumb')}
            </Link>
            <ChevronRight size={13} />
            <span className="truncate text-jb-soft" aria-current="page">{title}</span>
          </nav>

          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
            <div className="min-w-0">
              <Eyebrow className="mb-4">{label}</Eyebrow>
              <h1 className="m-0 mb-5 font-mono text-[clamp(30px,4.4vw,50px)] leading-[1.07] font-bold tracking-[-.03em] text-white text-balance">
                {title}
              </h1>
              {lead && <p className="m-0 mb-8 text-[17px] leading-[1.65] text-jb-soft max-w-[560px] text-pretty">{lead}</p>}
              <div className="flex flex-wrap gap-3 mb-8">
                <Link href={`${prefix}/contact`} className={`${btnPrimary} text-[15px] px-6 py-3.5 rounded-[11px]`}>
                  {t('quoteButton')}
                </Link>
                <Link href={`${prefix}/portfolio`} className={`${btnGhost} text-[15px] px-6 py-3.5`}>
                  {t('portfolio')}
                </Link>
              </div>
              <ul className="flex flex-wrap p-0 m-0 list-none gap-x-5 gap-y-2">
                {points.map((p) => (
                  <li key={p} className="inline-flex items-center gap-2 text-[13.5px] text-jb-soft">
                    <Check size={15} className="text-jb-accent" strokeWidth={2.5} />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative min-w-0">
              <Shot
                src={cover}
                alt={title}
                label={title}
                className="aspect-[4/3] rounded-[20px] border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,.45)]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CONTENIDO + TARJETA LATERAL */}
      <section className="px-6 pt-6 pb-20">
        <div className="max-w-[1180px] mx-auto grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex flex-col min-w-0 gap-16">
            {content.map((block, i) => (
              <article key={i} className="flex flex-col gap-6">
                <SectionHeading eyebrow={block.label || t('about')} title={block.subTitle} />
                {paragraphs(block.text)}
                {lists(block.list)}
              </article>
            ))}

            {hasMedia && (
              <article className="flex flex-col gap-6">
                <SectionHeading eyebrow={t('media')} />
                {media(page.galery)}
                {arr(page.Animations).map((a, i) => a.src && <LottieClip key={i} name={a.src} />)}
              </article>
            )}

            {arr(page.P).map((p, i) => (
              <aside key={i} className="flex flex-col gap-5 p-7 rounded-[18px] border border-white/[.09] bg-jb-card">
                {p.text && <p className="m-0 text-[16px] leading-[1.7] text-jb-text text-pretty">{rich(p.text)}</p>}
                {buttons(p.buttons)}
              </aside>
            ))}

            {examples.map((e, i) => (
              <article key={i} className="flex flex-col gap-6">
                <SectionHeading eyebrow={e.label || t('examples')} title={e.subTitle} />
                {paragraphs(e.text)}
                {media(e.Galeria)}
                {buttons(e.buttons)}
              </article>
            ))}

            {ctas.map((c, i) => (
              <article
                key={i}
                className="flex flex-col gap-6 p-7 sm:p-9 rounded-[20px] border border-[rgba(52,209,122,.25)] bg-jb-band"
              >
                {(c.callToAction || c.SubTitle) && (
                  <SectionHeading eyebrow={c.callToAction ? undefined : t('benefits')} title={c.callToAction || c.SubTitle} />
                )}
                {c.callToAction && c.SubTitle && (
                  <h3 className="m-0 text-lg font-bold text-white first-letter:uppercase">{c.SubTitle}</h3>
                )}
                {paragraphs(c.text)}
                {lists(c.list)}
                {paragraphs(c.text2)}
                {arr(c.Animations).map((a, j) => a.src && <LottieClip key={j} name={a.src} />)}
                {buttons(c.buttons)}
              </article>
            ))}
          </div>

          {/* Tarjeta de presupuesto (desktop) */}
          <aside className="hidden lg:block lg:sticky lg:top-24">
            <div className="flex flex-col gap-5 p-6 rounded-[18px] border border-white/[.1] bg-jb-card shadow-[0_20px_60px_rgba(0,0,0,.35)]">
              <div>
                <span className="font-mono text-[10.5px] tracking-[.16em] uppercase text-jb-mint">{title}</span>
                <h2 className="mt-2 mb-0 text-xl font-bold text-white">{t('quoteTitle')}</h2>
              </div>
              <ul className="flex flex-col gap-2.5 p-0 m-0 list-none">
                {points.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-[14px] text-jb-soft">
                    <Check size={16} className="flex-none mt-0.5 text-jb-accent" strokeWidth={2.5} />
                    {p}
                  </li>
                ))}
              </ul>
              <div className="flex flex-col gap-2.5">
                <Link href={`${prefix}/contact`} className={`${btnPrimary} text-sm py-3`}>
                  {t('quoteButton')}
                </Link>
                <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={`${btnGhost} text-sm py-3 rounded-[10px]`}>
                  WhatsApp
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* OTROS SERVICIOS */}
      {others.length > 0 && (
        <section className="px-6 py-20 bg-jb-band border-t border-white/[.06]">
          <div className="max-w-[1180px] mx-auto">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
              <h2 className="m-0 font-mono text-[clamp(24px,3.2vw,34px)] font-bold tracking-[-.02em] text-white">{t('others')}</h2>
              <Link href={`${prefix}/services`} className="font-mono text-xs tracking-[.08em] uppercase text-jb-mint hover:text-jb-accent-hi">
                {t('allServices')}
              </Link>
            </div>
            <div className="flex gap-4 pb-2 -mx-6 px-6 overflow-x-auto snap-x snap-mandatory no-scrollbar lg:grid lg:grid-cols-3 lg:mx-0 lg:px-0 lg:overflow-visible">
              {others.map((o) => {
                const oTitle = localized(locale, o.titleEs, o.titleEn);
                return (
                  <Link
                    key={o.id}
                    href={`${prefix}/services/${o.slug}`}
                    className="group snap-start flex-none w-[78%] sm:w-[46%] lg:w-auto flex flex-col overflow-hidden rounded-2xl border border-white/[.09] bg-jb-card hover:border-[rgba(52,209,122,.5)] transition"
                  >
                    <Shot
                      src={o.coverUrl}
                      alt={oTitle}
                      label={oTitle}
                      className="aspect-[16/10]"
                      imgClassName="transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                    <div className="flex items-center justify-between gap-3 p-5">
                      <span className="text-[16px] font-semibold text-white">{oTitle}</span>
                      <ArrowUpRight size={16} className="flex-none text-jb-mint transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Barra de presupuesto (móvil): sticky al final del contenido, así no tapa el footer */}
      <div className="sticky bottom-0 z-40 lg:hidden border-t border-white/[.08] bg-[rgba(10,28,18,.92)] backdrop-blur-md px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-3 max-w-[640px] mx-auto">
          <span className="flex-1 min-w-0 text-[13px] leading-tight text-jb-soft truncate">{title}</span>
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={`${btnGhost} text-sm px-4 py-2.5 rounded-[10px]`}>
            WhatsApp
          </a>
          <Link href={`${prefix}/contact`} className={`${btnPrimary} text-sm px-4 py-2.5`}>
            {t('quoteButton')}
          </Link>
        </div>
      </div>
    </div>
  );
}
