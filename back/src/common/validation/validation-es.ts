import { BadRequestException, ValidationError } from '@nestjs/common';

/** Spanish names for the DTO fields, shown in validation errors */
const LABELS: Record<string, string> = {
  accountHolder: 'titular de la cuenta',
  accountNumber: 'número de cuenta',
  accountType: 'tipo de cuenta',
  active: 'activo',
  address: 'dirección',
  author: 'autor',
  badge: 'etiqueta',
  badges: 'etiquetas',
  bankName: 'banco',
  bar: 'barra',
  base: 'base',
  bio: 'biografía',
  body: 'contenido',
  carrier: 'transportista',
  categoryId: 'categoría',
  city: 'ciudad',
  compareAtCents: 'precio anterior',
  content: 'contenido',
  contentType: 'tipo de archivo',
  coverUrl: 'foto de portada',
  description: 'descripción',
  descriptionEn: 'descripción (inglés)',
  descriptionEs: 'descripción (español)',
  detail: 'detalle',
  email: 'correo',
  enabled: 'activado',
  endsAt: 'fecha de fin',
  filename: 'nombre del archivo',
  folder: 'carpeta',
  header: 'encabezado',
  heading: 'encabezado',
  heroEyebrowEn: 'etiqueta de la tienda (inglés)',
  heroEyebrowEs: 'etiqueta de la tienda (español)',
  heroIntroEn: 'descripción de la tienda (inglés)',
  heroIntroEs: 'descripción de la tienda (español)',
  heroTitleEn: 'título de la tienda (inglés)',
  heroTitleEs: 'título de la tienda (español)',
  holderId: 'cédula o RUC',
  homeSection: 'productos en el inicio',
  href: 'enlace',
  isPage: 'es página',
  items: 'elementos',
  key: 'clave',
  keywords: 'palabras clave',
  label: 'etiqueta',
  lastUpdate: 'última actualización',
  links: 'enlaces',
  lists: 'listas',
  locale: 'idioma',
  mediaUrls: 'fotos',
  message: 'mensaje',
  metaDescription: 'descripción SEO',
  metaTitle: 'título SEO',
  name: 'nombre',
  nameEn: 'nombre (inglés)',
  nameEs: 'nombre (español)',
  note: 'nota',
  oldPrice: 'precio anterior',
  options: 'opciones',
  org: 'organización',
  page: 'página',
  password: 'contraseña',
  pausedNotice: 'aviso de ventas pausadas',
  paypalOrderId: 'pedido de PayPal',
  phone: 'teléfono',
  photoUrl: 'foto',
  platform: 'plataforma',
  price: 'precio',
  priceCents: 'precio',
  productId: 'producto',
  published: 'publicado',
  quantity: 'cantidad',
  quote: 'cita',
  role: 'cargo',
  sales: 'aceptar pedidos',
  section: 'sección',
  serviceSlug: 'servicio',
  showPrices: 'mostrar precios',
  size: 'tamaño',
  skills: 'habilidades',
  slug: 'dirección (slug)',
  sortOrder: 'orden',
  specs: 'detalles',
  stat: 'dato',
  statLabel: 'texto del dato',
  status: 'estado',
  stock: 'stock',
  story: 'historia',
  subject: 'asunto',
  text: 'texto',
  title: 'título',
  titleEn: 'título (inglés)',
  titleEs: 'título (español)',
  trackingNumber: 'número de guía',
  trackingUrl: 'enlace de seguimiento',
  transferBank: 'banco de la transferencia',
  transferEmail: 'correo para comprobantes',
  transferEnabled: 'pago por transferencia',
  transferReference: 'código de la transferencia',
  type: 'tipo',
  untilLabel: 'texto de vigencia',
  url: 'URL',
  value: 'valor',
  values: 'valores',
};

const label = (property: string) => LABELS[property] ?? property;
/** First number in class-validator's default English message (the limit) */
const num = (msg: string) => msg.match(/-?\d+(\.\d+)?/)?.[0] ?? '';

/** Spanish text for one failed rule; `f` is the quoted field name */
function translate(rule: string, f: string, english: string): string {
  switch (rule) {
    case 'whitelistValidation':
      return `El campo ${f} no está permitido`;
    case 'isNotEmpty':
    case 'isDefined':
    case 'arrayNotEmpty':
      return `El campo ${f} es obligatorio`;
    case 'isString':
      return `El campo ${f} debe ser texto`;
    case 'isBoolean':
      return `El campo ${f} debe ser sí o no`;
    case 'isInt':
      return `El campo ${f} debe ser un número entero`;
    case 'isNumber':
      return `El campo ${f} debe ser un número`;
    case 'isPositive':
      return `El campo ${f} debe ser mayor que 0`;
    case 'min':
      return `El campo ${f} debe ser mayor o igual a ${num(english)}`;
    case 'max':
      return `El campo ${f} debe ser menor o igual a ${num(english)}`;
    case 'maxLength':
      return `El campo ${f} admite hasta ${num(english)} caracteres`;
    case 'minLength':
      return `El campo ${f} debe tener al menos ${num(english)} caracteres`;
    case 'isLength':
      return `El campo ${f} tiene una longitud no válida`;
    case 'isEmail':
      return `El campo ${f} debe ser un correo válido`;
    case 'isUrl':
      return `El campo ${f} debe ser una URL válida (https://…)`;
    case 'isUuid':
    case 'isUUID':
      return `El campo ${f} no es un identificador válido`;
    case 'isDateString':
    case 'isIso8601':
    case 'isISO8601':
      return `El campo ${f} debe ser una fecha válida`;
    case 'isIn':
    case 'isEnum': {
      const allowed = english.split(':')[1]?.trim();
      return `El campo ${f} tiene un valor no permitido${allowed ? ` (permitidos: ${allowed})` : ''}`;
    }
    case 'isArray':
      return `El campo ${f} debe ser una lista`;
    case 'arrayMaxSize':
      return `El campo ${f} admite como máximo ${num(english)} elementos`;
    case 'arrayMinSize':
      return `El campo ${f} debe tener al menos ${num(english)} elementos`;
    case 'isObject':
      return `El campo ${f} debe ser un objeto`;
    case 'nestedValidation':
    case 'matches':
      return `El campo ${f} tiene un formato no válido`;
    default:
      return `El campo ${f} no es válido`;
  }
}

/** class-validator's own (English) messages start with the property; custom ones in the DTOs don't */
const isDefaultMessage = (msg: string, property: string) =>
  msg.startsWith(`${property} `) ||
  msg.startsWith(`each value in ${property} `) ||
  msg.startsWith(`property ${property} `) ||
  msg.startsWith('nested property ') ||
  msg.startsWith('an unknown value');

function collect(errors: ValidationError[], out: string[]) {
  for (const e of errors) {
    const f = `«${label(e.property)}»`;
    for (const [rule, msg] of Object.entries(e.constraints ?? {})) {
      out.push(isDefaultMessage(msg, e.property) ? translate(rule, f, msg) : msg);
    }
    if (e.children?.length) collect(e.children, out);
  }
  return out;
}

/** ValidationPipe exceptionFactory: same 400 shape as Nest's, with the messages in Spanish */
export function spanishValidationErrors(errors: ValidationError[]) {
  const messages = [...new Set(collect(errors, []))];
  return new BadRequestException({ statusCode: 400, error: 'Datos no válidos', message: messages });
}
