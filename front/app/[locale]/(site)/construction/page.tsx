import Link from 'next/link';
import { createMetadata } from '@/app/utils'
import { Eyebrow, btnPrimary, btnGhost } from '@/app/component'
import { useLocale, useTranslations } from 'next-intl';

export const metadata = createMetadata({
  title: 'Página en construcción',
  description:
    'Esta sección de JB.SKYLENS se encuentra actualmente en construcción. Pronto tendremos nuevas soluciones con drones.',
  canonical: 'https://dron.joaobarres.dev/construction',
  index: false, // 👈 importante para SEO
})

export default function Construction() {
  const t = useTranslations('site.construction');
  const locale = useLocale();
  // Solo agregar prefijo de idioma si NO es el idioma por defecto (es)
  const prefix = locale === 'es' ? '' : `/${locale}`;

  return (
    <section className="flex items-center justify-center min-h-[70vh] px-6 py-24 bg-jb-bg bg-[radial-gradient(700px_400px_at_50%_30%,rgba(52,209,122,.14),transparent_70%)]">
      <div className="max-w-[620px] text-center flex flex-col items-center gap-[22px]">
        <div className="w-[84px] h-[84px] rounded-full border border-[rgba(52,209,122,.4)] flex items-center justify-center animate-jb-hover">
          <span className="w-[22px] h-[22px] rounded-full bg-jb-accent" />
        </div>
        <Eyebrow>{t('eyebrow')}</Eyebrow>
        <h1 className="m-0 font-mono text-[clamp(30px,4.4vw,48px)] leading-[1.08] font-bold tracking-[-.03em] text-white text-balance">
          {t('title')}
        </h1>
        <p className="m-0 text-[16.5px] leading-[1.65] text-jb-soft text-pretty">{t('text')}</p>
        <div className="flex flex-wrap justify-center gap-3 mt-1.5">
          <Link href={prefix || '/'} className={`${btnPrimary} text-[15px] px-[22px] py-[13px] rounded-[11px]`}>
            {t('home')}
          </Link>
          <Link href={`${prefix}/contact`} className={`${btnGhost} text-[15px] px-[22px] py-[13px]`}>
            {t('contact')}
          </Link>
        </div>
      </div>
    </section>
  )
}
