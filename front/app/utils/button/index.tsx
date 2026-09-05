'use client'

import Link from "next/link";

interface ButtonNavProps {
  hrf?: string;
  text?: string;
  icon?: React.ReactNode;
  style?: string;
}

export function ButtonNav({ hrf = '', text = '', icon = '', style = '' }: ButtonNavProps) {
  return (
    <div className={style}>
      <Link
        href={hrf}
        style={{ display: 'flex', alignItems: 'center', gap: '8px' }} // Estilos directamente en el Link
      >
        {icon && <span>{icon}</span>}
        <span className="hidden sm:inline">{text}</span>
      </Link>
    </div>
  );
}

interface ButtonProps {
  href?: string;
  text?: string;
  icon?: React.ReactNode;
  style?: string;
  id?: string;
  target?: string
}

export function Button({
  href,
  id,
  text = '',
  icon = null,
  style = '',
  target
}: ButtonProps) {
  const classes = `inline-flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${style}`;

  return (
    <div className="flex justify-center">
      {href ? (
        <a target={target} href={href} id={id} className={classes}>
          <span>{text}</span>
          {icon}
        </a>
      ) : (
        <>
          <button id={id} className={classes} >
            <span>{text}</span>
            {icon}
          </button>
        </>
      )}
    </div>
  );
}

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="relative text-white">
      <select
        className="w-full p-4 py-2 pl-3 pr-8 text-sm text-white transition duration-300 border shadow-sm appearance-none cursor-pointer bg-honeydew-800 rounded-xl placeholder:text-white ease focus:outline-none"
        value={locale} onChange={(e) => switchLocale(e.target.value)}>
        <option value="es">Español</option>
        <option value="en">English</option>
      </select>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.2" stroke="currentColor" className="h-5 w-5 ml-1 absolute top-2.5 right-2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
      </svg>
    </div>
  );
}