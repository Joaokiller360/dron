'use client'

import { SeparatorUp } from '@/app/utils'

import { Drone, ShieldCheck, Map, Medal, KeyRound, Bot } from 'lucide-react'

const list = [
  {
    title: "El valor de la experiencia",
    description:
      "Nos avalan más de 50 producciones nacionales e internacionales",
    icon: <Bot />,
  },
  {
    title: "LA FLOTA MÁS COMPLETA",
    description:
      "De Ecuador, con las mejores cámaras y lentes del mercado para cine y televisión",
    icon: <Drone />,
  },
  {
    title: "TRAMITACIÓN DE PERMISOS",
    description:
      "Método agilizado, coordinación con las autoridades incluida en los servicios",
    icon: <ShieldCheck />,
  },
  {
    title: "Volamos en cualquier lugar",
    description:
      "En cualquier momento y en cualquier condición, ¡plantéanos el reto!",
    icon: <Map />,
  },
  {
    title: "Compromiso de calidad",
    description:
      "Y de eficacia; trabajamos en tiempo récord, ahorrando costes operativos",
    icon: <Medal />,
  },
  {
    title: `Drones "ready to go"`,
    description:
      "Incluidos piloto y operador de cámara, backup drone, monitor y material esencial",
    icon: <KeyRound />,
  },
];


export default function WhyChooseUs() {
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
            <h2
              id="why-choose-us-title"
              className="my-5 font-mono text-3xl font-bold uppercase sm:text-4xl gradient-text"
            >
              ¿Por qué elegir JB.SKYLENS como empresa de drones en Ecuador?
            </h2>
          </header>

          <div className="p-4 shadow-lg bg-honeydew-900 dark:bg-honeydew-800 rounded-2xl sm:p-14">

            {/* TEXTO DESCRIPTIVO */}
            <p className="px-4 text-base leading-relaxed text-center sm:text-xl">
              Ofrecemos <strong>servicios profesionales con drones en Ecuador</strong>,
              bajo un modelo llave en mano, respaldados por un equipo especializado
              con más de <strong>40 horas de vuelo certificadas</strong>.
              <br /><br />
              En JB.SKYLENS trabajamos con altos estándares de calidad, cumplimiento
              normativo y eficiencia operativa, logrando tomas aéreas precisas en
              menos tiempo y reduciendo costos en producciones audiovisuales,
              inspecciones técnicas y eventos.
            </p>

            {/* LISTADO DE BENEFICIOS */}
            <div className="flex justify-center pt-8">
              <div className="grid w-full max-w-6xl grid-cols-2 gap-4 lg:grid-cols-3">

                {list.map((item, index) => (
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
                      {item.title}
                    </h3>

                    <p className="text-xs text-center sm:text-base">
                      {item.description}
                    </p>
                  </article>
                ))}

              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  )
}