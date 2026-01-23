import { Banner, CardClient, createMetadata, SectionCard } from "@/app/utils";
import { FileSearchCorner } from 'lucide-react'

export const metadata = createMetadata({
  title: 'Servicios con drones',
  description:
    'Servicios con drones en Ecuador: inspecciones técnicas, fotografía aérea, video profesional, eventos y soluciones industriales.',
  keywords: [
    'servicios con drones',
    'inspección con drones',
    'fotografía aérea profesional',
    'video con drones Ecuador',
    'JB.SKYLENS',
  ],
  canonical: 'https://dron.joaobarres.dev/services',
})


export default function Services() {
  return (
    <>
      <section className="pb-10 bg-honeydew-900 dark:bg-honeydew-800 pt-28" >
        <Banner
          title='explora nuestros servicios'
        />

        <section className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <section className="space-y-6" >
            {/* capsula uno */}
            <SectionCard style="bg-honeydew-800 dark:bg-honeydew-900">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

                <CardClient
                  services={[
                    {
                      title: 'Grabación de cine, series y peliculas',
                      description: 'Producción audiovisual aérea con calidad cinematográfica, ideal para escenas dinámicas, tomas creativas y narrativas de alto impacto visual'
                    }
                  ]}
                  content={[
                    {
                      imgName: 'grabacion-cine'
                    }
                  ]}
                  buttons={[
                    {
                      id: 1,
                      href: '/',
                      active: true,
                      name: 'Ver Más',
                      icon: <FileSearchCorner size={24} strokeWidth={2} />
                    }
                  ]}
                />

                <CardClient
                  services={[
                    {
                      title: 'Localización y reconocimiento',
                      description: 'Análisis visual del terreno para planificación, evaluación de zonas y toma de decisiones antes de iniciar un proyecto o producción'
                    }
                  ]}
                  content={[
                    {
                      imgName: 'localizacion-reconocimiento'
                    }
                  ]}
                  buttons={[
                    {
                      id: 1,
                      href: '/',
                      active: true,
                      name: 'Ver Más',
                      icon: <FileSearchCorner size={24} strokeWidth={2} />
                    }
                  ]}
                />

                <CardClient
                  services={[
                    {
                      title: 'Industrial, inspección y fotogrametría',
                      description: 'Captura aérea técnica para inspección de infraestructuras, levantamientos fotogramétricos y monitoreo industrial con alta precisión'
                    }
                  ]}
                  content={[
                    {
                      imgName: 'industria-inspeccion'
                    }
                  ]}
                  buttons={[
                    {
                      id: 1,
                      href: '/',
                      active: true,
                      name: 'Ver Más',
                      icon: <FileSearchCorner size={24} strokeWidth={2} />
                    }
                  ]}
                />

                <CardClient
                  services={[
                    {
                      title: 'Vuelo en ciudad',
                      description: 'Operaciones con dron en entornos urbanos, cumpliendo normativas y garantizando seguridad para proyectos comerciales y audiovisuales'
                    }
                  ]}
                  content={[
                    {
                      imgName: 'vuelo-ciudad'
                    }
                  ]}
                  buttons={[
                    {
                      id: 1,
                      href: '/',
                      active: true,
                      name: 'Ver Más',
                      icon: <FileSearchCorner size={24} strokeWidth={2} />
                    }
                  ]}
                />

                <CardClient
                  services={[
                    {
                      title: 'Eventos y retransmisiones',
                      description: 'Cobertura aérea en tiempo real o grabada para eventos, shows y actividades especiales, brindando una perspectiva única y envolvente'
                    }
                  ]}
                  content={[
                    {
                      imgName: 'evento-retransmisiones'
                    }
                  ]}
                  buttons={[
                    {
                      id: 1,
                      href: '/',
                      active: true,
                      name: 'Ver Más',
                      icon: <FileSearchCorner size={24} strokeWidth={2} />
                    }
                  ]}
                />

              </div>

            </SectionCard>
          </section>
        </section>
      </section>

    </>
  )
}
