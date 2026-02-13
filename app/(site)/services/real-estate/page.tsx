
import { PageServices } from '@/app/utils'

export default function realState() {
  return (
    <>

      <PageServices
        D={[
          {
            imagen: 'drones-inmobiliaria',
            label: 'Servicios',
            title: 'drones para inmobiliaria',
          }
        ]}
        keyword={[
          'DGAC-Ecuador-(RDAC 101)',
          'sector inmobiliario',
          'única',
          'recorridos virtuales y videos'
        ]}
        keywordLink={{
          'DGAC-Ecuador-(RDAC 101)': 'https://www.aviacioncivil.gob.ec/'
        }}
        Content={[
          {
            label: 'Servicios',
            subTitle: 'imagenes aéreas para inmobiliaria',
            text: [
              'Los drones son herramientas valiosas en el sector inmobiliario, ya que permiten capturar imágenes aéreas impresionantes de propiedades y sus alrededores. Estas imágenes proporcionan una perspectiva única que puede atraer a potenciales compradores al mostrar la ubicación, el tamaño y las características de la propiedad de manera más efectiva que las fotografías tradicionales desde el suelo.',
              'Además, los drones pueden ser utilizados para crear recorridos virtuales y videos promocionales que destacan las mejores cualidades de una propiedad, facilitando la comercialización y venta de inmuebles.',
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
                label: 'example-realState',
                video: 'example-realState',
              }
            ]
          }
        ]}
        index={0}
      />
    </>
  )
}
