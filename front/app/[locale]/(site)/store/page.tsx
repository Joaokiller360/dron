import { notFound } from 'next/navigation';
import { getLocale, getMessages, getTranslations } from 'next-intl/server';
import { PageHero, fetchPublic, storeHeader, type PublicStore } from '@/app/component';
import StoreClient from './StoreClient';

export async function generateMetadata() {
  const messages = await getMessages();
  return {
    title: messages.store?.metadeta?.TitleMeta || 'Tienda | JB.SKYLENS',
    description: messages.store?.metadeta?.DescriptionMeta,
  };
}

export default async function Store() {
  const store = await fetchPublic<PublicStore>('/store');
  // Store switched off in the dashboard (or API unreachable): the page doesn't exist
  if (!store?.settings.enabled) notFound();
  const header = storeHeader(store.settings, await getLocale(), await getTranslations('store'));

  return (
    <div className="bg-jb-bg">
      <PageHero eyebrow={header.eyebrow} title={header.title} intro={header.intro} />
      <StoreClient products={store.products} settings={store.settings} payments={store.payments} />
    </div>
  );
}
