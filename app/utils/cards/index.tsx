'use client'
import { Button, ScrollBottonEffect } from '@/app/utils'
import { Video } from 'lucide-react'

interface SectionCard {
  children: React.ReactNode
  style?: string
}

export function SectionCard({ children, style = '' }: SectionCard) {
  return (
    <>
      <section className={`p-5 ${style} rounded-2xl sm:p-10`}>
        {children}
      </section>
    </>
  )
}

interface CardVideo {
  title?: string
  organizacion?: string
  present?: string
  nameButton?: string
  lugar?: string
  href?: string
  videoname?: string
  imgName?: string
  index: number
}

export function CardVideo({ index = 0, title = '', organizacion = '', nameButton = '', href = '', videoname = '', imgName = '', present = '' }: CardVideo) {
  return (
    <>
      <ScrollRevealEffect index={index} key={title}>
        <div className="flex flex-col h-full p-6 rounded-xl bg-honeydew-800 dark:bg-honeydew-900" id={title}>

          {/* Imagen o Video */}
          <div className="relative overflow-hidden rounded-lg">
            {videoname ? (
              <video
                className="object-cover w-full h-64 rounded-lg"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              >
                <source src={`https://res.cloudinary.com/dzlavqhid/video/upload/${videoname}.mp4`} type="video/mp4" />
                {videoname}
              </video>
            ) : (
              imgName && (
                <img
                  loading="lazy"
                  src={`https://res.cloudinary.com/dzlavqhid/image/upload/${imgName}.jpg`}
                  alt={imgName}
                  className="object-cover w-full h-64 transition-transform duration-500 group-hover:scale-105"
                />
              )
            )}
          </div>


          {/* Contenido */}
          <div className="flex flex-col flex-1 text-white">
            <div className='grid items-center'>
              <h5 className="mt-6 mb-2 text-2xl font-semibold tracking-tight text-center line-clamp-2">
                {title}
              </h5>

              {/* Organizacion o Present */}
              {present ? (
                <p className="mb-4 text-xl text-center line-clamp-3">
                  Presenta: <span className='underline underline-offset-4'>{present}</span>
                </p>
              ) : (
                organizacion && (
                  <p className="mb-4 text-xl text-center line-clamp-3">
                    Organizacion: <span className='underline underline-offset-4'>{organizacion}</span>
                  </p>
                )
              )}
            </div>

            {/* Botón siempre abajo */}
            <div className="mt-auto">
              <Button
                target='_blank'
                href={href}
                text={`Ver ${nameButton}`}
                style="cursor-pointer transition duration-500 bg-honeydew-900 hover:bg-white text-white hover:text-black dark:hover:text-white dark:bg-white dark:hover:bg-honeydew-800 dark:text-black"
                icon={<Video size={24} strokeWidth={2} />}
              />
            </div>
          </div>

        </div>
      </ScrollRevealEffect>

    </>
  )
}

{/* 
            {showDefaultButton && (
              <Button
                href={}
                text={map}
                style="w-full cursor-pointer transition duration-500 bg-honeydew-900 hover:bg-white text-white hover:text-black dark:hover:text-white dark:bg-white dark:hover:bg-honeydew-800 dark:text-black"
                icon={<Video size={24} strokeWidth={2} />}
              />
            )}
            */}


interface CardClient {
  client?: string
  organizacion?: string
  buttons?: Buttons[];
  content?: Content[];
  clients?: Client[];
  services?: Services[];
  index: number
}

interface Client {
  client?: string
  organizacion?: string
  buttons?: Buttons[];
  content?: Content[];
}

interface Services {
  title?: string
  description?: string
  buttons?: Buttons[];
  content?: Content[];
}

interface Content {
  videoname?: string
  imgName?: string
}

interface Buttons {
  id: number
  href: string
  active: boolean
  name?: string
  icon?: React.ReactNode
}

export function CardClient({ index = 0, buttons = [], content = [], clients = [], services = [] }: CardClient) {

  const activeButtons = buttons.filter(
    ({ active, href }) => active && href
  )

  const media = content[0]

  const cliente = clients[0]
  const Services = services[0]

  const d = { cliente, Services }

  return (
    <>

      {/* Componente nuevo */}

      {d?.cliente ? (
        <>
          <div className="relative w-full py-6 sm:py-8 bg-honeydew-800 dark:bg-honeydew-900 rounded-2xl">
            <div className="flex flex-col items-center mx-5">
              {/* Imagen o Video */}
              <div className="relative overflow-hidden">

                {media?.imgName ? (
                  <>
                    <img
                      loading="lazy"
                      src={`https://res.cloudinary.com/dzlavqhid/image/upload/${media?.imgName}.jpg`}
                      alt={d?.cliente?.client}
                      className="object-cover w-full h-auto mb-5 transition-transform duration-500 group-hover:scale-105 rounded-2xl"
                    />
                  </>
                ) : (
                  media?.videoname && (
                    <>
                      <video
                        className="object-cover w-full h-64 mb-5 rounded-2xl"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                      >
                        <source src={`https://res.cloudinary.com/dzlavqhid/video/upload/${media.videoname}.mp4`} type="video/mp4" />
                        {media.videoname}
                      </video>
                    </>
                  )
                )}

              </div>

              {/* Nombre o Organizacion del cliente */}
              <span className="mb-0.5 text-xl text-center font-semibold tracking-tight text-heading">{d.cliente.client}</span>
              <span className="text-xl text-body">{d.cliente.organizacion}</span>

              {/* Botones */}
              <div className={`grid gap-2 px-6 mt-4 md:mt-6 ${activeButtons.length === 1 ? 'flex items-center justify-center' : 'grid-cols-2'} `} >
                {activeButtons.map(({ id, href, name, icon }) => (
                  <Button
                    target='_blank'
                    key={id}
                    text={name}
                    href={href}
                    style="w-full max-w-xs cursor-pointer transition duration-500 bg-honeydew-900 hover:bg-white text-white hover:text-black dark:hover:text-white dark:bg-white dark:hover:bg-honeydew-800 dark:text-black"
                    icon={icon}
                  />
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        d?.Services && (
          <>
            <div className="relative w-full py-6 sm:py-8 bg-honeydew-900 dark:bg-honeydew-800 rounded-2xl">
              <div className="flex flex-col items-center mx-5">

                {/* Imagen o Video */}
                <div className="relative overflow-hidden">

                  {media?.imgName ? (
                    <>
                      <img
                        loading="lazy"
                        src={`https://res.cloudinary.com/dzlavqhid/image/upload/${media?.imgName}.jpg`}
                        alt={d?.cliente?.client}
                        className="w-auto h-56 mb-6 bg-white rounded-2xl"
                      />
                    </>
                  ) : (
                    media?.videoname && (
                      <>
                        <video
                          className="object-cover w-full h-64 mb-5 rounded-2xl"
                          autoPlay
                          muted
                          loop
                          playsInline
                          preload="metadata"
                        >
                          <source src={`https://res.cloudinary.com/dzlavqhid/video/upload/${media.videoname}.mp4`} type="video/mp4" />
                          {media.videoname}
                        </video>
                      </>
                    )
                  )}

                </div>

                {/* Nombre del Servicio */}
                <span className="mb-0.5 text-2xl text-center font-semibold tracking-tight text-heading">{d.Services.title}</span>
                <span className="p-4 text-xl leading-relaxed">{d.Services.description}</span>

                {/* Boton */}
                <div className={`grid gap-2 px-6 mt-4 md:mt-6 ${activeButtons.length === 1 ? 'flex items-center justify-center' : 'grid-cols-2'} `} >
                  {activeButtons.map(({ id, href, name, icon }) => (
                    <Button
                      target='_blank'
                      key={id}
                      text={name}
                      href={href}
                      style="w-full max-w-xs cursor-pointer transition duration-500 bg-honeydew-800 hover:bg-white text-white hover:text-black dark:hover:text-white dark:bg-white dark:hover:bg-honeydew-900 dark:text-black"
                      icon={icon}
                    />
                  ))}
                </div>
              </div>
            </div>
          </>
        )
      )}

      {/*

      
Componente guardado

<div className="relative w-full py-6 sm:py-8 bg-honeydew-900 rounded-2xl">
        <div className="flex flex-col items-center mx-5">

          <>

            <div className="relative overflow-hidden">

              {media?.imgName ? (
                <>
                  <img
                    loading="lazy"
                    src={`https://res.cloudinary.com/dzlavqhid/image/upload/${media.imgName}.jpg`}
                    alt={media.imgName}
                    className="object-cover w-full h-64 mb-5 transition-transform duration-500 group-hover:scale-105 rounded-2xl"
                  />
                </>
              ) : (
                media?.videoname && (
                  <>
                    <video
                      className="object-cover w-full h-64 mb-5 rounded-2xl"
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                    >
                      <source src={`https://res.cloudinary.com/dzlavqhid/video/upload/${media.videoname}.mp4`} type="video/mp4" />
                      {media.videoname}
                    </video>
                  </>
                )
              )}

            </div>

            <span className="mb-0.5 text-xl text-center font-semibold tracking-tight text-heading">
              {client}
            </span>
            <span className="text-xl text-body">
              {organizacion}
            </span>

            <div className={`grid gap-2 px-6 mt-4 md:mt-6 ${activeButtons.length === 1 ? 'flex items-center justify-center' : 'grid-cols-2'} `} >
              {activeButtons.map(({ id, href, name, icon }) => (
                <Button
                  key={id}
                  text={name}
                  href={href}
                  style="w-full max-w-xs cursor-pointer transition duration-500 bg-honeydew-900 hover:bg-white text-white hover:text-black dark:hover:text-white dark:bg-white dark:hover:bg-honeydew-800 dark:text-black"
                  icon={icon}
                />
              ))}
            </div>

          </>

        </div>
      </div>
  
*/}



    </>
  )
}

import { Banner, highlightText, ScrollRevealEffect, keywordLink } from '@/app/utils'
import { Film, MapPin, Factory, Building2, Earth, CheckCircle, Paperclip } from 'lucide-react';
import React from 'react'
import Link from 'next/link'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

interface d {
  imagen?: string
  title?: string
  label?: string
}

interface content {
  label?: string
  subTitle?: string
  text?: string[]
  list?: List[]
}

interface ButtonItem {
  label: string
  href: string
  target?: '_self' | '_blank'
}

interface p {
  text?: string
  buttons?: ButtonItem[]
}

interface List {
  text?: string[]
}

interface Galery {
  imagen?: string
  video?: string
  label?: string
  ref?: string
}

interface page {
  D: d[]
  Content: content[]
  keyword?: string[]
  keywordLink?: keywordLink
  index: number
  galery?: Galery[]
  P?: p[]
  galeria?: galeria[]
  CalltoAction?: CalltoAction[]
  Animations?: animation[]
  Example?: example[]
}

interface galeria {
  video?: string
  label?: string
  ref?: string
}

interface CalltoAction {
  callToAction?: string
  text?: string[]
  buttons?: ButtonItem[]
}

interface animation {
  src?: string
}

interface example {
  label?: string
  subTitle?: string
  text?: string[]

}

const listServices = [
  {
    icon: <Film size={38} className="mb-2" />,
    label: 'drones para cine y publicidad',
    hreft: 'film-and-tv-production'
  },
  {
    icon: <MapPin size={38} className="mb-2" />,
    label: 'drones de localizacion',
    hreft: 'location-scouting-and-recon'
  },
  {
    icon: <Factory size={38} className="mb-2" />,
    label: 'drones industriales',
    hreft: 'insdustrial-inspection-and-photogrammetry'
  },
  {
    icon: <Building2 size={38} className="mb-2" />,
    label: 'drones para vuelo en ciudad',
    hreft: 'urban-flight-operations'
  },
  {
    icon: <Earth size={38} className="mb-2" />,
    label: 'drones para eventos y retransmisiones',
    hreft: 'events-and-live-broadcasting'
  }
]

export function PageServices({
  D,
  Content,
  keyword = [],
  keywordLink = {},
  index = 0,
  P,
  galery,
  galeria,
  CalltoAction,
  Animations,
  Example
}: page) {

  const banner = D[0]
  // const section = Content[0]

  return (
    <>
      <header className="relative pb-16 pt-44 bg-honeydew-900/40" >

        {/* Imagen de fondo */}
        <img
          src={`https://res.cloudinary.com/dzlavqhid/image/upload/${banner.imagen}.webp`}
          alt={banner.imagen}
          className="absolute inset-0 object-cover object-center w-full h-full -z-10"
        />

        <Banner
          label={banner.label}
          title={banner.title}
        />
        <div className="flex justify-center">
          <div className="grid gap-4 justify-items-center grid-cols-2 sm:grid-cols-4 lg:grid-cols-[repeat(auto-fit,minmax(7rem,1fr))] max-w-6xl">

            {listServices.map((card, index) => (
              <ScrollRevealEffect index={index} key={card.label}>
                <a
                  href={`/services/${card.hreft}`}
                  className="flex flex-col items-center justify-center w-32 p-4 text-xs text-center text-white h-30 bg-honeydew-900/90 rounded-2xl"
                >
                  {card.icon}
                  <span className="leading-tight uppercase">
                    {card.label}
                  </span>
                </a>
              </ScrollRevealEffect>
            ))}


          </div>
        </div>

      </header>

      <main className='py-5 text-black sm:p-10 bg-honeydew-900 dark:bg-honeydew-800'>

        <section className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">


          {Content.map((section, index) => (
            <ScrollRevealEffect key={index}>
              <div key={index} className="p-5 bg-gray-200 rounded-2xl sm:p-10">
                <React.Fragment>
                  <div className="font-mono">
                    {/*Label*/}
                    <span className="text-sm font-bold uppercase sm:text-xl text-honeydew-800">
                      <ScrollBottonEffect>
                        <span className="pr-1">-</span>
                        {section.label || 'Services'}
                      </ScrollBottonEffect>
                    </span>

                    {/*Subtitle*/}
                    <div className="pt-2">
                      <span className="text-xl font-bold text-justify uppercase lg:text-3xl sm:text-2xl">
                        <ScrollBottonEffect>
                          {section.subTitle}
                        </ScrollBottonEffect>
                      </span>
                    </div>
                  </div>

                  <div className='text-justify sm:text-xl'>
                    {/*Text*/}
                    {section.text && (
                      <div>
                        {section.text.map((paragraph, i) => (
                          <ScrollRevealEffect key={i} index={i}>
                            <span className="block pt-2">
                              {highlightText(paragraph, keyword, keywordLink)}
                            </span>
                          </ScrollRevealEffect>
                        ))}
                      </div>
                    )}

                    {/*List*/}

                    {section.list?.map((item, j) => (
                      <ScrollRevealEffect key={j} index={j}>
                        <ul className="py-4 space-y-3">
                          <li className="flex items-start gap-3">
                            <span className="flex items-center justify-center w-5 h-5 mt-1">
                              <CheckCircle className="w-4 h-4 text-honeydew-800" />
                            </span>
                            <span>
                              {item.text && highlightText(item.text.join(' '), keyword)}
                            </span>
                          </li>
                        </ul>
                      </ScrollRevealEffect>
                    ))}

                    {Array.isArray(galery) && (
                      <ScrollRevealEffect>
                        <div className="flex justify-center pt-2 xl:p-4 sm:pt-0">
                          <div className="grid w-full h-auto gap-4 xs:grid-cols-1 sm:grid-cols-2">
                            {galery.map((g, l) => (
                              <div key={l} className="h-auto rounded-2xl">
                                {g.video && (
                                  <video
                                    className="object-cover w-full h-96 rounded-2xl"
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    preload="metadata"
                                  >
                                    <source
                                      src={`https://res.cloudinary.com/dzlavqhid/video/upload/${g.video}.mp4`}
                                      type="video/mp4"
                                    />
                                  </video>
                                )}

                                {g.ref && (
                                  <div className="flex items-center justify-center gap-2 pt-1">
                                    <Paperclip className="w-4 h-4" />
                                    <Link
                                      href={`https://www.instagram.com/${g.ref}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm underline hover:opacity-80"
                                    >
                                      {g.label}
                                    </Link>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </ScrollRevealEffect>
                    )}

                    {Animations?.map((a, i) => (
                      <ScrollRevealEffect key={i} index={i}>
                        <div className="flex items-center justify-center w-full">
                          <div className="w-[85vw] sm:w-[70vw] md:w-[28rem] lg:w-[32rem] xl:w-[36rem] ">
                            <div className="relative w-full aspect-[16/9]">
                              <DotLottieReact
                                src={`/animation/${a.src}.json`}
                                loop
                                autoplay
                                className="absolute inset-0 w-full h-full"
                              />
                            </div>
                          </div>
                        </div>
                      </ScrollRevealEffect>

                    ))}

                    {Array.isArray(P) &&
                      P.map((p, x) => (
                        <ScrollRevealEffect key={x}>
                          <div className='grid justify-center mt-3'>
                            <span>
                              {p.text &&
                                highlightText(
                                  p.text,
                                  keyword,
                                  keywordLink
                                )}
                            </span>
                            {Array.isArray(p.buttons) && (
                              <div className="flex flex-wrap justify-center gap-10 mt-2">
                                {p.buttons.map((btn, i) => (
                                  <Button
                                    key={i}
                                    style="cursor-pointer text-center border-2 border-honeydew-800 dark:border-honeydew-800 transition duration-500 bg-white text-black hover:bg-honeydew-700 hover:text-white dark:bg-honeydew-800 dark:hover:bg-white dark:hover:text-black dark:text-white"
                                    href={btn.href}
                                    target={btn.target ?? '_self'}
                                    text={btn.label}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </ScrollRevealEffect>
                      ))}
                  </div>
                </React.Fragment>
              </div>
            </ScrollRevealEffect>
          ))}

          {galeria?.map((g, i) => (
            <ScrollRevealEffect key={i} index={i}>
              <div className='p-5 mt-10 bg-gray-200 rounded-2xl sm:p-10'>
                <div>
                  galeria
                </div>
              </div>
            </ScrollRevealEffect>
          ))}

          {CalltoAction?.map((c, i) => (
            <ScrollRevealEffect key={i} index={i}>
              <div className='p-5 mt-10 bg-gray-200 rounded-2xl sm:p-10'>

                <ScrollBottonEffect>
                  <span className='text-sm font-bold text-justify uppercase sm:text-xl'>{c.callToAction}</span>
                </ScrollBottonEffect>

                <div className='grid sm:text-xl'>
                  {Array.isArray(c.text) && c.text.map((text, idx) => (
                    <ScrollRevealEffect key={idx} index={idx}>
                      <span className='mt-2'>
                        {text &&
                          highlightText(
                            text,
                            keyword,
                            keywordLink
                          )}
                      </span>
                    </ScrollRevealEffect>
                  ))}
                </div>

                {Array.isArray(c.buttons) && (
                  <div className="flex flex-wrap justify-center gap-10 mt-2">
                    {c.buttons.map((btn, i) => (
                      <ScrollRevealEffect key={i} index={i}>
                        <Button
                          key={i}
                          style="cursor-pointer text-center border-2 border-honeydew-800 dark:border-honeydew-800 transition duration-500 bg-white text-black hover:bg-honeydew-700 hover:text-white dark:bg-honeydew-800 dark:hover:bg-white dark:hover:text-black dark:text-white"
                          href={btn.href}
                          target={btn.target ?? '_self'}
                          text={btn.label}
                        />
                      </ScrollRevealEffect>
                    ))}
                  </div>
                )}

              </div>
            </ScrollRevealEffect>
          ))}

          {Example?.map((e, i) => (
            <ScrollRevealEffect key={i} index={i}>
              <div className='p-5 mt-10 bg-gray-200 rounded-2xl sm:p-10'>
                <div className="font-mono">
                  {/*Label*/}
                  <span className="text-sm font-bold uppercase sm:text-xl text-honeydew-800">
                    <ScrollBottonEffect>
                      <span className="pr-1">-</span>
                      {e.label || 'Example'}
                    </ScrollBottonEffect>
                  </span>

                  {/*Subtitle*/}
                  <div className="pt-2">
                    <span className="text-xl font-bold text-justify uppercase lg:text-3xl sm:text-2xl">
                      <ScrollBottonEffect>
                        {e.subTitle || 'Ejemplo'}
                      </ScrollBottonEffect>
                    </span>
                  </div>

                  <ScrollBottonEffect>
                    <div className='flex justify-center pt-3'>
                      <img className="w-auto h-auto rounded-2xl " src={`https://res.cloudinary.com/dzlavqhid/image/upload/${banner.imagen}.webp`}
                        alt={banner.imagen} />
                    </div>
                  </ScrollBottonEffect>
                </div>
              </div>
            </ScrollRevealEffect>
          ))}

        </section>

      </main >
    </>
  )
}