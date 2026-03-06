'use client'

import { Camera } from 'lucide-react';
import { Logo } from '../logo';
import Link from 'next/link';
import { useLocale } from 'next-intl';

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
          <Link href={href}>{name}</Link>
        </div>
      </li>
    </>
  )
}



interface ButtonNavProps {
  hrf?: string;
  text?: string;
  icon?: React.ReactNode;
}

export function ButtonNav({ hrf = '', text = '', icon }: ButtonNavProps) {
  return (
    <Link
      href={hrf}
      style={{ display: 'flex', alignItems: 'center', gap: '8px' }} // Estilos directamente en el Link
    >
      {icon && <span>{icon}</span>}
      <span className="hidden sm:inline">{text}</span>
    </Link>
  );
}

import { BookText, HomeIcon, UserRound, Rocket, ContactRound } from "lucide-react";
import { useTranslations } from 'next-intl';

export function NavPast() {
  const t = useTranslations('nav');
  const locale = useLocale();

  // Solo agregar prefijo de idioma si NO es el idioma por defecto (es)
  const prefix = locale === 'es' ? '' : `/${locale}`;

  const itemsNavbar = [
    {
      id: 1,
      title: t('home'),
      icon: <HomeIcon size={25} color="#fff" strokeWidth={1} />,
      link: prefix || '/',
    },
    {
      id: 2,
      title: t('services'),
      icon: <UserRound size={25} color="#fff" strokeWidth={1} />,
      link: `${prefix}/services`,
    },
    {
      id: 3,
      title: t('teams'),
      icon: <Rocket size={25} color="#fff" strokeWidth={1} />,
      link: `${prefix}/teams`,
    },
    {
      id: 4,
      title: t('portfolio'),
      icon: <Camera size={25} color="#fff" strokeWidth={1} />,
      link: `${prefix}/portfolio`,
    },
    {
      id: 5,
      title: t('clients'),
      icon: <BookText size={25} color="#fff" strokeWidth={1} />,
      link: `${prefix}/clients`,
    },
    {
      id: 6,
      title: t('contact'),
      icon: <ContactRound size={25} color="#fff" strokeWidth={1} />,
      link: `${prefix}/contact`,
    }
  ];

  return (
    <nav className="fixed z-40 flex justify-center w-full px-2 top-8">
      <div
        className="flex items-center max-w-full gap-1 px-2 py-2 overflow-x-auto rounded-full bg-black/40 backdrop-blur-sm whitespace-nowrap scrollbar-hide md:flex-wrap md:justify-center md:overflow-visible"
      >
        {/* Logo solo en desktop */}
        <div className="items-center hidden mr-2 xl:flex">
          <Logo
            href={prefix || '/'}
            name="jb.skylens"
            style="h-7 rounded-full bg-white"
            imgName="logo-p"
          />
        </div>

        {itemsNavbar.map((item) => (
          <div
            key={item.id}
            className="flex-shrink-0 px-3 py-2 transition rounded-full hover:bg-colorButton"
          >
            <ButtonNav
              hrf={item.link}
              text={item.title}
              icon={item.icon}
            />
          </div>
        ))}
      </div>
    </nav>
  );
}