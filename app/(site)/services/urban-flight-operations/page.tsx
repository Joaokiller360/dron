
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
          'Adaptables a cualquier idea:'
        ]}
        Content={[
          {
            label: 'Servicios',
            subTitle: 'especialistas líderes en cinematografía aérea',
            text: [
              'Los drones para uso en ciudad son útiles para diversas tareas, como la captura de imágenes aéreas para producciones audiovisuales, inspecciones de infraestructuras o servicios de emergencia.',
              'Los drones para uso en ciudad son útiles para diversas tareas, como la captura de imágenes aéreas para producciones audiovisuales, inspecciones de infraestructuras o servicios de emergencia.'
            ],
            list: [
              {
                text: ['Permiten capturar tomas aéreas impresionantes:', 'desde tomas panorámicas hasta seguimientos rápidos, los drones aportan una dimensión visual única a tu proyecto.']
              }, {
                text: ['Adaptables a cualquier idea:', 'no importa si estás filmando un anuncio publicitario o una escena clave de una película, nuestros drones se adaptan a tus necesidades. Son perfectos para todo, desde mostrar paisajes hasta capturar la acción más intensa.']
              }
            ]
          }
        ]} index={0}      />

    </>
  )
}
