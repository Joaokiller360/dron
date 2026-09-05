'use client'

import { Button, ScrollRevealEffect, SeparatorUp, ScrollBottonEffect } from "@/app/utils"
import { Clapperboard } from "lucide-react";
import { useLocale, useTranslations } from 'next-intl';

interface IMG {
  name?: string
  urlImg?: string
  href?: string
  style?: string
}

export function Img({ name = '', urlImg = '', href = '', style = '' }: IMG) {
  return (
    <>
      <a href={href} className={`${style} relative flex flex-col px-4 pt-40 pb-4 overflow-hidden font-black rounded-lg group grow cursor-pointer`}>
        <img src={urlImg || '/img/palmas-atardecer.jpg'} alt={name} className="absolute inset-0 object-cover w-full h-full transition-transform duration-500 ease-in-out group-hover:scale-105" />
        <div className="absolute inset-0 bg-linear-to-b from-gray-900/25 to-gray-900/5" />
        <h3 className="absolute top-0 left-0 z-10 p-4 text-xl font-black xs:text-xl md:text-3xl">{name}</h3>
      </a>
    </>
  )
}

export default function Galery() {
  const t = useTranslations('home');
  const locale = useLocale();
  // Solo agregar prefijo de idioma si NO es el idioma por defecto (es)
  const prefix = locale === 'es' ? '' : `/${locale}`;

  const gallery = {
    title: t('gallery.title'),
    mainGrid: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-5',
    blocks: [
      {
        wrapper: 'flex flex-col h-auto col-span-2 text-white sm:col-span-1 md:col-span-2 md:h-full hover:text-white/80',
        type: 'single',
        item: {
          name: t('gallery.events.one'),
          href: `${prefix}/portfolio`,
          urlImg:
            'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=2940&auto=format&fit=crop',
        },
      },
      {
        wrapper: 'col-span-2 text-white sm:col-span-1 md:col-span-2 hover:text-white/80',
        type: 'nested',
        item: {
          name: t('gallery.events.two'),
          href: `${prefix}/portfolio`,
          urlImg:
            'https://images.unsplash.com/photo-1504675099198-7023dd85f5a3?q=80&w=2940&auto=format&fit=crop',
          style: 'mb-4',
        },
        childrenGrid: 'grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-2',
        children: [
          {
            name: t('gallery.events.three'),
            href: `${prefix}/portfolio`,
            urlImg:
              'https://images.unsplash.com/photo-1571104508999-893933ded431?q=80&w=2940&auto=format&fit=crop',
          },
          {
            name: t('gallery.events.four'),
            href: `${prefix}/portfolio`,
            urlImg:
              'https://images.unsplash.com/photo-1626897505254-e0f811aa9bf7?q=80&w=2940&auto=format&fit=crop',
          },
        ],
      },
      {
        wrapper: 'flex flex-col h-auto col-span-2 sm:col-span-1 md:col-span-1 md:h-full',
        type: 'single',
        item: {
          name: t('gallery.events.five'),
          href: `${prefix}/portfolio`,
          urlImg:
            'https://images.unsplash.com/photo-1693680501357-a342180f1946?q=80&w=2940&auto=format&fit=crop',
        },
      },
    ],
    cta: {
      href: `${prefix}/portfolio`,
      text: t('gallery.button.viewPortfolio'),
    },
  };

  return (
    <>
      <SeparatorUp colorsPrimary="bg-honeydew-800 dark:bg-honeydew-900" colorsSecundary="text-honeydew-900 dark:text-honeydew-800" />
      <section className="py-6 pt-10 bg-honeydew-900 dark:bg-honeydew-800 lg:py-8">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <section className="grid mb-10 space-y-4 text-center">
            <div>
              <ScrollBottonEffect>
                <span className="my-5 font-mono text-4xl font-bold uppercase gradient-text">
                  {gallery.title}
                </span>
              </ScrollBottonEffect>
            </div>
          </section>

          <section>
            {/* GRID EXACTO */}
            <div className="px-2 py-4 mx-auto max-w-7xl sm:py-4 lg:px-6">

              <div className={`grid h-full gap-4 ${gallery.mainGrid}`}>
                {gallery.blocks.map((block, index) => (
                  <ScrollRevealEffect
                    key={index}
                    index={index}
                    className={block.wrapper} // 👈 AQUÍ VA EL COL-SPAN
                  >
                    <Img {...block.item} />

                    {block.type === 'nested' && block.children && (
                      <div className={block.childrenGrid}>
                        {block.children.map((child, childIndex) => (
                          <ScrollRevealEffect
                            key={childIndex}
                            index={childIndex}
                          >
                            <Img {...child} />
                          </ScrollRevealEffect>
                        ))}
                      </div>
                    )}
                  </ScrollRevealEffect>
                ))}
              </div>


            </div>

          </section>

          <div className="flex justify-center pt-5">
            <ScrollBottonEffect>
              <Button
                href={gallery.cta.href}
                text={gallery.cta.text}
                style="bg-white hover:bg-honeydew-500 text-black"
                icon={<Clapperboard size={24} color="#000" strokeWidth={2} />}
              />
            </ScrollBottonEffect>
          </div>
        </div>
      </section>
    </>
  )
}
