import { getLocale, getMessages } from 'next-intl/server';
import { createMetadata, localeUrl, SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '@/app/utils';
import { fetchPublic, getContactInfo, localized, type PublicService, type PublicProject, type PublicPromotions, type PublicStore, type PublicTestimonial } from '@/app/component';
import HomeClient from './HomeClient';

export async function generateMetadata() {
  const [messages, locale] = await Promise.all([getMessages(), getLocale()]);
  const meta = messages.home?.metadeta;
  return createMetadata({
    title: meta?.TitleMeta,
    description:
      meta?.DescriptionMeta || 'JB.SKYLENS ofrece servicios profesionales con drones en Ecuador: inspecciones, fotografía aérea, video, eventos y soluciones técnicas con drones.',
    keywords: meta?.keywords,
    path: '/',
    locale,
  });
}

export default async function Page() {
  const [services, projects, promotions, store, testimonials, contact, locale, messages] = await Promise.all([
    fetchPublic<PublicService[]>('/services'),
    fetchPublic<PublicProject[]>('/projects'),
    fetchPublic<PublicPromotions>('/promotions'),
    fetchPublic<PublicStore>('/store'),
    fetchPublic<PublicTestimonial[]>('/testimonials'),
    getContactInfo(),
    getLocale(),
    getMessages(),
  ]);
  // Landing section only while the store is on, the dashboard switch allows it and there's something to show
  const showStore = !!store?.settings.enabled && store.settings.homeSection !== false && store.products.length > 0;
  // Tells search engines who the business is and where it works (rich results, local search)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfessionalService',
        '@id': `${SITE_URL}/#business`,
        name: SITE_NAME,
        alternateName: ['JB Skylens', 'JB SKYLENS Drones'],
        description: messages.home?.metadeta?.DescriptionMeta,
        url: localeUrl('/', locale),
        logo: `${SITE_URL}/img/logo-p.png`,
        image: DEFAULT_OG_IMAGE,
        telephone: contact.phone,
        email: contact.email,
        address: { '@type': 'PostalAddress', addressLocality: 'Esmeraldas', addressRegion: 'Esmeraldas', addressCountry: 'EC' },
        areaServed: [{ '@type': 'City', name: 'Esmeraldas' }, { '@type': 'Country', name: 'Ecuador' }],
        sameAs: ['https://www.instagram.com/jb.skylens', 'https://www.facebook.com/share/1AagbyNSJV/'],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: locale === 'en' ? 'Drone services' : 'Servicios con drones',
          itemListElement: (services ?? []).map((s) => ({
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: localized(locale, s.titleEs, s.titleEn),
              ...(s.isPage && { url: localeUrl(`/services/${s.slug}`, locale) }),
            },
          })),
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: localeUrl('/', locale),
        name: SITE_NAME,
        inLanguage: locale === 'en' ? 'en' : 'es-EC',
        publisher: { '@id': `${SITE_URL}/#business` },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <HomeClient
        services={(services ?? []).slice(0, 6)}
        projects={(projects ?? []).slice(0, 4)}
        promotions={promotions}
        testimonials={(testimonials ?? []).slice(0, 6)}
        store={showStore ? { settings: store!.settings, products: store!.products.slice(0, 4) } : null}
      />
    </>
  );
}
