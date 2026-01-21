'use client'

import { SeparatorUp } from '@/app/utils'

export default function WhatDeDo() {
  return (
    <>
      <SeparatorUp colorsPrimary="bg-honeydew-900 dark:bg-honeydew-800" colorsSecundary="text-honeydew-800 dark:text-honeydew-900" />
      <div className="bg-honeydew-800 dark:bg-honeydew-900 py-8 sm:py-16 lg:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid space-y-4 text-center mb-6">

            <div className="text-sm lg:text-lg font-mono mx-6 font-light gradient-text">
              <span>- </span>
              <span className="uppercase">
                A QUÉ NOS DEDICAMOS
              </span>
              <span> -</span>
            </div>

            <div className='grid text-xl sm:text-4xl'>
              <span className="font-mono font-bold my-2 gradient-text uppercase">
                CONOCE LO QUE HACEMOS
              </span>

              <span className="font-mono font-bold my-2 gradient-text uppercase">
                TRABAJOS  RPAS/AUS
              </span>
            </div>

          </div>

          <div className="bg-honeydew-900 dark:bg-honeydew-800 rounded-2xl p-14 shadow-lg">

            <div className="text-sm sm:text-2xl">
              <span className="flex text-center">
                Operamos nuestras unidades de drones aéreos en cualquier lugar del ECUADOR para todo tipo de trabajos RPAS/UAS; somos una empresa de drones autorizada para volar en todo ECUADOR.
              </span>
            </div>

            <div className="flex flex-wrap sm:-m-4 -mx-4 -mb-10 -mt-4 md:space-y-0 space-y-6 pt-10">
              <div className="p-4 md:w-1/3 flex flex-col text-center items-center">
                <div className="sm:w-20 sm:h-20 w-16 h-16 inline-flex items-center justify-center rounded-full bg-honeydew-900 text-honeydew-500 mb-5 shrink-0">
                  <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="sm:w-10 sm:h-10 w-6 h-6" viewBox="0 0 24 24">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                  </svg>
                </div>
                <div className="grow">
                  <p className="leading-relaxed text-base">Volamos en cualquier escenario: ciudad, espacio aéreo controlado (CTR/ATZ), de noche y sin importar las condiciones meteorológicas</p>
                </div>
              </div>
              <div className="p-4 md:w-1/3 flex flex-col text-center items-center">
                <div className="sm:w-20 sm:h-20 w-16 h-16 inline-flex items-center justify-center rounded-full bg-honeydew-900 text-honeydew-500 mb-5 shrink-0">
                  <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="sm:w-10 sm:h-10 w-6 h-6" viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div className="grow">
                  <p className="leading-relaxed text-base">Podemos operar múltiples unidades de forma simultánea en distintos lugares del mundo</p>
                </div>
              </div>
              <div className="p-4 md:w-1/3 flex flex-col text-center items-center">
                <div className="sm:w-20 sm:h-20 w-16 h-16 inline-flex items-center justify-center rounded-full bg-honeydew-900 text-honeydew-500 mb-5 shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-10 sm:h-10 w-6 h-6 lucide lucide-drone"
                  >
                    <path d="M10 10 7 7" />
                    <path d="m10 14-3 3" />
                    <path d="m14 10 3-3" />
                    <path d="m14 14 3 3" />
                    <path d="M14.205 4.139a4 4 0 1 1 5.439 5.863" />
                    <path d="M19.637 14a4 4 0 1 1-5.432 5.868" />
                    <path d="M4.367 10a4 4 0 1 1 5.438-5.862" />
                    <path d="M9.795 19.862a4 4 0 1 1-5.429-5.873" />
                    <rect x="10" y="8" width="4" height="8" rx="1" />
                  </svg>

                </div>
                <div className="grow">
                  <p className="leading-relaxed text-base">Nuestros drones están matriculados, asegurados y sometidos a un mantenimiento minucioso</p>
                </div>
              </div>
            </div>
          </div>
        </div >
      </div >
    </>
  )
}