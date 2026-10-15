import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/app/utils/metadata';

export default function robots(): MetadataRoute.Robots {
  // Private areas for both locales (Spanish has no prefix): dashboard, checkout,
  // clients' proformas and leftover test pages
  const hidden = ['/dashboard', '/store/checkout', '/proforma/', '/prueba', '/construction'];
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', ...hidden, ...hidden.map((p) => `/en${p}`)],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
