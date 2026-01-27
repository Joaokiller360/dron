import { Metadata } from 'next'

interface Meta {
  title?: string
  description?: string
  keywords?: string[]
  canonical?: string
  index?: boolean
  href?: string
}

export const createMetadata = ({
  title,
  description,
  keywords,
  canonical,
  index = true,
  href,
}: Meta): Metadata => ({
  ...(`${title} | JB.SKYLENS - DRON` && { title }),
  ...(description && { description }),
  ...(keywords && { keywords }),
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
})