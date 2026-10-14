'use client'

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PauseCircle } from 'lucide-react';
import { type PublicProduct, type PublicStore } from '@/app/component';
import { useCart } from './cart';
import CartDrawer from './CartDrawer';
import ProductCard from './ProductCard';

export default function StoreClient({
  products,
  settings,
  payments,
}: {
  products: PublicProduct[];
  settings: PublicStore['settings'];
  payments: PublicStore['payments'];
}) {
  const t = useTranslations('store');
  const cart = useCart(products, settings.showPrices);
  const [cartOpen, setCartOpen] = useState(false);

  const selling = settings.sales;

  return (
    <>
      <section className="px-6 pt-2 pb-24">
        <div className="max-w-[1180px] mx-auto">
          {!selling && (
            <div className="flex items-start gap-3 px-5 py-4 mb-8 rounded-2xl border border-amber-300/25 bg-amber-300/[.06] text-[14.5px] text-jb-soft">
              <PauseCircle size={19} className="flex-none mt-px text-amber-300" />
              <span>{settings.pausedNotice || t('paused')}</span>
            </div>
          )}

          {products.length === 0 ? (
            <p className="text-center text-white/60">{t('empty')}</p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(260px,100%),1fr))] gap-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} cart={cart} selling={selling} />
              ))}
            </div>
          )}
        </div>
      </section>

      <CartDrawer products={products} settings={settings} payments={payments} open={cartOpen} onOpenChange={setCartOpen} />
    </>
  );
}
