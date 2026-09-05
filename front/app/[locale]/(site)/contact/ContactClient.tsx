'use client'
import { Banner, SeparatorUp } from "@/app/utils"
import { From } from "@/app/hooks"
import { About } from '@/app/component'
import { useLocale, useTranslations } from 'next-intl'

export default function ContactClient() {
  const t = useTranslations('contact');
  const locale = useLocale();
  const prefix = locale === 'es' ? '' : `/${locale}`;

  return (
    <>
      <div className="pb-10 bg-honeydew-800 dark:bg-honeydew-900 pt-28">
        <Banner
          label={`${t('label')}`}
          title={t('title')}
          description={t('description')}
        />
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <section className="p-5 bg-honeydew-900 dark:bg-honeydew-800 rounded-2xl sm:p-10">
            <From additionalClasses="text-black" />
          </section>
        </div>
      </div>
      <SeparatorUp colorsPrimary="bg-honeydew-800 dark:bg-honeydew-900" colorsSecundary="text-honeydew-900 dark:text-honeydew-800" />
      <About />
    </>
  )
}
