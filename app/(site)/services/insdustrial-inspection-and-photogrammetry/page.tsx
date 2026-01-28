
import { PageServices, createMetadata } from '@/app/utils'

export const metadata = createMetadata({
  title: 'Industrial, inspección y fotogrametria | JB.SKYLENS',
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

export default function urbanFlightOperations() {
  return (
    <>

      <PageServices
        D={[
          {
            imagen: 'industria-inspeccion',
            label: 'Servicios',
            title: 'industrial, inspección y fotogrametría',
          }
        ]}
        Content={[]} index={0}      />

    </>
  )
}
