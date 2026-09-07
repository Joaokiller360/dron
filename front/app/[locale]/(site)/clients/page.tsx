
import { CallAction } from '@/app/component'
import { Banner, SectionCard, CardClient, ScrollRevealEffect, ScrollBottonEffect, linksToButtons } from '@/app/utils'
import { getLocale, getMessages, getTranslations } from 'next-intl/server';

interface DbClient {
  id: string;
  slug: string;
  name: string;
  category: { id: string; name: string; sortOrder: number };
  photoUrl: string;
  links: { platform: string; url: string }[];
}

async function getPublishedClients(): Promise<DbClient[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return [];
  try {
    const res = await fetch(`${apiUrl}/clients`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function generateMetadata() {
  const messages = await getMessages();
  return {
    title: messages.clients?.metadeta?.TitleMeta || 'Cliente | JB.SKYLENS',
    description:
      messages.clients?.metadeta?.DescriptionMeta || 'Conoce a los clientes de JB.SKYLENS, empresas y marcas que han confiado en nuestros servicios profesionales con drones en Ecuador.',
    keywords: [
      messages.clients?.metadeta?.keywords
    ],
    canonical: messages.clients?.metadeta?.canonical,
  };
}

export default async function Clients() {

  const dbClients = await getPublishedClients();

  const _ = await getTranslations('clients');
  const callToAction = await getTranslations('clients.collToAction');

  const locale = await getLocale();

  // Solo agregar prefijo de idioma si NO es el idioma por defecto (es)
  const prefix = locale === 'es' ? '' : `/${locale}`;

  const groups: { categoryId: string; name: string; sortOrder: number; items: DbClient[] }[] = [];
  for (const client of dbClients) {
    const group = groups.find((g) => g.categoryId === client.category.id);
    if (group) {
      group.items.push(client);
    } else {
      groups.push({
        categoryId: client.category.id,
        name: client.category.name,
        sortOrder: client.category.sortOrder,
        items: [client],
      });
    }
  }
  groups.sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <>
      <div className="pb-10 bg-honeydew-800 dark:bg-honeydew-900 pt-28">
        <Banner
          label={`${_('label')}`}
          title={`${_('title')}`}
          description={`${_('description')}`}
        />
        <section className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">

          <section className="space-y-6">
            {groups.map(({ categoryId, name, items }) => (
              <SectionCard key={categoryId} style='bg-honeydew-900 dark:bg-honeydew-800'>
                <div>
                  <ScrollBottonEffect>
                    <div className='flex justify-center font-mono text-3xl font-semibold uppercase'>
                      <span>{name}</span>
                    </div>
                    <hr className="my-3 h-0.5 border-t-0 bg-white" />
                  </ScrollBottonEffect>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {items.map((c, index) => (
                      <ScrollRevealEffect key={c.id} index={index}>
                        <CardClient
                          index={index}
                          anchorId={c.slug}
                          clients={[{ client: c.name, organizacion: c.category.name }]}
                          content={[{ coverUrl: c.photoUrl }]}
                          buttons={linksToButtons(c.links)}
                        />
                      </ScrollRevealEffect>
                    ))}
                  </div>
                </div>
              </SectionCard>
            ))}

            {groups.length === 0 && (
              <p className="text-center text-white/60">
                {locale === 'en' ? 'No clients published yet.' : 'Todavía no hay clientes publicados.'}
              </p>
            )}
          </section>
        </section>

      </div>

      <CallAction
        styleSPrimary='bg-honeydew-800 dark:bg-honeydew-900'
        styleSSecundary='text-honeydew-900 dark:text-honeydew-800'
        style='bg-honeydew-900 dark:bg-honeydew-800'
        background='bg-honeydew-800 dark:bg-honeydew-900'
        textColor='font-semibold text-3xl uppercase font-mono'
        text={callToAction('text')}
        buttonText={callToAction('buttonText')}
        buttonhref={`${prefix}/contact`}
        buttonColor='cursor-pointer text-center transition duration-500 bg-white text-black hover:bg-honeydew-900 hover:text-white dark:bg-honeydew-800 dark:hover:bg-white dark:hover:text-black dark:text-white flex justify-center'
      />
    </>
  )
}
