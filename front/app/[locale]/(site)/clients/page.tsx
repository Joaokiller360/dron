
import { CallAction } from '@/app/component'
import { Banner, SectionCard, CardClient, ScrollRevealEffect } from '@/app/utils'
import { PhoneCall, Instagram, EarthIcon } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { getMessages } from 'next-intl/server';

export async function generateMetadata() {
  const messages = await getMessages();
  return {
    title: messages.clients?.metadeta?.TitleMeta || 'Cliente | JB.SKYLENS',
    description:
      messages.clients?.metadeta?.DescriptionMeta || 'Conoce a los clientes de JB.SKYLENS, empresas y marcas que han confiado en nuestros servicios profesionales con drones en Ecuador.',
    keywords: [
      messages.clients?.metadeta?.keywords
    ],
    canonical: messages.clients?.metadeta?.canonical,
  };
}

export default function Clients() {

  const _ = useTranslations('clients');
  const section = useTranslations('clients.sectionClients');
  const callToAction = useTranslations('clients.collToAction');
  const present = useTranslations('clients.presentation');

  const locale = useLocale();

  // Solo agregar prefijo de idioma si NO es el idioma por defecto (es)
  const prefix = locale === 'es' ? '' : `/${locale}`;

  const documentals = [
    {
      clients: [
        {
          client: 'Fundación Corazones Descalzos',
          organizacion: `${present('one')}`,
        }
      ],
      content: [
        {
          imgName: 'corazones-descalzos'
        }
      ],
      buttons: [
        {
          id: 1,
          href: 'https://www.instagram.com/fundacionph3',
          active: true,
          name: 'Instagram',
          icon: <Instagram size={24} strokeWidth={2} />
        }
      ]
    }

  ]

  const tv = [
    {
      clients: [
        {
          client: 'Televisión Central de China (CCTV)',
          organizacion: `${present('five')}`,
        }
      ],
      content: [
        {
          imgName: 'cgtn'
        }
      ],
      buttons: [
        {
          id: 1,
          href: 'https://espanol.cgtn.com/news/2025-03-18/1901813188407869441/index.html?sfnsn=wa',
          active: true,
          name: 'Website',
          icon: <EarthIcon size={24} strokeWidth={2} />
        }
      ]
    }

  ]

  const gubernamental = [
    {
      clients: [
        {
          client: 'Prefectura de Esmeraldas',
          organizacion: `${present('two')}`,
        }
      ],
      content: [
        {
          imgName: 'prefectura-esmeraldas'
        }
      ],
      buttons: [
        {
          id: 1,
          href: 'https://www.instagram.com/esmeraldasprefectura',
          active: true,
          name: 'Instagram',
          icon: <Instagram size={24} strokeWidth={2} />
        }
      ]
    },
    {
      clients: [
        {
          client: 'Alcaldía de Esmeraldas',
          organizacion: `${present('two')}`,
        }
      ],
      content: [
        {
          imgName: 'alcaldia-esmeraldas'
        }
      ],
      buttons: [
        {
          id: 1,
          href: 'https://www.instagram.com/',
          active: true,
          name: 'Instagram',
          icon: <Instagram size={24} strokeWidth={2} />
        }
      ]
    }

  ]

  const grandConsomer = [
    {
      clients: [
        {
          client: 'Marina Ecovida',
          organizacion: `${present('four')}`
        }
      ],
      content: [
        {
          imgName: 'marina'
        }
      ],
      buttons: [
        {
          id: 1,
          href: 'https://www.instagram.com/marinaecovida',
          active: true,
          name: 'Instagram',
          icon: <Instagram size={24} strokeWidth={2} />
        }, {
          id: 2,
          href: 'https://api.whatsapp.com/message/SI7RZTHBYV3AK1?autoload=1&app_absent=0&utm_source=ig',
          active: true,
          name: 'Contacto',
          icon: <PhoneCall size={24} strokeWidth={2} />
        }
      ]
    },
    {
      clients: [
        {
          client: 'Vida Pura Beach',
          organizacion: `${present('four')}`,
        }
      ],
      content: [
        {
          imgName: 'vida-pura'
        }
      ],
      buttons: [
        {
          id: 1,
          href: 'https://www.instagram.com/marinaecovida',
          active: true,
          name: 'Instagram',
          icon: <Instagram size={24} strokeWidth={2} />
        }
      ]
    },
    {
      clients: [
        {
          client: 'Rumbeke Music Entertainment',
          organizacion: `${present('four')}`
        }
      ],
      content: [
        {
          imgName: 'rumbeke'
        }
      ],
      buttons: [
        {
          id: 1,
          href: 'https://www.instagram.com/rumbekemusicentertainment',
          active: true,
          name: 'Instagram',
          icon: <Instagram size={24} strokeWidth={2} />
        }
      ]
    }
  ]

  return (
    <>
      <div className="pb-10 bg-honeydew-800 dark:bg-honeydew-900 pt-28">
        <Banner
          label={`${_('label')}`}
          title={`${_('title')}`}
          description={`${_('description')}`}
        />
        <section className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">

          <section className="space-y-6">
            {/* capsula uno */}
            <SectionCard style='bg-honeydew-900 dark:bg-honeydew-800'>
              <div>
                <div className='flex justify-center font-mono text-3xl font-semibold uppercase'>
                  <span>{section('one')}</span>
                </div>
                <hr className="my-3 h-0.5 border-t-0 bg-white" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

                  {grandConsomer.map((item, index) => (
                    <ScrollRevealEffect key={index} index={index}>
                      <CardClient
                        index={index}
                        clients={item.clients}
                        content={item.content}
                        buttons={item.buttons}
                      />
                    </ScrollRevealEffect>
                  ))}

                </div>
              </div>

            </SectionCard>
            {/* capsula dos */}
            <SectionCard style='bg-honeydew-900 dark:bg-honeydew-800'>
              <div>
                <div className='flex justify-center font-mono text-3xl font-semibold uppercase'>
                  <span>{section('two')}</span>
                </div>
                <hr className="my-3 h-0.5 border-t-0 bg-white" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

                  {documentals.map((item, index) => (
                    <ScrollRevealEffect key={index} index={index}>
                      <CardClient
                        index={index}
                        clients={item.clients}
                        content={item.content}
                        buttons={item.buttons}
                      />
                    </ScrollRevealEffect>
                  ))}

                </div>
              </div>
            </SectionCard>
            {/* capsula tres */}
            <SectionCard style='bg-honeydew-900 dark:bg-honeydew-800'>
              <div>
                <div className='flex justify-center font-mono text-3xl font-semibold uppercase'>
                  <span>{section('four')}</span>
                </div>
                <hr className="my-3 h-0.5 border-t-0 bg-white" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

                  {tv.map((item, index) => (
                    <ScrollRevealEffect key={index} index={index}>
                      <CardClient
                        index={index}
                        clients={item.clients}
                        content={item.content}
                        buttons={item.buttons}
                      />
                    </ScrollRevealEffect>
                  ))}

                </div>
              </div>
            </SectionCard>
            {/* capsula tres */}
            <SectionCard style='bg-honeydew-900 dark:bg-honeydew-800'>
              <div>
                <div className='flex justify-center font-mono text-3xl font-semibold uppercase'>
                  <span>{section('three')}</span>
                </div>
                <hr className="my-3 h-0.5 border-t-0 bg-white" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

                  {gubernamental.map((item, index) => (
                    <ScrollRevealEffect key={index} index={index}>
                      <CardClient
                        index={index}
                        clients={item.clients}
                        content={item.content}
                        buttons={item.buttons}
                      />
                    </ScrollRevealEffect>
                  ))}

                </div>
              </div>
            </SectionCard>
          </section>
        </section>

      </div>

      <CallAction
        styleSPrimary='bg-honeydew-800 dark:bg-honeydew-900'
        styleSSecundary='text-honeydew-900 dark:text-honeydew-800'
        style='bg-honeydew-900 dark:bg-honeydew-800'
        background='bg-honeydew-800 dark:bg-honeydew-900'
        textColor='font-semibold text-3xl uppercase font-mono'
        text={callToAction('text')}
        buttonText={callToAction('buttonText')}
        buttonhref={`${prefix}/contact`}
        buttonColor='cursor-pointer text-center transition duration-500 bg-white text-black hover:bg-honeydew-900 hover:text-white dark:bg-honeydew-800 dark:hover:bg-white dark:hover:text-black dark:text-white flex justify-center'
      />
    </>
  )
}
