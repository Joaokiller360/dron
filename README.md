# 🚁 JB.SKYLENS - Servicios Profesionales con Drones

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.1.5-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=for-the-badge&logo=tailwindcss)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-0055FF?style=for-the-badge&logo=framer)
![next-intl](https://img.shields.io/badge/next--intl-4.1.0-blue?style=for-the-badge)

**Sitio web profesional de servicios con drones en Ecuador**

[🌐 Ver Demo](https://dron.joaobarres.dev) · [📧 Contacto](mailto:contacto@joaobarres.dev)

</div>

---

## 📋 Descripción

**JB.SKYLENS** es una operadora de drones independiente en Ecuador 🇪🇨, especializada en contenido aéreo profesional. Este repositorio contiene el código fuente de su sitio web, desarrollado con tecnologías modernas para ofrecer una experiencia rápida, responsive y optimizada para SEO.

### ✨ Características principales

- � **Sitio multilingüe** (Español e Inglés) con next-intl
- 🎬 **Producción audiovisual** con drones profesionales
- 📸 **Fotografía aérea** de alta calidad
- 🔍 **Inspecciones técnicas** industriales y estructurales
- 🎉 **Cobertura de eventos** en vivo
- 🏗️ **Levantamientos topográficos** y fotogrametría
- 🌊 **Operaciones en zonas costeras** y portuarias
- 🔎 **SEO optimizado** con metadata dinámica por idioma

---

## 🌍 Internacionalización (i18n)

El proyecto utiliza **next-intl** para soporte multilingüe completo:

### Idiomas soportados

| Idioma | Código | Prefijo URL |
|--------|--------|-------------|
| Español | `es` | Sin prefijo (por defecto) |
| Inglés | `en` | `/en/` |

### Configuración

```typescript
// i18n/routing.ts
export const routing = defineRouting({
  locales: ['es', 'en'],
  defaultLocale: 'es',
  localePrefix: 'as-needed' // Solo muestra prefijo para idiomas no predeterminados
});
```

### Estructura de traducciones

Los archivos de traducción están en `/translate/`:

```json
// translate/es.json
{
  "nav": {
    "home": "Inicio",
    "services": "Servicios",
    "portfolio": "Portafolio"
  },
  "metadata": {
    "title": "JB.SKYLENS - Servicios con Drones",
    "description": "Operadora de drones en Ecuador..."
  }
}
```

### Uso en componentes

```tsx
// Cliente
import { useTranslations } from 'next-intl';

function Component() {
  const t = useTranslations('nav');
  return <span>{t('home')}</span>;
}

// Servidor (metadata)
import { getMessages } from 'next-intl/server';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const messages = await getMessages({ locale });
  return { title: messages.metadata.title };
}
```

### Navegación multilingüe

- Los enlaces se adaptan automáticamente al idioma actual
- El prefijo `/es` se omite para español (idioma por defecto)
- El prefijo `/en` se añade para inglés
- Selector de idioma en el navbar

---

## 🛠️ Stack Tecnológico

| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| **Next.js** | 16.1.5 | Framework de React para producción |
| **React** | 19.2.3 | Biblioteca de UI |
| **TypeScript** | 5.x | Tipado estático |
| **Tailwind CSS** | 4.x | Framework de estilos utility-first |
| **Framer Motion** | 12.29.2 | Animaciones fluidas |
| **Flowbite** | 4.0.1 | Componentes UI |
| **Lucide React** | 0.555.0 | Iconos |
| **EmailJS** | 4.4.1 | Envío de emails desde el cliente |
| **Lottie** | 0.17.13 | Animaciones vectoriales |
| **next-intl** | 4.1.0 | Internacionalización (i18n) |

---

## 📁 Estructura del Proyecto

```
jbskylens-dron/
├── app/
│   ├── [locale]/                  # Rutas con idioma dinámico (es/en)
│   │   ├── (site)/                # Páginas del sitio
│   │   │   ├── clients/           # Página de clientes
│   │   │   ├── construction/      # Página en construcción
│   │   │   ├── contact/           # Formulario de contacto
│   │   │   ├── legal/             # Páginas legales
│   │   │   │   ├── privacy-policies/
│   │   │   │   └── terms-and-conditions/
│   │   │   ├── portfolio/         # Portafolio de proyectos
│   │   │   ├── services/          # Servicios
│   │   │   │   ├── events-and-live-broadcasting/
│   │   │   │   ├── film-and-tv-production/
│   │   │   │   ├── insdustrial-inspection-and-photogrammetry/
│   │   │   │   ├── location-scouting-and-recon/
│   │   │   │   ├── real-estate/
│   │   │   │   ├── tours-360/
│   │   │   │   └── urban-flight-operations/
│   │   │   └── teams/             # Equipo de trabajo
│   │   ├── layout.tsx             # Layout con NextIntlClientProvider
│   │   └── page.tsx               # Página de inicio
│   │
│   ├── component/                 # Componentes principales
│   │   ├── about/                 # Sección "Sobre nosotros"
│   │   ├── call-action/           # Call to action
│   │   ├── footer/                # Pie de página
│   │   ├── galery/                # Galería de imágenes
│   │   ├── home/                  # Hero section
│   │   ├── logos/                 # Logos de clientes
│   │   ├── whatDeDo/              # Sección "Qué hacemos"
│   │   └── whyChooseUs/           # Sección "Por qué elegirnos"
│   │
│   ├── hooks/                     # Custom hooks
│   │   └── from-email/            # Hook para formulario de email
│   │
│   ├── utils/                     # Utilidades y componentes reutilizables
│   │   ├── animation/             # Animaciones (Scroll effects)
│   │   ├── banner/                # Componente banner
│   │   ├── button/                # Botones personalizados
│   │   ├── cards/                 # Tarjetas de contenido
│   │   ├── email/                 # Utilidades de email
│   │   ├── highlightText/         # Resaltado de texto con keywords
│   │   ├── icons/                 # Iconos personalizados
│   │   ├── layout/                # Layouts reutilizables
│   │   ├── legalProps/            # Props para páginas legales
│   │   ├── logo/                  # Componente logo
│   │   ├── maps/                  # Animaciones Lottie
│   │   ├── metadata/              # Generador de metadata SEO
│   │   ├── nav/                   # Navegación multilingüe
│   │   ├── separador/             # Separadores visuales
│   │   └── toast/                 # Notificaciones toast
│   │
│   ├── globals.css                # Estilos globales + tema personalizado
│   └── not-found.tsx              # Página 404
│
├── translate/                     # Archivos de traducción
│   ├── es.json                    # Traducciones en español
│   └── en.json                    # Traducciones en inglés
│
├── public/
│   ├── animation/                 # Animaciones Lottie JSON
│   ├── ico/                       # Favicons
│   ├── img/                       # Imágenes estáticas
│   ├── video/                     # Videos
│   ├── robots.txt                 # Configuración para crawlers
│   └── sitemap.xml                # Mapa del sitio para SEO (es + en)
│
├── i18n/
│   ├── routing.ts                 # Configuración de rutas i18n
│   └── request.ts                 # Configuración de solicitudes i18n
│
├── middleware.ts                  # Middleware para manejo de idiomas
├── data.tsx                       # Datos de navegación
├── tailwind.config.js             # Configuración de Tailwind
├── next.config.ts                 # Configuración de Next.js con i18n
├── nixpacks.toml                  # Configuración de despliegue
├── tsconfig.json                  # Configuración de TypeScript
└── package.json                   # Dependencias y scripts
```

---

## 🚀 Instalación y Desarrollo

### Prerrequisitos

- Node.js 22.x o superior
- npm 10.x o superior

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/Joaokiller360/dron.git

# Entrar al directorio
cd dron

# Instalar dependencias
npm install
```

### Scripts disponibles

```bash
# Iniciar servidor de desarrollo
npm run dev

# Crear build de producción
npm run build

# Iniciar servidor de producción
npm run start

# Ejecutar linter
npm run lint
```

### Variables de entorno

Crear un archivo `.env.local` en la raíz del proyecto:

```env
# Google Analytics
GOOGLE_ANALYTICS=G-XXXXXXXXXX

# Google Search Console Verification
GOOGLE_VERIFICATION=your-verification-code

# EmailJS (para formulario de contacto)
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your-service-id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your-template-id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your-public-key
```

---

## 🎨 Paleta de Colores

El proyecto utiliza una paleta de colores personalizada llamada **Honeydew**:

| Color | Código Hex | Uso |
|-------|------------|-----|
| honeydew-50 | `#ecf8f1` | Fondos claros |
| honeydew-100 | `#d9f2e3` | Acentos suaves |
| honeydew-200 | `#b4e4c7` | Bordes |
| honeydew-300 | `#8ed7ab` | Hover states |
| honeydew-400 | `#68ca8f` | Elementos secundarios |
| honeydew-500 | `#42bd73` | Color principal/Acento |
| honeydew-600 | `#35975c` | Botones activos |
| honeydew-700 | `#287145` | Texto destacado |
| honeydew-800 | `#1b4b2e` | Fondo oscuro |
| honeydew-900 | `#0d2617` | Fondo muy oscuro |
| honeydew-950 | `#091a10` | Negro personalizado |

---

## 📄 Páginas del Sitio

| Ruta (ES) | Ruta (EN) | Descripción |
|-----------|-----------|-------------|
| `/` | `/en` | Página de inicio con hero, galería, servicios y CTA |
| `/services` | `/en/services` | Lista completa de servicios ofrecidos |
| `/services/events-and-live-broadcasting` | `/en/services/events-and-live-broadcasting` | Servicios para eventos y transmisiones |
| `/services/film-and-tv-production` | `/en/services/film-and-tv-production` | Producción para cine y TV |
| `/services/insdustrial-inspection-and-photogrammetry` | `/en/services/insdustrial-inspection-and-photogrammetry` | Inspecciones y fotogrametría |
| `/services/location-scouting-and-recon` | `/en/services/location-scouting-and-recon` | Reconocimiento de locaciones |
| `/services/urban-flight-operations` | `/en/services/urban-flight-operations` | Operaciones urbanas |
| `/services/real-estate` | `/en/services/real-estate` | Fotografía inmobiliaria |
| `/services/tours-360` | `/en/services/tours-360` | Tours virtuales 360° |
| `/portfolio` | `/en/portfolio` | Portafolio de trabajos realizados |
| `/teams` | `/en/teams` | Equipo de trabajo |
| `/contact` | `/en/contact` | Formulario de contacto |
| `/clients` | `/en/clients` | Clientes (en desarrollo) |
| `/legal/privacy-policies` | `/en/legal/privacy-policies` | Política de privacidad |
| `/legal/terms-and-conditions` | `/en/legal/terms-and-conditions` | Términos y condiciones |

---

## 🔧 Componentes Principales

### Componentes de UI (`/app/component`)

- **`Inicio`** - Hero section con animación Lottie de dron
- **`Galery`** - Galería de imágenes/videos
- **`WhyChooseUs`** - Sección de beneficios
- **`Logos`** - Carrusel de logos de clientes
- **`WhatDeDo`** - Descripción de servicios
- **`About`** - Información sobre la empresa
- **`Footer`** - Pie de página responsive
- **`CallAction`** - Llamadas a la acción

### Utilidades (`/app/utils`)

- **`createMetadata`** - Generador de metadata SEO dinámico
- **`Navbar`** - Navegación principal
- **`Button`** - Botones personalizados con variantes
- **`SectionCard`** / **`CardVideo`** / **`CardClient`** - Tarjetas de contenido
- **`Banner`** - Banners de página
- **`ScrollRevealEffect`** / **`ScrollBottonEffect`** - Animaciones al scroll
- **`CopyText`** - Copiar texto al portapapeles
- **`ToastSuccess`** - Notificaciones de éxito
- **`SeparatorUp`** / **`SeparatorBelow`** - Separadores visuales SVG

---

## 📱 SEO y Optimización

El proyecto incluye:

- ✅ **Sitio multilingüe** con español e inglés
- ✅ Metadata dinámica por página **traducida según el idioma**
- ✅ Open Graph y Twitter Cards con soporte i18n
- ✅ Sitemap XML con **rutas en ambos idiomas** (`/` y `/en/`)
- ✅ Robots.txt configurado
- ✅ Google Analytics integrado
- ✅ Google Search Console verification
- ✅ Estructura semántica HTML5
- ✅ Imágenes optimizadas
- ✅ Lazy loading
- ✅ Fuentes optimizadas (Geist Sans & Mono)
- ✅ **Keywords resaltados** automáticamente en contenido de servicios

---

## 🌐 Despliegue

El proyecto está configurado para desplegarse en múltiples plataformas:

### Railway / Nixpacks

El archivo `nixpacks.toml` está configurado para Node.js 22:

```toml
[phases.setup]
nixPkgs = ["nodejs_22", "npm-10_x"]
```

### Vercel

Compatible con despliegue automático en Vercel.

### Dominio

- **Producción**: [https://dron.joaobarres.dev](https://dron.joaobarres.dev)

---

## 👨‍💻 Autor

<div align="center">

**Joao Barres**

[![Website](https://img.shields.io/badge/Website-joaobarres.dev-1b4b2e?style=for-the-badge)](https://joaobarres.dev)
[![Instagram](https://img.shields.io/badge/Instagram-@jb.skylens-E4405F?style=for-the-badge&logo=instagram)](https://www.instagram.com/jb.skylens)
[![Facebook](https://img.shields.io/badge/Facebook-JB.SKYLENS-1877F2?style=for-the-badge&logo=facebook)](https://www.facebook.com/share/1AagbyNSJV/)

</div>

---

## 📞 Contacto

- **Email**: contacto@joaobarres.dev
- **Teléfono**: +593 98 666 0737
- **Ubicación**: Esmeraldas, Ecuador 🇪🇨

---

## 📜 Licencia

© 2026 JB.SKYLENS - Todos los derechos reservados.

---

<div align="center">

**Hecho con ❤️ en Ecuador 🇪🇨**

</div>
