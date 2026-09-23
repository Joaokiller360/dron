'use client'

// Shared chrome and building blocks for the public site, implemented from the
// claude.ai/design project (SiteHeader.dc.html, SiteFooter.dc.html and the
// hero/section patterns repeated across every page).

import { useState, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Menu, X, Instagram, Facebook } from 'lucide-react';
import { LanguageSwitcher, Year } from '@/app/utils';
import { useContactInfo } from './ContactInfo';


export function usePrefix() {
  const locale = useLocale();
  // Solo agregar prefijo de idioma si NO es el idioma por defecto (es)
  return locale === 'es' ? '' : `/${locale}`;
}

function useIsDashboard() {
  const pathname = usePathname();
  return /(^|\/)dashboard(\/|$)/.test(pathname ?? '');
}

function Brand({ href, size = 22 }: { href: string; size?: number }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 text-white hover:text-white">
      <img
        src="/img/logo-p.png"
        alt=""
        width={size}
        height={size}
        className="bg-white rounded-full"
        style={{ width: size, height: size }}
      />
      <span className="font-mono text-base font-bold tracking-[-.02em]">JB.SKYLENS</span>
    </Link>
  );
}

export function SiteHeader({ storeEnabled = false }: { storeEnabled?: boolean }) {
  const t = useTranslations('nav');
  const s = useTranslations('site.header');
  const prefix = usePrefix();
  const pathname = usePathname() ?? '';
  const [open, setOpen] = useState(false);
  if (useIsDashboard()) return null;

  // Strip the locale prefix so /en/teams and /teams match the same item
  const path = pathname.replace(/^\/(en|es)(?=\/|$)/, '') || '/';
  const items = [
    { key: 'services', href: '/services' },
    { key: 'teams', href: '/teams' },
    { key: 'portfolio', href: '/portfolio' },
    { key: 'clients', href: '/clients' },
    ...(storeEnabled ? [{ key: 'store', href: '/store' }] : []),
    { key: 'contact', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b backdrop-blur-[14px] bg-[rgba(10,28,18,.88)] border-white/[.07]">
      <nav className="max-w-[1180px] mx-auto px-6 py-3.5 flex items-center gap-6">
        <Brand href={prefix || '/'} />

        <div className="justify-center flex-1 hidden gap-1 md:flex">
          {items.map((item) => {
            const active = path === item.href || path.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.key}
                href={`${prefix}${item.href}`}
                aria-current={active ? 'page' : undefined}
                className={`text-sm px-3 py-[7px] rounded-lg transition hover:text-white hover:bg-white/[.06] ${
                  active ? 'text-white bg-[rgba(52,209,122,.14)]' : 'text-jb-soft'
                }`}
              >
                {t(item.key)}
              </Link>
            );
          })}
        </div>

        <Link
          href={`${prefix}/contact`}
          className="hidden md:inline-block bg-jb-accent hover:bg-jb-accent-hi text-jb-ink hover:text-jb-ink font-bold text-sm px-[18px] py-2.5 rounded-[10px] whitespace-nowrap transition"
        >
          {s('cta')}
        </Link>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? s('closeMenu') : s('openMenu')}
          aria-expanded={open}
          className="flex items-center justify-center ml-auto text-white border rounded-lg md:hidden w-9 h-9 border-white/15"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      {open && (
        <div className="px-6 pb-4 md:hidden animate-jb-fade">
          <div className="flex flex-col gap-1">
            {items.map((item) => {
              const active = path === item.href || path.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.key}
                  href={`${prefix}${item.href}`}
                  onClick={() => setOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-[15px] ${
                    active ? 'text-white bg-[rgba(52,209,122,.14)]' : 'text-jb-soft'
                  }`}
                >
                  {t(item.key)}
                </Link>
              );
            })}
            <Link
              href={`${prefix}/contact`}
              onClick={() => setOpen(false)}
              className="mt-2 text-center bg-jb-accent text-jb-ink hover:text-jb-ink font-bold text-sm px-[18px] py-3 rounded-[10px]"
            >
              {s('cta')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

function FooterHeading({ children }: { children: ReactNode }) {
  return (
    <div className="mb-1 font-mono text-[10.5px] tracking-[.18em] uppercase text-jb-mint">{children}</div>
  );
}

const footerLink = 'text-sm text-jb-soft hover:text-white transition';

export function SiteFooter({ storeEnabled = false }: { storeEnabled?: boolean }) {
  const t = useTranslations('nav');
  const f = useTranslations('site.footer');
  const prefix = usePrefix();
  const contact = useContactInfo();
  if (useIsDashboard()) return null;

  return (
    <footer className="px-6 pt-14 pb-8 bg-jb-bg border-t border-white/[.07]">
      <div className="max-w-[1180px] mx-auto grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-9">
        <div className="flex flex-col gap-3.5">
          <Brand href={prefix || '/'} size={20} />
          <p className="m-0 text-[13.5px] leading-[1.6] text-jb-muted max-w-[260px]">{f('about')}</p>
          <div className="flex gap-3 text-jb-soft">
            <a href="https://www.instagram.com/jb.skylens" target="_blank" rel="noopener noreferrer" className="hover:text-white" aria-label="Instagram">
              <Instagram size={18} />
            </a>
            <a href="https://www.facebook.com/share/1AagbyNSJV/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="hover:text-white" aria-label="Facebook">
              <Facebook size={18} />
            </a>
          </div>
        </div>
        <div className="flex flex-col gap-2.5">
          <FooterHeading>{f('site')}</FooterHeading>
          <Link href={`${prefix}/services`} className={footerLink}>{t('services')}</Link>
          <Link href={`${prefix}/teams`} className={footerLink}>{t('teams')}</Link>
          <Link href={`${prefix}/portfolio`} className={footerLink}>{t('portfolio')}</Link>
          <Link href={`${prefix}/clients`} className={footerLink}>{t('clients')}</Link>
          {storeEnabled && <Link href={`${prefix}/store`} className={footerLink}>{t('store')}</Link>}
        </div>
        <div className="flex flex-col gap-2.5">
          <FooterHeading>{t('contact')}</FooterHeading>
          <Link href={`${prefix}/contact`} className={footerLink}>{f('write')}</Link>
          <a href={`mailto:${contact.email}`} className={footerLink}>{contact.email}</a>
          <a href={contact.whatsapp} target="_blank" rel="noopener noreferrer" className={footerLink}>{contact.phone}</a>
        </div>
        <div className="flex flex-col gap-2.5">
          <FooterHeading>{f('legal')}</FooterHeading>
          <Link href={`${prefix}/legal/terms-and-conditions`} className={footerLink}>{f('terms')}</Link>
          <Link href={`${prefix}/legal/privacy-policies`} className={footerLink}>{f('privacy')}</Link>
          <div className="mt-2 max-w-[180px]">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
      <div className="max-w-[1180px] mx-auto mt-10 pt-[22px] border-t border-white/[.07] text-[13px] text-jb-muted">
        © <Year /> JoaoBarres. {f('rights')}
      </div>
    </footer>
  );
}

// "— Label —" kicker above headings
export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`font-mono text-[11.5px] tracking-[.22em] uppercase text-jb-mint ${className}`}>
      — {children} —
    </div>
  );
}

export function SectionTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h2
      className={`m-0 font-mono text-[clamp(26px,3.6vw,38px)] font-bold tracking-[-.02em] text-white text-balance ${className}`}
    >
      {children}
    </h2>
  );
}

// Standard page hero: eyebrow, H1, intro paragraph and optional extras
export function PageHero({
  eyebrow,
  title,
  intro,
  children,
  className = 'pb-12',
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`px-6 pt-20 jb-glow ${className}`}>
      <div className="max-w-[1180px] mx-auto">
        <Eyebrow className="mb-3.5">{eyebrow}</Eyebrow>
        <h1 className="m-0 mb-4 max-w-[820px] font-mono text-[clamp(32px,4.6vw,52px)] leading-[1.06] font-bold tracking-[-.03em] text-white text-balance">
          {title}
        </h1>
        {intro && <p className="m-0 max-w-[620px] text-[17px] leading-[1.65] text-jb-soft text-pretty">{intro}</p>}
        {children}
      </div>
    </section>
  );
}

// Image with the design's striped placeholder as fallback (missing or broken src).
// fit="contain" shows the whole image (logos, any aspect ratio) over a blurred,
// dimmed copy of itself so the empty sides are not bare.
export function Shot({
  src,
  alt = '',
  label,
  className = '',
  imgClassName = '',
  labelPosition = 'bottom',
  fit = 'cover',
}: {
  src?: string | null;
  alt?: string;
  label?: string;
  className?: string;
  imgClassName?: string;
  labelPosition?: 'bottom' | 'center';
  fit?: 'cover' | 'contain';
}) {
  const [failed, setFailed] = useState(false);
  if (src && !failed && fit === 'contain') {
    return (
      <div className={`jb-stripes overflow-hidden ${className}`}>
        <div className="relative w-full h-full overflow-hidden">
          <img src={src} alt="" aria-hidden loading="lazy" className="absolute inset-0 object-cover w-full h-full scale-125 blur-2xl opacity-35" />
          <img src={src} alt={alt} loading="lazy" className={`relative object-contain w-full h-full ${imgClassName}`} onError={() => setFailed(true)} />
        </div>
      </div>
    );
  }
  if (src && !failed) {
    return (
      <div className={`jb-stripes overflow-hidden ${className}`}>
        <img src={src} alt={alt} loading="lazy" className={`object-cover w-full h-full ${imgClassName}`} onError={() => setFailed(true)} />
      </div>
    );
  }
  return (
    <div
      className={`jb-stripes flex p-3.5 ${
        labelPosition === 'center' ? 'items-center justify-center' : 'items-end'
      } ${className}`}
    >
      {label && (
        <span className="font-mono text-[10.5px] tracking-widest uppercase text-jb-muted">{label}</span>
      )}
    </div>
  );
}
