import { notFound } from 'next/navigation';
import { fetchPublic, type PublicService } from '@/app/component';
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
  const service = await getService(slug);
  if (!service) return {};

  const title = service.metaTitle || `${service.titleEs} | JB.SKYLENS`;
  return {
    title,
    description: service.metaDescription || undefined,
    keywords: service.keywords?.length ? service.keywords : undefined,
    alternates: { canonical: `https://dron.joaobarres.dev/services/${service.slug}` },
    robots: { index: service.published, follow: service.published },
    openGraph: {
      title,
      description: service.metaDescription || undefined,
      url: `https://dron.joaobarres.dev/services/${service.slug}`,
      siteName: 'JB Skylens',
      images: service.coverUrl ? [{ url: service.coverUrl }] : [],
      type: 'website',
    },
  };
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
