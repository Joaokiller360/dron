import { Banner, CardClient, createMetadata, SectionCard } from "@/app/utils";
import { FileSearchCorner } from 'lucide-react'

export const metadata = createMetadata({
  title: 'Servicios con drones',
  description:
    'Servicios con drones en Ecuador: inspecciones técnicas, fotografía aérea, video profesional, eventos y soluciones industriales.',
    keywords: [
      'servicios con drones esmeraldas',
      'servicios de drones profesionales',
      'drones para inspección técnica',
      'drones para filmación profesional',
      'drones para fotografía aérea',
      'drones para levantamientos topográficos',
      'drones para vigilancia aérea',
      'drones para seguridad industrial',
      'drones para infraestructuras',
    
      'inspección de puentes con drones',
      'inspección de techos con drones',
      'inspección industrial con drones',
      'drones para puertos',
      'drones para barcos',
      'drones para operaciones portuarias',
    
      'drones para publicidad',
      'drones para marketing',
      'producción audiovisual con drones',
      'video corporativo con drones',
      'contenido publicitario aéreo',
    
      'servicios de drones en ecuador',
      'empresa de drones ecuador',
      'drones profesionales ecuador',
      'operador de drones certificado',
      'drones con permisos legales',
    
      'JB.SKYLENS servicios',
      'servicios JB SKYLENS',
      'drones para empresas',
      'servicios técnicos con drones',
      'servicios audiovisuales aéreos',
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
