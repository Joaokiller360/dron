
import { CallAction } from '@/app/component'
import { Banner, SectionCard, createMetadata, CardClient } from '@/app/utils'
import { PhoneCall, Instagram } from 'lucide-react'

export const metadata = createMetadata('Clientes')

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
            <SectionCard>
              <div>
                <div className='flex justify-center font-mono text-3xl font-semibold uppercase'>
                  <span>gran consumo</span>
                </div>
                <hr className="my-3 h-0.5 border-t-0 bg-white" />
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  <CardClient
                    client='Marina Ecovida'
                    imgName='marina'
                    organizacion='Event Garden'
                    buttons={[
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
                    ]}
                  />
                  <CardClient
                    client='Vida Pura Beach'
                    imgName='vida-pura'
                    organizacion='Event Garden'
                    buttons={[
                      {
                        id: 1,
                        href: 'https://www.instagram.com/marinaecovida',
                        active: true,
                        name: 'Instagram',
                        icon: <Instagram size={24} strokeWidth={2} />
                      }
                    ]}
                  />
                  <CardClient
                    client='Rumbeke Music Entertainment'
                    imgName='rumbeke'
                    organizacion='Event Garden'
                    buttons={[
                      {
                        id: 1,
                        href: 'https://www.instagram.com/rumbekemusicentertainment',
                        active: true,
                        name: 'Instagram',
                        icon: <Instagram size={24} strokeWidth={2} />
                      }
                    ]}
                  />
                </div>
              </div>

            </SectionCard>
            {/* capsula dos */}
            <SectionCard>
              <div>
                <div className='flex justify-center font-mono text-3xl font-semibold uppercase'>
                  <span>documentales</span>
                </div>
                <hr className="my-3 h-0.5 border-t-0 bg-white" />
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  <CardClient
                    client='Fundación Corazones Descalzos'
                    imgName='corazones-descalzos'
                    organizacion='Fundación'
                    buttons={[
                      {
                        id: 1,
                        href: 'https://www.instagram.com/corazones.descalzos',
                        active: true,
                        name: 'Instagram',
                        icon: <Instagram size={24} strokeWidth={2} />
                      }
                    ]}
                  />
                </div>
              </div>
            </SectionCard>
            {/* capsula tres */}
            <SectionCard>
              <div>
                <div className='flex justify-center font-mono text-3xl font-semibold uppercase'>
                  <span>Gubernamental</span>
                </div>
                <hr className="my-3 h-0.5 border-t-0 bg-white" />
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  <CardClient
                    client='Prefectura de Esmeraldas'
                    imgName='prefectura-esmeraldas'
                    organizacion='Gubernamental'
                    buttons={[
                      {
                        id: 1,
                        href: 'https://www.instagram.com/esmeraldasprefectura',
                        active: true,
                        name: 'Instagram',
                        icon: <Instagram size={24} strokeWidth={2} />
                      }
                    ]}
                  />
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
