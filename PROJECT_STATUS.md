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
| `auth` | `POST /auth/login` | `GET /auth/me` | login del admin, devuelve JWT (`accessToken` + `user`) |
| `contact-messages` | `POST` (crear, rate-limited) | `GET`, `GET /:id`, `PATCH /:id/status` | bandeja del form de contacto |
| `categories` | `GET` (filtra por `?type=PROJECT\|CLIENT\|SERVICE`) | `POST`, `PATCH`, `DELETE` | slug autogenerado del nombre; `PATCH` re-genera el slug; `DELETE` da 409 si sigue en uso (cuenta projects+clients+services) |
| `projects` | `GET`, `GET /:slug` | `GET /admin`, `POST`, `PATCH`, `DELETE` | portafolio; `categoryId` obligatorio (FK a `categories`, type=PROJECT) |
| `team-members` | `GET` | `GET /admin`, `POST`, `PATCH`, `DELETE` | equipo; `role` es texto libre (no usa categorías) |
| `clients` | `GET` | `GET /admin`, `POST`, `PATCH`, `DELETE` | `categoryId` obligatorio (FK a `categories`, type=CLIENT) |
| `services` | `GET`, `GET /slug/:slug` | `GET /admin`, `POST`, `PATCH`, `DELETE` | `categoryId` **opcional** (FK a `categories`, type=SERVICE, `ON DELETE SET NULL`); ver "Páginas de servicio" abajo |
| `legal-pages` | `GET`, `GET /slug/:slug` | `GET /admin`, `POST`, `PATCH`, `DELETE` | páginas `/legal/<slug>`; ver "Páginas legales" abajo |
| `health` | `GET /health` | — | ping a la DB |

### Modelo de datos (Prisma)

- `AdminUser` — cuentas del dashboard (email + bcrypt hash).
- `Category` — `{ name, slug, type: PROJECT|CLIENT|SERVICE, sortOrder }`. Compartida entre los tres tipos de contenido; slug siempre autogenerado en el backend.
- `ContactMessage` — `{ name, phone, email, message, locale, status: NEW|READ|ARCHIVED }`.
- `Project` — `{ slug, categoryId→Category, titleEs/En, descriptionEs/En, coverUrl, href, mediaUrls[], published, sortOrder }`. `href` es el link externo real (ej. reel de Instagram) o interno para el botón "ver"; si no hay, el front usa `coverUrl`.
- `TeamMember` — `{ slug, name, role, photoUrl, links: Json [{platform, url}], published, sortOrder }`.
- `Client` — `{ slug, name, categoryId→Category, photoUrl, links: Json, published, sortOrder }`.
- `Service` — `{ slug, titleEs/En, descriptionEs/En, coverUrl, href, categoryId?→Category, published, sortOrder, isPage, page: Json?, metaTitle, metaDescription, keywords[] }`.
  - `isPage=false` (default): tarjeta simple de la sección "Más servicios" en `/services`.
  - `isPage=true`: **página completa** en `/services/<slug>`; `page` guarda el árbol entero de props de `PageServices` (ver abajo).
- `LegalPage` — `{ slug, titleEs/En, label, lastUpdate, keywords[], content: Json, metaTitle, metaDescription, published, sortOrder }`.
  - `content` = array de secciones: `{ heading?, text?: string[], lists?: [{ header?, description?: string[], items: string[] }] }`.

`links` usa una lista fija de plataformas: `instagram | whatsapp | website | facebook | tiktok` (mapeadas a íconos en el front vía `app/utils/socialLinks`).

### Migraciones (en orden)

`20260905051038_init` · `..._add_team_client_service` · `..._add_project_href` · `..._add_categories_nullable` · `..._finalize_categories` · **`20260907060137_service_rich_page`** (Service: `is_page`, `page jsonb`, `meta_*`, `keywords[]`) · **`20260907061500_service_category_optional`** (`services.category_id` NULLable, hecha a mano + `migrate deploy` porque el shadow DB remoto es inestable) · **`20260907070000_legal_pages`** (tabla `legal_pages` + realinea el FK `services.category_id` a `ON DELETE SET NULL`).

> Ojo: el Postgres remoto tira `P1017 (server closed connection)` de forma intermitente al crear el shadow DB. Para cambios de schema usar `prisma migrate diff --from-schema-datasource ... --script` para generar el SQL, escribir el archivo de migración a mano y correr `npx prisma migrate deploy` (no usa shadow DB).

### Seeds

- `prisma/seed.ts` — crea el `AdminUser` (`npm run prisma:seed`).
- `prisma/seed-service-pages.ts` — **one-off idempotente** (upsert por slug). Mete las 7 páginas de servicio (`film-and-tv-production`, `location-scouting-and-recon`, `insdustrial-inspection-and-photogrammetry`, `urban-flight-operations`, `events-and-live-broadcasting`, `real-estate`, `tours-360`) con su árbol `PageServices` completo. `npx ts-node prisma/seed-service-pages.ts`.
- `prisma/seed-legal-pages.ts` — **one-off idempotente**. Lee `front/translate/es.json` (`legal.terms` + `legal.privacy`) y crea las 2 páginas legales (`terms-and-conditions`, `privacy-policies`). `npx ts-node prisma/seed-legal-pages.ts`.
- Ambos seeds se dejaron en el repo (a diferencia del script de migración de contenido original) porque son re-ejecutables y sirven para restaurar si alguien borra una fila desde el dashboard.

### Credenciales / acceso

- **Admin dashboard**: `admin@joaobarres.dev` / `localadminpass123` (definido en `back/.env` como `ADMIN_EMAIL` / `ADMIN_PASSWORD`; correr `npm run prisma:seed` para (re)crearlo).
- DB real: Postgres remoto en `207.180.216.55:5434` (ver `DATABASE_URL` en `back/.env`). Ojo: **no** es una DB de prueba descartable, ya tiene contenido real migrado.
- `CORS_ORIGIN` incluye `localhost:3000` y la IP de LAN. Si cambia la IP de red, hay que agregarla ahí y reiniciar el backend (las env vars solo se leen al arrancar).

## Páginas de servicio completas (`isPage=true`)

Las 7 páginas de marketing que antes eran rutas estáticas hardcodeadas (`/services/<slug>/page.tsx` usando `<PageServices>` con props literales / i18n) **se migraron a la DB** y las carpetas estáticas se **borraron**. Ahora:

- Ruta dinámica `front/app/[locale]/(site)/services/[slug]/page.tsx` — hace `fetch` a `GET /services/slug/:slug`, y si `isPage && page` renderiza `<PageServices {...page} />`. Slug desconocido / no publicado → `notFound()` (404).
- El `page` JSON refleja 1:1 las props de `PageServices` (`app/utils/cards`): `D` (hero: `{imagen, label, title}`), `Content` (`[{label, subTitle, text[], list[]}]`), `keyword[]`, `keywordLink{}`, `galery[]` (`{video, imagen, label, ref}`), `P[]` (`{text, buttons[]}`), `CalltoAction[]` (`{callToAction, SubTitle, text[], text2[], buttons[], list[]}`), `Animations[]` (`{src}`), `Example[]` (`{label, subTitle, text[], buttons[], Galeria[]}`). Media = **claves de asset Cloudinary**, no URLs (`PageServices` arma `https://res.cloudinary.com/dzlavqhid/...`).
- Las 2 páginas que sacaban texto de `next-intl` (`location-scouting-and-recon`, `events-and-live-broadcasting`) se aplanaron a **literales en español** en el seed. El resto ya eran ES-only. Se pierde el EN del cuerpo de esas 2 (títulos/descripciones de tarjeta siguen bilingües).
- `/services` (la grilla) ahora se llena 100% desde la DB (filas `isPage`, ordenadas por `sortOrder`). Solo cae al array hardcodeado si la API no responde.

## Páginas legales (`legal_pages`)

Mismo patrón. Las 2 rutas estáticas (`/legal/terms-and-conditions`, `/legal/privacy-policies`) se migraron a la DB y se borraron las carpetas.

- Ruta dinámica `front/app/[locale]/(site)/legal/[slug]/page.tsx` → `GET /legal-pages/slug/:slug` → `<LegalPage>`.
- `LegalPage` (`app/utils/legalProps`) se endureció: tolera `section.text` como string suelto, `section.lists` no-array, y `list.items` undefined (antes tiraba `section.text.map is not a function` cuando le llegaba la forma vieja).
- Contenido en `content` (array de secciones), aplanado a ES en el seed.

## Dashboard (`front/app/[locale]/dashboard`)

Ruta: `/dashboard`. Protegido con login (JWT contra el backend), `noindex`. No está en el nav público a propósito. El **footer del sitio está oculto** en `/dashboard` (`app/component/footer/index.tsx` chequea `usePathname()`).

Tabs: **Estado** · **Mensajes** · **Proyectos** · **Equipo** · **Clientes** · **Servicios** · **Legal**.
(La tab **Categorías** se quitó del nav; `CategoriesPanel.tsx` sigue en el repo pero huérfano. La creación/edición/borrado de categorías ahora vive dentro del `CategoryPicker`.)

- **Todos los forms son modales** (`Modal.tsx` — shell compartido: overlay `z-50`, cierra con X / backdrop / Esc, bloquea scroll del body). Cada panel = lista de tarjetas + botón "Nuevo X" en el header que abre el modal.
- **Proyectos / Equipo / Clientes** — solo crear. Slug autogenerado (`slugify` del nombre/título).
- **Servicios** — crear **y editar** (botón lápiz en la tarjeta carga la fila en el modal → PATCH; el slug no cambia al editar). Sin `CategoryPicker` (categoría opcional). Checkbox "Página completa" revela campos SEO + `ServicePageEditor.tsx`: secciones en **acordeón** (Hero, Palabras resaltadas, Bloques de contenido + bullets, Galería principal, Párrafos con botones (P), Call to action, Ejemplos, Animaciones Lottie). `defaultOpen` = la sección arranca abierta si ya tiene contenido. Repeaters con add/remove; arrays de strings = textareas (1 ítem por línea); botones = `label | href` por línea.
- **Legal** (`LegalPanel.tsx`) — CRUD completo (crear/editar/eliminar/publicar). Editor de secciones: encabezado, párrafos (1/línea), sublistas (header + descripción + ítems).
- **`CategoryPicker`** — dentro de los forms de Proyectos y Clientes. Botonera `[select] [＋ nueva] [✎ editar] [🗑 eliminar]`: crear inline, renombrar (PATCH), borrar (DELETE, muestra el 409 del backend si está en uso).

Diseño: se sacó del lenguaje visual real del sitio — `font-mono` (Geist Mono) para títulos/labels uppercase, escala `honeydew-*` (`50`→`950`, la única paleta real; `text-customRed`/`gradient-text` son clases muertas, no las repliques), tarjetas anidadas con badges circulares de ícono, nav en pill glass (`bg-black/30 backdrop-blur`), animaciones `ScrollRevealEffect`/`ScrollBottonEffect` (framer-motion). En el `ServicePageEditor` los inputs/textareas usan `bg-honeydew-950 + border-white/15` para contraste sobre las cards `honeydew-900`.

## Páginas públicas conectadas a la DB

- `/portfolio` — agrupa por `Project.category`, ordenado por `sortOrder`. Endurecido: proyecto sin categoría (si se borrara una) cae en un grupo "Otros" en vez de crashear.
- `/teams` — lista `TeamMember`s publicados bajo el heading "El crew dron".
- `/clients` — agrupa por `Client.category`.
- `/services` — grilla principal desde DB (`isPage`); sección "Más servicios" con los `isPage=false`. Las 7 páginas completas viven en `/services/<slug>` (ruta dinámica).
- `/legal/<slug>` — ruta dinámica desde `legal_pages`.
- `/contact` — el form manda por EmailJS **y además** hace un POST best-effort a `/contact-messages` (fire-and-forget).

Todas leen del backend server-side (`fetch` en Server Components, `cache: 'no-store'`).

## Bugs / gotchas conocidos

1. **Turbopack recrea carpetas de ruta borradas** mientras `next dev` corre. Al borrar `services/<slug>/` o `legal/<slug>/`, el dev server las vuelve a escribir (versión vieja de git, que suele crashear) → en Next 16 dev **un módulo de ruta con error tira 500 en TODA la app**. Fix: apagar el dev server, borrar las carpetas + `rm -rf .next`, verificar con `find "app/[locale]/(site)/services" "app/[locale]/(site)/legal" -name page.tsx` (deben quedar solo los `[slug]/page.tsx`), y recién ahí `npm run dev`. `npm run dev` solo NO alcanza.
2. `front/app/[locale]/not-found.tsx` no puede quedar en 0 bytes (rompía 500 en todo). Ya está relleno.
3. `i18n/request.ts` envuelve `await requestLocale` en try/catch (Next 16 dev a veces tira `headers() called outside a request scope`).
4. `middleware.ts` → `proxy.ts` (convención Next 16).
5. Páginas de servidor `async` que hacen `fetch`: usar `getTranslations`/`getLocale` de `next-intl/server`, no los hooks de cliente.
6. `text-customRed` no existe en el tema — en el dashboard se usó `red-400`/`red-500` de Tailwind. No se tocó en el resto del sitio.

## Contenido en la DB

- **13 proyectos**, **7 clientes**, **2 team members** (migrados en una sesión anterior).
- **Categorías**: 7 de PROJECT (Bodas, XV años, Eventos, Inmobiliaria, Inspección, Tours 360, Producción) + 4 de CLIENT (Grandes Marcas, Documentales, Televisión, Gobierno). Sin categorías de SERVICE (ya no hacen falta, `Service.categoryId` es opcional).
  - Nota: durante pruebas se borró y recreó "Bodas" (id nuevo, 0 proyectos asociados) y se eliminó una categoría basura llamada "p".
- **7 páginas de servicio** (`isPage=true`) — seedeadas desde `seed-service-pages.ts`.
- **2 páginas legales** — seedeadas desde `seed-legal-pages.ts`. (Si `/legal/privacy-policies` da 404, alguien la borró desde el dashboard; re-correr el seed.)

## Lo que falta / posibles próximos pasos

- Nunca se probó `docker compose up` de verdad.
- El footer aún linkea "Política de Privacidad" a `/construction` (no a `/legal/privacy-policies`) — revisar `app/component/footer`.
- Editar páginas legales / de servicio cambia el contenido pero **no el slug** (a propósito, para no romper URLs).
- `TeamMember.role` sigue siendo texto libre.
- `CategoriesPanel.tsx` quedó huérfano — borrar o re-conectar.
