
import { CallAction } from '@/app/component'
import { Banner, SectionCard, createMetadata, CardClient, ScrollRevealEffect } from '@/app/utils'
import { PhoneCall, Instagram } from 'lucide-react'

export const metadata = createMetadata({
  title: 'Clientes | JB.SKYLENS',
  description:
    'Empresas y personas que han confiado en JB.SKYLENS para servicios profesionales con drones en Ecuador.',
  keywords: [
    'clientes JB.SKYLENS',
    'empresas que usan drones',
    'clientes de servicios con drones',
    'empresas atendidas con drones',

    'drones para empresas ecuador',
    'servicios de drones empresariales',
    'drones para industria',
    'drones para puertos',
    'drones para eventos empresariales',

    'clientes de filmación aérea',
    'clientes de fotografía aérea',
    'clientes de producción audiovisual',

    'empresas de esmeraldas con drones',
    'clientes corporativos con drones',

    'confianza en servicios con drones',
    'casos de éxito con drones',
    'proyectos empresariales con drones',

    'clientes JB SKYLENS drones',
    'empresas que confían en JB.SKYLENS',
    'servicios profesionales con drones',
    'empresa de drones confiable',
  ]
  ,
  canonical: 'https://dron.joaobarres.dev/clients',
})

const documentals = [
  {
    clients: [
      {
        client: 'Fundación Corazones Descalzos',
        organizacion: 'Fundación',
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

const gubernamental = [
  {
    clients: [
      {
        client: 'Prefectura de Esmeraldas',
        organizacion: 'Gubernamental'
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
        organizacion: 'Gubernamental'
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
        organizacion: 'Event Garden'
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
        organizacion: 'Event Garden'
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
        organizacion: 'Event Garden'
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
  },
  {
    clients: [
      {
        client: 'Corona',
        organizacion: 'Event Garden'
      }
    ],
    content: [
      {
        imgName: 'corona'
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


export default function Clients() {

  return (
    <>
      <div className="pb-10 bg-honeydew-800 dark:bg-honeydew-900 pt-28">
        <Banner
          label='clientes'
          title='que han confiado en nosotros'
          description='Nuestro equipo de profesionales se esfuerza para ofrecer garantía de satisfacción a nuestros clientes finales. Trabajamos con las grandes casas del entretenimiento y primeras marcas en el mundo'
        />
        <section className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">

          <section className="space-y-6">
            {/* capsula uno */}
            <SectionCard style='bg-honeydew-900 dark:bg-honeydew-800'>
              <div>
                <div className='flex justify-center font-mono text-3xl font-semibold uppercase'>
                  <span>gran consumo</span>
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
                  <span>documentales</span>
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
                  <span>Gubernamental</span>
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
        text='¡Somos la solución que buscas!'
        buttonText='¡Contáctanos!'
        buttonhref='/contact'
        buttonColor='cursor-pointer text-center transition duration-500 bg-white text-black hover:bg-honeydew-900 hover:text-white dark:bg-honeydew-800 dark:hover:bg-white dark:hover:text-black dark:text-white flex justify-center'
      />
    </>
  )
}
