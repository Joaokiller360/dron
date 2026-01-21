
import { Button, createMetadata, Templets } from "@/app/utils"

export const metadata = createMetadata('Error 405')

export default function Construction() {
  return (
    <>
      <Templets
        style="bg-honeydew-900 dark:bg-honeydew-800"
      >
        <div className='relative z-10 px-10 overflow-hidden text-center lg:gap-8 xl:gap-0 lg:py-60 lg:px-0'>
          <p className='mt-4 text-3xl font-bold sm:text-5xl text-customRed'>405</p>
          <h1 className='mt-4 text-3xl font-bold tracking-tight sm:text-5xl'>Página En Construccion</h1>
          <p className='mt-6 text-base leading-7'>Lo sentimos, no hemos podido mostrar la página que estabas buscando.</p>
          <div className="flex justify-center pt-5">
            <Button
              href="/"
              style="bg-honeydew-500 text-black hover:bg-white"
              text="Volver al inicio"
            />
          </div>
        </div>
      </Templets>
    </>
  )
}