import { CallAction } from '@/app/component'
import { Banner, SectionCard, CardVideo, ScrollBottonEffect } from '@/app/utils'
import { useLocale, useTranslations } from 'next-intl'
import { getMessages } from 'next-intl/server';

// Metadatos traducidos usando next-intl
export async function generateMetadata() {
  const messages = await getMessages();
  return {
    title: messages.portfolio?.metadeta?.TitleMeta || 'Portafolio | JB.SKYLENS',
    description:
      messages.portfolio?.metadeta?.DescriptionMeta || 'Explora el portafolio de JB.SKYLENS con proyectos reales de fotografía aérea, video con drones, eventos e inspecciones en Ecuador.',
    keywords: [
      messages.portfolio?.metadeta?.keywords
    ],
    canonical: 'https://dron.joaobarres.dev/portfolio',
  };
}

export default function Portfolio() {

  const t = useTranslations('portfolio.collToAction');
  const eventes = useTranslations('portfolio.events');
  const d = useTranslations('clients.presentation');
  const _ = useTranslations('portfolio');
  const locale = useLocale();

  // Solo agregar prefijo de idioma si NO es el idioma por defecto (es)
  const prefix = locale === 'es' ? '' : `/${locale}`;

  const marinaEcovida = [
    {
      title: 'Marina Sounset - Session Vol. 4',
      present: 'Jaun Fernando Velazco',
      nameButton: 'Reels',
      href: 'https://www.instagram.com/reel/DS7quC9DdTr/?igsh=MTZpMHI1cHlzZmxwNw==',
      videoname: 'juan-fernando'
    },
    {
      title: 'Halloween - CONCERT PARTY',
      present: 'Magic Juan',
      nameButton: 'Reels',
      videoname: 'magic-juan',
      href: 'https://www.instagram.com/reel/DQnVl9ijDO-/?igsh=MTVucHQ2M3B6aGQyMw=='
    },
    {
      title: 'Marina Sounset - Session Vol. 3',
      present: 'Verde 70',
      nameButton: 'Reels',
      videoname: 'verde-70',
      href: 'https://www.instagram.com/reel/DNMlByMx6FD/?igsh=dDNsMDI5eXhhcnpt'
    },
    {
      title: 'Marina Sounset - Session Vol. 2',
      present: 'Tercer Mundo + AU-D',
      nameButton: 'Reels',
      videoname: 'tercerMundo-auD',
      imgName: 'marina',
      href: 'https://www.instagram.com/reel/DJ0QWdJJl2V/?igsh=MXBtZ2Rod3I5NDAzaw=='
    }
  ]

  const eventoVarios = [
    {
      title: 'Green AND White',
      organizacion: 'Vida Pura Beach',
      nameButton: 'Reals',
      imgName: 'vida-pura',
      href: 'https://www.instagram.com/reel/DMWlNidNaUA/?igsh=ZXZiN2dwaWIybWQ0',
    },
    {
      title: 'Paolo Plaza',
      organizacion: 'Vida Pura Beach',
      nameButton: 'Reals',
      imgName: 'vida-pura',
      href: 'https://www.instagram.com/reel/DB97gJdPqBT/?igsh=MWcxcmRmeWE2dTEwYQ==',
    },
    {
      title: 'Rumbeke 2025',
      organizacion: 'Rumbeke Music Entertainment',
      nameButton: ' Reals',
      imgName: 'rumbeke',
      href: 'https://www.instagram.com/reel/DNcNE8zN1O9/?igsh=ODl2YmV4Y2wwYXNk',
    },
    {
      title: 'Rumbeke Carnaval 2025',
      organizacion: 'Rumbeke Music Entertainment',
      nameButton: 'Reals',
      videoname: 'rumbeke-2025',
      href: 'https://www.instagram.com/reel/C-jf6zPxlXs/?igsh=cGYxZnFhc2t3ODB1',
    },
    {
      title: 'ALOHA FEST 2025',
      organizacion: 'ALOHA FEST',
      nameButton: 'Reals',
      videoname: 'aloha-feste-2025',
      href: 'https://www.instagram.com/reel/DG4qghKOlPh/?utm_source=ig_web_copy_link',
    }
  ]

  const documentals = [
    {
      title: 'Corazones Descalzos',
      organizacion: 'Fundación Corazones Descalzos',
      nameButton: 'Reals',
      videoname: 'corazones-descalzos',
      href: 'https://www.instagram.com/reel/DS8appVjfKH/?igsh=MTl4dWV6OHZ2c3o0Zg==',
    }
  ]

  const tv = [
    {
      title: 'Televisión Central de China (CCTV)',
      organizacion: 'CGTN Español',
      nameButton: 'Website',
      imgName: 'cgtn',
      href: 'https://espanol.cgtn.com/news/2025-03-18/1901813188407869441/index.html?sfnsn=wa',
    }
  ]

  const gubernamental = [
    {
      title: 'Prefectura de Esmeraldas',
      organizacion: 'Gobierno',
      nameButton: 'Reals',
      videoname: 'provincializacion-esmeralda',
      href: 'https://www.instagram.com/reel/DRgImsmibaa/?utm_source=ig_web_button_share_sheet&igsh=MzRlODBiNWFlZA==',
    },
    {
      title: 'Elvis Crespo',
      organizacion: 'Alcaldia De Esmeraldas',
      nameButton: 'Reals',
      videoname: 'elvis-crespo',
      href: 'https://www.instagram.com/reel/DNA-zXrx9i8/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=='
    }
  ]

  return (
    <>
      <section className="pb-10 bg-honeydew-800 dark:bg-honeydew-900 pt-28" >

        <Banner
          label={`${_('label')}`}
          title={`${_('title')}`}
          description={`${_('description')}`}
        />

        <section className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <section className="space-y-6" >
            {/* capsula uno */}
            <SectionCard style="bg-honeydew-900 dark:bg-honeydew-800">
              <div>

                <ScrollBottonEffect>
                  <div className='flex justify-center font-mono text-3xl font-semibold uppercase'>
                    <span>{eventes('one')}</span>
                  </div>
                  <hr className="my-3 h-0.5 border-t-0 bg-white" />
                </ScrollBottonEffect>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {marinaEcovida.map((video, index) => (
                    <CardVideo
                      key={video.title}
                      index={index}
                      {...video}
                    />
                  ))}

                </div>
              </div>

            </SectionCard>

            {/* capsula dos */}
            <SectionCard style="bg-honeydew-900 dark:bg-honeydew-800">
              <div>
                <ScrollBottonEffect>
                  <div className='flex justify-center font-mono text-3xl font-semibold uppercase'>
                    <span>{eventes('two')}</span>
                  </div>
                  <hr className="my-3 h-0.5 border-t-0 bg-white" />
                </ScrollBottonEffect>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {eventoVarios.map((video, index) => (
                    <CardVideo
                      key={video.title}
                      index={index}
                      {...video}
                    />
                  ))}
                </div>
              </div>
            </SectionCard>

            {/* capsula tres */}
            <SectionCard style="bg-honeydew-900 dark:bg-honeydew-800">
              <div>
                <ScrollBottonEffect>
                  <div className='flex justify-center font-mono text-3xl font-semibold uppercase'>
                    <span>{eventes('three')}</span>
                  </div>
                  <hr className="my-3 h-0.5 border-t-0 bg-white" />
                </ScrollBottonEffect>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {documentals.map((video, index) => (
                    <CardVideo
                      key={video.title}
                      index={index}
                      {...video}
                    />
                  ))}
                </div>
              </div>
            </SectionCard>

            {/* capsula cuatro */}
            <SectionCard style="bg-honeydew-900 dark:bg-honeydew-800">
              <div>
                <ScrollBottonEffect>
                  <div className='flex justify-center font-mono text-3xl font-semibold uppercase'>
                    <span>{d('five')}</span>
                  </div>
                  <hr className="my-3 h-0.5 border-t-0 bg-white" />
                </ScrollBottonEffect>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

                  {tv.map((video, index) => (
                    <CardVideo
                      key={video.title}
                      index={index}
                      {...video}
                    />
                  ))}

                </div>
              </div>
            </SectionCard>

            {/* capsula quinta */}
            <SectionCard style="bg-honeydew-900 dark:bg-honeydew-800">
              <div>
                <ScrollBottonEffect>
                  <div className='flex justify-center font-mono text-3xl font-semibold uppercase'>
                    <span>{eventes('four')}</span>
                  </div>
                  <hr className="my-3 h-0.5 border-t-0 bg-white" />
                </ScrollBottonEffect>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

                  {gubernamental.map((video, index) => (
                    <CardVideo
                      key={video.title}
                      index={index}
                      {...video}
                    />
                  ))}

                </div>
              </div>
            </SectionCard>
          </section>
        </section>

      </section>

      <CallAction
        styleSPrimary='bg-honeydew-800 dark:bg-honeydew-900'
        styleSSecundary='text-honeydew-900 dark:text-honeydew-800'
        style='bg-honeydew-900 dark:bg-honeydew-800'
        background='bg-honeydew-800 dark:bg-honeydew-900'
        textColor='font-semibold text-3xl uppercase font-mono'
        text={t('text')}
        buttonText={t('buttonText')}
        buttonhref={`${prefix}/contact`}
        buttonColor='cursor-pointer text-center transition duration-500 bg-white text-black hover:bg-honeydew-900 hover:text-white dark:bg-honeydew-800 dark:hover:bg-white dark:hover:text-black dark:text-white flex justify-center'
      />
    </>
  )
}
