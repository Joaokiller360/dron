import { LegalPage, createMetadata } from "@/app/utils";

export const metadata = createMetadata({
  title: 'Política de Privacidad | JB.SKYLENS',
  description:
    'Consulta la política de privacidad de JB.SKYLENS, empresa especializada en servicios profesionales con drones en Ecuador.',
  keywords: [
    'JB.SKYLENS',
    'drones Ecuador',
    'política de privacidad',
    'servicios con drones',
    'Joao Barres',
  ],
  canonical: 'https://dron.joaobarres.dev/legal/privacy-policies',
})

export default function TermsAndConditions() {
  return (
    <section className="pb-10 bg-honeydew-900 dark:bg-honeydew-800 pt-28" >

      <LegalPage
        title="Política de Privacidad"
        label="Nuestros"
        lastUpdate="23 de Enero del 2026"
        keyword={[
          'Visite'
        ]}

        content={[
          {
            heading: 'INTRODUCCIÓN',
            text: [
              'Esta Política de privacidad describe cómo se recopila, utiliza y comparte su información personal cuando visita o hace una compra en https://dron.joaobarres.dev (denominado en lo sucesivo el "Sitio").'
            ],
          },
          {
            heading: '1. INFORMACIÓN PERSONAL QUE RECOPILAMOS',
            text: [
              `
              Cuando visita el Sitio, recopilamos automáticamente cierta información sobre su dispositivo, incluida información sobre su navegador web, dirección IP,
zona horaria y algunas de las cookies que están instaladas en su dispositivo.
              `,
              `
              Además, a medida que navega por el Sitio, recopilamos información sobre lapáginas web individuales o los productos que ve, las páginas web o los términos de búsqueda que lo remitieron al Sitio e información sobre cómo
interactúa usted con el Sitio. 
              `,
              `
              Nos referimos a esta información recopilada automáticamente como “Información del dispositivo”
              `,
              'Recopilamos Información del dispositivo mediante el uso de las siguientes tecnologías:'
            ],
            lists: [
              {
                header: 'Cookies',
                description: 'Las cookies son archivos de datos que se colocan en su dispositivo o computadora y a menudo incluyen un identificador único anónimo. Para obtener más información sobre las cookies y cómo deshabilitarlas, visite http://www.allaboutcookies.org.',
                items: [
                  'Cookies persistentes: Estas cookies permanecen en su dispositivo hasta que las elimina o su navegador las elimina automáticamente después de un período de tiempo determinado.',
                  'Cookies de terceros: Estas cookies se colocan a través de nuestro Sitio por nuestros socios publicitarios y analíticos. Estas cookies pueden reconocer su computadora tanto en nuestro Sitio como en otros sitios web.'
                ]
              },
            ]
          },
        ]}
      />

    </section>
  )
}