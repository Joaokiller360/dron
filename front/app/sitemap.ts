import type { MetadataRoute } from 'next';
import { LOCALES, localeUrl } from '@/app/utils/metadata';
import { fetchPublic, type PublicService, type PublicStore } from '@/app/component/site/api';

// Built on every request from the API, so new services, products and legal
// pages show up in the sitemap as soon as they are published in the dashboard
export const dynamic = 'force-dynamic';

type Entry = MetadataRoute.Sitemap[number];
type Dated = { slug: string; updatedAt?: string };

/** One entry per locale for a route, each listing every translation */
function route(path: string, opts: Omit<Entry, 'url' | 'alternates'>): MetadataRoute.Sitemap {
  const languages = { ...Object.fromEntries(LOCALES.map((l) => [l, localeUrl(path, l)])), 'x-default': localeUrl(path, 'es') };
  return LOCALES.map((locale) => ({ url: localeUrl(path, locale), alternates: { languages }, ...opts }));
}

const date = (iso?: string) => (iso ? new Date(iso) : undefined);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, legal, store] = await Promise.all([
    fetchPublic<(PublicService & { updatedAt?: string })[]>('/services'),
    fetchPublic<Dated[]>('/legal-pages'),
    fetchPublic<Omit<PublicStore, 'products'> & { products: Dated[] }>('/store'),
  ]);
  const storeOn = !!store?.settings.enabled;
  const now = new Date();

  return [
    ...route('/', { lastModified: now, changeFrequency: 'weekly', priority: 1 }),
    ...route('/services', { lastModified: now, changeFrequency: 'weekly', priority: 0.9 }),
    ...route('/portfolio', { lastModified: now, changeFrequency: 'weekly', priority: 0.8 }),
    ...route('/contact', { changeFrequency: 'monthly', priority: 0.8 }),
    ...route('/clients', { changeFrequency: 'monthly', priority: 0.6 }),
    ...route('/teams', { changeFrequency: 'monthly', priority: 0.6 }),
    ...(services ?? [])
      .filter((s) => s.isPage)
      .flatMap((s) => route(`/services/${s.slug}`, { lastModified: date(s.updatedAt), changeFrequency: 'monthly', priority: 0.8 })),
    ...(storeOn ? route('/store', { lastModified: now, changeFrequency: 'weekly', priority: 0.7 }) : []),
    ...(storeOn ? store!.products : []).flatMap((p) =>
      route(`/store/${p.slug}`, { lastModified: date(p.updatedAt), changeFrequency: 'weekly', priority: 0.6 }),
    ),
    ...(legal ?? []).flatMap((p) =>
      route(`/legal/${p.slug}`, { lastModified: date(p.updatedAt), changeFrequency: 'yearly', priority: 0.3 }),
    ),
  ];
}
