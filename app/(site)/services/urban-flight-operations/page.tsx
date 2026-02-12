
import { createMetadata, PageServices } from '@/app/utils'

export const metadata = createMetadata({
  title: 'Vuelos en ciudad | JB.SKYLENS',
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
            imagen: 'vuelo-ciudad',
            label: 'Servicios',
            title: 'vuelos en ciudad',
          }
        ]}
        keyword={[
          'Permiten capturar tomas aéreas impresionantes:',
          'Adaptables a cualquier idea:',
          'perspectivas únicas en rodajes audiovisuales',
          'Grandes clientes',
          'facilitamos retransmisiones en directo',
          'DGAC-Ecuador-(RDAC 101)',
          'Operar drones en ciudad',
          'JB.SKYLENS',
          'las operaciones con drones requieren autorizaciones específicas y coordinación con las autoridades correspondientes',
          'las multas por no realizar correctamente la operativa ascienden hasta $15.000 dolares americanos',
        ]}
        keywordLink={{
          'DGAC-Ecuador-(RDAC 101)': 'https://www.aviacioncivil.gob.ec/'
        }}
        Example={[
          {
            label: 'servicios con drones en ciudad',
            subTitle: 'volar en ciudad legalmente y sin complicaciones',
            text: [
              'Volamos nuestros drones en ciudad para capturar perspectivas únicas en rodajes audiovisuales de cine, televisión y publicidad, donde cada toma aérea eleva la narrativa visual con precisión y dinamismo.',
              'Grandes clientes confían en nuestra expertise para integrar estos vuelos en sus producciones, garantizando innovación y calidad sin igual.',
              'Asimismo, facilitamos retransmisiones en directo que transmiten la emoción de todo tipo de eventos, ya sean deportivos o culturales en tiempo real, sin olvidar otros trabajos con drones como pueden ser las inspecciones técnicas en infraestructuras o mapeos topográficos para proyectos de urbanismo.'
            ],
            Galeria: [ 
              {
                label: 'vuelo en ciudad',
                video: 'provincializacion-esmeralda',
                href: 'DRgImsmibaa/?utm_source=ig_web_button_share_sheet&igsh=MzRlODBiNWFlZA=='
              }
            ]
          },
          {
            label: 'volar en ciudad legalmente y sin complicaciones',
            subTitle: 'nuestro compromiso con la seguridad y la legalidad',
            text: [
              'Volar en ciudad es una operativa compleja y nos tomamos muy en serio la seguridad y el cumplimiento de las normativas. Nuestro equipo está formado por pilotos y técnicos expertos, garantizando vuelos seguros y eficientes en cada proyecto.',
              'Por ese mismo motivo todas nuestras operaciones siempre cumplen a rajatabla las directrices de la DGAC-Ecuador-(RDAC 101), asegurando que cada vuelo se realice de manera legal y responsable, protegiendo tanto a las personas como a las propiedades en el entorno urbano.',
              'Nos aseguramos siempre de tramitar todos los permisos que son necesarios junto a nuestros partners especializados, garantizando siempre que los vuelos son legales y están en orden. Debemos tener en cuenta que las multas por no realizar correctamente la operativa ascienden hasta $15.000 dolares americanos, ¡no vale la pena arriesgarse con opciones piratas!'
            ],
            buttons: [
              {
                label: 'Solicita tu vuelo en ciudad',
                href: '/contact'
              }
            ]
          }
        ]}
        Content={[
          {
            label: 'Servicios',
            subTitle: 'especialistas líderes en cinematografía aérea',
            text: [
              'JB.SKYLENS es una empresa especializada en servicios profesionales con drones, enfocada en operaciones en entornos urbanos, inspecciones técnicas y vuelos en escenarios complejos, incluyendo operaciones nocturnas y misiones de alta precisión, siempre cumpliendo estrictamente la normativa aeronáutica vigente.',
              'Operar drones en ciudad implica un entorno de alta complejidad que exige planificación técnica, protocolos de seguridad avanzados y una ejecución precisa para garantizar operaciones seguras y eficientes.',
              'En Ecuador, las operaciones con drones requieren autorizaciones específicas y coordinación con las autoridades correspondientes, especialmente cuando se realizan vuelos en zonas urbanas, áreas pobladas o espacios aéreos controlados, donde la densidad de personas y estructuras exige estándares operacionales más rigurosos.',
              'Gracias a nuestra experiencia en distintos escenarios operativos, en JB.SKYLENS ofrecemos soluciones adaptadas a cada contexto, garantizando vuelos seguros, legales y técnicamente optimizados para cada proyecto.'
            ],
          }
        ]}
        Animations={[
          {
            src: 'cityFlight'
          }
        ]} 
        
        index={0}
      />

    </>
  )
}
