'use client'
import { Banner, SectionCard, CardClient, ScrollRevealEffect, ScrollBottonEffect } from '@/app/utils'
import { CallAction } from '@/app/component'
import { Instagram, PhoneCall } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl';

export default function TeamsClient() {
  const _ = useTranslations('teams');
  const t = useTranslations('teams.collToAction');
  const locale = useLocale();
  const prefix = locale === 'es' ? '' : `/${locale}`;

  const teams = [
    {
      clients: [
        {
          client: 'Joao Barres',
          organizacion: 'Pailot'
        }
      ],
      content: [
        {
          imgName: 'pilot'
        }
      ],
      buttons: [
        {
          id: 1,
          href: 'https://www.instagram.com/joao_barres',
          active: true,
          name: 'Instagram',
          icon: <Instagram size={24} strokeWidth={2} />
        }, {
          id: 2,
          href: 'https://api.whatsapp.com/message/SI7RZTHBYV3AK1?autoload=1&app_absent=0&utm_source=ig',
          active: false,
          name: 'Contacto',
          icon: <PhoneCall size={24} strokeWidth={2} />
        }
      ]
    },
    {
      clients: [
        {
          client: 'Camara.Esme',
          organizacion: 'Filmaker'
        }
      ],
      content: [
        {
          imgName: 'camaraEsme'
        }
      ],
      buttons: [
        {
          id: 1,
          href: 'https://www.instagram.com/camara.esme',
          active: true,
          name: 'Instagram',
          icon: <Instagram size={24} strokeWidth={2} />
        }, {
          id: 2,
          href: 'https://api.whatsapp.com/message/SI7RZTHBYV3AK1?autoload=1&app_absent=0&utm_source=ig',
          active: false,
          name: 'Contacto',
          icon: <PhoneCall size={24} strokeWidth={2} />
        }
      ]
    }
  ]

  return (
    <>
      <section className="pb-10 bg-honeydew-800 dark:bg-honeydew-900 pt-28">
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
                <ScrollBottonEffect>
                  <div className='flex justify-center font-mono text-3xl font-semibold uppercase'>
                    <span>El crew dron</span>
                  </div>
                  <hr className="my-3 h-0.5 border-t-0 bg-white" />
                </ScrollBottonEffect>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {teams.map((team, index) => (
                    <ScrollRevealEffect key={index} index={index}>
                      <CardClient
                        index={index}
                        clients={team.clients}
                        content={team.content}
                        buttons={team.buttons}
                      />
                    </ScrollRevealEffect>
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
        buttonhref={`${prefix}/portfolio`}
        buttonColor='cursor-pointer text-center transition duration-500 bg-white text-black hover:bg-honeydew-900 hover:text-white dark:bg-honeydew-800 dark:hover:bg-white dark:hover:text-black dark:text-white flex justify-center'
      />
    </>
  )
}
