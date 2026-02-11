
import { PageServices, createMetadata } from '@/app/utils'

export const metadata = createMetadata({
  title: 'Industrial, inspección y fotogrametria | JB.SKYLENS',
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
