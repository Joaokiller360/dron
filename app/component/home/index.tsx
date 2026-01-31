'use client'

import { Templets, Button, ScrollBottonEffect } from "@/app/utils";
import { Clapperboard, Handshake } from "lucide-react";

const banner = {
  ubication: {
    ubi: `Ecuador – Esmeraldas`,
  },
  banner: {
    title: 'Empresa audiovisual de drones en Esmeraldas',
  },
  description: {
    text: `Gracias a nuestros drones profesionales, es posible conseguir
    secuencias aéreas agresivas, veloces y de alta calidad para
    producciones audiovisuales, eventos y empresas en Ecuador.`,
  },
  buttons: [
    {
      href: 'https://www.instagram.com/jb.skylens',
      text: 'Ver demoreel',
      style:
        'cursor-pointer transition duration-500 bg-honeydew-500 hover:bg-white text-white hover:text-black dark:hover:text-white dark:bg-white dark:hover:bg-honeydew-500 dark:text-black',
      icon: Clapperboard,
    },
    {
      href: '/contact',
      text: 'Pide presupuesto sin compromiso',
      style:
        'cursor-pointer text-center transition duration-500 bg-white text-black hover:bg-honeydew-500 hover:text-white dark:bg-honeydew-500 dark:hover:bg-white dark:hover:text-black dark:text-white',
      icon: Handshake,
    },
  ],
};

export default function Inicio() {
  return (
    <Templets style="font-sans bg-honeydew-800 dark:bg-honeydew-900" key={'/'}>

      {/* HERO */}
      <header className="flex justify-center">
        <ScrollBottonEffect>
          <section
            className="max-w-4xl text-white fade-in"
            aria-labelledby="hero-title"
          >
            <div className="grid text-center">

              {/* Ubicación */}
              <p className="font-mono text-xl font-light uppercase gradient-text">
                {banner.ubication.ubi}
              </p>

              {/* H1 principal (SOLO UNO EN TODA LA PÁGINA) */}
              <h1
                id="hero-title"
                className="my-5 font-mono text-4xl font-bold uppercase gradient-text"
              >
                {banner.banner.title}
              </h1>

              {/* Descripción */}
              <p className="mx-10 font-mono text-sm font-light lg:text-lg gradient-text">
                {banner.description.text}
              </p>
            </div>

            {/* CTA */}
            <nav
              className="flex justify-center pt-5"
              aria-label="Acciones principales"
            >
              <div className="flex flex-col items-center gap-4 sm:flex-row">
                {banner.buttons.map((btn, index) => {
                  const Icon = btn.icon;
                  return (
                    <Button
                      key={index}
                      href={btn.href}
                      text={btn.text}
                      style={btn.style}
                      icon={<Icon size={24} strokeWidth={2} />}
                    />
                  );
                })}
              </div>
            </nav>

          </section>
        </ScrollBottonEffect>
      </header>

    </Templets>
  );
}