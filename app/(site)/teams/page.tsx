
import { createMetadata, Banner, SectionCard, CardClient, ScrollRevealEffect, ScrollBottonEffect } from '@/app/utils'
import { CallAction } from '@/app/component'
import { Instagram, PhoneCall } from 'lucide-react'

export const metadata = createMetadata({
  title: 'Nuestro equipo | JB.SKYLENS',
  description:
    'Conoce al equipo de JB.SKYLENS, especialistas en operación de drones, inspecciones técnicas y producción audiovisual aérea.',
  keywords: [
    'equipo JB.SKYLENS',
    'equipo de drones profesionales',
    'operadores de drones certificados',
    'pilotos de drones ecuador',
    'especialistas en drones',

    'equipo audiovisual con drones',
    'productores audiovisuales aéreos',
    'técnicos en drones',
    'expertos en filmación aérea',

    'empresa de drones en esmeraldas',
    'empresa de drones en ecuador',
    'equipo técnico de drones',

    'operador de drones profesional',
    'piloto de drones con experiencia',
    'equipo de inspección con drones',

    'equipo para seguridad industrial',
    'equipo para inspecciones técnicas',
    'equipo para producción audiovisual',

    'Joao Barres',
    'fundador JB.SKYLENS',
    'equipo JB SKYLENS drones',
    'profesionales en drones',
    'empresa audiovisual profesional',
  ]
  ,
  canonical: 'https://dron.joaobarres.dev/teams',
})

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

export default function Portfolio() {
  return (
    <>
      <section className="pb-10 bg-honeydew-800 dark:bg-honeydew-900 pt-28">
        <Banner
          label='Conoce a nuestro equipo de'
          title='Profesionales'
          description='Tenemos a un gran equipo de profesionales, pilotos, técnicos, cámaras y productores, para que tus grabaciones cuenten siempre con la mejor calidad'
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
        text='¡Somos la solución que buscas!'
        buttonText='Ver Portafolio'
        buttonhref='/portfolio'
        buttonColor='cursor-pointer text-center transition duration-500 bg-white text-black hover:bg-honeydew-900 hover:text-white dark:bg-honeydew-800 dark:hover:bg-white dark:hover:text-black dark:text-white flex justify-center'
      />
    </>
  )
}
