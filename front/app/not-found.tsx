import { createMetadata } from "@/app/utils"
import { useTranslations } from "next-intl";
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal, Key } from "react";

export async function generateMetadata() {
  return createMetadata({
    title: 'Página no encontrada',
    description: 'La página que buscas no existe.',
    index: false,
  });
}

export default function NotFound() {

  const t = useTranslations('notFound');

  return (
    <div className="flex flex-col min-h-screen text-white bg-honeydew-900">
      <main className="flex items-center justify-center flex-1 px-6 py-28">
        <div className="text-center">
          <p className="mt-4 text-3xl font-bold sm:text-5xl text-customRed">
            404
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
            {t('title')}
          </h1>
          <p className="mt-6 text-base leading-7">
            {t.raw('message').map((line: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined, index: number) => (
              <span key={index}>
                {line}
                {index < t.raw('message').length - 1 && <br />}
              </span>
            ))}
          </p>
          <div className="flex justify-center pt-5">
            <a
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 text-black transition-all rounded-xl bg-honeydew-500 hover:bg-white"
            >
              {t('backToHome')}
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}