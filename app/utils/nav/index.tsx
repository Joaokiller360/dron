'use client'

import { Video, Route, Factory, Helicopter, TvMinimalPlay } from 'lucide-react';
import { usePathname } from "next/navigation";
import { Logo } from '../logo';

interface route {
  icon?: React.ReactNode
  name?: string
  href?: string
}

export function Routes({ icon, name = '', href = '' }: route) {
  return (
    <>
      <li className="inline-flex items-center w-full p-2 rounded cursor-pointer hover:bg-neutral-tertiary-medium hover:text-heading hover:bg-honeydew-800 dark:hover:bg-honeydew-900">
        <div className='flex items-center'>
          {icon}
          <a href={href} >{name}</a>
        </div>
      </li>
    </>
  )
}


export default function Navbar() {
  const pathname = usePathname();

  // Si estás en la página "/components", el nav no se muestra

  if (pathname === "/components") return null;

  return (

    <>
      <nav className="fixed top-0 z-20 w-full text-white dark:bg-honeydew-800 bg-honeydew-900 start-0 border-default">
        <div className="flex flex-wrap items-center justify-between p-4 mx-auto max-w-7xl backdrop-blur-sm">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <Logo
              href='/'
              name='jb.skylens'
              style='h-7 me-3 rounded-full bg-white'
              imgName='logo-p'
            />
          </div>
          <button data-collapse-toggle="navbar-dropdown" type="button" className="inline-flex items-center justify-center w-10 h-10 p-2 text-sm text-body rounded-base md:hidden hover:bg-neutral-secondary-soft hover:text-heading focus:outline-none focus:ring-2 focus:ring-neutral-tertiary" aria-controls="navbar-dropdown" aria-expanded="false">
            <span className="sr-only">Open main menu</span>
            <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M5 7h14M5 12h14M5 17h14" /></svg>
          </button>
          <div className="hidden w-full md:block md:w-auto" id="navbar-dropdown">
            <ul className="flex flex-col p-4 mt-4 font-medium border md:p-0 border-default rounded-base bg-neutral-secondary-soft md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-neutral-primary sm:items-center">
              <li className="px-4 py-2 cursor-pointer hover:bg-honeydew-800 dark:hover:bg-honeydew-900 rounded-2xl">
                <a href="/" className="block rounded bg-brand md:bg-transparent md:text-fg-brand md:p-0" aria-current="page">Inicio</a>
              </li>
              <li className='px-4 py-2 cursor-pointer hover:bg-honeydew-800 dark:hover:bg-honeydew-900 rounded-2xl'>
                <button id="dropdownNvbarButton" data-dropdown-toggle="dropdownNavbar" className="flex items-center justify-between w-full font-medium rounded cursor-pointer text-heading md:w-auto md:hover:bg-transparent md:border-0 md:hover:text-fg-brand md:p-0">
                  Servicios
                  <svg className="w-4 h-4 ms-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 9-7 7-7-7" /></svg>
                </button>

                <div id="dropdownNavbar" className="z-10 hidden shadow-lg bg-honeydew-900 rounded-2xl w-72">
                  <ul className="p-2 text-sm font-medium text-body" aria-labelledby="dropdownNvbarButton">
                    <Routes
                      icon={<Video className='pr-2' />}
                      name='Grabación de cine, series y peliculas'
                      href='/construction'
                    />
                    <Routes
                      icon={<Route className='pr-2' />}
                      name='Localización y reconocimiento'
                      href='/construction'
                    />
                    <Routes
                      icon={<Factory className='pr-2' />}
                      name='Industrial, Inspección y fotogrametria'
                      href='/construction'
                    />
                    <Routes
                      icon={<Helicopter className='pr-2' />}
                      name='Vuelo en ciudad'
                      href='/construction'
                    />
                    <Routes
                      icon={<TvMinimalPlay className='pr-2' />}
                      name='Eventos y retransmisiones'
                      href='/construction'
                    />
                  </ul>
                </div>
              </li>
              <li className="px-4 py-2 cursor-pointer hover:bg-honeydew-800 dark:hover:bg-honeydew-900 rounded-2xl">
                <a href="/teams" className="block rounded text-heading hover:bg-neutral-tertiary md:hover:bg-transparent md:border-0 md:hover:text-fg-brand md:p-0 md:dark:hover:bg-transparent">Equipo</a>
              </li>
              <li className="px-4 py-2 cursor-pointer hover:bg-honeydew-800 dark:hover:bg-honeydew-900 rounded-2xl">
                <a href="/portfolio" className="block rounded text-heading hover:bg-neutral-tertiary md:hover:bg-transparent md:border-0 md:hover:text-fg-brand md:p-0 md:dark:hover:bg-transparent">Portafolio</a>
              </li>
              <li className="px-4 py-2 cursor-pointer hover:bg-honeydew-800 dark:hover:bg-honeydew-900 rounded-2xl">
                <a href="/clients" className="block rounded text-heading hover:bg-neutral-tertiary md:hover:bg-transparent md:border-0 md:hover:text-fg-brand md:p-0 md:dark:hover:bg-transparent">Clientes</a>
              </li>
              <li className="px-4 py-2 cursor-pointer hover:bg-honeydew-800 dark:hover:bg-honeydew-900 rounded-2xl">
                <a href="/contact" className="block rounded text-heading hover:bg-neutral-tertiary md:hover:bg-transparent md:border-0 md:hover:text-fg-brand md:p-0 md:dark:hover:bg-transparent">Contacto</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}
