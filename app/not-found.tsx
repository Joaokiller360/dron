
import { Button, createMetadata, Templets } from "./utils"

export const metadata = createMetadata({
  title: 'Página no encontrada',
  description:
    'Esta sección de JB.SKYLENS se encuentra actualmente en construcción. Pronto tendremos nuevas soluciones con drones.',
  index: false, // 👈 importante para SEO
})


export default function NotFound() {
  return (
    <Templets style="bg-honeydew-900 dark:bg-honeydew-800">
      <div className="text-center">
        <p className="mt-4 text-3xl font-bold sm:text-5xl text-customRed">
          404
        </p>

        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
          Página No Encontrada
        </h1>

        <p className="mt-6 text-base leading-7">
          Lo sentimos, no hemos podido encontrar la página que estabas buscando.
          <br />
          Por favor vuelve al inicio.
        </p>

        <div className="flex justify-center pt-5">
          <Button
            href="/"
            style="bg-honeydew-500 text-black hover:bg-white"
            text="Volver al inicio"
          />
        </div>
      </div>
    </Templets>
  )
}