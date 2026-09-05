import { createMetadata, PageServices } from '@/app/utils'

export const metadata = createMetadata({
  title: 'Film and TV Production | JB.SKYLENS',
  description:
    'Servicios profesionales de filmación aérea con drones en Ecuador para cine, televisión, comerciales y producciones audiovisuales. Tomas cinematográficas de alta calidad para proyectos creativos y publicitarios.',
  keywords: [
    'filmación con drones',
    'drones para cine',
    'producción audiovisual con drones',
    'tomas aéreas cinematográficas',

    'drones para televisión',
    'servicios de drones para productoras',
    'filmación aérea profesional',
    'drones para comerciales',

    'video aéreo cinematográfico',
    'producción de video con drones',
    'drones para rodajes',
    'tomas aéreas profesionales',

    'servicios de drones en ecuador',
    'filmación aérea en esmeraldas',
    'operaciones audiovisuales con drones',

    'JB.SKYLENS film',
    'empresa de drones para cine',
    'drones para producciones',
    'servicios profesionales de drones'
  ]
  ,
  canonical: 'https://dron.joaobarres.dev/services/film-and-tv-production',
})

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
        keyword={[
          'DGAC-Ecuador-(RDAC 101)',
          'Portfolio'
        ]}
        keywordLink={{
          Portfolio: '/portfolio',
          'DGAC-Ecuador-(RDAC 101)': 'https://www.aviacioncivil.gob.ec/'
        }}
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
                text: [
                  'Permiten capturar tomas aéreas impresionantes: desde tomas panorámicas hasta seguimientos rápidos, los drones aportan una dimensión visual única a tu proyecto.',
                  'Adaptables a cualquier idea: no importa si estás filmando un anuncio publicitario o una escena clave de una película, nuestros drones se adaptan a tus necesidades. Son perfectos para todo, desde mostrar paisajes hasta capturar la acción más intensa.',
                  'Ahorro de tiempo y dinero: los drones ofrecen una manera más económica y rápida de obtener las tomas perfectas, sin comprometer la calidad. Además, nuestro servicio está especializado en  conseguir las tomas perfectas en el menor tiempo posible, multiplicando el ahorro al disminuir los costes operativos en set: eficiencia y calidad premium, ¡es lo que ofrecemos!',
                  'Calidad de imagen superior: nuestros drones están equipados con tecnología de cámara y estabilización de última generación, asegurando que cada toma sea nítida y de alta calidad.'
                ]
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
        P={[
          {
            text: 'En nuestro Portfolio podrás ver las obras en las que hemos prestado nuestros servicios de especialistas; tanto en eventos y publicidad.',
            buttons: [
              {
                label: 'Ver Portfolio',
                href: '/portfolio'
              },
              {
                label: 'Ver servicios',
                href: '/services'
              }
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
