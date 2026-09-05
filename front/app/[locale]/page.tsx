import { Inicio, Logos, About, WhatDeDo, WhyChooseUs, Galery } from '@/app/component'
import { getMessages } from 'next-intl/server';

import { getLocale } from 'next-intl/server';

const locale = getLocale();

export async function generateMetadata() {
  const messages = await getMessages();
  return {
    title: messages.home?.metadeta?.TitleMeta || 'JB.SKYLENS',
    description:
      messages.home?.metadeta?.DescriptionMeta || 'JB.SKYLENS ofrece servicios profesionales con drones en Ecuador: inspecciones, fotografía aérea, video, eventos y soluciones técnicas con drones.',
    keywords: messages.home?.metadeta?.keywords || [],
    canonical: { href: `https://jbskylens.com/${await locale === 'es' ? '' : locale}` },
  };
}

export default function Page() {
  return (
    <>
      <Inicio />
      <Galery />
      <WhyChooseUs />
      <Logos />
      <WhatDeDo />
      <About />
    </>
  );
}
