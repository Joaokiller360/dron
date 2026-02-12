
import { PageServices, createMetadata } from '@/app/utils'

export const metadata = createMetadata({
  title: 'Localización y Reconocimiento | JB.SKYLENS',
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
            imagen: 'localizacion-reconocimiento',
            label: 'Servicios',
            title: 'localización y reconocimiento',
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
            subTitle: 'ENCUENTRA LA MEJOR UBICACIÓN PARA TU PROYECTO',
            text: [
              'Permiten explorar y seleccionar locaciones de manera rápida y accesible, incluso en áreas remotas o de difícil acceso.',
              'Proporcionan vistas panorámicas únicas, facilitando la visualización y planificación de escenas desde perspectivas antes inalcanzables.'
            ],
          }
        ]}
        Animations={[
          {
            src: 'cityFlight', 
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
