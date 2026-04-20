
import { createMetadata } from '@/app/utils'

export const metadata = createMetadata({
  href: 'logo-ico',
})

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}