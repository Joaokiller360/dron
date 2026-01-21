'use client'

import { Instagram, Twitter, Facebook } from 'lucide-react';

import { CopyText, SeparatorUp } from '@/app/utils';

export default function Footer() {
  return (
    <>
      <footer className="bg-honeydew-800 dark:bg-honeydew-900 text-white">
        <SeparatorUp colorsPrimary="bg-honeydew-900 dark:bg-honeydew-800" colorsSecundary="text-honeydew-800 dark:text-honeydew-900" />
        <div className="mx-auto w-full max-w-7xl p-4 py-6 lg:py-8">
          <div className="md:flex md:justify-between">
            <div className="mb-6 md:mb-0">
              <a href="https://flowbite.com/" className="flex items-center">
                <img src="https://flowbite.com/docs/images/logo.svg" className="h-7 me-3" alt="FlowBite Logo" />
                <span className="text-heading self-center text-2xl font-semibold whitespace-nowrap">Flowbite</span>
              </a>
            </div>
            <div className="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3">
              <div>
                <h2 className="mb-6 text-sm font-semibold text-heading uppercase">Recursos</h2>
                <ul className="text-body font-medium">
                  <li className="mb-2">
                    <a href="/" className="hover:underline">Inicio</a>
                  </li>
                  <li className="mb-2">
                    <a href="/teams" className="hover:underline">Equipo</a>
                  </li>
                  <li className="mb-2">
                    <a href="/services" className="hover:underline">Servicios</a>
                  </li>
                  <li className="mb-2">
                    <a href="/clients" className="hover:underline">Clientes</a>
                  </li>
                  <li className="mb-2">
                    <a href="/portfolio" className="hover:underline">Portafolio</a>
                  </li>
                </ul>
              </div>
              <div>
                <h2 className="mb-6 text-sm font-semibold text-heading uppercase">Legal</h2>
                <ul className="text-body font-medium">
                  <li className="mb-4">
                    <a href="#" className="hover:underline">Politica de Privacidad</a>
                  </li>
                  <li>
                    <a href="#" className="hover:underline">Terminos &amp; Condiciones</a>
                  </li>
                </ul>
              </div>
              <div className='sm:pl-5'>
                <h2 className="mb-6 text-sm font-semibold text-heading uppercase">Area de Contacto</h2>
                <ul className="text-body font-medium">
                  <li>
                    <a className='text-sm font-semibold text-heading'>Correo:</a><br />
                    <CopyText value='contacto@joaobarres.dev' toastText='Correo Copiado Correctamente' />
                  </li>
                  <li className="mt-4">
                    <a className='text-sm font-semibold text-heading'>Telefono:</a><br />
                    <CopyText value='+593 98 666 0737' toastText='Telefono Copiado Correctamente' />
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <hr className="my-6 border-default sm:mx-auto lg:my-8 text-white/80" />
          <div className="sm:flex items-center sm:justify-between">
            <span className="text-sm text-body sm:text-center">© 2026 <a href="https://joaobarres.dev/" className="hover:underline">JoaoBarres</a>. Todos los derechos reservados.
            </span>
            <div className="flex pt-5 sm:pt-0 items-center">
              <a href="https://www.facebook.com/share/1AagbyNSJV/?mibextid=wwXIfr" className="text-body hover:text-heading">
                <Facebook />
                <span className="sr-only">Facebook page</span>
              </a>
              <a href="#" className="text-body hover:text-heading ms-5">
                <Twitter />
                <span className="sr-only">Twitter page</span>
              </a>
              <a href="https://www.instagram.com/jb.skylens" className="text-body hover:text-heading ms-5">
                <Instagram />
                <span className="sr-only">Dribbble account</span>
              </a>
            </div>
          </div>
        </div>
      </footer>

    </>
  )
}