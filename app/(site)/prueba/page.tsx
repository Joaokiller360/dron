import { Banner, CardClient, SectionCard } from "@/app/utils";
import { PhoneCall, Instagram } from 'lucide-react'

export default function Prueba() {
  return (
    <>
      <section className="pb-10 bg-honeydew-800 dark:bg-honeydew-900 pt-28" >
        <Banner
          title='explora nuestros servicios'
        />

        <section className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <section className="space-y-6" >
            {/* capsula uno */}
            <SectionCard style="bg-honeydew-800 dark:bg-honeydew-900">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/*
                <CardClient
                  clients={[
                    {
                      client: 'Hola soy cliente',
                      organizacion: 'Soy cliente'
                    }
                  ]}
                  content={[
                    {
                      imgName: 'marina'
                    }
                  ]}
                  buttons={[
                    {
                      id: 1,
                      href: 'https://www.instagram.com/marinaecovida',
                      active: true,
                      name: 'Instagram',
                      icon: <Instagram size={24} strokeWidth={2} />
                    }, {
                      id: 2,
                      href: 'https://api.whatsapp.com/message/SI7RZTHBYV3AK1?autoload=1&app_absent=0&utm_source=ig',
                      active: true,
                      name: 'Contacto',
                      icon: <PhoneCall size={24} strokeWidth={2} />
                    }
                  ]}
                />

                <CardClient
                  services={[
                    {
                      title: 'Hola soy servicio',
                      description: 'So aaaay'
                    }
                  ]}
                  content={[
                    {
                      imgName: 'marina'
                    }
                  ]}
                  buttons={[
                    {
                      id: 1,
                      href: 'https://www.instagram.com/marinaecovida',
                      active: true,
                      name: 'Instagram',
                      icon: <Instagram size={24} strokeWidth={2} />
                    }
                  ]}
                />
                */}
              </div>

            </SectionCard>
          </section>
        </section>
      </section>

    </>
  )
}
