import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { createMetadata } from '@/app/utils';
import { fetchPublic, localized, type PublicService } from '@/app/component';
import ServiceDetail, { type DetailService } from './ServiceDetail';

interface DbService extends DetailService {
  published: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  keywords: string[];
}

async function getService(slug: string): Promise<DbService | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return null;
  try {
    const res = await fetch(`${apiUrl}/services/slug/${encodeURIComponent(slug)}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return (await res.json()) as DbService;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [service, locale] = await Promise.all([getService(slug), getLocale()]);
  if (!service || !service.isPage) return {};

  const name = localized(locale, service.titleEs, service.titleEn);
  // The dashboard's SEO texts are written in Spanish; English pages use the English copy
  const title = (locale === 'es' && service.metaTitle) || name;
  const description =
    (locale === 'es' && service.metaDescription) || localized(locale, service.descriptionEs ?? '', service.descriptionEn).slice(0, 160) || undefined;
  return createMetadata({
    title,
    description,
    keywords: service.keywords,
    path: `/services/${service.slug}`,
    locale,
    index: service.published,
    image: service.coverUrl && /^https?:/.test(service.coverUrl) ? service.coverUrl : undefined,
  });
}

export default async function DynamicServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [service, all] = await Promise.all([
    getService(slug),
    fetchPublic<PublicService[]>('/services'),
  ]);

  // Only DB rows explicitly flagged as full pages render here; the simple
  // "Más servicios" cards (isPage=false) have no standalone page.
  if (!service || !service.isPage || !service.page) notFound();

  const others = (all ?? []).filter((s) => s.isPage && s.slug !== service.slug);
  return <ServiceDetail service={service} others={others} />;
}
