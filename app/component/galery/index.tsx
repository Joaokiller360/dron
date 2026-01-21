'use client'

import { Button, SeparatorUp } from "@/app/utils"
import { Clapperboard } from "lucide-react";

export default function Galery() {
  return (
    <>
      <SeparatorUp colorsPrimary="bg-honeydew-800 dark:bg-honeydew-900" colorsSecundary="text-honeydew-900 dark:text-honeydew-800" />
      <section className="py-6 pt-10 bg-honeydew-900 dark:bg-honeydew-800 lg:py-8">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <section className="grid mb-10 space-y-4 text-center">
            <div>
              <span className="my-5 font-mono text-4xl font-bold uppercase gradient-text">
                Galeria
              </span>
            </div>
          </section>
          <section>
            <div className="px-2 py-4 mx-auto max-w-7xl sm:py-4 lg:px-6">
              <div className="grid h-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5">

                <div className="flex flex-col h-auto col-span-2 text-white sm:col-span-1 md:col-span-2 md:h-full hover:text-white/80">
                  <a href="#" className="relative flex flex-col px-4 pt-40 pb-4 overflow-hidden font-black rounded-lg group grow">
                    <img src="https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" className="absolute inset-0 object-cover w-full h-full transition-transform duration-500 ease-in-out group-hover:scale-105" />
                    <div className="absolute inset-0 bg-linear-to-b from-gray-900/25 to-gray-900/5" />
                    <h3 className="absolute top-0 left-0 z-10 p-4 text-xl font-black xs:text-xl md:text-3xl">Bodas</h3>
                  </a>
                </div>

                <div className="col-span-2 text-white sm:col-span-1 md:col-span-2 hover:text-white/80">
                  <a href="" className="relative flex flex-col px-4 pt-40 pb-4 mb-4 overflow-hidden font-black rounded-lg group">
                    <img src="https://images.unsplash.com/photo-1504675099198-7023dd85f5a3?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" className="absolute inset-0 object-cover w-full h-full transition-transform duration-500 ease-in-out group-hover:scale-105" />
                    <div className="absolute inset-0 bg-linear-to-b from-gray-900/25 to-gray-900/5"></div>
                    <h3 className="absolute top-0 left-0 z-10 p-4 text-xl xs:text-xl md:text-3xl">XV</h3>
                  </a>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-2">
                    <a href="" className="relative flex flex-col px-4 pt-40 pb-4 overflow-hidden font-black text-white rounded-lg group hover:text-white/80">
                      <img src="https://images.unsplash.com/photo-1571104508999-893933ded431?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" className="absolute inset-0 object-cover w-full h-full transition-transform duration-500 ease-in-out group-hover:scale-105" />
                      <div className="absolute inset-0 bg-linear-to-b from-gray-900/25 to-gray-900/5"></div>
                      <h3 className="absolute top-0 left-0 z-10 p-4 text-xl xs:text-xl md:text-3xl">Eventos</h3>
                    </a>
                    <a href="" className="relative flex flex-col px-4 pt-40 pb-4 overflow-hidden font-black text-white rounded-lg group hover:text-white/80">
                      <img src="https://images.unsplash.com/photo-1626897505254-e0f811aa9bf7?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" className="absolute inset-0 object-cover w-full h-full transition-transform duration-500 ease-in-out group-hover:scale-105" />
                      <div className="absolute inset-0 bg-linear-to-b from-gray-900/25 to-gray-900/5"></div>
                      <h3 className="absolute top-0 left-0 z-10 p-4 text-xl xs:text-xl md:text-3xl">Inspecciones</h3>
                    </a>
                  </div>
                </div>
                <div className="flex flex-col h-auto col-span-2 sm:col-span-1 md:col-span-1 md:h-full">
                  <a href="" className="relative flex flex-col px-4 pt-40 pb-4 overflow-hidden font-black text-white rounded-lg group grow hover:text-white/80">
                    <img src="https://images.unsplash.com/photo-1693680501357-a342180f1946?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" className="absolute inset-0 object-cover w-full h-full transition-transform duration-500 ease-in-out group-hover:scale-105" />
                    <div className="absolute inset-0 bg-linear-to-b from-gray-900/25 to-gray-900/5"></div>
                    <h3 className="absolute top-0 left-0 z-10 p-4 text-xl xs:text-xl md:text-3xl">Reals</h3>
                  </a>
                </div>
              </div>
            </div>
          </section>

          <div className="flex justify-center pt-5">
            <Button
              href="/portfolio"
              text="Ver Trabajos"
              style="bg-white hover:bg-honeydew-500 text-black"
              icon={<Clapperboard size={24} color="#000" strokeWidth={2} />}
            />
          </div>
        </div>
      </section>
    </>
  )
}
