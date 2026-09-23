import Link from 'next/link';
import { getLocale, getMessages, getTranslations } from 'next-intl/server';
import { PageHero, Shot, fetchPublic, btnPrimary, type PublicClient, type PublicTestimonial } from '@/app/component';

export async function generateMetadata() {
  const messages = await getMessages();
  return {
    title: messages.clients?.metadeta?.TitleMeta || 'Cliente | JB.SKYLENS',
    description:
      messages.clients?.metadeta?.DescriptionMeta || 'Conoce a los clientes de JB.SKYLENS, empresas y marcas que han confiado en nuestros servicios profesionales con drones en Ecuador.',
    keywords: [
      messages.clients?.metadeta?.keywords
    ],
    canonical: messages.clients?.metadeta?.canonical,
  };
}

export default async function Clients() {
  const [clientsRes, testimonialsRes] = await Promise.all([
    fetchPublic<PublicClient[]>('/clients'),
    fetchPublic<PublicTestimonial[]>('/testimonials'),
  ]);
  const clients = clientsRes ?? [];
  const testimonials = testimonialsRes ?? [];
  const t = await getTranslations('site.clients');
  const locale = await getLocale();

  // Solo agregar prefijo de idioma si NO es el idioma por defecto (es)
  const prefix = locale === 'es' ? '' : `/${locale}`;

  return (
    <div className="bg-jb-bg">
      <PageHero eyebrow={t('eyebrow')} title={t('title')} intro={t('intro')} />

      <section className="px-6 pt-4 pb-20">
        {clients.length > 0 ? (
          <div className="max-w-[1180px] mx-auto grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-px bg-white/[.08] border border-white/[.08] rounded-2xl overflow-hidden">
            {clients.map((c) => {
              const link = c.links?.[0]?.url;
              const cell = (
                <>
                  <Shot src={c.photoUrl} alt={c.name} label={c.name} labelPosition="center" className="absolute inset-0" />
                  <span className="absolute inset-x-0 bottom-0 px-3 pt-6 pb-2.5 bg-gradient-to-t from-[rgba(10,28,18,.9)] to-transparent">
                    <span className="block text-[13px] font-semibold text-white truncate">{c.name}</span>
                    {c.category && (
                      <span className="block font-mono text-[10.5px] tracking-[.08em] uppercase text-jb-muted truncate">
                        {c.category.name}
                      </span>
                    )}
                  </span>
                </>
              );
              const cls = 'relative block aspect-[3/2] bg-jb-band overflow-hidden';
              return link ? (
                <a
                  key={c.id}
                  id={c.slug}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${cls} group hover:opacity-90`}
                >
                  {cell}
                </a>
              ) : (
                <div key={c.id} id={c.slug} className={cls}>
                  {cell}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-white/60">{t('empty')}</p>
        )}
      </section>

      <section className="px-6 py-20 bg-jb-band border-t border-white/[.06]">
        {testimonials.length > 0 && (
          <div className="max-w-[1180px] mx-auto mb-10">
            <h2 className="m-0 mb-8 font-mono text-[clamp(26px,3.4vw,36px)] font-bold tracking-[-.02em] text-white">
              {t('says')}
            </h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(290px,100%),1fr))] gap-4">
              {testimonials.map((q) => (
                <figure key={q.id} className="flex flex-col gap-5 p-[26px] m-0 rounded-2xl bg-jb-card border border-white/[.08]">
                  <blockquote className="m-0 text-[16.5px] leading-[1.6] text-jb-text text-pretty">“{q.quote}”</blockquote>
                  <figcaption className="flex flex-col gap-[3px] mt-auto">
                    <span className="text-[14.5px] font-bold text-white">{q.author}</span>
                    {q.org && <span className="font-mono text-[11.5px] text-jb-muted">{q.org}</span>}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        )}
        <div className="max-w-[1180px] mx-auto flex flex-wrap items-center justify-between gap-[18px] px-7 py-[26px] rounded-2xl border border-[rgba(52,209,122,.25)]">
          <span className="text-lg font-semibold text-white">{t('next')}</span>
          <Link href={`${prefix}/contact`} className={`${btnPrimary} text-sm px-5 py-3`}>
            {t('cta')}
          </Link>
        </div>
      </section>
    </div>
  );
}
