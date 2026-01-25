import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { createMetadata, Favicon, Navbar } from '@/app/utils'
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
  href: 'logo-ico',
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