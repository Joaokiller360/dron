import { PageServices } from '@/app/utils'
import { useLocale, useTranslations } from 'next-intl'
import { getMessages } from 'next-intl/server';

export async function generateMetadata() {
  const messages = await getMessages();
  return {
    title: messages.pageServices?.eventsBroadcast?.metadata?.title || 'Eventos y Retransmisiones | JB.SKYLENS',
    description:
      messages.pageServices?.eventsBroadcast?.metadata?.description || 'Servicios profesionales de cobertura de eventos y retransmisiones con drones en Ecuador. Filmación aérea en vivo, grabación de eventos, shows, conciertos, celebraciones y transmisiones profesionales desde el aire.',
    keywords: [
      messages.pageServices?.eventsBroadcast?.metadata?.keywords
    ],
    canonical: 'https://dron.joaobarres.dev/services',
  };
}

export default function urbanFlightOperations() {

  const hero = useTranslations('pageServices.eventsBroadcast.hero');
  const regulation = useTranslations('pageServices.eventsBroadcast.regulation');
  const content = useTranslations('pageServices.eventsBroadcast.content');
  const callToAction = useTranslations('pageServices.eventsBroadcast.callToAction');
  const example = useTranslations('pageServices.eventsBroadcast.example');

  const locale = useLocale();

  // Solo agregar prefijo de idioma si NO es el idioma por defecto (es)
  const prefix = locale === 'es' ? '' : `/${locale}`;

  return (
    <>

      <PageServices
        D={[
          {
            imagen: 'evento-retransmisiones',
            label: hero('label'),
            title: hero('title'),
          }
        ]}
        keyword={[
          regulation('keywords.0.label'),
        ]}
        keywordLink={{
          [regulation('keywords.0.label')]: regulation('links.dgac')
        }}
        Content={[
          {
            label: content('label'),
            subTitle: content('subTitle'),
            text: [content('text.0'), content('text.1'), content('text.2')]
          }
        ]}
        CalltoAction={[
          {
            callToAction: callToAction('title'),
            text: [callToAction('text.0'), callToAction('text.1')],
            buttons: [
              {
                label: callToAction('button'),
                href: `${prefix}/contact`
              }
            ]
          }
        ]}
        Example={[
          {
            label: example('label'),
            subTitle: example('subTitle'),
            Galeria: [
              {
                label:  example('galleryLabel'),
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
