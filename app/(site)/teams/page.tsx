
import { createMetadata, Banner, SectionCard } from '@/app/utils'
import { CallAction } from '@/app/component'

export const metadata = createMetadata('Equipo')

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
            <SectionCard>
              <div>
                <div className='flex justify-center font-mono text-3xl font-semibold uppercase'>
                  <span>El quipo de dron</span>
                </div>
                <hr className="my-3 h-0.5 border-t-0 bg-white" />
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  <div>
                    <img className="h-auto max-w-full rounded-xl" src="https://flowbite.s3.amazonaws.com/docs/gallery/square/image.jpg" alt="" />
                  </div>
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
