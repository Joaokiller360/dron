# 🚁 JB.SKYLENS - Servicios Profesionales con Drones

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.0.7-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=for-the-badge&logo=tailwindcss)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-0055FF?style=for-the-badge&logo=framer)

**Sitio web profesional de servicios con drones en Ecuador**

[🌐 Ver Demo](https://dron.joaobarres.dev) · [📧 Contacto](mailto:contacto@joaobarres.dev)

</div>

---

## 📋 Descripción


**JB.SKYLENS** es una operadora de drones independiente en Ecuador 🇪🇨, especializada en contenido aéreo profesional. Este repositorio contiene el código fuente de su sitio web, desarrollado con tecnologías modernas para ofrecer una experiencia rápida, responsive y optimizada para SEO.

---

## 🌍 Internacionalización y SEO avanzado

El sitio está completamente **multilingüe** (español e inglés) usando [next-intl](https://next-intl-docs.vercel.app/), con:

- 🌐 **Navegación multilingüe**: rutas amigables, con prefijo /en para inglés y sin prefijo para español (por defecto).
- 🏷️ **Traducción dinámica de metadatos**: títulos, descripciones y Open Graph traducidos por página usando `getMessages` en el server.
- 🗺️ **Sitemap.xml**: indexa todas las rutas en español e inglés para SEO internacional.
- 🗝️ **Gestión robusta de claves de traducción**: todos los textos y palabras clave de servicios están en `/translate/es.json` y `/translate/en.json`.
- ✨ **Resaltado de palabras clave**: los servicios resaltan palabras clave automáticamente si coinciden exactamente con las definidas en el JSON de traducción.

---

### ✨ Características principales

- 🎬 **Producción audiovisual** con drones profesionales
- 📸 **Fotografía aérea** de alta calidad
- 🔍 **Inspecciones técnicas** industriales y estructurales
- 🎉 **Cobertura de eventos** en vivo
- 🏗️ **Levantamientos topográficos** y fotogrametría
- 🌊 **Operaciones en zonas costeras** y portuarias

---

## 🛠️ Stack Tecnológico

| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| **Next.js** | 16.0.7 | Framework de React para producción |
| **React** | 19.2.3 | Biblioteca de UI |
| **TypeScript** | 5.x | Tipado estático |
| **Tailwind CSS** | 4.x | Framework de estilos utility-first |
| **Framer Motion** | 12.29.2 | Animaciones fluidas |
| **Flowbite** | 4.0.1 | Componentes UI |
| **Lucide React** | 0.555.0 | Iconos |
| **EmailJS** | 4.4.1 | Envío de emails desde el cliente |
| **Lottie** | 0.17.13 | Animaciones vectoriales |

---

## 📁 Estructura del Proyecto

```
jbskylens-dron/
├── app/
│   ├── (site)/                    # Páginas del sitio
│   │   ├── clients/               # Página de clientes
│   │   ├── construction/          # Página en construcción
│   │   ├── contact/               # Formulario de contacto
│   │   ├── legal/                 # Páginas legales
│   │   │   ├── privacy-policies/  # Política de privacidad
│   │   │   └── terms-and-conditions/ # Términos y condiciones
│   │   ├── portfolio/             # Portafolio de proyectos
│   │   ├── services/              # Servicios
│   │   │   ├── events-and-live-broadcasting/
│   │   │   ├── film-and-tv-production/
│   │   │   ├── insdustrial-inspection-and-photogrammetry/
│   │   │   ├── location-scouting-and-recon/
│   │   │   └── urban-flight-operations/
│   │   └── teams/                 # Equipo de trabajo
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
│   │   ├── highlightText/         # Resaltado de texto
│   │   ├── icons/                 # Iconos personalizados
│   │   ├── layout/                # Layouts reutilizables
│   │   ├── legalProps/            # Props para páginas legales
│   │   ├── logo/                  # Componente logo
│   │   ├── maps/                  # Animaciones Lottie
│   │   ├── metadata/              # Generador de metadata SEO
│   │   ├── nav/                   # Navegación
│   │   ├── separador/             # Separadores visuales
│   │   └── toast/                 # Notificaciones toast
│   │
│   ├── globals.css                # Estilos globales + tema personalizado
│   ├── layout.tsx                 # Layout principal
│   ├── page.tsx                   # Página de inicio
│   ├── not-found.tsx              # Página 404
│   └── flowbait-init.tsx          # Inicialización de Flowbite
│
├── public/
│   ├── animation/                 # Animaciones Lottie JSON
│   ├── ico/                       # Favicons
│   ├── img/                       # Imágenes estáticas
│   ├── video/                     # Videos
│   ├── robots.txt                 # Configuración para crawlers
│   └── sitemap.xml                # Mapa del sitio para SEO
│
├── data.tsx                       # Datos de navegación
├── tailwind.config.js             # Configuración de Tailwind
├── next.config.ts                 # Configuración de Next.js
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

| Ruta | Descripción |
|------|-------------|
| `/` / `/en` | Página de inicio (español/inglés) |
| `/services` / `/en/services` | Lista de servicios (español/inglés) |
| `/services/events-and-live-broadcasting` / `/en/services/events-and-live-broadcasting` | Servicios para eventos y transmisiones (español/inglés) |
| `/services/film-and-tv-production` / `/en/services/film-and-tv-production` | Producción para cine y TV (español/inglés) |
| `/services/insdustrial-inspection-and-photogrammetry` / `/en/services/insdustrial-inspection-and-photogrammetry` | Inspecciones y fotogrametría (español/inglés) |
| `/services/location-scouting-and-recon` / `/en/services/location-scouting-and-recon` | Reconocimiento de locaciones (español/inglés) |
| `/services/urban-flight-operations` / `/en/services/urban-flight-operations` | Operaciones urbanas (español/inglés) |
| `/portfolio` / `/en/portfolio` | Portafolio de trabajos (español/inglés) |
| `/teams` / `/en/teams` | Equipo de trabajo (español/inglés) |
| `/contact` / `/en/contact` | Formulario de contacto (español/inglés) |
| `/clients` / `/en/clients` | Clientes (en desarrollo, ambos idiomas) |
| `/legal/privacy-policies` / `/en/legal/privacy-policies` | Política de privacidad (español/inglés) |
| `/legal/terms-and-conditions` / `/en/legal/terms-and-conditions` | Términos y condiciones (español/inglés) |

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

- **`createMetadata`** - Generador de metadata SEO dinámico y traducido
- **`Navbar`** - Navegación principal multilingüe
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

- ✅ **Internacionalización completa** (español/inglés) con next-intl
- ✅ **Navegación y rutas multilingües**
- ✅ **Metadata dinámica y traducida** por página con keywords optimizados
- ✅ **Open Graph y Twitter Cards** traducidos
- ✅ **Sitemap XML** con rutas en ambos idiomas
- ✅ **Robots.txt** configurado
- ✅ **Google Analytics** integrado
- ✅ **Google Search Console verification**
- ✅ **Estructura semántica HTML5**
- ✅ **Imágenes optimizadas**
- ✅ **Lazy loading**
- ✅ **Fuentes optimizadas** (Geist Sans & Mono)

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
