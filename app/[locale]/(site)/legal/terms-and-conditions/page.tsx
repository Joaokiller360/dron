import { LegalPage, createMetadata } from "@/app/utils";

export const metadata = createMetadata({
  title: 'Términos y Condiciones | JB.SKYLENS',
  description:
    'Consulta los términos y condiciones de JB.SKYLENS, empresa especializada en servicios profesionales con drones en Ecuador.',
  keywords: [
    'JB.SKYLENS',
    'drones Ecuador',
    'términos y condiciones',
    'servicios con drones',
    'Joao Barres',
  ],
  canonical: 'https://dron.joaobarres.dev/legal/terms-and-conditions',
})

export default function TermsAndConditions() {
  return (
    <section className="pb-10 bg-honeydew-900 dark:bg-honeydew-800 pt-28" >

      <LegalPage
        title="Términos & Condiciones"
        label="Nuestros"
        lastUpdate="23 de Enero del 2026"
        keyword={[
          'JB.SKYLNES - DRON',
          'https://dron.joaobarres.dev',
          'contacto@joaobarres.dev',
          'nosotros',
          'nuestro',
          'nos',
          '9 De Octubre y Bolivar (Edificios Reinoso Of.1)'
        ]}

        content={[
          {
            heading: '1. INFORMACIÓN GENERAL',
            text: [
              `Este sitio web es operado por JB.SKYLNES - DRON. En todo el sitio, los términos "nosotros", "nos" y "nuestro" se refieren a JB.SKYLNES - DRON.`,
              'Sitio web: https://dron.joaobarres.dev',
              'Email de contacto: contacto@joaobarres.dev',
              'Dirección: 9 De Octubre y Bolivar (Edificios Reinoso Of.1)'
            ],
          },
          {
            heading: '2. PRODUCTOS Y SERVICIOS',
            text: [
              'Nos esforzamos por mostrar con la mayor precisión los colores y las imágenes de nuestros productos que aparecen en la web. No podemos garantizar que la visualización de cualquier color en su monitor sea exacta.'
            ],
          },
          {
            heading: '3. PRECIOS Y PAGOS',
            text: [
              'Todos los precios están sujetos a cambios sin previo aviso. Los precios mostrados incluyen IVA cuando corresponda.'
            ],
          },
          {
            heading: '4. ENTREGA DEL MATERIAL',
            text: [
              'El tiempo estimado de envío es de 3-15 días hábiles. Los tiempos de entrega son estimados y no podemos garantizar entregas en fechas específicas.'
            ],
          },
          {
            heading: '5. POLÍTICA DE DEVOLUCIONES',
            text: [
              'Aceptamos devoluciones dentro de los 7 días posteriores a la recepción del producto.'
            ],
            lists: [
              {
                header: '5.1 PROCEDIMIENTO DE DEVOLUCIÓN',
                description: '1. Devolución del dinero (solo aplica para casos de garantía y ley de retracto):',
                items: [
                  'A través de transferencia (cuenta de ahorros, cuenta corriente, ahorro a la mano): se realiza aproximadamente dentro de los cinco días hábiles siguientes de recibir el producto nuevamente en nuestra bodega.',
                  'A través de reversión del pago: quince días hábiles después de recibir el producto en nuestra bodega. Ésta reversión corre por cuenta y orden de tu entidad bancaria, cualquier duda debes comunicarte directamente con ellos.',
                  'Cambio del producto (Sujeto a disponibilidad de inventario en el momento del cambio). Sólo se podrán realizar cambios por productos con valor igual o inferior al original y la diferencia en caso de aplicar, se entregará en un cupón para una nueva compra en la tienda online. En caso de no contar con disponibilidad para el cambio, se entregará el valor del producto(s) en un cupón para una nueva compra.',
                  'Cupón para realizar una nueva compra (Este cupón tiene validez por seis meses a partir de la fecha de creación).'
                ],
              },
              {
                description: '2. Cambio del producto (Sujeto a disponibilidad de inventario en el momento del cambio). Sólo se podrán realizar cambios por productos con valor igual o inferior al original y la diferencia en caso de aplicar, se entregará en un cupón para una nueva compra en la tienda online. En caso de no contar con disponibilidad para el cambio, se entregará el valor del producto(s) en un cupón para una nueva compra.',
                items: []
              }, {
                description: '3. Cupón para realizar una nueva compra (Este cupón tiene validez por seis meses a partir de la fecha de creación).',
                items: []
              }, {
                header: '5.2 CONDICIONES DEL PRODUCTO PARA DEVOLUCIÓN',
                description: 'El producto deberá devolverse en óptimas condiciones, sin rastros de haber sido utilizado, con las etiquetas originales o en su defecto, si ya fueron retiradas, debes introducirlas en el empaque. Una vez recibido el producto en nuestra bodega, verificaremos las condiciones del mismo y de acuerdo con los resultados, se te enviará un producto nuevo o se te entregará un cupón para una nueva compra.',
                items: []
              }
            ]
          },
          {
            heading: '6. PRIVACIDAD Y PROTECCIÓN DE DATOS',
            text: [
              'Nos comprometemos a proteger su privacidad. La información personal que nos proporcione se utilizará únicamente para procesar su pedido y mejorar su experiencia de compra.'
            ],
          },
          {
            heading: '7. MODIFICACIONES DE LOS TÉRMINOS',
            text: [
              'Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación en el sitio web.'
            ],
          }
        ]}
      />

    </section>
  )
}
