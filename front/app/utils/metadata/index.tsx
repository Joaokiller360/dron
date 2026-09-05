import { Metadata } from 'next'

interface Meta {
  title?: string
  description?: string
  keywords?: string[]
  canonical?: string
  index?: boolean
  href?: string
  image?: string
}

export const createMetadata = ({
  title,
  description,
  keywords,
  canonical,
  index = true,
  href,
  image,
}: Meta): Metadata => {
  const fullTitle = title ? `${title} | JB.SKYLENS - DRON` : 'JB.SKYLENS - DRON'

  return {
    title: fullTitle,
    description,
    keywords,

    ...(canonical && {
      alternates: { canonical },
    }),

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
      url: canonical,
      siteName: 'JB Skylens',
      images: image
        ? [
          {
            url: image,
            width: 1200,
            height: 630,
          },
        ]
        : [],
      locale: 'es_EC',
      type: 'website',
    },

    // 🔥 TWITTER
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: image ? [image] : [],
    },
  }
}