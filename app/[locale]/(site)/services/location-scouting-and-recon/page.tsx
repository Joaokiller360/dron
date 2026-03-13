import { PageServices } from '@/app/utils'
import { useLocale, useTranslations } from 'next-intl'
import { getMessages } from 'next-intl/server';

export async function generateMetadata() {
  const messages = await getMessages();
  return {
    title: messages.pageServices?.locationRecon?.metadata?.title || "Localización y Reconocimiento | JB.SKYLENS",
    description:
      messages.pageServices?.locationRecon?.metadata?.description || "Servicios profesionales de localización y reconocimiento con drones en Ecuador. Inspección aérea, monitoreo de zonas, búsqueda de áreas específicas y análisis visual para seguridad, industria y proyectos técnicos.",
    keywords: [
      messages.pageServices?.locationRecon?.metadata?.keywords
    ],
    canonical: messages.pageServices?.locationRecon?.metadata?.canonical || 'https://dron.joaobarres.dev/services/location-scouting-and-recon',
  };
}

export default function urbanFlightOperations() {

  const hero = useTranslations('pageServices.locationRecon.hero');
  const regulation = useTranslations('pageServices.locationRecon.regulation');
  const content = useTranslations('pageServices.locationRecon.content');
  const callToAction = useTranslations('pageServices.locationRecon.callToAction');
  const example = useTranslations('pageServices.locationRecon.example');
  const locale = useLocale();

  // Solo agregar prefijo de idioma si NO es el idioma por defecto (es)
  const prefix = locale === 'es' ? '' : `/${locale}`;

  return (
    <>

      <PageServices
        D={[
          {
            imagen: 'localizacion-reconocimiento',
            label: hero('label'),
            title: hero('title'),
          }
        ]}
        keyword={[
          regulation('keywords.0.label'),
        ]}
        keywordLink={{
          [regulation('keywords.dgac.label')]: regulation('links.dgac')
        }}
        Content={[
          {
            label: content('label'),
            subTitle: content('subTitle'),
            text: [content('text.0'), content('text.1')]
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
