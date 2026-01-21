'use client'

import { Templets, Button } from "@/app/utils";
import { Clapperboard, Handshake } from "lucide-react";

export default function Inicio() {
  return (
    <>
      <Templets style="font-sans bg-honeydew-800 dark:bg-honeydew-900" key={'/'}>
        <div className="max-w-4xl text-white fade-in" id="#">
          <div className="grid text-center">
            <span className="font-mono text-xl font-light uppercase li gradient-text">
              ECUADOR - ESMERALDAS
            </span>
            <span className="my-5 font-mono text-4xl font-bold uppercase gradient-text">
              EMPRESA AUDIOVISUALES DE DRONES
            </span>
            <span className="mx-10 font-mono text-sm font-light lg:text-lg gradient-text">
              Gracias a nuestros DRONES, es posible conseguir las secuencias más agresivas y veloces que puedas imaginar.
            </span>
          </div>

          <div className="flex justify-center pt-5">
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <Button
                href="https://www.instagram.com/jb.skylens?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                text="Ver demoreel"
                style="cursor-pointer transition duration-500 bg-honeydew-500 hover:bg-white text-white hover:text-black dark:hover:text-white dark:bg-white dark:hover:bg-honeydew-500 dark:text-black"
                icon={<Clapperboard size={24} strokeWidth={2} />}
              />
              <Button
                href="/contact"
                text="Pide presupuesto, sin compromiso"
                style="cursor-pointer text-center transition duration-500 bg-white text-black hover:bg-honeydew-500 hover:text-white dark:bg-honeydew-500 dark:hover:bg-white dark:hover:text-black dark:text-white"
                icon={<Handshake size={24} strokeWidth={2} />}
              />
            </div>
          </div>
        </div>
      </Templets>
    </>
  );
}
