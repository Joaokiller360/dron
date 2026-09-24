import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { fetchPublic, localized, type PublicStore } from '@/app/component';
import ProductClient from './ProductClient';

// The public catalog already carries every published product (with gallery
// and details), and the cart on this page needs the whole list too
async function load(slug: string) {
  const store = await fetchPublic<PublicStore>('/store');
  const product = store?.settings.enabled ? store.products.find((p) => p.slug === slug) : undefined;
  return { store, product };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { product } = await load(slug);
  if (!product) return {};
  const locale = await getLocale();
  const name = localized(locale, product.nameEs, product.nameEn);
  const description = localized(locale, product.descriptionEs ?? '', product.descriptionEn).slice(0, 160);
  return {
    title: `${name} | JB.SKYLENS`,
    description: description || undefined,
    openGraph: { title: name, description: description || undefined, images: product.coverUrl ? [product.coverUrl] : undefined },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { store, product } = await load(slug);
  if (!store || !product) notFound();
  return <ProductClient product={product} products={store.products} settings={store.settings} payments={store.payments} />;
}
