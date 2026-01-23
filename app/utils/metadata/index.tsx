import { Metadata } from 'next'

interface Meta {
  title: string
  description?: string
  keywords?: string[]
  canonical?: string
  index?: boolean
}

export const createMetadata = ({
  title,
  description = '',
  keywords = [],
  canonical,
  index = true,
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
  }
}