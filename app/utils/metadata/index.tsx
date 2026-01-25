import { Metadata } from 'next'

interface Meta {
  title: string
  description?: string
  keywords?: string[]
  canonical?: string
  index?: boolean
  href?: string
}

export const createMetadata = ({
  title,
  description = '',
  keywords = [],
  canonical,
  index = true,
  href = ''
}: Meta): Metadata => {
  return {
    title,
    description,
    keywords,
    alternates: canonical
      ? {
        canonical,
      }
      : undefined,
    robots: {
      index,
      follow: true,
    },
    icons: {
      icon: href
        ? `https://res.cloudinary.com/dzlavqhid/image/upload/${href}.ico`
        : '/ico/logo.ico',
    }
  }
}