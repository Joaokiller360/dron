'use client'

import { SeparatorUp } from '@/app/utils'

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

export const AnimatedLogoCloud = ({ colors = '' }:Styles) => {
  return (
    <div className="w-full py-12">
      <div className="mx-auto w-full px-6 md:px-8">
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
                  className="flex shrink-0 flex-row justify-around gap-6"
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


export default function Logos() {
  return (
    <>
      <SeparatorUp colorsPrimary="bg-honeydew-800 dark:bg-honeydew-900" colorsSecundary="text-honeydew-900 dark:text-honeydew-800" />
      <div className="bg-honeydew-900 dark:bg-honeydew-800 py-8 sm:py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid space-y-4 text-center mb-10">
            <div className="text-sm lg:text-lg font-mono mx-10 font-light gradient-text">
              <span>- </span>
              <span className="uppercase">
                Los grandes confian en nosotros
              </span>
              <span> -</span>
            </div>
            <span className="text-xl sm:text-4xl font-mono font-bold sm:my-5 gradient-text uppercase">
              Nuestros Clientes
            </span>
          </div>

          <div className="bg-honeydew-800 dark:bg-honeydew-900 rounded-2xl sm:p-10 shadow-lg">
            < AnimatedLogoCloud colors='invert'/>
          </div>
        </div>
      </div>
    </>
  )
}