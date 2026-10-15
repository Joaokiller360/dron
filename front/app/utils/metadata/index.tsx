import { Metadata } from 'next'

/** Public origin of the site; every canonical, hreflang and sitemap URL is built from it */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://dron.joaobarres.dev').replace(/\/+$/, '')
export const SITE_NAME = 'JB.SKYLENS'
export const LOCALES = ['es', 'en'] as const
/** Shared when a page has no picture of its own (1200×630) */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/img/og-image.jpg`

/** Absolute URL of a path ("/services") in a locale; Spanish is the default and has no prefix */
export const localeUrl = (path: string, locale: string) => {
  const clean = path === '/' ? '' : path
  if (locale === 'es') return `${SITE_URL}${clean || '/'}`
  return `${SITE_URL}/${locale}${clean}`
}

/** Canonical for this locale plus the hreflang links to every translation */
export const localeAlternates = (path: string, locale: string): Metadata['alternates'] => ({
  canonical: localeUrl(path, locale),
  languages: {
    es: localeUrl(path, 'es'),
    en: localeUrl(path, 'en'),
    'x-default': localeUrl(path, 'es'),
  },
})

interface Meta {
  title?: string
  description?: string
  keywords?: string[] | string
  /** Route without the locale prefix ("/contact"); gives canonical, hreflang and og:url */
  path?: string
  locale?: string
  index?: boolean
  href?: string
  image?: string
}

export const createMetadata = ({
  title,
  description,
  keywords,
  path,
  locale = 'es',
  index = true,
  href,
  image,
}: Meta): Metadata => {
  const fullTitle = !title ? `${SITE_NAME} | Servicios con drones en Ecuador` : title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`
  const images = [{ url: image || DEFAULT_OG_IMAGE, width: 1200, height: 630 }]
  const words = (Array.isArray(keywords) ? keywords : keywords ? [keywords] : []).flat().filter(Boolean)

  return {
    metadataBase: new URL(SITE_URL),
    title: fullTitle,
    description,
    ...(words.length && { keywords: words }),

    ...(path !== undefined && { alternates: localeAlternates(path, locale) }),

    robots: {
      index,
      follow: index,
    },

    ...(href && {
      icons: {
        icon: `https://res.cloudinary.com/dzlavqhid/image/upload/${href}.ico`,
      },
    }),

    // 🔥 OPEN GRAPH (WhatsApp, Facebook, etc)
    openGraph: {
      title: fullTitle,
      description,
      ...(path !== undefined && { url: localeUrl(path, locale) }),
      siteName: SITE_NAME,
      images,
      locale: locale === 'en' ? 'en_US' : 'es_EC',
      alternateLocale: locale === 'en' ? 'es_EC' : 'en_US',
      type: 'website',
    },

    // 🔥 TWITTER
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: images.map((i) => i.url),
    },
  }
}
