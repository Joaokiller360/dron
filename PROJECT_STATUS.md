# JB.SKYLENS — Estado del proyecto

Resumen de todo lo hecho para tener contexto rápido en la próxima sesión. No reemplaza al código — si algo choca con lo que ves en el repo, confía en el repo y actualiza este archivo.

## Estructura del repo

Monorepo con dos carpetas independientes:

```
jbskylens-dron/
├── front/   # Next.js 16 (App Router) — el sitio + el dashboard admin
└── back/    # NestJS 10 + Prisma 5 + PostgreSQL — la API
```

Antes todo vivía en la raíz (Next.js directo). Se separó en `front/`/`back/` con `git mv` para conservar historia.

## Backend (`back/`)

Stack: Node 20, NestJS 10, TypeScript 5, Prisma 5, JWT + bcrypt, Swagger, Winston, Docker.

- Corre en `PORT=8008`, prefijo `api/v1` (ej. `http://localhost:8008/api/v1/health`).
- `Dockerfile` + `docker-compose.yml` listos (postgres + api) pero nunca probados con Docker real en esta máquina (no había Docker instalado) — sí se probó todo el flujo (migrate + seed + start) corriendo el proceso directo.
- Swagger en `/api/v1/docs`.

### Módulos / recursos

| Recurso | Público | Admin (JWT) | Notas |
|---|---|---|---|
| `auth` | `POST /auth/login` | `GET /auth/me` | login del admin, devuelve JWT |
| `contact-messages` | `POST` (crear, rate-limited) | `GET`, `GET /:id`, `PATCH /:id/status` | bandeja del form de contacto |
| `categories` | `GET` (filtra por `?type=PROJECT\|CLIENT\|SERVICE`) | `POST`, `PATCH`, `DELETE` | slug autogenerado del nombre; `DELETE` da 409 si sigue en uso |
| `projects` | `GET`, `GET /:slug` | `GET /admin`, `POST`, `PATCH`, `DELETE` | portafolio; `categoryId` obligatorio (FK a `categories`, type=PROJECT) |
| `team-members` | `GET` | `GET /admin`, `POST`, `PATCH`, `DELETE` | equipo; `role` es texto libre (no usa categorías) |
| `clients` | `GET` | `GET /admin`, `POST`, `PATCH`, `DELETE` | `categoryId` obligatorio (FK a `categories`, type=CLIENT) |
| `services` | `GET` | `GET /admin`, `POST`, `PATCH`, `DELETE` | `categoryId` obligatorio (FK a `categories`, type=SERVICE) |
| `health` | `GET /health` | — | ping a la DB |

### Modelo de datos (Prisma)

- `AdminUser` — cuentas del dashboard (email + bcrypt hash).
- `Category` — `{ name, slug, type: PROJECT|CLIENT|SERVICE, sortOrder }`. Compartida entre los tres tipos de contenido; slug siempre autogenerado en el backend.
- `ContactMessage` — `{ name, phone, email, message, locale, status: NEW|READ|ARCHIVED }`.
- `Project` — `{ slug, categoryId→Category, titleEs/En, descriptionEs/En, coverUrl, href, mediaUrls[], published, sortOrder }`. `href` es el link externo real (ej. reel de Instagram) o interno para el botón "ver"; si no hay, el front usa `coverUrl`.
- `TeamMember` — `{ slug, name, role, photoUrl, links: Json [{platform, url}], published, sortOrder }`.
- `Client` — `{ slug, name, categoryId→Category, photoUrl, links: Json, published, sortOrder }`.
- `Service` — `{ slug, titleEs/En, descriptionEs/En, coverUrl, href, categoryId→Category, published, sortOrder }`.

`links` usa una lista fija de plataformas: `instagram | whatsapp | website | facebook | tiktok` (mapeadas a íconos en el front vía `app/utils/socialLinks`).

### Credenciales / acceso

- Admin seed: email/contraseña están en `back/.env` (`ADMIN_EMAIL`/`ADMIN_PASSWORD`) — correr `npm run prisma:seed` para (re)crearlo. No lo repito aquí a propósito, mira el `.env`.
- DB real: Postgres remoto en `207.180.216.55:5434` (ver `DATABASE_URL` en `back/.env`). Ojo: **no** es una DB de prueba descartable, ya tiene contenido real migrado (ver abajo).
- `CORS_ORIGIN` incluye `localhost:3000` y `192.168.1.6:3000` (la IP de LAN que se usó para abrir el sitio desde otro dispositivo). Si cambia la IP de red, hay que agregarla ahí y reiniciar el backend (las env vars solo se leen al arrancar).

## Contenido migrado (ya no es hardcodeado)

Todo lo que antes vivía como arrays hardcodeados en `front/app/[locale]/(site)/{portfolio,teams,clients}` se migró a la base de datos con un script one-off (ya borrado, su trabajo terminó):

- **13 proyectos** del portafolio (bodas/eventos de Marina Ecovida, documentales, TV, gobierno...), con sus URLs reales de Cloudinary y sus links reales de Instagram/websites preservados en `href`.
- **7 clientes** (Marina Ecovida, Vida Pura Beach, Rumbeke, Fundación Corazones Descalzos, CGTN, Prefectura/Alcaldía de Esmeraldas).
- **2 miembros del equipo** (Joao Barres - Piloto, Camara.Esme - Filmaker).
- **11 categorías** creadas durante la migración: 7 de proyecto (Bodas, XV años, Eventos, Inmobiliaria, Inspección, Tours 360, Producción) + 4 de cliente (Grandes Marcas, Documentales, Televisión, Gobierno). Las de servicio quedaron vacías (nadie ha creado un servicio real todavía, solo pruebas que se borraron).

Ojo: el proyecto "prueba" que el usuario subió manualmente en una sesión anterior para probar el dashboard ya **no existe** — desapareció en algún punto (probablemente borrado por el propio usuario desde el dashboard), no fue una acción mía.

## Dashboard (`front/app/[locale]/dashboard`)

Ruta: `/dashboard`. Protegido con login (JWT contra el backend), `noindex`. No está en el nav público a propósito.

Tabs: **Estado** (health check en vivo) · **Mensajes** (bandeja de contacto, filtro/estado) · **Categorías** (crear/listar/borrar, agrupado por tipo) · **Proyectos** · **Equipo** · **Clientes** · **Servicios**.

Cada uno de los 4 paneles de contenido (Proyectos/Equipo/Clientes/Servicios) tiene:
- Formulario de creación con **slug autogenerado** (nunca se pide a mano — se deriva del nombre/título vía `slugify()`).
- Los que usan categoría (Proyectos/Clientes/Servicios) tienen un **selector de categoría con creación inline**: botón "+" al lado del select abre un campo para crear la categoría ahí mismo sin cambiar de tab, y la selecciona automáticamente.
- **Preview de imagen** en vivo al lado del campo de URL (arriba en mobile) mientras se escribe.
- Grid de tarjetas existentes con **miniatura**, badge de categoría/rol, badge publicado/oculto, botón "Ver publicación" (abre `/portfolio#slug`, `/teams#slug`, `/clients#slug` o `/services#slug` en pestaña nueva) y acciones de publicar/ocultar/eliminar.

Diseño: se sacó del lenguaje visual real del sitio (no inventado) — `font-mono` (Geist Mono) para títulos/labels uppercase, escala de verdes `honeydew-*` (la única paleta real; `text-customRed`/`gradient-text` que existen en otras partes del sitio son clases muertas sin CSS detrás, no las repliques), tarjetas anidadas con badges circulares de ícono, nav en pill glass (`bg-black/30 backdrop-blur`) igual que el navbar del sitio, animaciones `ScrollRevealEffect`/`ScrollBottonEffect` (framer-motion).

## Páginas públicas conectadas a la DB

- `/portfolio` — agrupa por `Project.category`, ordenado por `sortOrder` de la categoría.
- `/teams` — lista `TeamMember`s publicados bajo el heading original "El crew dron".
- `/clients` — agrupa por `Client.category`.
- `/services` — la grilla de 7 tarjetas de navegación a las páginas de servicio (film-and-tv-production, etc.) sigue siendo estática a propósito (son páginas de marketing con muchísimo contenido propio, no algo que un CRUD simple pueda reemplazar); lo que sí es dinámico es una sección adicional "Más servicios" con lo que se cree en el dashboard.
- `/contact` — el form sigue mandando por EmailJS (como siempre) y **además** hace un POST best-effort a `/contact-messages` para que llegue a la bandeja del dashboard. Si el backend falla, no rompe el form (fire-and-forget).

Todas leen del backend server-side (`fetch` en Server Components, `cache: 'no-store'`), no client-side — el contenido está en el HTML inicial, no depende de que corra JS.

## Bugs reales encontrados y arreglados (no relacionados con lo que se pedía, pero bloqueaban todo)

1. **`front/app/[locale]/not-found.tsx` estaba vacío (0 bytes)**, ya commiteado así desde antes de esta sesión. Next intentaba usarlo como boundary de 404 (cosa que en `next dev` con Next 16 pasa hasta en rutas válidas por un bug de timing con `headers()`/next-intl) y explotaba con 500 en absolutamente todo. Se rellenó con el mismo contenido que el `app/not-found.tsx` raíz.
2. Relacionado: `i18n/request.ts` ahora envuelve `await requestLocale` en try/catch (Next 16 dev a veces tira `headers() called outside a request scope` ahí; nunca pasa en producción).
3. `middleware.ts` → renombrado a `proxy.ts` (convención de Next 16, mismo comportamiento).
4. Turbopack cachea `.next/` de forma persistente — un simple restart de `npm run dev` a veces **no** recoge cambios en archivos de convención especial (como `not-found.tsx`). Si algo raro pasa después de un cambio así: `rm -rf .next` antes de `npm run dev`, no solo Ctrl+C y volver a correr.
5. Convertir páginas de servidor síncronas a `async` (para hacer `fetch` a la DB) rompe `useTranslations`/`useLocale` (hooks de cliente) si se llaman después de un `await` — hay que usar `getTranslations`/`getLocale` de `next-intl/server` en su lugar. Pasó en `/portfolio`, `/clients`, `/services`.
6. `text-customRed` (usado en varios lados del sitio, incluyendo el `not-found.tsx` original) no está definido en ningún lado del tema — solo existe la escala `honeydew-*`. En el dashboard se cambió por `red-400`/`red-500` reales de Tailwind. **No se tocó** en el resto del sitio (fuera de alcance).

## Lo que falta / posibles próximos pasos

- Nunca se probó `docker compose up` de verdad (no había Docker en esta máquina) — el `docker-compose.yml` de `back/` debería funcionar pero no está verificado end-to-end en contenedor.
- No hay categorías de tipo Servicio todavía (nadie creó una real) — el primer servicio real que se cree necesitará crear su categoría primero (ahora se puede hacer inline, sin cambiar de tab).
- Las páginas de servicio individuales (`/services/film-and-tv-production`, etc.) siguen siendo 100% estáticas — si en algún momento se quiere que sean editables, es un trabajo aparte bastante más grande (tienen secciones, listas, animaciones Lottie, keywords SEO por página).
- `TeamMember.role` es texto libre, no usa el sistema de categorías (a propósito, no se pidió).
