import { Banner, CardClient, ScrollRevealEffect, SectionCard } from "@/app/utils";
import { useLocale, useTranslations } from 'next-intl'
import { getMessages } from 'next-intl/server';

export async function generateMetadata() {
  const messages = await getMessages();
  return {
    title: messages.services?.metadeta?.TitleMeta || 'Servicios con drones | JB.SKYLENS',
    description:
      messages.services?.metadeta?.DescriptionMeta || 'Explora el portafolio de JB.SKYLENS con proyectos reales de fotografía aérea, video con drones, eventos e inspecciones en Ecuador.',
    keywords: [
      messages.services?.metadeta?.keywords
    ],
    canonical: 'https://dron.joaobarres.dev/services',
  };
}

export default function Services() {

  const t = useTranslations('services');
  const locale = useLocale();

  // Solo agregar prefijo de idioma si NO es el idioma por defecto (es)
  const prefix = locale === 'es' ? '' : `/${locale}`;

  const link = `${prefix}/services/`

  const clients = [
    { key: "film", imgName: "grabacion-cine", href: `${link}film-and-tv-production` },
    { key: "location", imgName: "localizacion-reconocimiento", href: `${link}location-scouting-and-recon` },
    { key: "industrial", imgName: "insdustrial-inspeccion", href: `${link}insdustrial-inspection-and-photogrammetry` },
    { key: "urban", imgName: "vuelo-ciudad", href: `${link}urban-flight-operations` },
    { key: "events", imgName: "evento-retransmisiones", href: `${link}events-and-live-broadcasting` },
    { key: "realestate", imgName: "drones-inmobiliaria", href: `${link}real-estate` },
    { key: "tours360", imgName: "tours-360", href: `${link}tours-360` }
  ]

  return (
    <>
      <section className="pb-10 bg-honeydew-900 dark:bg-honeydew-800 pt-28" >
        <Banner
          title={t('title')}
          label={t('label')}
        />

        <section className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <section className="space-y-6" >
            {/* capsula uno */}
            <SectionCard style="bg-honeydew-800 dark:bg-honeydew-900">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

                {clients.map((client, index) => (
                  <ScrollRevealEffect key={client.key} index={index}>
                    <CardClient
                      index={index}
                      services={[
                        {
                          title: t(`items.${client.key}.title`),
                          description: t(`items.${client.key}.description`)
                        }
                      ]}
                      content={[
                        {
                          imgName: client.imgName
                        }
                      ]}
                      buttons={[
                        {
                          id: 1,
                          href: client.href,
                          active: true,
                          name: t(`items.${client.key}.button`)
                        }
                      ]}
                    />
                  </ScrollRevealEffect>
                ))}
              </div>

            </SectionCard>
          </section>
        </section>
      </section>

    </>
  )
}
