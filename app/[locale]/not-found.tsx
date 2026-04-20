import { createMetadata } from "@/app/utils"

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  return createMetadata({
    title: 'Página no encontrada',
    description: 'La página que buscas no existe.',
    index: false,
  });
}

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen text-white bg-honeydew-900">
      <main className="flex items-center justify-center flex-1 px-6 py-28">
        <div className="text-center">
          <p className="mt-4 text-3xl font-bold sm:text-5xl text-customRed">
            404
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
            Página no encontrada
          </h1>
          <p className="mt-6 text-base leading-7">
            Lo sentimos, la página que buscas no existe.
          </p>
          <div className="flex justify-center pt-5">
            <a
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 text-black transition-all rounded-xl bg-honeydew-500 hover:bg-white"
            >
              Volver al inicio
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}