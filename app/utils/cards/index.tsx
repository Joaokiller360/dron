'use client'
import { Button, ScrollBottonEffect } from '@/app/utils'
import { HousePlus, Video } from 'lucide-react'

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
                  src={
                    imgName
                      ? `https://res.cloudinary.com/dzlavqhid/image/upload/${imgName}.jpg`
                      : '/img/palmas-atardecer.jpg'
                  }
                  onError={(e) => {
                    e.currentTarget.src = "/img/palmas-atardecer.jpg";
                  }}
                  alt={imgName || "imagen"}
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
                      src={
                        media?.imgName
                          ? `https://res.cloudinary.com/dzlavqhid/image/upload/${media.imgName}.jpg`
                          : '/img/palmas-atardecer.jpg'
                      }
                      onError={(e) => {
                        e.currentTarget.src = "/img/palmas-atardecer.jpg";
                      }}
                      alt={d?.cliente?.client || "imagen"}
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
                        src={
                          media?.imgName
                            ? `https://res.cloudinary.com/dzlavqhid/image/upload/${media?.imgName}.jpg`
                            : '/img/palmas-atardecer.jpg'
                        }
                        onError={(e) => {
                          e.currentTarget.src = "/img/palmas-atardecer.jpg";
                        }}
                        alt={d?.cliente?.client || "imagen"}
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
                <span className="p-4 text-xl leading-relaxed text-justify">{d.Services.description}</span>

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
    </>
  )
}

import { Banner, highlightText, ScrollRevealEffect, keywordLink } from '@/app/utils'
import { Film, MapPin, Factory, Building2, Earth, CheckCircle, Paperclip, MapPinHouse } from 'lucide-react';
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
  label?: string
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
  Content?: content[]
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
  urlImg?: string
  label?: string
  href?: string
  style?: string
}

interface CalltoAction {
  callToAction?: string
  SubTitle?: string
  text?: string[]
  text2?: string[]
  buttons?: ButtonItem[]
  list?: List[]
  Animations?: animation[]
}

interface animation {
  src?: string
}

interface example {
  label?: string
  subTitle?: string
  text?: string[]
  buttons?: ButtonItem[]
  Galeria?: galeria[]
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
  },
  {
    icon: <MapPinHouse size={38} className="mb-2" />,
    label: 'drones para inmobiliaria',
    hreft: 'real-estate'
  },
  {
    icon: <HousePlus size={38} className="mb-2" />,
    label: 'tours virtuales 360',
    hreft: 'tours-360'
  }
]

export function Img({ urlImg = '', href = '', style = '' }: galeria) {
  return (
    <>
      <a href={href} className={`${style} relative flex flex-col px-4 pt-40 pb-4 overflow-hidden font-black rounded-lg group grow cursor-pointer`}>
        <img src={urlImg} alt={href} className="absolute inset-0 object-cover w-full h-full transition-transform duration-500 ease-in-out group-hover:scale-105" />
        <div className="absolute inset-0 bg-linear-to-b from-gray-900/25 to-gray-900/5" />
      </a>
    </>
  )
}


// Componente principal que renderiza la página de servicios
export function PageServices({
  D, // Array de datos para el banner principal
  Content, // Array de secciones de contenido principal
  keyword = [], // Palabras clave para resaltar en el texto
  keywordLink = {}, // Enlaces asociados a palabras clave
  index = 0, // Índice de la página (no siempre usado)
  P, // Secciones adicionales de párrafos y botones
  galery, // Galería de videos o imágenes para la sección principal
  galeria, // Galería secundaria (puede ser para ejemplos o extras)
  CalltoAction, // Secciones de llamada a la acción
  Animations, // Animaciones Lottie para mostrar
  Example // Ejemplos de uso o casos destacados
}: page) {

  // Banner principal de la página
  const banner = D[0]
  // const section = Content[0]

  return (
    <>
      {/* Encabezado con imagen de fondo y banner */}
      <header className="relative pb-16 pt-44 bg-honeydew-900/40" >

        {/* Imagen de fondo del banner */}
        <img
          loading="lazy"
          src={
            banner?.imagen
              ? `https://res.cloudinary.com/dzlavqhid/image/upload/${banner.imagen}.jpg`
              : '/img/palmas-atardecer.jpg'
          }
          onError={(e) => {
            e.currentTarget.src = "/img/palmas-atardecer.jpg";
          }}
          alt={banner?.title || "imagen"}
          className="absolute inset-0 object-cover object-center w-full h-full -z-10"
        />

        {/* Componente Banner con título y etiqueta */}
        <Banner
          label={banner.label}
          title={banner.title}
        />
        <div className="flex justify-center">
          {/* Tarjetas de servicios principales */}
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

      {/* Contenido principal de la página */}
      <main className='py-5 text-black sm:p-10 bg-honeydew-900 dark:bg-honeydew-800'>

        <section className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">

          {/* Renderiza cada sección de contenido principal */}
          {Content?.map((section, index) => (
            <ScrollRevealEffect key={index}>
              <div key={index} className="p-5 bg-gray-200 rounded-2xl sm:p-10">
                <React.Fragment>
                  <div className="font-mono">
                    {/* Etiqueta de la sección */}
                    <span className="text-sm font-bold uppercase sm:text-xl text-honeydew-800">
                      <ScrollBottonEffect>
                        <span className="pr-1">-</span>
                        {section.label || 'Services'}
                      </ScrollBottonEffect>
                    </span>

                    {/* Subtítulo de la sección */}
                    <div className="pt-2">
                      <span className="text-xl font-bold text-justify uppercase lg:text-3xl sm:text-2xl">
                        <ScrollBottonEffect>
                          {section.subTitle}
                        </ScrollBottonEffect>
                      </span>
                    </div>
                  </div>

                  <div className='text-justify sm:text-xl'>
                    {/* Texto principal de la sección */}
                    {section.text && (
                      <div className='pb-2'>
                        {section.text.map((paragraph, i) => (
                          <ScrollRevealEffect key={i} index={i}>
                            <span className="block pt-2">
                              {highlightText(paragraph, keyword, keywordLink)}
                            </span>
                          </ScrollRevealEffect>
                        ))}
                      </div>
                    )}

                    {/* Lista de elementos destacados de la sección */}
                    {Array.isArray(section.list) && section.list?.map((item, j) => (
                      <ScrollRevealEffect key={j} index={j}>
                        <span className="pb-2 font-bold">{item.label}</span>
                        {Array.isArray(item.text) && (
                          <ul className="pb-2 space-y-3">
                            {item.text.map((text, k) => (
                              <li key={k} className="flex items-start gap-3">
                                <span className="flex items-center justify-center w-5 h-5 mt-1">
                                  <CheckCircle className="w-4 h-4 text-honeydew-800" />
                                </span>
                                <span>
                                  {text && highlightText(text, keyword)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </ScrollRevealEffect>
                    ))}

                    {/* Galería de videos o imágenes si existe */}
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

                                {/* Enlace a Instagram si existe referencia */}
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

                    {/* Animaciones Lottie si existen */}
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

                    {/* Secciones adicionales de párrafos y botones */}
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

          {/* Galería secundaria si existe */}
          {galeria?.map((g, i) => (
            <ScrollRevealEffect key={i} index={i}>
              <div className='p-5 mt-10 bg-gray-200 rounded-2xl sm:p-10'>
                <div>
                  galeria
                </div>
              </div>
            </ScrollRevealEffect>
          ))}

          {/* Secciones de llamada a la acción */}
          {CalltoAction?.map((c, i) => (
            <ScrollRevealEffect key={i} index={i}>
              <div className='p-5 mt-10 bg-gray-200 rounded-2xl sm:p-10'>

                {/* Título de la llamada a la acción */}
                <ScrollBottonEffect>
                  <span className='pb-2 text-sm font-bold text-justify uppercase sm:text-xl'>{c?.callToAction}</span>
                </ScrollBottonEffect>

                {/* Título de la llamada a la acción */}
                <ScrollBottonEffect>
                  <span className='flex justify-center pb-2 text-sm font-bold text-center uppercase sm:text-xl'>{c?.SubTitle}</span>
                </ScrollBottonEffect>

                {/* Texto de la llamada a la acción */}

                {Array.isArray(c?.text) && c.text.map((text, idx) => (
                  <div className='grid sm:text-xl' key={idx}>
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
                  </div>
                ))}

                {/* Lista de elementos destacados de la sección */}
                {Array.isArray(c.list) && c.list?.map((item, j) => (
                  <ScrollRevealEffect key={j} index={j}>
                    <span className="py-2 text-xl font-bold">{item?.label}</span>
                    {Array.isArray(item?.text) && (
                      <ul className="space-y-3">
                        {item?.text.map((text, k) => (
                          <li key={k} className="flex items-start gap-3">
                            <span className="flex items-center justify-center w-5 h-5 mt-1">
                              <CheckCircle className="w-4 h-4 text-honeydew-800" />
                            </span>
                            <span className='text-xl'>
                              {text && highlightText(text, keyword)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </ScrollRevealEffect>
                ))}

                {Array.isArray(c?.text2) && c.text2.map((text, idx) => (
                  <div className='grid pt-2 sm:text-xl' key={idx}>
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
                  </div>
                ))}

                {/* Animaciones Lottie si existen */}
                {c?.Animations?.map((a, i) => (
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

                {/* Botones de la llamada a la acción */}
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

          {/* Ejemplos de uso o casos destacados */}
          {Example?.map((e, i) => (
            <ScrollRevealEffect key={i} index={i}>
              <div className='p-5 mt-10 bg-gray-200 rounded-2xl sm:p-10'>
                <div className="font-mono">
                  {/* Etiqueta del ejemplo */}
                  <span className="text-sm font-bold uppercase sm:text-xl text-honeydew-800">
                    <ScrollBottonEffect>
                      <span className="pr-1">-</span>
                      {e.label || 'Example'}
                    </ScrollBottonEffect>
                  </span>

                  {/* Subtítulo del ejemplo */}
                  <div className="pt-2">
                    <span className="text-xl font-bold text-justify uppercase lg:text-3xl sm:text-2xl">
                      <ScrollBottonEffect>
                        {e.subTitle || 'Ejemplo'}
                      </ScrollBottonEffect>
                    </span>
                  </div>

                  {/* Texto del ejemplo */}
                  <div className="pt-2">
                    <span className='font-sans text-xl text-justify'>
                      {Array.isArray(e.text) && e.text.map((paragraph, idx) => (
                        <ScrollRevealEffect key={idx} index={idx}>
                          <span className="block pt-2">
                            {highlightText(paragraph, keyword, keywordLink)}
                          </span>
                        </ScrollRevealEffect>
                      ))}
                    </span>
                  </div>

                  {/* Imagen del ejemplo */}
                  {Array.isArray(e.Galeria) && (
                    <ScrollRevealEffect>
                      <div className="flex justify-center w-full pt-5">
                        <div className="w-[96vw] sm:w-[90vw] md:w-[52rem] lg:w-[64rem] xl:w-[75rem]">
                          <div
                            className={`grid gap-3 ${e.Galeria.length === 1
                              ? "grid-cols-1 justify-items-center"
                              : "grid-cols-1 sm:grid-cols-2"}`}
                          >
                            {e.Galeria.map((g, l) => (
                              <div key={l} className="w-full max-w-[900px]">
                                {g.video && (
                                  <video
                                    className="object-cover w-full rounded-2xl aspect-video"
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    preload="metadata"
                                  >
                                    <source
                                      src={`https://res.cloudinary.com/dzlavqhid/video/upload/${g?.video}.mp4`}
                                      type="video/mp4"
                                    />
                                  </video>
                                )}

                                {g.urlImg && (
                                  <img
                                    loading="lazy"
                                    src={
                                      g?.urlImg
                                        ? `https://res.cloudinary.com/dzlavqhid/image/upload/${g?.urlImg}.jpg`
                                        : '/img/palmas-atardecer.jpg'
                                    }
                                    onError={(e) => {
                                      e.currentTarget.src = "/img/palmas-atardecer.jpg";
                                    }}
                                    alt={g?.label || "imagen"}
                                    className="object-cover w-full h-auto mb-5 transition-transform duration-500 group-hover:scale-105 rounded-2xl"
                                  />
                                )}

                                {g.href && (
                                  <div className="flex items-center justify-center gap-2 pt-3">
                                    <Paperclip className="w-4 h-4" />
                                    <Link
                                      href={`https://www.instagram.com/reel/${g.href}`}
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
                      </div>


                    </ScrollRevealEffect>
                  )}

                  {/* Botones del ejemplo */}
                  {Array.isArray(e.buttons) && (
                    <div className="flex flex-wrap justify-center gap-10 mt-5">
                      {e.buttons.map((btn, i) => (
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
              </div>
            </ScrollRevealEffect>
          ))}

        </section>

      </main >
    </>
  )
}