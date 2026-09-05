'use client'

import { ScrollRevealEffect } from '@/app/utils';

import { useLocale, useTranslations } from 'next-intl';




export default function About() {

  const t = useTranslations('home');
  const locale = useLocale();

  // Solo agregar prefijo de idioma si NO es el idioma por defecto (es)
  const prefix = locale === 'es' ? '' : `/${locale}`;

  const about = [
    t('about.paragraphs.one'),
    t('about.paragraphs.two'),
    t('about.paragraphs.three')
  ]
  
  return (
    <>
      <div className="py-8 bg-honeydew-900 dark:bg-honeydew-800 sm:py-16 lg:py-12">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid mb-10 space-y-4 text-center">
            <ScrollRevealEffect>
              <span className="font-mono text-2xl font-bold uppercase sm:text-4xl sm:my-1 gradient-text">
                {t('about.title')}
              </span>
            </ScrollRevealEffect>
          </div>

          <div className="p-5 text-sm text-justify shadow-lg bg-honeydew-800 dark:bg-honeydew-900 rounded-2xl sm:p-10 sm:text-2xl sm:text-justify">
            {about.map((item, index) => (
              <ScrollRevealEffect key={index}>
                <p className="mb-4">
                  {item}
                </p>
              </ScrollRevealEffect>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}