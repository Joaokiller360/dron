
import { PageServices } from '@/app/utils'

export default function urbanFlightOperations() {
  return (
    <>

      <PageServices
        D={[
          {
            imagen: 'grabacion-cine',
            label: 'Servicios',
            title: 'grabación de cine, series y peliculas',
          }
        ]}
        keyword={
          [
            'Permiten capturar tomas aéreas impresionantes:',
            'Adaptables a cualquier idea:',
            '',
          ]
        }
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
              }
            ]
          }
        ]}
      />

    </>
  )
}
