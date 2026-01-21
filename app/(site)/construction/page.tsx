'use client'

import { Templets } from "@/app/utils"

export default function Construction() {
  return (
    <>
      <Templets
        style="bg-honeydew-900 dark:bg-honeydew-800"
      >
        <div className='relative overflow-hidden lg:gap-8 xl:gap-0 lg:py-60  lg:px-0 px-10 text-center z-10'>
          <p className='mt-4 text-3xl font-bold sm:text-5xl text-customRed'>405</p>
          <h1 className='mt-4 text-3xl font-bold tracking-tight sm:text-5xl'>Página En Construccion</h1>
          <p className='mt-6 text-base leading-7'>Lo sentimos, no hemos podido mostrar la página que estabas buscando.</p>
        </div>
      </Templets>
    </>
  )
}