
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
          'Permiten capturar tomas aéreas impresionantes:',
          'Adaptables a cualquier idea:',
          'Ahorro de tiempo y dinero:',
          'Calidad de imagen superior'
        ]}
        Content={[
          {
            label: 'Servicios',
            subTitle: 'especialistas líderes en cinematografía aérea',
            text: [
              'Somos expertos en brindar un servicio profesional para publicidad y ficción; estamos especializados en de drones para cine y drones para comerciales, llevamos tus proyectos audiovisuales a nuevas alturas.',
              'El uso de drones para cine y publicidad presenta muchas ventajas competitivas:'
            ],
            list: [
              {
                text: ['Permiten capturar tomas aéreas impresionantes:', 'desde tomas panorámicas hasta seguimientos rápidos, los drones aportan una dimensión visual única a tu proyecto.']
              }, {
                text: ['Adaptables a cualquier idea:', 'no importa si estás filmando un anuncio publicitario o una escena clave de una película, nuestros drones se adaptan a tus necesidades. Son perfectos para todo, desde mostrar paisajes hasta capturar la acción más intensa.']
              }, {
                text: ['Ahorro de tiempo y dinero:', 'los drones ofrecen una manera más económica y rápida de obtener las tomas perfectas, sin comprometer la calidad. Además, nuestro servicio está especializado en  conseguir las tomas perfectas en el menor tiempo posible, multiplicando el ahorro al disminuir los costes operativos en set: eficiencia y calidad premium, ¡es lo que ofrecemos!']
              }, {
                text: ['Calidad de imagen superior:', 'nuestros drones están equipados con tecnología de cámara y estabilización de última generación, asegurando que cada toma sea nítida y de alta calidad.']
              }
            ],
          }
        ]}
        galery={[
          {
            video: 'juan-fernando',
            label: 'juan-fernando',
            ref: 'juanfervelasco'
          },
          {
            video: 'corazones-descalzos',
            label: 'corazones-descalzos',
            ref: 'fundacionph3'
          }
        ]}
        index={0}
      />

    </>
  )
}
