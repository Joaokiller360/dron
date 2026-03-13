import "./[locale]/globals.css"
import { Button, createMetadata, Templets, NavPast } from "@/app/utils"
import { Footer } from '@/app/component';
import { getTranslations, getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import FlowbiteInit from "@/app/flowbait-init";

export async function generateMetadata() {
  const t = await getTranslations('notFound');
  return createMetadata({
    title: t('title'),
    description: t('description'),
    index: false,
  });
}

export default async function NotFound() {
  const t = await getTranslations('notFound');
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <FlowbiteInit />
      <div className="flex flex-col min-h-screen">
        <NavPast />

        <main className="flex-1 text-white">
          <Templets style="bg-honeydew-900 dark:bg-honeydew-800">
            <div className="text-center">
              <p className="mt-4 text-3xl font-bold sm:text-5xl text-customRed">
                404
              </p>

              <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
                {t('heading')}
              </h1>

              <p className="mt-6 text-base leading-7">
                {t('message')}
              </p>

              <div className="flex justify-center pt-5">
                <Button
                  href="/"
                  style="bg-honeydew-500 text-black hover:bg-white"
                  text={t('button')}
                />
              </div>
            </div>
          </Templets>
        </main>

        <Footer />
      </div>
    </NextIntlClientProvider>
  )
}