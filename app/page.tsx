
import { Inicio, Logos, About, WhatDeDo, WhyChooseUs, Galery } from '@/app/component'
import { createMetadata } from '@/app/utils'

export const metadata = createMetadata({
  title: 'JB.SKYLENS | Servicios profesionales con drones en Ecuador',
  description:
    'JB.SKYLENS ofrece servicios profesionales con drones en Ecuador: inspecciones, fotografía aérea, video, eventos y soluciones técnicas con drones.',
  keywords: [
    'JB.SKYLENS',
    'drones Ecuador',
    'servicios con drones',
    'fotografía aérea',
    'video con drones',
    'Joao Barres',
  ],
  canonical: 'https://dron.joaobarres.dev/',
})


export default function Home() {
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
