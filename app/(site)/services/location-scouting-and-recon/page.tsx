
import { BannerCard, createMetadata } from '@/app/utils'
import { Film, MapPin, Factory, Building2, Earth } from 'lucide-react';

export const metadata = createMetadata({
  title: 'Localización y Reconocimiento | JB.SKYLENS',
  description:
    'Empresas y personas que han confiado en JB.SKYLENS para servicios profesionales con drones en Ecuador.',
  keywords: [
    'clientes JB.SKYLENS',
    'empresas que usan drones',
    'clientes de servicios con drones',
    'empresas atendidas con drones',

    'drones para empresas ecuador',
    'servicios de drones empresariales',
    'drones para industria',
    'drones para puertos',
    'drones para eventos empresariales',

    'clientes de filmación aérea',
    'clientes de fotografía aérea',
    'clientes de producción audiovisual',

    'empresas de esmeraldas con drones',
    'clientes corporativos con drones',

    'confianza en servicios con drones',
    'casos de éxito con drones',
    'proyectos empresariales con drones',

    'clientes JB SKYLENS drones',
    'empresas que confían en JB.SKYLENS',
    'servicios profesionales con drones',
    'empresa de drones confiable',
  ]
  ,
  canonical: 'https://dron.joaobarres.dev/clients',
})

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
        title='localización y reconocimiento'
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
