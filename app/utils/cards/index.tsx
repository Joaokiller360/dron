
import { Button } from '@/app/utils'
import { Video } from 'lucide-react'

interface SectionCard {
  children: React.ReactNode
}

export function SectionCard({ children }: SectionCard) {
  return (
    <>
      <section className="p-5 bg-honeydew-900 dark:bg-honeydew-800 rounded-2xl sm:p-10">
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
}

export function CardVideo({ title = '', organizacion = '', nameButton = '', href = '', videoname = '', imgName = '', present = '' }: CardVideo) {
  return (
    <>
      <section className="flex flex-col h-full p-6 rounded-xl bg-honeydew-800 dark:bg-honeydew-900">

        {/* Imagen o Video */}
        <div className="relative overflow-hidden rounded-lg">
          {videoname ? (
            <video
              className="object-cover w-full h-56 rounded-lg"
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
              href={href}
              text={`Ver ${nameButton}`}
              style="cursor-pointer transition duration-500 bg-honeydew-900 hover:bg-white text-white hover:text-black dark:hover:text-white dark:bg-white dark:hover:bg-honeydew-800 dark:text-black"
              icon={<Video size={24} strokeWidth={2} />}
            />
          </div>
        </div>

      </section>

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
  imgName?: string
  organizacion?: string
  buttons?: Buttons[];
}

interface Buttons {
  id: number
  href: string
  active: boolean
  name?: string
  icon?: React.ReactNode
}

export function CardClient({ client = '', imgName = '', organizacion = '', buttons = [], }: CardClient) {

  const activeButtons = buttons.filter(
    ({ active, href }) => active && href
  )


  return (
    <>
      <div className="relative w-full py-6 sm:py-8 bg-honeydew-900 rounded-2xl">
        <div className="flex flex-col items-center">
          <img
            className="w-24 h-24 mb-6 bg-white rounded-full"
            src={`https://res.cloudinary.com/dzlavqhid/image/upload/${imgName}.jpg`}
            alt={imgName}
          />

          <span className="mb-0.5 text-xl text-center font-semibold tracking-tight text-heading">
            {client}
          </span>
          <span className="text-sm text-body">{organizacion}</span>

          <div className={`grid gap-2 px-6 mt-4 md:mt-6 ${activeButtons.length === 1 ? 'flex items-center justify-center' : 'grid-cols-1 xl:grid-cols-2'} `} >
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
  )
}
