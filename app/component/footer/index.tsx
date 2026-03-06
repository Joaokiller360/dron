'use client'

// Importación de iconos de redes sociales
import { Instagram, Twitter, Facebook } from 'lucide-react';

// Importación de utilidades y componentes reutilizables
import { CopyText, SeparatorUp, Logo, LanguageSwitcher } from '@/app/utils';

// Importación de hooks de internacionalización
import { useLocale, useTranslations } from 'next-intl';

export default function Footer() {
  // Hook para traducciones del footer
  const t = useTranslations('footer');
  // Hook para obtener el idioma actual
  const locale = useLocale();
  // Prefijo de idioma solo si NO es español
  const prefix = locale === 'es' ? '' : `/${locale}`;

  return (
    <>
      {/* Pie de página principal */}
      <footer className="text-white bg-honeydew-800 dark:bg-honeydew-900">
        {/* Separador decorativo superior */}
        <SeparatorUp colorsPrimary="bg-honeydew-900 dark:bg-honeydew-800" colorsSecundary="text-honeydew-800 dark:text-honeydew-900" />
        <div className="w-full p-4 py-6 mx-auto max-w-7xl lg:py-8">
          <div className="md:flex md:justify-between">
            {/* Logo de la empresa */}
            <div className="mb-6 md:mb-0">
              <Logo
                href='/'
                name='jb.skylens'
                style='h-7 me-3 rounded-full bg-white'
                imgName='logo-p'
              />
            </div>
            {/* Secciones de enlaces */}
            <div className="grid grid-cols-2 gap-8 md:grid-cols-3 sm:gap-3 xl:grid-cols-4">
              {/* Recursos principales */}
              <div>
                <h2 className="w-auto mb-6 text-sm font-semibold uppercase text-heading">{t('resources.title')}</h2>
                <ul className="font-medium text-body">
                  <li className="mb-2">
                    <a href={`${prefix}/`} className="hover:underline">{t('resources.home')}</a>
                  </li>
                  <li className="mb-2">
                    <a href={`${prefix}/teams`} className="hover:underline">{t('resources.teams')}</a>
                  </li>
                  <li className="mb-2">
                    <a href={`${prefix}/services`} className="hover:underline">{t('resources.services')}</a>
                  </li>
                  <li className="mb-2">
                    <a href={`${prefix}/portfolio`} className="hover:underline">{t('resources.portfolio')}</a>
                  </li>
                </ul>
              </div>
              {/* Sección legal */}
              <div>
                <h2 className="mb-6 text-sm font-semibold uppercase text-heading">{t('legal.title')}</h2>
                <ul className="font-medium text-body">
                  <li className="mb-4">
                    <a href={`${prefix}/construction`} className="hover:underline">{t('legal.privacy')}</a>
                  </li>
                  <li>
                    <a href={`${prefix}/legal/terms-and-conditions`} className="hover:underline">{t('legal.terms')}</a>
                  </li>
                </ul>
              </div>
              {/* Área de contacto */}
              <div className='sm:pl-1'>
                <h2 className="mb-6 text-sm font-semibold uppercase text-heading">{t('contactArea.title')}</h2>
                <ul className="font-medium text-body">
                  <li>
                    {/* Email de contacto con botón para copiar */}
                    <a className='text-sm font-semibold text-heading'>{t('contactArea.email')}:</a><br />
                    <CopyText value='contacto@joaobarres.dev' toastText='Correo Copiado Correctamente' />
                  </li>
                  <li className="mt-4">
                    {/* Teléfono de contacto con botón para copiar */}
                    <a className='text-sm font-semibold text-heading'>{t('contactArea.phone')}:</a><br />
                    <CopyText value='+593 98 666 0737' toastText='Telefono Copiado Correctamente' />
                  </li>
                </ul>
              </div>
              {/* Selector de idioma */}
              <div>
                <h2 className="mb-6 text-sm font-semibold uppercase text-heading">{t('language.title')}</h2>
                <LanguageSwitcher />
              </div>
            </div>
          </div>
          {/* Línea divisoria */}
          <hr className="my-6 border-default sm:mx-auto lg:my-8 text-white/80" />
          <div className="items-center sm:flex sm:justify-between">
            {/* Derechos de autor */}
            <span className="text-sm text-body sm:text-center">© 2026 <a href="https://joaobarres.dev/" className="hover:underline">JoaoBarres</a>. {t('rights')}
            </span>
            {/* Redes sociales */}
            <div className="flex items-center pt-5 sm:pt-0">
              <a href="https://www.facebook.com/share/1AagbyNSJV/?mibextid=wwXIfr" className="text-body hover:text-heading">
                <Facebook />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="#" className="text-body hover:text-heading ms-5">
                <Twitter />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="https://www.instagram.com/jb.skylens" className="text-body hover:text-heading ms-5">
                <Instagram />
                <span className="sr-only">Instagram</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}