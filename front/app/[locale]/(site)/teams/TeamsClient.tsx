'use client'
import { Banner, SectionCard, CardClient, ScrollRevealEffect, ScrollBottonEffect, linksToButtons } from '@/app/utils'
import { CallAction } from '@/app/component'
import { useLocale, useTranslations } from 'next-intl';

export interface DbTeamMember {
  id: string;
  slug: string;
  name: string;
  role: string;
  photoUrl: string;
  links: { platform: string; url: string }[];
}

export default function TeamsClient({ dbMembers = [] }: { dbMembers?: DbTeamMember[] }) {
  const _ = useTranslations('teams');
  const t = useTranslations('teams.collToAction');
  const locale = useLocale();
  const prefix = locale === 'es' ? '' : `/${locale}`;

  return (
    <>
      <section className="pb-10 bg-honeydew-800 dark:bg-honeydew-900 pt-28">
        <Banner
          label={`${_('label')}`}
          title={`${_('title')}`}
          description={`${_('description')}`}
        />

        <section className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <section className="space-y-6">
            {dbMembers.length > 0 ? (
              <SectionCard style='bg-honeydew-900 dark:bg-honeydew-800'>
                <div>
                  <ScrollBottonEffect>
                    <div className='flex justify-center font-mono text-3xl font-semibold uppercase'>
                      <span>El crew dron</span>
                    </div>
                    <hr className="my-3 h-0.5 border-t-0 bg-white" />
                  </ScrollBottonEffect>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {dbMembers.map((m, index) => (
                      <ScrollRevealEffect key={m.id} index={index}>
                        <CardClient
                          index={index}
                          anchorId={m.slug}
                          clients={[{ client: m.name, organizacion: m.role }]}
                          content={[{ coverUrl: m.photoUrl }]}
                          buttons={linksToButtons(m.links)}
                        />
                      </ScrollRevealEffect>
                    ))}
                  </div>
                </div>
              </SectionCard>
            ) : (
              <p className="text-center text-white/60">
                {locale === 'en' ? 'No team members published yet.' : 'Todavía no hay miembros publicados.'}
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
