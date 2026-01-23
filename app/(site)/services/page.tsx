import { Banner, CardClient, createMetadata, SectionCard } from "@/app/utils";
import { FileSearchCorner } from 'lucide-react'

export const metadata = createMetadata({
  title: 'Servicios con drones',
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
