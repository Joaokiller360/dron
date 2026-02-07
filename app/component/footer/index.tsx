'use client'

import { Instagram, Twitter, Facebook } from 'lucide-react';

import { CopyText, SeparatorUp, Logo } from '@/app/utils';

export default function Footer() {
  return (
    <>
      <footer className="text-white bg-honeydew-800 dark:bg-honeydew-900">
        <SeparatorUp colorsPrimary="bg-honeydew-900 dark:bg-honeydew-800" colorsSecundary="text-honeydew-800 dark:text-honeydew-900" />
        <div className="w-full p-4 py-6 mx-auto max-w-7xl lg:py-8">
          <div className="md:flex md:justify-between">
            <div className="mb-6 md:mb-0">
              <Logo
                href='/'
                name='jb.skylens'
                style='h-7 me-3 rounded-full bg-white'
                imgName='logo-p'
              />
            </div>
            <div className="grid grid-cols-2 gap-8 sm:gap-3 sm:grid-cols-3">
              <div>
                <h2 className="w-auto mb-6 text-sm font-semibold uppercase text-heading">Recursos</h2>
                <ul className="font-medium text-body">
                  <li className="mb-2">
                    <a href="/" className="hover:underline">Inicio</a>
                  </li>
                  <li className="mb-2">
                    <a href="/teams" className="hover:underline">Equipo</a>
                  </li>
                  <li className="mb-2">
                    <a href="/services" className="hover:underline">Servicios</a>
                  </li>
                  {/*
                  
                  <li className="mb-2">
                    <a href="/clients" className="hover:underline">Clientes</a>
                  </li>
                  
                  */}
                  <li className="mb-2">
                    <a href="/portfolio" className="hover:underline">Portafolio</a>
                  </li>
                </ul>
              </div>
              <div>
                <h2 className="mb-6 text-sm font-semibold uppercase text-heading">Legal</h2>
                <ul className="font-medium text-body">
                  <li className="mb-4">
                    <a href="/construction" className="hover:underline">Politica de Privacidad</a>
                  </li>
                  <li>
                    <a href="/legal/terms-and-conditions" className="hover:underline">Terminos &amp; Condiciones</a>
                  </li>
                </ul>
              </div>
              <div className='sm:pl-1'>
                <h2 className="mb-6 text-sm font-semibold uppercase text-heading">Area de Contacto</h2>
                <ul className="font-medium text-body">
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
          <div className="items-center sm:flex sm:justify-between">
            <span className="text-sm text-body sm:text-center">© 2026 <a href="https://joaobarres.dev/" className="hover:underline">JoaoBarres</a>. Todos los derechos reservados.
            </span>
            <div className="flex items-center pt-5 sm:pt-0">
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