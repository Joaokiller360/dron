'use client'

import { Activity, CircleUser, Drone } from 'lucide-react'
import { ScrollRevealEffect, SeparatorUp, ScrollBottonEffect } from '@/app/utils'
import { useTranslations } from 'next-intl';

export default function WhatDeDo() {

  const t = useTranslations('home');

  const whatWeDo = {
    eyebrow: t('whatDeDo.label'),
    titleTop: t('whatDeDo.title'),
    titleBottom: t('whatDeDo.titleButton'),
    description:
      t('whatDeDo.description'),

    items: [
      {
        text:
          `${t('whatDeDo.items.one')}`,
        icon: Activity,
      },
      {
        text:
          `${t('whatDeDo.items.two')}`,
        icon: CircleUser,
      },
      {
        text:
          `${t('whatDeDo.items.three')}`,
        icon: Drone,
      },
    ],
  }

  return (
    <>
      <SeparatorUp
        colorsPrimary="bg-honeydew-900 dark:bg-honeydew-800"
        colorsSecundary="text-honeydew-800 dark:text-honeydew-900"
      />

      <div className="py-8 bg-honeydew-800 dark:bg-honeydew-900 sm:py-16 lg:py-12">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">

          {/* Header */}
          <div className="grid mb-6 space-y-4 text-center">
            <div className="mx-6 font-mono font-light lg:text-lg sm:text-xl gradient-text">
              <ScrollBottonEffect>
                <span>- </span>
                <span className="uppercase">{whatWeDo.eyebrow}</span>
                <span> -</span>
              </ScrollBottonEffect>
            </div>

            <div className="grid text-xl sm:text-4xl">
              <ScrollBottonEffect>
                <span className="my-2 font-mono font-bold uppercase gradient-text">
                  {whatWeDo.titleTop}
                </span>
              </ScrollBottonEffect>
              <ScrollBottonEffect>
                <span className="my-2 font-mono font-bold uppercase gradient-text">
                  {whatWeDo.titleBottom}
                </span>
              </ScrollBottonEffect>
            </div>
          </div>

          {/* Card */}
          <div className="shadow-lg bg-honeydew-900 dark:bg-honeydew-800 rounded-2xl p-14">

            <div className="text-sm sm:text-2xl">
              <ScrollBottonEffect>
                <span className="flex text-center">
                  {whatWeDo.description}
                </span>
              </ScrollBottonEffect>
            </div>
            {/* Items */}
            <div className="flex flex-wrap pt-10 -mx-4 -mt-4 -mb-10 space-y-6 sm:-m-4 md:space-y-0">
              {whatWeDo.items.map((item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    key={index}
                    className="flex flex-col items-center p-4 text-center md:w-1/3"
                  >
                    <ScrollRevealEffect index={index}>
                      <>
                        <div className="inline-flex items-center justify-center w-16 h-16 mb-5 rounded-full sm:w-20 sm:h-20 bg-honeydew-800 text-honeydew-500 shrink-0 dark:bg-honeydew-900">
                          <Icon size={54} strokeWidth={2} />
                        </div>

                        <div className="grow">
                          <p className="text-base leading-relaxed">
                            {item.text}
                          </p>
                        </div>
                      </>
                    </ScrollRevealEffect>
                  </div>
                )
              })}
            </div>


          </div>
        </div>
      </div>
    </>
  )
}