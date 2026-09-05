import { createMetadata, PageServices } from '@/app/utils'

export const metadata = createMetadata({
  title: 'Tours 360 | JB.SKYLENS',
  description:
    'Servicios profesionales de drones para tours virtuales en Ecuador. Fotografías, videos aéreos y tomas cinematográficas para inmobiliarias, constructoras y proyectos inmobiliarios.',
  keywords: [
    'tours virtuales con drones',
    'tours 360 con drones',
    'fotografía aérea para tours virtuales',
    'video aéreo para tours 360',

    'tours virtuales para inmobiliarias ecuador',
    'servicios de drones para tours virtuales',
    'tours 360 para proyectos inmobiliarios',
    'filmación aérea de tours virtuales',

    'marketing inmobiliario con tours virtuales',
    'contenido audiovisual para tours 360',
    'tomas aéreas de tours virtuales',

    'servicios de drones en esmeraldas',
    'producción audiovisual para tours virtuales',
    'fotografía profesional para tours 360',
  ]
})

export default function tours360() {
  return (
    <>

      <PageServices
        D={[
          {
            imagen: 'tours-360',
            label: 'Servicios',
            title: 'Tours virtuales 360 para negocios y empresas',
          }
        ]}
        Content={[
          {
            label: 'Servicios',
            subTitle: 'Muestra tu negocio de forma interactiva y profesional',
            text: [
              'Los tours virtuales permiten a tus clientes recorrer tu negocio desde cualquier lugar y en cualquier momento, generando confianza antes incluso de visitarte físicamente. Esta tecnología transforma la forma en que presentas tus espacios, mostrando cada detalle de manera interactiva, moderna y atractiva.',
              'Implementar un recorrido virtual no solo mejora tu presencia digital, sino que también aumenta el tiempo que los usuarios pasan en tu página, mejora tu posicionamiento online y eleva la percepción profesional de tu marca. Es una herramienta ideal para destacar frente a la competencia, captar más clientes y ofrecer una experiencia innovadora que realmente impacta.'
            ]
          }
        ]}
        CalltoAction={[
          {
            SubTitle: '¿Cómo puede ayudar a tu negocio?',
            list: [
              {
                label: 'Aumenta la confianza del cliente',
                text: [
                  'Cuando una persona puede ver tu espacio real antes de visitarte, se siente más segura y confiada para tomar una decisión.'
                ]
              },
              {
                label: 'Mejora tu presencia digital',
                text: [
                  'Un tour virtual transmite profesionalismo, innovación y tecnología, haciendo que tu marca destaque online.'
                ]
              },
              {
                label: 'Disponible 24/7',
                text: [
                  'Un tour virtual está disponible las 24 horas del día, los 7 días de la semana, sin interrupciones ni horarios limitados.'
                ]
              }
            ]
          },
          {
            SubTitle: '¿Por qué invertir en un Tour Virtual?',
            text: [
              'Porque hoy los clientes investigan antes de visitar. Si tu negocio no muestra su espacio, alguien más sí lo hará y captará su atención primero.'
            ],
            list: [
              {
                label: 'Un recorrido virtual funciona como:',
                text: [
                  'Vendedor digital',
                  'Exhibición interactiva',
                  'Carta de presentación visual',
                  'Experiencia diferenciadora'
                ]
              }
            ],
            text2: [
              'Todo en una sola herramienta.'
            ]
          },
          {
            callToAction: 'Resultado Final para tu Marca',
            list: [
              {
                text: [
                  'Más confianza',
                  'Más interacción',
                  'Más tiempo en tu web',
                  'Más conversiones',
                  'Más profesionalismo'
                ]
              }
            ]
          },
          {
            SubTitle: 'Haz que tus clientes entren a tu negocio antes de visitarlo.',
            buttons: [
              {
                label: 'Contáctanos',
                href: '/contact'
              }
            ]
          }
        ]}
        Animations={[
          {
            src: 'cityFlight',
          }
        ]}
        Example={[
          {
            label: 'nuestros trabajos',
            subTitle: 'ejemplo de aplicación',
            Galeria: [
              {
                label: 'tours 360',
                urlImg: 'tours-360',
              }
            ]
          }
        ]}
        index={0}
      />
    </>
  )
}
