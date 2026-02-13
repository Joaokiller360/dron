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
