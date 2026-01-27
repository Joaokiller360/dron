
import { Banner, createMetadata, SeparatorUp } from "@/app/utils"
import { From } from "@/app/hooks"
import { About } from '@/app/component'

export const metadata = createMetadata({
  title: 'Contacto | JB.SKYLENS',
  description:
    'Contáctanos para servicios profesionales con drones en Ecuador. Cotizaciones para inspecciones, eventos, fotografía y video aéreo.',
  keywords: [
    'contacto JB.SKYLENS',
    'cotización drones',
    'drones Ecuador contacto',
    'servicios con drones Ecuador',
  ],
  canonical: 'https://dron.joaobarres.dev/contact',
})


export default function Contact() {
  return (
    <>
      <div className="pb-10 bg-honeydew-800 dark:bg-honeydew-900 pt-28">

        <Banner
          label="mas informacion"
          title="Contacta con nosotros"
          description="Ponte en contacto con nosotros para brindarte más información sobre nuestros servicios y ofrecerte un presupuesto adaptado"
        />

        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <section className="p-5 bg-honeydew-900 dark:bg-honeydew-800 rounded-2xl sm:p-10">
            <From additionalClasses="text-black" />
          </section>
        </div>
      </div>

      <SeparatorUp colorsPrimary="bg-honeydew-800 dark:bg-honeydew-900" colorsSecundary="text-honeydew-900 dark:text-honeydew-800" />
      
      <About />

    </>
  )
}