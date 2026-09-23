/**
 * One-off: migrate the 7 hardcoded /services/<slug> pages into the DB so they
 * become editable from the dashboard. Idempotent (upsert by slug). Run once:
 *
 *   npx ts-node prisma/seed-service-pages.ts
 *
 * The two pages that used to pull copy from next-intl messages
 * (location-scouting-and-recon, events-and-live-broadcasting) are flattened to
 * Spanish literals here — matching the other 5, which were already ES-only.
 */
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const CLOUD = 'https://res.cloudinary.com/dzlavqhid/image/upload';
const REGULATION = 'DGAC-Ecuador-(RDAC 101)';
const DGAC_LINK = 'https://www.aviacioncivil.gob.ec/';
const SAFETY_TEXT = [
  'En JB.SkyLens trabajamos bajo estrictos estándares de seguridad y cumpliendo la normativa oficial de la DGAC-Ecuador-(RDAC 101). Nuestro equipo de pilotos profesionales garantiza operaciones aéreas legales, seguras y eficientes en cada proyecto.',
  'Gestionamos permisos, registros y requisitos obligatorios para que cada vuelo esté en regla, porque entendemos que en trabajos aéreos la seguridad, la responsabilidad y la legalidad no son opcionales, son parte del servicio.',
];
const SAFETY_TITLE = 'Nuestro compromiso con la seguridad y profesionalidad';
const BTN_CONTACT = { label: 'Contactanos', href: '/contact' };
const BTN_PORTFOLIO = { label: 'Ver Portfolio', href: '/portfolio' };

// Short bilingual card copy (from translate/*.json services.items) so the
// /services grid keeps its original titles/descriptions after the migration.
const BLURBS: Record<string, { titleEn: string; descEs: string; descEn: string }> = {
  'film-and-tv-production': {
    titleEn: 'Filming for cinema, series, and movies',
    descEs: 'Producción audiovisual aérea con calidad cinematográfica, ideal para escenas dinámicas, tomas creativas y narrativas de alto impacto visual',
    descEn: 'Aerial audiovisual production with cinematic quality, ideal for dynamic scenes, creative shots, and high-impact visual storytelling',
  },
  'location-scouting-and-recon': {
    titleEn: 'Location and reconnaissance',
    descEs: 'Análisis visual del terreno para planificación, evaluación de zonas y toma de decisiones antes de iniciar un proyecto o producción',
    descEn: 'Visual terrain analysis for planning, area evaluation, and decision-making before starting a project or production',
  },
  'insdustrial-inspection-and-photogrammetry': {
    titleEn: 'Industrial, inspection, and photogrammetry',
    descEs: 'Captura aérea técnica para inspección de infraestructuras, levantamientos fotogramétricos y monitoreo industrial con alta precisión',
    descEn: 'Technical aerial capture for infrastructure inspection, photogrammetric surveys, and industrial monitoring with high precision',
  },
  'urban-flight-operations': {
    titleEn: 'Urban flight',
    descEs: 'Operaciones con dron en entornos urbanos, cumpliendo normativas y garantizando seguridad para proyectos comerciales y audiovisuales',
    descEn: 'Drone operations in urban environments, complying with regulations and ensuring safety for commercial and audiovisual projects',
  },
  'events-and-live-broadcasting': {
    titleEn: 'Events and live broadcasts',
    descEs: 'Cobertura aérea en tiempo real o grabada para eventos, shows y actividades especiales, brindando una perspectiva única y envolvente',
    descEn: 'Aerial coverage in real time or recorded for events, shows, and special activities, providing a unique and immersive perspective',
  },
  'real-estate': {
    titleEn: 'Drones for real estate',
    descEs: 'Captura aérea de propiedades para el sector inmobiliario, mostrando ubicaciones, características y detalles de manera atractiva para potenciales compradores',
    descEn: 'Aerial capture of properties for the real estate sector, showcasing locations, features, and details attractively for potential buyers',
  },
  'tours-360': {
    titleEn: '360 Virtual Tours',
    descEs: 'Creación de recorridos virtuales interactivos en 360 grados, ideales para mostrar espacios comerciales, turísticos o inmobiliarios de manera innovadora y atractiva',
    descEn: 'Creation of interactive 360-degree virtual tours, ideal for showcasing commercial, touristic, or real estate spaces in an innovative and attractive way',
  },
};

type PageRow = {
  slug: string;
  titleEs: string;
  image: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  sortOrder: number;
  page: Prisma.InputJsonValue;
};

const PAGES: PageRow[] = [
  {
    slug: 'film-and-tv-production',
    titleEs: 'Grabación de cine, series y películas',
    image: 'grabacion-cine',
    metaTitle: 'Film and TV Production | JB.SKYLENS',
    metaDescription:
      'Servicios profesionales de filmación aérea con drones en Ecuador para cine, televisión, comerciales y producciones audiovisuales. Tomas cinematográficas de alta calidad para proyectos creativos y publicitarios.',
    keywords: [
      'filmación con drones', 'drones para cine', 'producción audiovisual con drones',
      'tomas aéreas cinematográficas', 'drones para televisión',
      'servicios de drones para productoras', 'filmación aérea profesional',
      'drones para comerciales', 'video aéreo cinematográfico',
      'producción de video con drones', 'drones para rodajes', 'tomas aéreas profesionales',
      'servicios de drones en ecuador', 'filmación aérea en esmeraldas',
      'operaciones audiovisuales con drones', 'JB.SKYLENS film',
      'empresa de drones para cine', 'drones para producciones',
      'servicios profesionales de drones',
    ],
    sortOrder: 0,
    page: {
      D: [{ imagen: 'grabacion-cine', label: 'Servicios', title: 'grabación de cine, series y peliculas' }],
      keyword: [REGULATION, 'Portfolio'],
      keywordLink: { Portfolio: '/portfolio', [REGULATION]: DGAC_LINK },
      Content: [
        {
          label: 'Servicios',
          subTitle: 'especialistas líderes en cinematografía aérea',
          text: [
            'Somos expertos en brindar un servicio profesional para publicidad y ficción; estamos especializados en de drones para cine y drones para comerciales, llevamos tus proyectos audiovisuales a nuevas alturas.',
            'El uso de drones para cine y publicidad presenta muchas ventajas competitivas:',
          ],
          list: [
            {
              text: [
                'Permiten capturar tomas aéreas impresionantes: desde tomas panorámicas hasta seguimientos rápidos, los drones aportan una dimensión visual única a tu proyecto.',
                'Adaptables a cualquier idea: no importa si estás filmando un anuncio publicitario o una escena clave de una película, nuestros drones se adaptan a tus necesidades. Son perfectos para todo, desde mostrar paisajes hasta capturar la acción más intensa.',
                'Ahorro de tiempo y dinero: los drones ofrecen una manera más económica y rápida de obtener las tomas perfectas, sin comprometer la calidad. Además, nuestro servicio está especializado en  conseguir las tomas perfectas en el menor tiempo posible, multiplicando el ahorro al disminuir los costes operativos en set: eficiencia y calidad premium, ¡es lo que ofrecemos!',
                'Calidad de imagen superior: nuestros drones están equipados con tecnología de cámara y estabilización de última generación, asegurando que cada toma sea nítida y de alta calidad.',
              ],
            },
          ],
        },
      ],
      galery: [
        { video: 'juan-fernando', label: 'juan-fernando', ref: 'juanfervelasco' },
        { video: 'corazones-descalzos', label: 'corazones-descalzos', ref: 'fundacionph3' },
      ],
      P: [
        {
          text: 'En nuestro Portfolio podrás ver las obras en las que hemos prestado nuestros servicios de especialistas; tanto en eventos y publicidad.',
          buttons: [
            { label: 'Ver Portfolio', href: '/portfolio' },
            { label: 'Ver servicios', href: '/services' },
          ],
        },
      ],
      CalltoAction: [
        { callToAction: SAFETY_TITLE, text: SAFETY_TEXT, buttons: [BTN_CONTACT, BTN_PORTFOLIO] },
      ],
    },
  },

  {
    slug: 'location-scouting-and-recon',
    titleEs: 'Localización y reconocimiento',
    image: 'localizacion-reconocimiento',
    metaTitle: 'Localización y Reconocimiento | JB.SKYLENS',
    metaDescription:
      'Servicios profesionales de localización y reconocimiento con drones en Ecuador. Inspección aérea, monitoreo de zonas, búsqueda de áreas específicas y análisis visual para seguridad, industria y proyectos técnicos.',
    keywords: [
      'drones para localización', 'reconocimiento aéreo con drones', 'inspección aérea con drones',
      'monitoreo de zonas con drones', 'drones para seguridad ecuador',
      'servicios de drones para vigilancia', 'drones para búsqueda de áreas',
      'reconocimiento territorial con drones', 'drones para industria', 'drones para puertos',
      'inspección de infraestructura con drones', 'monitoreo industrial aéreo',
      'servicios de drones en esmeraldas', 'operaciones profesionales con drones',
      'análisis visual con drones', 'JB.SKYLENS reconocimiento', 'empresa de drones profesional',
      'servicios técnicos con drones', 'drones para proyectos empresariales',
    ],
    sortOrder: 1,
    page: {
      D: [{ imagen: 'localizacion-reconocimiento', label: 'Servicios', title: 'Localización y reconocimiento' }],
      keyword: [REGULATION],
      keywordLink: { [REGULATION]: DGAC_LINK },
      Content: [
        {
          label: 'Servicios',
          subTitle: 'ENCUENTRA LA MEJOR UBICACIÓN PARA TU PROYECTO',
          text: [
            'Permiten explorar y seleccionar locaciones de manera rápida y accesible, incluso en áreas remotas o de difícil acceso.',
            'Proporcionan vistas panorámicas únicas, facilitando la visualización y planificación de escenas desde perspectivas antes inalcanzables.',
          ],
        },
      ],
      Animations: [{ src: 'cityFlight' }],
      CalltoAction: [
        { callToAction: SAFETY_TITLE, text: SAFETY_TEXT, buttons: [BTN_CONTACT, BTN_PORTFOLIO] },
      ],
    },
  },

  {
    slug: 'insdustrial-inspection-and-photogrammetry',
    titleEs: 'Industrial, inspección y fotogrametría',
    image: 'industria-inspeccion',
    metaTitle: 'Industrial, inspección y fotogrametría | JB.SKYLENS',
    metaDescription:
      'Servicios profesionales de inspección industrial y fotogrametría con drones en Ecuador. Levantamientos topográficos, análisis técnico, monitoreo de infraestructura y soluciones aéreas para proyectos industriales y portuarios.',
    keywords: [
      'fotogrametría con drones', 'inspección industrial con drones',
      'levantamientos topográficos con drones', 'análisis técnico aéreo',
      'drones para industria ecuador', 'inspección de infraestructura con drones',
      'drones para puertos', 'monitoreo industrial aéreo', 'modelos 3D con drones',
      'mapeo aéreo profesional', 'topografía con drones', 'ortomosaicos con drones',
      'servicios de drones en esmeraldas', 'operaciones técnicas con drones',
      'drones para ingeniería', 'JB.SKYLENS industrial', 'empresa de drones profesional',
      'servicios técnicos con drones', 'drones para proyectos industriales',
    ],
    sortOrder: 2,
    page: {
      D: [{ imagen: 'industria-inspeccion', label: 'Servicios', title: 'industrial, inspección y fotogrametría' }],
      keyword: [REGULATION],
      keywordLink: { [REGULATION]: DGAC_LINK },
      Content: [
        {
          label: 'Servicios',
          subTitle: 'trabajos rpas con drones industriales',
          text: [
            'Los drones, también conocidos como vehículos aéreos no tripulados (UAVs), han revolucionado diversas aplicaciones industriales gracias a su flexibilidad, capacidad de acceso y eficiencia en costos.',
            'JB.SKYLENS ofrece servicios con drones industriales para trabajos RPAS, más allá de los propios para la industria audiovisual. En nuestra cartera de servicios ofrecemos nuestra flota de drones para agricultura, inspección-monitoreo-mantenmineto de infraestructuras, mapeo-topografía-fotogrametría de alta precisión, seguimiento de obras & Real Estate, operaciones logísticas, así como vigilancia y seguridad.',
          ],
        },
      ],
      P: [{ buttons: [{ label: 'Enviar Solicitud', href: '/contact' }] }],
      Animations: [{ src: 'businessAdvisory' }],
      CalltoAction: [
        { callToAction: SAFETY_TITLE, text: SAFETY_TEXT, buttons: [BTN_CONTACT, BTN_PORTFOLIO] },
      ],
    },
  },

  {
    slug: 'urban-flight-operations',
    titleEs: 'Vuelos en ciudad',
    image: 'vuelo-ciudad',
    metaTitle: 'Vuelos en ciudad | JB.SKYLENS',
    metaDescription:
      'Servicios profesionales de vuelos con drones en zonas urbanas en Ecuador. Operaciones aéreas seguras y autorizadas para filmación, inspección, monitoreo y producción audiovisual en entornos urbanos complejos.',
    keywords: [
      'drones en ciudad', 'vuelos urbanos con drones', 'operaciones con drones en zonas urbanas',
      'filmación aérea en ciudad', 'drones para zonas urbanas ecuador',
      'servicios de drones urbanos', 'drones para inspecciones en ciudad',
      'monitoreo urbano con drones', 'drones para edificios', 'filmación aérea urbana',
      'producción audiovisual urbana', 'tomas aéreas en ciudad',
      'servicios de drones en esmeraldas', 'operaciones profesionales con drones',
      'vuelos autorizados con drones', 'JB.SKYLENS vuelos urbanos',
      'empresa de drones profesional', 'servicios técnicos con drones',
      'drones para proyectos urbanos',
    ],
    sortOrder: 3,
    page: {
      D: [{ imagen: 'vuelo-ciudad', label: 'Servicios', title: 'vuelos en ciudad' }],
      keyword: [
        'Permiten capturar tomas aéreas impresionantes:',
        'Adaptables a cualquier idea:',
        'perspectivas únicas en rodajes audiovisuales',
        'Grandes clientes',
        'facilitamos retransmisiones en directo',
        REGULATION,
        'Operar drones en ciudad',
        'JB.SKYLENS',
        'las operaciones con drones requieren autorizaciones específicas y coordinación con las autoridades correspondientes',
        'las multas por no realizar correctamente la operativa ascienden hasta $15.000 dolares americanos',
      ],
      keywordLink: { [REGULATION]: DGAC_LINK },
      Example: [
        {
          label: 'servicios con drones en ciudad',
          subTitle: 'volar en ciudad legalmente y sin complicaciones',
          text: [
            'Volamos nuestros drones en ciudad para capturar perspectivas únicas en rodajes audiovisuales de cine, televisión y publicidad, donde cada toma aérea eleva la narrativa visual con precisión y dinamismo.',
            'Grandes clientes confían en nuestra expertise para integrar estos vuelos en sus producciones, garantizando innovación y calidad sin igual.',
            'Asimismo, facilitamos retransmisiones en directo que transmiten la emoción de todo tipo de eventos, ya sean deportivos o culturales en tiempo real, sin olvidar otros trabajos con drones como pueden ser las inspecciones técnicas en infraestructuras o mapeos topográficos para proyectos de urbanismo.',
          ],
          Galeria: [
            {
              label: 'vuelo en ciudad',
              video: 'provincializacion-esmeralda',
              href: 'DRgImsmibaa/?utm_source=ig_web_button_share_sheet&igsh=MzRlODBiNWFlZA==',
            },
          ],
        },
        {
          label: 'volar en ciudad legalmente y sin complicaciones',
          subTitle: 'nuestro compromiso con la seguridad y la legalidad',
          text: [
            'Volar en ciudad es una operativa compleja y nos tomamos muy en serio la seguridad y el cumplimiento de las normativas. Nuestro equipo está formado por pilotos y técnicos expertos, garantizando vuelos seguros y eficientes en cada proyecto.',
            'Por ese mismo motivo todas nuestras operaciones siempre cumplen a rajatabla las directrices de la DGAC-Ecuador-(RDAC 101), asegurando que cada vuelo se realice de manera legal y responsable, protegiendo tanto a las personas como a las propiedades en el entorno urbano.',
            'Nos aseguramos siempre de tramitar todos los permisos que son necesarios junto a nuestros partners especializados, garantizando siempre que los vuelos son legales y están en orden. Debemos tener en cuenta que las multas por no realizar correctamente la operativa ascienden hasta $15.000 dolares americanos, ¡no vale la pena arriesgarse con opciones piratas!',
          ],
          buttons: [{ label: 'Solicita tu vuelo en ciudad', href: '/contact' }],
        },
      ],
      Content: [
        {
          label: 'Servicios',
          subTitle: 'especialistas líderes en cinematografía aérea',
          text: [
            'JB.SKYLENS es una empresa especializada en servicios profesionales con drones, enfocada en operaciones en entornos urbanos, inspecciones técnicas y vuelos en escenarios complejos, incluyendo operaciones nocturnas y misiones de alta precisión, siempre cumpliendo estrictamente la normativa aeronáutica vigente.',
            'Operar drones en ciudad implica un entorno de alta complejidad que exige planificación técnica, protocolos de seguridad avanzados y una ejecución precisa para garantizar operaciones seguras y eficientes.',
            'En Ecuador, las operaciones con drones requieren autorizaciones específicas y coordinación con las autoridades correspondientes, especialmente cuando se realizan vuelos en zonas urbanas, áreas pobladas o espacios aéreos controlados, donde la densidad de personas y estructuras exige estándares operacionales más rigurosos.',
            'Gracias a nuestra experiencia en distintos escenarios operativos, en JB.SKYLENS ofrecemos soluciones adaptadas a cada contexto, garantizando vuelos seguros, legales y técnicamente optimizados para cada proyecto.',
          ],
        },
      ],
      Animations: [{ src: 'cityFlight' }],
    },
  },

  {
    slug: 'events-and-live-broadcasting',
    titleEs: 'Eventos y retransmisiones',
    image: 'evento-retransmisiones',
    metaTitle: 'Eventos y Retransmisiones | JB.SKYLENS',
    metaDescription:
      'Servicios profesionales de cobertura de eventos y retransmisiones con drones en Ecuador. Filmación aérea en vivo, grabación de eventos, shows, conciertos, celebraciones y transmisiones profesionales desde el aire.',
    keywords: [
      'drones para eventos', 'filmación aérea de eventos', 'cobertura de eventos con drones',
      'retransmisión aérea en vivo', 'drones para conciertos', 'drones para festivales',
      'drones para bodas y celebraciones', 'video aéreo para eventos',
      'servicios de drones para eventos ecuador', 'filmación de eventos en esmeraldas',
      'producción audiovisual para eventos', 'tomas aéreas de eventos', 'streaming con drones',
      'transmisión en vivo con drones', 'cobertura profesional de eventos',
      'empresa de drones para eventos', 'servicios profesionales con drones',
      'filmación profesional aérea',
    ],
    sortOrder: 4,
    page: {
      D: [{ imagen: 'evento-retransmisiones', label: 'Servicios', title: 'Eventos y retransmisiones' }],
      keyword: [REGULATION],
      keywordLink: { [REGULATION]: DGAC_LINK },
      Content: [
        {
          label: 'Servicios',
          subTitle: 'Las mejores imágenes de tu evento',
          text: [
            'Los drones para uso en ciudad son útiles para diversas tareas, como la captura de imágenes aéreas para producciones audiovisuales, inspecciones de infraestructuras o servicios de emergencia.',
            'Sin embargo, es necesario obtener un permiso especial de la DGAC-Ecuador-(RDAC 101) para operar en lo que se conoce como CTR (Control de Tráfico Aéreo) debido a que en estas áreas hay una mayor densidad de tráfico aéreo y se deben seguir protocolos de seguridad específicos.',
            'Es importante contar con operadores profesionales autorizados y con experiencia para garantizar la seguridad de los vuelos y el cumplimiento de la normativa aérea en estas áreas.',
          ],
        },
      ],
      CalltoAction: [
        {
          callToAction: SAFETY_TITLE,
          text: SAFETY_TEXT,
          buttons: [{ label: 'Solicitar más información', href: '/contact' }],
        },
      ],
      Example: [
        {
          label: 'Nuestros trabajos',
          subTitle: 'Ejemplo de aplicación',
          Galeria: [{ label: 'Retransmisión en directo', video: 'provincializacion-esmeralda' }],
        },
      ],
    },
  },

  {
    slug: 'real-estate',
    titleEs: 'Drones para inmobiliaria',
    image: 'drones-inmobiliaria',
    metaTitle: 'Real State | JB.SKYLENS',
    metaDescription:
      'Servicios profesionales de drones para bienes raíces en Ecuador. Fotografías, videos aéreos y tomas cinematográficas para inmobiliarias, constructoras y proyectos inmobiliarios.',
    keywords: [
      'drones para bienes raíces', 'real estate con drones', 'fotografía aérea inmobiliaria',
      'video aéreo para propiedades', 'drones para inmobiliarias ecuador',
      'servicios de drones para constructoras', 'drones para proyectos inmobiliarios',
      'filmación aérea de propiedades', 'marketing inmobiliario con drones',
      'contenido audiovisual inmobiliario', 'tomas aéreas de casas y edificios',
      'servicios de drones en esmeraldas', 'producción audiovisual inmobiliaria',
      'fotografía profesional de propiedades', 'JB.SKYLENS real estate',
      'drones profesionales para ventas de casas', 'promoción inmobiliaria con drones',
      'empresa de drones para inmobiliarias',
    ],
    sortOrder: 5,
    page: {
      D: [{ imagen: 'drones-inmobiliaria', label: 'Servicios', title: 'drones para inmobiliaria' }],
      keyword: [REGULATION, 'sector inmobiliario', 'única', 'recorridos virtuales y videos'],
      keywordLink: { [REGULATION]: DGAC_LINK },
      Content: [
        {
          label: 'Servicios',
          subTitle: 'imagenes aéreas para inmobiliaria',
          text: [
            'Los drones son herramientas valiosas en el sector inmobiliario, ya que permiten capturar imágenes aéreas impresionantes de propiedades y sus alrededores. Estas imágenes proporcionan una perspectiva única que puede atraer a potenciales compradores al mostrar la ubicación, el tamaño y las características de la propiedad de manera más efectiva que las fotografías tradicionales desde el suelo.',
            'Además, los drones pueden ser utilizados para crear recorridos virtuales y videos promocionales que destacan las mejores cualidades de una propiedad, facilitando la comercialización y venta de inmuebles.',
            'Es importante contar con operadores profesionales autorizados y con experiencia para garantizar la seguridad de los vuelos y el cumplimiento de la normativa aérea en estas áreas.',
          ],
        },
      ],
      CalltoAction: [
        {
          callToAction: SAFETY_TITLE,
          text: SAFETY_TEXT,
          buttons: [{ label: 'Solicitar más información', href: '/contact' }],
        },
      ],
      Example: [
        {
          label: 'nuestros trabajos',
          subTitle: 'ejemplo de aplicación',
          Galeria: [{ label: 'example-realState', video: 'example-realState' }],
        },
      ],
    },
  },

  {
    slug: 'tours-360',
    titleEs: 'Tours Virtuales 360',
    image: 'tours-360',
    metaTitle: 'Tours 360 | JB.SKYLENS',
    metaDescription:
      'Servicios profesionales de drones para tours virtuales en Ecuador. Fotografías, videos aéreos y tomas cinematográficas para inmobiliarias, constructoras y proyectos inmobiliarios.',
    keywords: [
      'tours virtuales con drones', 'tours 360 con drones',
      'fotografía aérea para tours virtuales', 'video aéreo para tours 360',
      'tours virtuales para inmobiliarias ecuador', 'servicios de drones para tours virtuales',
      'tours 360 para proyectos inmobiliarios', 'filmación aérea de tours virtuales',
      'marketing inmobiliario con tours virtuales', 'contenido audiovisual para tours 360',
      'tomas aéreas de tours virtuales', 'servicios de drones en esmeraldas',
      'producción audiovisual para tours virtuales', 'fotografía profesional para tours 360',
    ],
    sortOrder: 6,
    page: {
      D: [{ imagen: 'tours-360', label: 'Servicios', title: 'Tours virtuales 360 para negocios y empresas' }],
      Content: [
        {
          label: 'Servicios',
          subTitle: 'Muestra tu negocio de forma interactiva y profesional',
          text: [
            'Los tours virtuales permiten a tus clientes recorrer tu negocio desde cualquier lugar y en cualquier momento, generando confianza antes incluso de visitarte físicamente. Esta tecnología transforma la forma en que presentas tus espacios, mostrando cada detalle de manera interactiva, moderna y atractiva.',
            'Implementar un recorrido virtual no solo mejora tu presencia digital, sino que también aumenta el tiempo que los usuarios pasan en tu página, mejora tu posicionamiento online y eleva la percepción profesional de tu marca. Es una herramienta ideal para destacar frente a la competencia, captar más clientes y ofrecer una experiencia innovadora que realmente impacta.',
          ],
        },
      ],
      CalltoAction: [
        {
          SubTitle: '¿Cómo puede ayudar a tu negocio?',
          list: [
            {
              label: 'Aumenta la confianza del cliente',
              text: ['Cuando una persona puede ver tu espacio real antes de visitarte, se siente más segura y confiada para tomar una decisión.'],
            },
            {
              label: 'Mejora tu presencia digital',
              text: ['Un tour virtual transmite profesionalismo, innovación y tecnología, haciendo que tu marca destaque online.'],
            },
            {
              label: 'Disponible 24/7',
              text: ['Un tour virtual está disponible las 24 horas del día, los 7 días de la semana, sin interrupciones ni horarios limitados.'],
            },
          ],
        },
        {
          SubTitle: '¿Por qué invertir en un Tour Virtual?',
          text: ['Porque hoy los clientes investigan antes de visitar. Si tu negocio no muestra su espacio, alguien más sí lo hará y captará su atención primero.'],
          list: [
            {
              label: 'Un recorrido virtual funciona como:',
              text: ['Vendedor digital', 'Exhibición interactiva', 'Carta de presentación visual', 'Experiencia diferenciadora'],
            },
          ],
          text2: ['Todo en una sola herramienta.'],
        },
        {
          callToAction: 'Resultado Final para tu Marca',
          list: [
            { text: ['Más confianza', 'Más interacción', 'Más tiempo en tu web', 'Más conversiones', 'Más profesionalismo'] },
          ],
        },
        {
          SubTitle: 'Haz que tus clientes entren a tu negocio antes de visitarlo.',
          buttons: [{ label: 'Contáctanos', href: '/contact' }],
        },
      ],
      Animations: [{ src: 'cityFlight' }],
      Example: [
        {
          label: 'nuestros trabajos',
          subTitle: 'ejemplo de aplicación',
          Galeria: [{ label: 'tours 360', urlImg: 'tours-360' }],
        },
      ],
    },
  },
];

async function main() {
  for (const p of PAGES) {
    const blurb = BLURBS[p.slug];
    const data = {
      slug: p.slug,
      titleEs: p.titleEs,
      titleEn: blurb?.titleEn,
      descriptionEs: blurb?.descEs,
      descriptionEn: blurb?.descEn,
      coverUrl: `${CLOUD}/${p.image}.jpg`,
      isPage: true,
      published: true,
      sortOrder: p.sortOrder,
      metaTitle: p.metaTitle,
      metaDescription: p.metaDescription,
      keywords: p.keywords,
      page: p.page,
    };
    await prisma.service.upsert({
      where: { slug: p.slug },
      update: data,
      create: data,
    });
    console.log(`✓ ${p.slug}`);
  }
  console.log(`\nSeeded ${PAGES.length} service pages.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
