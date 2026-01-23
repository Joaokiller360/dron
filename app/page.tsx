
import { Inicio, Logos, About, WhatDeDo, WhyChooseUs, Galery } from '@/app/component'
import { createMetadata } from '@/app/utils'

export const metadata = createMetadata({
  title: 'JB.SKYLENS | Servicios profesionales con drones en Ecuador',
  description:
    'JB.SKYLENS ofrece servicios profesionales con drones en Ecuador: inspecciones, fotografía aérea, video, eventos y soluciones técnicas con drones.',
    keywords: [
      'drones esmeraldas',
      'servicios con drones esmeraldas',
      'fotografía aérea esmeraldas',
      'video con drones esmeraldas',
      'operadores de drones esmeraldas',
      'drones profesionales esmeraldas',
      'filmación aérea esmeraldas',
      'inspecciones con drones esmeraldas',
      'drones en esmeraldas ecuador',
      'servicio de drones esmeraldas',
    
      'drones ecuador',
      'servicios con drones ecuador',
      'fotografía aérea ecuador',
      'video aéreo profesional ecuador',
      'inspección técnica con drones',
      'drones para eventos ecuador',
      'filmación de eventos con drones',
      'producción audiovisual con drones',
      'levantamientos con drones',
      'drones para empresas',
    
      'inspección de infraestructuras con drones',
      'drones para seguridad industrial',
      'drones para bienes raíces',
      'fotografía inmobiliaria aérea',
      'video corporativo con drones',
      'servicios audiovisuales aéreos',
      'drones para publicidad',
      'contenido aéreo profesional',
      'operador de drones certificado',
    
      'JB.SKYLENS',
      'JB SKYLENS drones',
      'servicios JB.SKYLENS',
      'Joao Barres',
      'empresa de drones en ecuador',
      'servicios profesionales con drones',
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
