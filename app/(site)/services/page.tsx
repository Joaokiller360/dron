import { Banner, CardClient, createMetadata, ScrollRevealEffect, SectionCard } from "@/app/utils";
import { FileSearchCorner } from 'lucide-react'

export const metadata = createMetadata({
  title: 'Servicios con drones | JB.SKYLENS',
  description:
    'Servicios con drones en Ecuador: inspecciones técnicas, fotografía aérea, video profesional, eventos y soluciones industriales.',
  keywords: [
    // Long-tail Esmeraldas
    'empresa de servicios profesionales con drones en esmeraldas',
    'filmación aérea profesional para empresas en esmeraldas',
    'servicio de inspección técnica con drones en esmeraldas',
    'drones para inspección de puertos y muelles en esmeraldas',
    'fotografía aérea profesional para proyectos inmobiliarios en esmeraldas',
    'drones para seguridad industrial y vigilancia en esmeraldas',
    'levantamientos topográficos con drones en esmeraldas',
    'drones para grabación de eventos sociales en esmeraldas',
    'producción audiovisual corporativa con drones en esmeraldas',
    'servicios de drones certificados para empresas en esmeraldas',
    // Cortas – alto volumen local
    'drones esmeraldas',
    'empresa de drones esmeraldas',
    'servicios con drones esmeraldas',
    'drones profesionales esmeraldas',
    'filmación con drones esmeraldas',
    'fotografía aérea esmeraldas',
    'inspección con drones esmeraldas',
    'drones para empresas esmeraldas',
    'drones industriales esmeraldas',
    'operador de drones esmeraldas',

    // Medias – intención comercial
    'servicios profesionales con drones en esmeraldas',
    'empresa de filmación aérea en esmeraldas',
    'fotografía aérea profesional en esmeraldas',
    'inspección técnica con drones en esmeraldas',
    'drones para seguridad industrial en esmeraldas',
    'drones para proyectos industriales en esmeraldas',
    'drones para puertos en esmeraldas',
    'drones para barcos en esmeraldas',
    'drones para muelles y terminales portuarias en esmeraldas',
    'drones para levantamientos topográficos en esmeraldas',

    // Long-tail – intención alta (las mejores)
    'empresa especializada en servicios profesionales con drones en esmeraldas',
    'servicio de filmación aérea profesional para empresas en esmeraldas',
    'inspección técnica de infraestructuras con drones en esmeraldas',
    'drones para inspección de puertos y operaciones portuarias en esmeraldas',
    'fotografía aérea profesional para proyectos inmobiliarios en esmeraldas',
    'drones para seguridad industrial y vigilancia aérea en esmeraldas',
    'levantamientos topográficos de alta precisión con drones en esmeraldas',
    'drones para inspección de barcos y embarcaciones en esmeraldas',
    'servicios de drones certificados y legales en esmeraldas',
    'empresa de drones con experiencia en proyectos industriales en esmeraldas',

    // Sector industrial / técnico
    'drones para inspección industrial en esmeraldas',
    'drones para inspección de estructuras metálicas en esmeraldas',
    'drones para monitoreo de obras civiles en esmeraldas',
    'drones para inspección de techos industriales en esmeraldas',
    'drones para evaluación estructural en esmeraldas',
    'servicios técnicos con drones para empresas en esmeraldas',
    'drones para control y seguimiento de proyectos en esmeraldas',
    'drones para vigilancia de instalaciones industriales en esmeraldas',
    'drones para zonas portuarias en esmeraldas',
    'drones para infraestructura crítica en esmeraldas',

    // Audiovisual / marketing
    'producción audiovisual con drones en esmeraldas',
    'video corporativo profesional con drones en esmeraldas',
    'filmación aérea cinematográfica en esmeraldas',
    'drones para publicidad y marketing en esmeraldas',
    'contenido audiovisual aéreo para marcas en esmeraldas',
    'grabación de eventos con drones en esmeraldas',
    'drones para videos promocionales en esmeraldas',
    'fotografía aérea para redes sociales en esmeraldas',
    'drones para campañas publicitarias en esmeraldas',
    'servicios audiovisuales aéreos profesionales en esmeraldas',

    // Confianza / legal / marca
    'empresa de drones certificada en esmeraldas',
    'operador de drones autorizado en esmeraldas',
    'servicios de drones con permisos legales en esmeraldas',
    'empresa profesional de drones en esmeraldas',
    'soluciones con drones para empresas en esmeraldas',
    'servicios integrales con drones en esmeraldas',
    'empresa líder en servicios con drones en esmeraldas',
    'drones profesionales para proyectos empresariales en esmeraldas',
    'servicios avanzados de drones en esmeraldas',
    'empresa confiable de drones en esmeraldas',

    // Long-tail Quito
    'empresa especializada en servicios con drones en quito',
    'filmación aérea profesional para constructoras en quito',
    'inspección técnica de infraestructuras con drones en quito',
    'drones para inspección de edificios y fachadas en quito',
    'fotografía aérea profesional para bienes raíces en quito',
    'levantamientos topográficos de alta precisión con drones en quito',
    'drones para monitoreo de obras civiles en quito',
    'producción audiovisual aérea para marcas en quito',
    'drones para publicidad y marketing digital en quito',
    'servicios profesionales de drones con permisos legales en quito',

    // Long-tail Guayaquil
    'empresa de servicios con drones profesionales en guayaquil',
    'filmación aérea de proyectos industriales en guayaquil',
    'inspección industrial con drones para fábricas en guayaquil',
    'drones para inspección de puertos y zonas marítimas en guayaquil',
    'fotografía aérea profesional para empresas en guayaquil',
    'drones para seguridad industrial y vigilancia aérea en guayaquil',
    'levantamientos topográficos con drones para constructoras en guayaquil',
    'producción audiovisual aérea para campañas publicitarias en guayaquil',
    'drones para grabación de eventos corporativos en guayaquil',
    'servicios de drones certificados y autorizados en guayaquil',

    // Servicios técnicos long-tail
    'servicio profesional de inspección técnica con drones en ecuador',
    'drones especializados en inspección de infraestructuras críticas',
    'inspección de techos y cubiertas industriales con drones',
    'inspección de puentes y viaductos usando drones profesionales',
    'drones para monitoreo y control de proyectos industriales',
    'drones para vigilancia aérea en zonas industriales',
    'servicios de drones para evaluación estructural',
    'drones para inspección de instalaciones portuarias',
    'drones para inspección de barcos y embarcaciones',
    'servicios de drones para seguridad industrial avanzada',

    // Audiovisual long-tail
    'servicios profesionales de filmación aérea con drones',
    'producción audiovisual aérea para empresas y marcas',
    'video corporativo profesional grabado con drones',
    'contenido audiovisual aéreo para marketing digital',
    'filmación cinematográfica aérea con drones profesionales',
    'fotografía aérea de alta resolución con drones',
    'drones para grabación de spots publicitarios',
    'producción de videos promocionales con drones',
    'servicios audiovisuales aéreos para redes sociales',
    'drones para contenido visual de alto impacto',

    // Marca + confianza
    'empresa de drones con experiencia comprobada en ecuador',
    'operador de drones profesional certificado en ecuador',
    'servicios de drones con cumplimiento legal en ecuador',
    'empresa especializada en drones para empresas',
    'soluciones técnicas y audiovisuales con drones',
    'servicios integrales con drones profesionales',
    'empresa de drones para proyectos industriales y comerciales',
    'servicios avanzados de drones para inspección y video',
    'empresa líder en servicios con drones en ecuador',
    'servicios de drones de alta calidad profesional'
  ],
  canonical: 'https://dron.joaobarres.dev/services',
})

const link = '/services/'

const clients = [
  {
    services: [
      {
        title: 'Grabación de cine, series y peliculas',
        description:
          'Producción audiovisual aérea con calidad cinematográfica, ideal para escenas dinámicas, tomas creativas y narrativas de alto impacto visual'
      }
    ],
    content: [
      {
        imgName: 'grabacion-cine'
      }
    ],
    buttons: [
      {
        id: 1,
        href: `${link}film-and-tv-production`,
        active: true,
        name: 'Ver Más',
        icon: <FileSearchCorner size={24} strokeWidth={2} />
      }
    ]
  },
  {
    services: [
      {
        title: 'Localización y reconocimiento',
        description: 'Análisis visual del terreno para planificación, evaluación de zonas y toma de decisiones antes de iniciar un proyecto o producción'
      }
    ],
    content: [
      {
        imgName: 'localizacion-reconocimiento'
      }
    ],
    buttons: [
      {
        id: 1,
        href: `${link}location-scouting-and-recon`,
        active: true,
        name: 'Ver Más',
        icon: <FileSearchCorner size={24} strokeWidth={2} />
      }
    ]
  },
  {
    services: [
      {
        title: 'Industrial, inspección y fotogrametría',
        description: 'Captura aérea técnica para inspección de infraestructuras, levantamientos fotogramétricos y monitoreo industrial con alta precisión'
      }
    ],
    content: [
      {
        imgName: 'industria-inspeccion'
      }
    ],
    buttons: [
      {
        id: 1,
        href: `${link}insdustrial-inspection-and-photogrammetry`,
        active: true,
        name: 'Ver Más',
        icon: <FileSearchCorner size={24} strokeWidth={2} />
      }
    ]
  },
  {
    services: [
      {
        title: 'Vuelo en ciudad',
        description: 'Operaciones con dron en entornos urbanos, cumpliendo normativas y garantizando seguridad para proyectos comerciales y audiovisuales'
      }
    ],
    content: [
      {
        imgName: 'vuelo-ciudad'
      }
    ],
    buttons: [
      {
        id: 1,
        href: `${link}urban-flight-operations`,
        active: true,
        name: 'Ver Más',
        icon: <FileSearchCorner size={24} strokeWidth={2} />
      }
    ]
  },
  {
    services: [
      {
        title: 'Eventos y retransmisiones',
        description: 'Cobertura aérea en tiempo real o grabada para eventos, shows y actividades especiales, brindando una perspectiva única y envolvente'
      }
    ],
    content: [
      {
        imgName: 'evento-retransmisiones'
      }
    ],
    buttons: [
      {
        id: 1,
        href: `${link}events-and-live-broadcasting`,
        active: true,
        name: 'Ver Más',
        icon: <FileSearchCorner size={24} strokeWidth={2} />
      }
    ]
  },
  {
    services: [
      {
        title: 'Drones para inmobiliaria',
        description: 'Captura aérea de propiedades para el sector inmobiliario, mostrando ubicaciones, características y detalles de manera atractiva para potenciales compradores'
      }
    ],
    content: [
      {
        imgName: 'drones-inmobiliaria'
      }
    ],
    buttons: [
      {
        id: 1,
        href: `${link}urban-flight-operations`,
        active: true,
        name: 'Ver Más',
        icon: <FileSearchCorner size={24} strokeWidth={2} />
      }
    ]
  }
]

export default function Services() {

  return (
    <>
      <section className="pb-10 bg-honeydew-900 dark:bg-honeydew-800 pt-28" >
        <Banner
          title='explora nuestros servicios'
          label='Servicios'
        />

        <section className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <section className="space-y-6" >
            {/* capsula uno */}
            <SectionCard style="bg-honeydew-800 dark:bg-honeydew-900">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

                {clients.map((client, index) => (
                  <ScrollRevealEffect key={index} index={index}>
                    <CardClient
                      index={index}
                      services={client.services}
                      content={client.content}
                      buttons={client.buttons}
                    />
                  </ScrollRevealEffect>
                ))}

              </div>

            </SectionCard>
          </section>
        </section>
      </section>

    </>
  )
}
