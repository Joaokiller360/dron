import { CallAction } from '@/app/component'
import { Banner, SectionCard, CardVideo, ScrollBottonEffect } from '@/app/utils'
import { getLocale, getMessages, getTranslations } from 'next-intl/server';

// Metadatos traducidos usando next-intl
export async function generateMetadata() {
  const messages = await getMessages();
  return {
    title: messages.portfolio?.metadeta?.TitleMeta || 'Portafolio | JB.SKYLENS',
    description:
      messages.portfolio?.metadeta?.DescriptionMeta || 'Explora el portafolio de JB.SKYLENS con proyectos reales de fotografía aérea, video con drones, eventos e inspecciones en Ecuador.',
    keywords: [
      messages.portfolio?.metadeta?.keywords
    ],
    canonical: 'https://dron.joaobarres.dev/portfolio',
  };
}

interface DbProject {
  id: string;
  slug: string;
  category: { id: string; name: string; sortOrder: number };
  titleEs: string;
  titleEn?: string | null;
  descriptionEs?: string | null;
  descriptionEn?: string | null;
  coverUrl: string;
  href?: string | null;
}

async function getPublishedProjects(): Promise<DbProject[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return [];
  try {
    const res = await fetch(`${apiUrl}/projects`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export default async function Portfolio() {

  const projects = await getPublishedProjects();

  const t = await getTranslations('portfolio.collToAction');
  const _ = await getTranslations('portfolio');
  const locale = await getLocale();

  // Solo agregar prefijo de idioma si NO es el idioma por defecto (es)
  const prefix = locale === 'es' ? '' : `/${locale}`;

  const groups: { categoryId: string; name: string; sortOrder: number; items: DbProject[] }[] = [];
  for (const project of projects) {
    const group = groups.find((g) => g.categoryId === project.category.id);
    if (group) {
      group.items.push(project);
    } else {
      groups.push({
        categoryId: project.category.id,
        name: project.category.name,
        sortOrder: project.category.sortOrder,
        items: [project],
      });
    }
  }
  groups.sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <>
      <section className="pb-10 bg-honeydew-800 dark:bg-honeydew-900 pt-28" >

        <Banner
          label={`${_('label')}`}
          title={`${_('title')}`}
          description={`${_('description')}`}
        />

        <section className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <section className="space-y-6" >
            {groups.map(({ categoryId, name, items }) => (
              <SectionCard key={categoryId} style="bg-honeydew-900 dark:bg-honeydew-800">
                <div>
                  <ScrollBottonEffect>
                    <div className='flex justify-center font-mono text-3xl font-semibold uppercase'>
                      <span>{name}</span>
                    </div>
                    <hr className="my-3 h-0.5 border-t-0 bg-white" />
                  </ScrollBottonEffect>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {items.map((p, index) => (
                      <CardVideo
                        key={p.id}
                        index={index}
                        anchorId={p.slug}
                        title={locale === 'en' && p.titleEn ? p.titleEn : p.titleEs}
                        organizacion={(locale === 'en' ? p.descriptionEn : p.descriptionEs) ?? undefined}
                        coverUrl={p.coverUrl}
                        href={p.href || p.coverUrl}
                      />
                    ))}
                  </div>
                </div>
              </SectionCard>
            ))}

            {groups.length === 0 && (
              <p className="text-center text-white/60">
                {locale === 'en' ? 'No projects published yet.' : 'Todavía no hay proyectos publicados.'}
              </p>
            )}
          </section>
        </section>

      </section>

      <CallAction
        styleSPrimary='bg-honeydew-800 dark:bg-honeydew-900'
        styleSSecundary='text-honeydew-900 dark:text-honeydew-800'
        style='bg-honeydew-900 dark:bg-honeydew-800'
        background='bg-honeydew-800 dark:bg-honeydew-900'
        textColor='font-semibold text-3xl uppercase font-mono'
        text={t('text')}
        buttonText={t('buttonText')}
        buttonhref={`${prefix}/contact`}
        buttonColor='cursor-pointer text-center transition duration-500 bg-white text-black hover:bg-honeydew-900 hover:text-white dark:bg-honeydew-800 dark:hover:bg-white dark:hover:text-black dark:text-white flex justify-center'
      />
    </>
  )
}
