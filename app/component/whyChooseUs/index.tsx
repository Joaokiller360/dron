'use client'

import { SeparatorUp } from '@/app/utils'

const list = [
  {
    title: "El valor de la experiencia",
    description:
      "Nos avalan más de 100 producciones nacionales e internacionales",
    icon: (
      <svg
        className="w-7 h-7 text-body"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M10 21v-9m3-4H7.5a2.5 2.5 0 1 1 0-5c1.5 0 2.875 1.25 3.875 2.5M14 21v-9m-9 0h14v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8ZM4 8h16a1 1 0 0 1 1 1v3H3V9a1 1 0 0 1 1-1Zm12.155-5c-3 0-5.5 5-5.5 5h5.5a2.5 2.5 0 0 0 0-5Z"
        />
      </svg>
    ),
  },
  {
    title: "LA FLOTA MÁS COMPLETA",
    description:
      "De Ecuador, con las mejores cámaras y lentes del mercado para cine y televisión",
    icon: (
      <svg
        className="w-7 h-7 text-body"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 6v6l4 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>
    ),
  },
  {
    title: "TRAMITACIÓN DE PERMISOS",
    description:
      "Método agilizado, coordinación con las autoridades incluida en los servicios",
    icon: (
      <svg
        className="w-7 h-7 text-body"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M15 12h3m-6 0h.01M6 12h.01M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z"
        />
      </svg>
    ),
  },
  {
    title: "Volamos en cualquier lugar",
    description:
      "En cualquier momento y en cualquier condición, ¡plantéanos el reto!",
    icon: (
      <svg
        className="w-7 h-7 text-body"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M15 12h3m-6 0h.01M6 12h.01M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z"
        />
      </svg>
    ),
  },
  {
    title: "Compromiso de calidad",
    description:
      "Y de eficacia; trabajamos en tiempo récord, ahorrando costes operativos",
    icon: (
      <svg
        className="w-7 h-7 text-body"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M15 12h3m-6 0h.01M6 12h.01M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z"
        />
      </svg>
    ),
  },
  {
    title: `Drones "ready to go"`,
    description:
      "Incluidos piloto y operador de cámara, backup drone, monitor y material esencial",
    icon: (
      <svg
        className="w-7 h-7 text-body"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M15 12h3m-6 0h.01M6 12h.01M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z"
        />
      </svg>
    ),
  },
];


export default function WhyChooseUs() {
  return (
    <>
      <SeparatorUp colorsPrimary="bg-honeydew-900 dark:bg-honeydew-800" colorsSecundary="text-honeydew-800 dark:text-honeydew-900" />
      <section className="bg-honeydew-800 dark:bg-honeydew-900 py-8 sm:py-16 lg:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid space-y-4 text-center mb-5">
            <span className="text-3xl sm:text-4xl font-mono font-bold my-5 gradient-text uppercase">
              ¿Por que Elegirnos?
            </span>
          </div>

          <div className="bg-honeydew-900 dark:bg-honeydew-800 rounded-2xl p-4 sm:p-14 shadow-lg">
            <span className="flex text-center text-xl px-4 sm:text-2xl">
              Ofrecemos servicios de drones llave en mano apoyándonos en un equipo de profesionales dedicados con más de 200 horas de vuelo y cuyos valores de resiliencia e implicación no tienen comparación en el sector.
              Nuestra empresa de drones mantiene su compromiso de calidad basado en la eficacia demostrada a lo largo de los años, conseguimos los planos deseados en el menor tiempo posible ahorrando costes operativos en la producción.
            </span>

            <div className="flex justify-center pt-8">
              <div className="grid w-full max-w-6xl gap-4 grid-cols-2 lg:grid-cols-3">
                {list.map((item, index) => (
                  <div
                    key={index}
                    className="flex h-full bg-honeydew-800 dark:bg-honeydew-900 flex-col bg-neutral-primary-soft p-5 rounded-3xl"
                  >
                    <div className="flex justify-center">
                      <div className="sm:w-20 sm:h-20 w-15 h-15 inline-flex items-center justify-center rounded-full bg-honeydew-900 dark:bg-honeydew-800 text-white mb-5 shrink-0">
                        {item.icon}
                      </div>
                    </div>

                    <h3 className="mb-2 text-sm sm:text-xl font-semibold text-center uppercase">
                      {item.title}
                    </h3>

                    <p className="text-xs sm:text-xl text-center">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  )
}