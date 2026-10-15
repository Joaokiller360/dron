// i18n/routing.ts
import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['es', 'en'],
  defaultLocale: 'es',
  localePrefix: 'as-needed', // Solo muestra /en si no es español
  // hreflang goes in each page's <head> and the sitemap with the public https URL;
  // the middleware's Link header used the internal http one
  alternateLinks: false
});

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);