import { getLocale, getMessages } from 'next-intl/server';
import { fetchPublic, type PublicService, type PublicProject, type PublicPromotions, type PublicStore } from '@/app/component';
import HomeClient from './HomeClient';

export async function generateMetadata() {
  const messages = await getMessages();
  const locale = await getLocale();
  return {
    title: messages.home?.metadeta?.TitleMeta || 'JB.SKYLENS',
    description:
      messages.home?.metadeta?.DescriptionMeta || 'JB.SKYLENS ofrece servicios profesionales con drones en Ecuador: inspecciones, fotografía aérea, video, eventos y soluciones técnicas con drones.',
    keywords: messages.home?.metadeta?.keywords || [],
    canonical: { href: `https://jbskylens.com/${locale === 'es' ? '' : locale}` },
  };
}

export default async function Page() {
  const [services, projects, promotions, store] = await Promise.all([
    fetchPublic<PublicService[]>('/services'),
    fetchPublic<PublicProject[]>('/projects'),
    fetchPublic<PublicPromotions>('/promotions'),
    fetchPublic<PublicStore>('/store'),
  ]);
  // Landing section only while the store is on, the dashboard switch allows it and there's something to show
  const showStore = !!store?.settings.enabled && store.settings.homeSection !== false && store.products.length > 0;
  return (
    <HomeClient
      services={(services ?? []).slice(0, 6)}
      projects={(projects ?? []).slice(0, 4)}
      promotions={promotions}
      store={showStore ? { settings: store!.settings, products: store!.products.slice(0, 4) } : null}
    />
  );
}
