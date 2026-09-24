// i18n/request.ts
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale: string | undefined;
  try {
    locale = await requestLocale;
  } catch {
    // Next 16.x dev server sometimes throws `headers` outside a request
    // scope while resolving requestLocale (upstream next-intl/Next.js
    // incompatibility, doesn't happen in production). Fall back instead
    // of crashing the whole route.
    locale = undefined;
  }

  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../translate/${locale}.json`)).default
  };
});