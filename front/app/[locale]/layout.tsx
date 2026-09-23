import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import Script from "next/script";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';

import { createMetadata } from '@/app/utils'
import FlowbiteInit from "../flowbait-init";
import { SiteHeader, SiteFooter, LiveRefresh, ContactInfoProvider, getContactInfo } from '@/app/component';

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata = createMetadata({
  href: 'logo-ico',
})

export default async function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();
  const contact = await getContactInfo();

  return (
    <>
      {/* Google Analytics */}
      <Script id="google-analytics" strategy="afterInteractive">
        {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.GOOGLE_ANALYTICS}');
          `}
      </Script>
      <meta name="google-site-verification" content={process.env.GOOGLE_VERIFICATION} />
      <meta name="facebook-domain-verification" content={process.env.FACEBOOK_VERIFICATION} />
      <div className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <ContactInfoProvider value={contact}>
            <FlowbiteInit />
            <div className="flex flex-col min-h-screen bg-jb-bg">
              <LiveRefresh />
              <SiteHeader />
              {/* CONTENIDO */}
              <main className="flex-1 text-jb-text">
                {children}
              </main>
              <SiteFooter />
            </div>
          </ContactInfoProvider>
        </NextIntlClientProvider>
      </div>
    </>
  );
}