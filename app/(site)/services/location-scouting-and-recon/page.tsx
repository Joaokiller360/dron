
import { PageServices, createMetadata } from '@/app/utils'

export const metadata = createMetadata({
  title: 'Localización y Reconocimiento | JB.SKYLENS',
  description:
    'Servicios profesionales de localización y reconocimiento con drones en Ecuador. Inspección aérea, monitoreo de zonas, búsqueda de áreas específicas y análisis visual para seguridad, industria y proyectos técnicos.',
  keywords: [
    'drones para localización',
    'reconocimiento aéreo con drones',
    'inspección aérea con drones',
    'monitoreo de zonas con drones',

    'drones para seguridad ecuador',
    'servicios de drones para vigilancia',
    'drones para búsqueda de áreas',
    'reconocimiento territorial con drones',

    'drones para industria',
    'drones para puertos',
    'inspección de infraestructura con drones',
    'monitoreo industrial aéreo',

    'servicios de drones en esmeraldas',
    'operaciones profesionales con drones',
    'análisis visual con drones',

    'JB.SKYLENS reconocimiento',
    'empresa de drones profesional',
    'servicios técnicos con drones',
    'drones para proyectos empresariales'
  ]
  ,
  canonical: 'https://dron.joaobarres.dev/services/location-scouting-and-recon',
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
