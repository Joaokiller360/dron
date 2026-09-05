import { LegalPage, createMetadata } from "@/app/utils";
import { useTranslations } from "next-intl";

export const metadata = createMetadata({
  title: 'Política de Privacidad',
  description:
    'Consulta la política de privacidad de JB.SKYLENS, empresa especializada en servicios profesionales con drones en Ecuador.',
  keywords: [
    'JB.SKYLENS',
    'drones Ecuador',
    'política de privacidad',
    'servicios con drones',
    'Joao Barres',
  ],
  canonical: 'https://dron.joaobarres.dev/legal/privacy-policies',
})

export default function PrivacyPolicies() {

  const t = useTranslations('legal.privacy');
  const content = t.raw('content') as Record<string, any>;

  const sections = Object.values(content);

  const contentSections = sections.map((section) => ({
    heading: section.subTitle,
    text: section.text
      ? Array.isArray(section.text)
        ? section.text
        : [section.text]
      : [],
    ...(section.lists && {
      lists: section.lists.map((list: any) => ({
        header: list.header ?? '',
        description: list.description ?? '',
        items: list.items ?? [],
      })),
    }),
  }));

  return (
    <section className="pb-10 bg-honeydew-900 dark:bg-honeydew-800 pt-28" >

      <LegalPage
        title={`${t('title')}`}
        label={`${t('label')}`}
        lastUpdate={`${t('lastUpdate')}`}
        keyword={t.raw('keywords')}

        content={contentSections}
      />

    </section>
  )
}