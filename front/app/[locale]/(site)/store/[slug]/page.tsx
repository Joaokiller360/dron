import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { createMetadata, localeUrl, SITE_NAME } from '@/app/utils';
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
  return createMetadata({
    title: name,
    description: description || undefined,
    path: `/store/${product.slug}`,
    locale,
    image: product.coverUrl || undefined,
  });
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { store, product } = await load(slug);
  if (!store || !product) notFound();
  const locale = await getLocale();
  // Product rich result (name, photos, price, stock) for search engines
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: localized(locale, product.nameEs, product.nameEn),
    description: localized(locale, product.descriptionEs ?? '', product.descriptionEn) || undefined,
    image: [product.coverUrl, ...(product.mediaUrls ?? [])].filter(Boolean),
    sku: product.id,
    brand: { '@type': 'Brand', name: SITE_NAME },
    url: localeUrl(`/store/${product.slug}`, locale),
    ...(product.priceCents != null && {
      offers: {
        '@type': 'Offer',
        url: localeUrl(`/store/${product.slug}`, locale),
        priceCurrency: 'USD',
        price: (product.priceCents / 100).toFixed(2),
        availability: product.stock === 0 ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
        seller: { '@type': 'Organization', name: SITE_NAME },
      },
    }),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <ProductClient product={product} products={store.products} settings={store.settings} payments={store.payments} />
    </>
  );
}
