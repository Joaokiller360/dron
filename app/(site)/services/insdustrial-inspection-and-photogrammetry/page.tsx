
import { Banner, SectionCard, TitleProject } from '@/app/utils'
import { Film, MapPin, Factory, Building2, Earth } from 'lucide-react';

const listServices = [
  {
    icon: <Film size={38} className="mb-2" />,
    label: 'drones para cine y publicidad',
    href: '/'
  },
  {
    icon: <Factory size={38} className="mb-2" />,
    label: 'drones industriales',
    href: '/'
  },
  {
    icon: <Building2 size={38} className="mb-2" />,
    label: 'drones para vuelo en ciudad',
    href: '/'
  },
  {
    icon: <Earth size={38} className="mb-2" />,
    label: 'drones para Eventos y retransmisiones',
    href: '/'
  },
  {
    icon: <MapPin size={38} className="mb-2" />,
    label: 'drones de localizacion',
    href: '/'
  },
]

export default function urbanFlightOperations() {
  return (
    <>

      <header className="relative pb-10 bg-honeydew-900 dark:bg-honeydew-800/40 pt-28" >

        {/* Imagen de fondo */}
        <img
          src="https://res.cloudinary.com/dzlavqhid/image/upload/evento-retransmisiones.webp"
          alt=""
          className="absolute inset-0 object-cover object-center w-full h-full -z-10"
        />

        <Banner
          label='Servicios'
          title='Eventos y retransmisiones'
        />
        <div className="flex justify-center">
          <div className="grid gap-4 justify-items-center grid-cols-2 sm:grid-cols-4 lg:grid-cols-[repeat(auto-fit,minmax(7rem,1fr))] max-w-6xl">

            {listServices.map((item, index) => (
              <a key={index} href={item.href} className="flex flex-col items-center justify-center w-32 p-4 text-xs text-center text-white h-30 bg-honeydew-900/90 rounded-2xl">
                {item.icon}
                <span className="leading-tight uppercase">
                  {item.label}
                </span>
              </a>
            ))}

          </div>

        </div>

      </header>

      <main className='p-10 bg-honeydew-800/90'>

        <section className='bg-black md:px-14 :px-20'>
          <div>
            <span className='font-bold uppercase'>
              <span>-</span> Servicios
            </span>

            <div>
              <span className='uppercase'>
                las mejores ímagenes de tu evento
              </span>
            </div>
          </div>

        </section>

      </main>

    </>
  )
}
