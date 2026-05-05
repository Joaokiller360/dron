import { getLocale } from 'next-intl/server';
import { createMetadata } from '@/app/utils'
import "./[locale]/globals.css";  // Agrega esta línea para importar los estilos globales de Tailwind

export const metadata = createMetadata({
  href: 'logo-ico',
})

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  
  return (
    <html lang={locale}>
      <body>
        {children}
      </body>
    </html>
  );
}