'use client'

import { ScrollBottonEffect, ScrollRevealEffect, SeparatorUp } from '@/app/utils'

import { Drone, ShieldCheck, Map, Medal, KeyRound, Bot } from 'lucide-react'
import { useTranslations } from 'next-intl';

const list = [
  { key: "experience", icon: <Bot /> },
  { key: "fleet", icon: <Drone /> },
  { key: "permits", icon: <ShieldCheck /> },
  { key: "anywhere", icon: <Map /> },
  { key: "quality", icon: <Medal /> },
  { key: "ready", icon: <KeyRound /> },
];

export default function WhyChooseUs() {

  const t = useTranslations('home.whyChooseUs');

  return (
    <>
      <SeparatorUp
        colorsPrimary="bg-honeydew-900 dark:bg-honeydew-800"
        colorsSecundary="text-honeydew-800 dark:text-honeydew-900"
      />

      <section
        className="py-8 bg-honeydew-800 dark:bg-honeydew-900 sm:py-16 lg:py-12"
        aria-labelledby="why-choose-us-title"
      >
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">

          {/* TÍTULO SEO */}
          <header className="grid mb-5 space-y-4 text-center">
            <ScrollBottonEffect>
              <span className="font-mono text-2xl font-bold uppercase sm:text-4xl sm:my-1 gradient-text">
                {t('title')}
              </span>
            </ScrollBottonEffect>
          </header>

          <div className="p-4 shadow-lg bg-honeydew-900 dark:bg-honeydew-800 rounded-2xl sm:p-14">

            {/* TEXTO DESCRIPTIVO */}
            <div className="px-4 text-base leading-relaxed text-center sm:text-xl">
              <ScrollBottonEffect>
                <span>
                  {t.rich('text.one', {
                    strong: (chunks) => <strong>{chunks}</strong>,
                  })}
                </span>
              </ScrollBottonEffect>
              <br />
              <ScrollBottonEffect>
                <span>
                  {t('text.two')}
                </span>
              </ScrollBottonEffect>
            </div>

            {/* LISTADO DE BENEFICIOS */}
            <div className="flex justify-center pt-8">
              <div className="grid w-full max-w-6xl grid-cols-2 gap-4 lg:grid-cols-3">

                {list.map((item, index) => (
                  <ScrollRevealEffect key={index}>
                    <article
                      key={index}
                      className="flex flex-col h-full p-5 bg-honeydew-800 dark:bg-honeydew-900 rounded-3xl"
                    >
                      <div className="flex justify-center">
                        <div className="inline-flex items-center justify-center mb-5 text-white rounded-full sm:w-20 sm:h-20 w-15 h-15 bg-honeydew-900 dark:bg-honeydew-800 shrink-0">
                          {item.icon}
                        </div>
                      </div>

                      <h3 className="mb-2 text-sm font-semibold text-center uppercase sm:text-xl">
                        {t(`items.${item.key}.title`)}
                      </h3>

                      <p className="text-xs text-center sm:text-base">
                        {t(`items.${item.key}.description`)}
                      </p>
                    </article>
                  </ScrollRevealEffect>
                ))}

              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  )
}