import { createMetadata } from '@/app/utils';
import { notFound } from 'next/navigation';
import { getLocale, getMessages, getTranslations } from 'next-intl/server';
import { PageHero, fetchPublic, storeHeader, type PublicStore } from '@/app/component';
import StoreClient from './StoreClient';

export async function generateMetadata() {
  const [messages, locale] = await Promise.all([getMessages(), getLocale()]);
  const meta = messages.store?.metadeta;
  return createMetadata({
    title: meta?.TitleMeta || 'Tienda',
    description: meta?.DescriptionMeta || 'Compra productos de JB.SKYLENS: fotografía aérea impresa, packs y más, con entrega en Ecuador.',
    keywords: meta?.keywords,
    path: '/store',
    locale,
  });
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
