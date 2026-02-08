
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Script from "next/script";

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
  href: 'logo-ico',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      {/* Google Analytics */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.GOOGLE_ANALYTICS}`}
        strategy="afterInteractive"
      />

      <Script id="google-analytics" strategy="afterInteractive">
        {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.GOOGLE_ANALYTICS}');
          `}
      </Script>
      <meta name="google-site-verification" content={process.env.GOOGLE_VERIFICATION} />
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