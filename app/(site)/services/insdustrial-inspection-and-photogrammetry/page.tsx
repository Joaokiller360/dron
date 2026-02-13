
import { PageServices, createMetadata } from '@/app/utils'

export const metadata = createMetadata({
  title: 'Industrial, inspección y fotogrametría | JB.SKYLENS',
  description:
    'Servicios profesionales de inspección industrial y fotogrametría con drones en Ecuador. Levantamientos topográficos, análisis técnico, monitoreo de infraestructura y soluciones aéreas para proyectos industriales y portuarios.',
  keywords: [
    'fotogrametría con drones',
    'inspección industrial con drones',
    'levantamientos topográficos con drones',
    'análisis técnico aéreo',

    'drones para industria ecuador',
    'inspección de infraestructura con drones',
    'drones para puertos',
    'monitoreo industrial aéreo',

    'modelos 3D con drones',
    'mapeo aéreo profesional',
    'topografía con drones',
    'ortomosaicos con drones',

    'servicios de drones en esmeraldas',
    'operaciones técnicas con drones',
    'drones para ingeniería',

    'JB.SKYLENS industrial',
    'empresa de drones profesional',
    'servicios técnicos con drones',
    'drones para proyectos industriales'
  ]
  ,
  canonical: 'https://dron.joaobarres.dev/clients',
})

export default function urbanFlightOperations() {
  return (
    <>

      <PageServices
        D={[
          {
            imagen: 'industria-inspeccion',
            label: 'Servicios',
            title: 'industrial, inspección y fotogrametría',
          }
        ]}
        keyword={[
          'DGAC-Ecuador-(RDAC 101)',
        ]}
        keywordLink={{
          'DGAC-Ecuador-(RDAC 101)': 'https://www.aviacioncivil.gob.ec/'
        }}
        Content={[
          {
            label: 'Servicios',
            subTitle: 'trabajos rpas con drones industriales',
            text: [
              'Los drones, también conocidos como vehículos aéreos no tripulados (UAVs), han revolucionado diversas aplicaciones industriales gracias a su flexibilidad, capacidad de acceso y eficiencia en costos.',
              'JB.SKYLENS ofrece servicios con drones industriales para trabajos RPAS, más allá de los propios para la industria audiovisual. En nuestra cartera de servicios ofrecemos nuestra flota de drones para agricultura, inspección-monitoreo-mantenmineto de infraestructuras, mapeo-topografía-fotogrametría de alta precisión, seguimiento de obras & Real Estate, operaciones logísticas, así como vigilancia y seguridad.'
            ],
          }
        ]}
        P={[
          {
            buttons: [
              {
                label: 'Enviar Solicitud',
                href: '/contact'
              },
            ]
          }
        ]}
        Animations={[
          {
            src: 'businessAdvisory'
          }
        ]}
        CalltoAction={[
          {
            callToAction: 'Nuestro compromiso con la seguridad y profesionalidad',
            text: [
              'En JB.SkyLens trabajamos bajo estrictos estándares de seguridad y cumpliendo la normativa oficial de la DGAC-Ecuador-(RDAC 101). Nuestro equipo de pilotos profesionales garantiza operaciones aéreas legales, seguras y eficientes en cada proyecto.',
              'Gestionamos permisos, registros y requisitos obligatorios para que cada vuelo esté en regla, porque entendemos que en trabajos aéreos la seguridad, la responsabilidad y la legalidad no son opcionales, son parte del servicio.'
            ],
            buttons: [
              {
                label: 'Contactanos',
                href: '/contact'
              },
              {
                label: 'Ver Portfolio',
                href: '/portfolio'
              }
            ]
          }
        ]}
        index={0}
      />

    </>
  )
}
