import { notFound, redirect } from 'next/navigation';
import { getLocale, getMessages } from 'next-intl/server';
import { fetchPublic, type PublicStore } from '@/app/component';
import CheckoutClient from './CheckoutClient';

export async function generateMetadata() {
  const messages = await getMessages();
  return {
    title: `${messages.store?.checkoutTitle || 'Finalizar compra'} | JB.SKYLENS`,
    robots: { index: false },
  };
}

export default async function Checkout() {
  const store = await fetchPublic<PublicStore>('/store');
  if (!store?.settings.enabled) notFound();
  // Sales paused: back to the catalog, which explains why
  if (!store.settings.sales) {
    const locale = await getLocale();
    redirect(`${locale === 'es' ? '' : `/${locale}`}/store`);
  }
  return <CheckoutClient products={store.products} settings={store.settings} payments={store.payments} />;
}
