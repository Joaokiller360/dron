'use client'

import { SeparatorUp, ScrollRevealEffect } from '@/app/utils'

const logos = [
  {
    name: 'Vercel',
    url: 'https://res.cloudinary.com/dfhp33ufc/image/upload/v1715881430/vercel_wordmark_dark_mhv8u8.svg',
  },
  {
    name: 'Nextjs',
    url: 'https://res.cloudinary.com/dfhp33ufc/image/upload/v1715881475/nextjs_logo_dark_gfkf8m.svg',
  },
  {
    name: 'Prime',
    url: 'https://res.cloudinary.com/dfhp33ufc/image/upload/v1715276558/logos/t2awrrfzdvmg1chnzyfr.svg',
  },
  {
    name: 'Trustpilot',
    url: 'https://res.cloudinary.com/dfhp33ufc/image/upload/v1715276558/logos/tkfspxqmjflfllbuqxsi.svg',
  },
  {
    name: 'Webflow',
    url: 'https://res.cloudinary.com/dfhp33ufc/image/upload/v1715276560/logos/nymiivu48d5lywhf9rpf.svg',
  },

  {
    name: 'Airbnb',
    url: 'https://res.cloudinary.com/dfhp33ufc/image/upload/v1715276558/logos/pmblusboe7vkw8vxdknx.svg',
  },
  {
    name: 'Tina',
    url: 'https://res.cloudinary.com/dfhp33ufc/image/upload/v1715276560/logos/afqhiygywyphuou6xtxc.svg',
  },
  {
    name: 'Stackoverflow',
    url: 'https://res.cloudinary.com/dfhp33ufc/image/upload/v1715276558/logos/ts1j4mkooxqmscgptafa.svg',
  },
  {
    name: 'mistral',
    url: 'https://res.cloudinary.com/dfhp33ufc/image/upload/v1715276558/logos/tyos2ayezryjskox3wzs.svg',
  },
]

interface Styles {
  colors?: string;
}

export const AnimatedLogoCloud = ({ colors = '' }: Styles) => {
  return (
    <div className="w-full py-12">
      <div className="w-full px-6 mx-auto md:px-8">
        <div
          className="relative mt-6 overflow-hidden"
          style={{
            maskImage:
              'linear-gradient(to left, transparent 0%, black 20%, black 80%, transparent 95%)',
          }}
        >
          {/* TRACK */}
          <div className="flex w-max animate-logo-cloud gap-6 group-hover:[animation-play-state:paused]">
            {Array(5)
              .fill(null)
              .map((_, index) => (
                <div
                  key={index}
                  className="flex flex-row justify-around gap-6 shrink-0"
                >
                  {logos.map((logo, key) => (
                    <img
                      key={key}
                      src={logo.url}
                      className={`h-10 w-28 px-2 brightness-0 ${colors}`}
                      alt={`${logo.name}`}
                    />
                  ))}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

import { useLocale, useTranslations } from 'next-intl'

export default function Logos() {

  const t = useTranslations('home');
  const locale = useLocale();

  // Solo agregar prefijo de idioma si NO es el idioma por defecto (es)
  const prefix = locale === 'es' ? '' : `/${locale}`;

  return (
    <>
      <SeparatorUp colorsPrimary="bg-honeydew-800 dark:bg-honeydew-900" colorsSecundary="text-honeydew-900 dark:text-honeydew-800" />
      <div className="py-8 bg-honeydew-900 dark:bg-honeydew-800 sm:py-16 lg:py-24">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid mb-10 space-y-4 text-center">
            <div className="mx-10 font-mono text-sm font-light lg:text-lg gradient-text">
              <ScrollRevealEffect>
                <span>- </span>
                <span className="uppercase">
                  {t('clients.label')}
                </span>
                <span> -</span>
              </ScrollRevealEffect>
            </div>
            <ScrollRevealEffect>
              <span className="font-mono text-xl font-bold uppercase sm:text-4xl sm:my-5 gradient-text">
                {t('clients.title')}
              </span>
            </ScrollRevealEffect>
          </div>

          <div className="shadow-lg bg-honeydew-800 dark:bg-honeydew-900 rounded-2xl sm:p-10">
            <ScrollRevealEffect>
              < AnimatedLogoCloud colors='invert' />
            </ScrollRevealEffect>
          </div>
        </div>
      </div>
    </>
  )
}