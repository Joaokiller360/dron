'use client'

import { ScrollRevealEffect, ScrollBottonEffect } from '@/app/utils';
import { text } from 'stream/consumers';

const about = [
  {
    text: 'JB SkyLens es una operadora de drones independiente en Ecuador 🇪🇨, especializada en contenido aéreo profesional. Con más de 50 proyectos realizados, ofrezco tomas dinámicas y de alta calidad para eventos, producciones, inspecciones y promoción turística.'
  },
  {
    text: 'Ideal para operar con precisión en espacios urbanos, costeros y portuarios. Mi enfoque combina seguridad, creatividad y rapidez en la entrega, adaptándome a las necesidades de cada cliente.'
  },
  {
    text: 'JB SkyLens sigue creciendo, incorporando nuevas tecnologías y ampliando servicios para brindar soluciones aéreas innovadoras en todo tipo de proyectos.'
  }
]

export default function About() {
  return (
    <>
      <div className="py-8 bg-honeydew-900 dark:bg-honeydew-800 sm:py-16 lg:py-12">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid mb-10 space-y-4 text-center">
            <ScrollRevealEffect>
              <span className="font-mono text-2xl font-bold uppercase sm:text-4xl sm:my-1 gradient-text">
                Un poco de nosotros
              </span>
            </ScrollRevealEffect>
          </div>

          <div className="p-5 text-sm text-justify shadow-lg bg-honeydew-800 dark:bg-honeydew-900 rounded-2xl sm:p-10 sm:text-2xl sm:text-justify">
            {about.map((item, index) => (
              <ScrollRevealEffect key={index}>
                <p className="mb-4">
                  {item.text}
                </p>
              </ScrollRevealEffect>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}