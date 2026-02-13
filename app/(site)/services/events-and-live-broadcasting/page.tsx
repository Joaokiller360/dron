import { createMetadata, PageServices } from '@/app/utils'

export const metadata = createMetadata({
  title: 'Eventos y Retransmisiones | JB.SKYLENS',
  description:
    'Servicios profesionales de cobertura de eventos y retransmisiones con drones en Ecuador. Filmación aérea en vivo, grabación de eventos, shows, conciertos, celebraciones y transmisiones profesionales desde el aire.',
  keywords: [
    'drones para eventos',
    'filmación aérea de eventos',
    'cobertura de eventos con drones',
    'retransmisión aérea en vivo',

    'drones para conciertos',
    'drones para festivales',
    'drones para bodas y celebraciones',
    'video aéreo para eventos',

    'servicios de drones para eventos ecuador',
    'filmación de eventos en esmeraldas',
    'producción audiovisual para eventos',
    'tomas aéreas de eventos',

    'streaming con drones',
    'transmisión en vivo con drones',
    'cobertura profesional de eventos',

    'JB.SKYLENS eventos',
    'empresa de drones para eventos',
    'servicios profesionales con drones',
    'filmación profesional aérea'
  ]
  ,
  canonical: 'https://dron.joaobarres.dev/services/events-and-live-broadcasting',
})

export default function urbanFlightOperations() {
  return (
    <>

      <PageServices
        D={[
          {
            imagen: 'evento-retransmisiones',
            label: 'Servicios',
            title: 'Eventos y retransmisiones',
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
            subTitle: 'las mejores imágenes de tu evento',
            text: [
              'Los drones para uso en ciudad son útiles para diversas tareas, como la captura de imágenes aéreas para producciones audiovisuales, inspecciones de infraestructuras o servicios de emergencia.',
              'Sin embargo, es necesario obtener un permiso especial de la DGAC-Ecuador-(RDAC 101) para operar en lo que se conoce como CTR (Control de Tráfico Aéreo) debido a que en estas áreas hay una mayor densidad de tráfico aéreo y se deben seguir protocolos de seguridad específicos.',
              'Es importante contar con operadores profesionales autorizados y con experiencia para garantizar la seguridad de los vuelos y el cumplimiento de la normativa aérea en estas áreas.'
            ],
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
                label: 'Solicitar más información',
                href: '/contact'
              }
            ]
          }
        ]}
        Example={[
          {
            label: 'nuestros trabajos',
            subTitle: 'ejemplo de aplicación',
            Galeria: [
              {
                label: 'retransmisión en directo',
                video: 'provincializacion-esmeralda',
              }
            ]
          }
        ]}
        index={0}
      />
    </>
  )
}
