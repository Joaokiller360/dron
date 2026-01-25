
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { createMetadata, Navbar } from '@/app/utils'
import { Footer } from '@/app/component';
import FlowbiteInit from "./flowbait-init";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = createMetadata({
  title: 'Servicios con drones',
  description:
    'Servicios con drones en Ecuador: inspecciones técnicas, fotografía aérea, video profesional, eventos y soluciones industriales.',
  href: '/logo-ico',
  keywords: [
    'drones esmeraldas',
    'servicios con drones esmeraldas',
    'drones profesionales esmeraldas',
    'fotografía aérea esmeraldas',
    'video aéreo profesional esmeraldas',
    'empresa de drones en esmeraldas',
    'operadores de drones esmeraldas',
    'filmación aérea esmeraldas',
    'drones para empresas esmeraldas',
    'drones en esmeraldas ecuador',
  
    'drones ecuador',
    'servicios con drones ecuador',
    'empresa de drones en ecuador',
    'fotografía aérea ecuador',
    'video con drones ecuador',
    'producción audiovisual aérea',
    'servicios audiovisuales con drones',
    'drones para publicidad',
    'drones para eventos',
    'operador de drones certificado',
  
    'inspecciones con drones',
    'drones para seguridad industrial',
    'drones para infraestructuras',
    'drones para bienes raíces',
    'drones para minería',
    'levantamientos con drones',
    'mapeo aéreo con drones',
    'contenido aéreo profesional',
    'filmación profesional con drones',
  
    'JB.SKYLENS',
    'JB SKYLENS drones',
    'Joao Barres',
    'empresa audiovisual con drones',
    'servicios profesionales con drones',
  ]
  ,
  canonical: 'https://dron.joaobarres.dev',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <FlowbiteInit />
        <div className="flex flex-col min-h-screen">

          <Navbar />

          {/* CONTENIDO */}
          <main className="flex-1 text-white">
            {children}
          </main>

          <Footer />
        </div>
      </body>
    </html>
  );
}