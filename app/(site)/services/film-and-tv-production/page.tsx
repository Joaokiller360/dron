
import { BannerCard } from '@/app/utils'
import { Film, MapPin, Factory, Building2, Earth } from 'lucide-react';

const listServices = [
  {
    icon: <Film size={38} className="mb-2" />,
    label: 'drones para cine y publicidad',
    hreft: 'events-and-live-broadcasting'
  },{
    icon: <Factory size={38} className="mb-2" />,
    label: 'drones industriales',
    hreft: 'insdustrial-inspection-and-photogrammetry'
  },{
    icon: <Building2 size={38} className="mb-2" />,
    label: 'drones para vuelo en ciudad',
    hreft: 'urban-flight-operations'
  },{
    icon: <Earth size={38} className="mb-2" />,
    label: 'drones para eventos y retransmisiones',
    hreft: 'film-and-tv-production'
  },{
    icon: <MapPin size={38} className="mb-2" />,
    label: 'drones de localizacion',
    hreft: 'location-scouting-and-recon'
  }
]

export default function urbanFlightOperations() {
  return (
    <>

      <BannerCard
        imagen='evento-retransmisiones'
        label='Servicios'
        title='industrial, inspección y fotogrametría'
        content={listServices}
      />

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
