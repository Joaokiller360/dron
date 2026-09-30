# JB.SKYLENS backend

API del sitio JB.SKYLENS dividida en **microservicios** NestJS (monorepo Nest: un `package.json`, varias apps). Cada servicio tiene su proceso, su deploy, su esquema de Postgres y su rol de DB; si uno cae, los demás siguen.

| Tecnología | Versión | Uso |
|---|---|---|
| Node.js | 20.x | Runtime |
| NestJS | 10.x | Framework (monorepo, build con webpack) |
| TypeScript | 5.x | Lenguaje |
| PostgreSQL | 16.x | Base de datos (un schema por servicio) |
| Prisma | 5.x | ORM (un client por servicio) |
| JWT + bcrypt | — | Autenticación |
| Swagger/OpenAPI | 7.x | Documentación (`/api/docs/<servicio>`) |
| Docker | — | Un Dockerfile para todos (`--build-arg APP=…`) |

## Servicios

```
                       ┌─ /api/auth/*                          → auth     (schema auth)
Cloudflare → gateway ──┼─ /api/products|orders|store/*,
  (único público)      │  /api/reorder/products                → store    (schema store)
                       ├─ /api/uploads/*                       → media    (sin DB; S3 + ClamAV)
                       ├─ /api/events  (SSE)                   → events   (sin DB)
                       ├─ /api/health  (lo responde el gateway: salud de todos)
                       └─ /api/* resto                         → content  (schema content)
```

| Servicio | Qué tiene | Tablas | Puerto local |
|---|---|---|---|
| `gateway` | Proxy node:http. Enruta, bloquea `/api/internal/*`, agrega `/api/health` | — | 8080 |
| `auth` | login, refresh-token (cookie), cambio de contraseña, admins | `admin_users`, `refresh_tokens` | 3001 |
| `content` | categorías, proyectos, equipo, clientes, servicios, páginas legales, testimonios, lugares, promociones, ajustes de contacto, mensajes de contacto, reorder, stats | resto + `site_settings` (`contact`, `promotions`) | 3002 |
| `store` | productos, pedidos, PayPal, transferencias, correos de la tienda, tareas en segundo plano | `products`, `orders`, `site_settings` (`store`) | 3003 |
| `media` | subidas del dashboard (presign S3 → escaneo ClamAV → publicar) | — | 3004 |
| `events` | stream SSE "algo cambió" para el sitio y el dashboard | — | 3005 |

La API pública no cambió: el front sigue usando `NEXT_PUBLIC_API_URL=https://apidron.joaobarres.dev/api` (ahora apunta al gateway) y la cookie de refresh sigue en `/api/auth`.

### Cómo se hablan entre sí

Rutas `/api/internal/*` protegidas con el header `x-internal-token` (= `INTERNAL_TOKEN`, igual en todos). El gateway nunca las deja pasar y sin token responden 404.

| Quién → a quién | Ruta | Si falla |
|---|---|---|
| content/store/media → auth | `GET internal/sessions/:userId` (valida el JWT del admin; caché 30 s) | rutas admin → 503; públicas siguen |
| store → content | `GET internal/content/store-discounts` | checkout → 503 (nunca cobra otro precio); catálogo se ve sin descuento |
| store → content | `GET internal/content/contact` (caché 5 min) | usa el último valor o el default |
| content → store | `GET internal/store/stats` | tarjetas de tienda en el dashboard muestran "–" |
| content/store → events | `POST internal/events` (fire-and-forget) | el sitio no se refresca solo hasta el próximo cambio |

## Estructura

```
back/
├── apps/
│   ├── gateway/src/          # main.ts (proxy) + routes.ts (tabla de rutas)
│   ├── auth/    src/ prisma/ # schema.prisma, migrations/, seed.ts, set-admin-password.js
│   ├── content/ src/ prisma/ # schema.prisma, migrations/, seed-*.ts
│   ├── store/   src/ prisma/
│   ├── media/   src/
│   └── events/  src/
├── libs/common/src/          # @app/common: bootstrap, CoreModule, config, filtros, guardas,
│                             # auth/ (JwtAuthGuard, RemoteJwtStrategy), internal/ (cliente + guard),
│                             # events/ (ChangePublisher + interceptor), store-discounts
├── db/                       # split-schemas.sql / unsplit-schemas.sql / create-roles.sql
├── Dockerfile                # ARG APP
└── docker-compose.yml        # postgres + clamav + los 6 servicios
```

Cada servicio con DB genera su client en `node_modules/@jbskylens/prisma-<servicio>` y lo importa desde ahí (no `@prisma/client`).

## Correr en local (sin Docker)

```bash
npm install
npm run prisma:generate
```

Variables comunes en `.env` (`JWT_SECRET`, `INTERNAL_TOKEN`, `API_PREFIX`, `CORS_ORIGIN`, `AUTH_URL`, `CONTENT_URL`, `STORE_URL`, `MEDIA_URL`, `EVENTS_URL`, `RESEND_*`…). Lo propio de cada servicio en `.env.<servicio>` (gana sobre `.env`):

```bash
# .env
INTERNAL_TOKEN=<openssl rand -base64 48>
AUTH_URL=http://localhost:3001/api
CONTENT_URL=http://localhost:3002/api
STORE_URL=http://localhost:3003/api
MEDIA_URL=http://localhost:3004/api
EVENTS_URL=http://localhost:3005/api

# .env.auth
PORT=3001
DATABASE_URL=postgresql://svc_auth:<pwd>@localhost:5432/jbskylens?schema=auth
# .env.content → PORT=3002 + svc_content ?schema=content   ·   .env.store → PORT=3003 + svc_store ?schema=store
# .env.media   → PORT=3004 + S3_*/CLAMAV_*                  ·   .env.events → PORT=3005
# .env.gateway → PORT=8080
```

DB nueva: `psql … -v auth_password=… -v content_password=… -v store_password=… -f db/create-roles.sql`, luego `npm run prisma:migrate:auth` (y `:content`, `:store`) y `npm run prisma:seed`.

Arrancar cada uno en su terminal: `npm run start:auth`, `start:content`, `start:store`, `start:media`, `start:events`, `start:gateway`. El front apunta a `http://localhost:8080/api`.

- Salud de todo: `GET http://localhost:8080/api/health`
- Swagger: `http://localhost:8080/api/docs/<servicio>`
- Tests: `npm test` · Build: `npm run build` (o `build:<servicio>`)

## Correr todo con Docker

```bash
POSTGRES_PASSWORD=… JWT_SECRET=… INTERNAL_TOKEN=… \
AUTH_DB_PASSWORD=… CONTENT_DB_PASSWORD=… STORE_DB_PASSWORD=… \
docker compose up -d --build
```

El primer arranque de Postgres crea los roles/schemas (`db/compose-init.sh`) y cada servicio corre sus migraciones al arrancar. Admin inicial: `docker compose exec auth node prisma/set-admin-password.js`.

## Deploy en Dokploy (desde el monolito)

Hoy corre el monolito (`jbskylens-backdron-uiceke`, rama `remaster`). Pasos para pasar a microservicios:

1. **Backup**: `pg_dump` completo de la DB de producción.
2. **Crear 6 apps** en Dokploy, todas con: Build Path `/`, Docker File `back/Dockerfile`, Docker Context Path `back`, rama `microservices`, Build arg `APP=<servicio>`, env `PORT=3000`. Solo `gateway` lleva dominio (Container Port **3000**).
3. **Env por app** (secretos solo en Dokploy):
   - todas: `INTERNAL_TOKEN` (mismo valor), `API_PREFIX`, `CORS_ORIGIN`, `CLIENT_IP_HEADER=cf-connecting-ip`, `AUTH_URL`/`CONTENT_URL`/`STORE_URL`/`MEDIA_URL`/`EVENTS_URL` = `http://<App Name de Dokploy>:3000/api`
   - `auth`, `content`, `store`, `media`: `JWT_SECRET` (el mismo de hoy)
   - `auth`: `DATABASE_URL=postgresql://svc_auth:<pwd>@jbskylens-jbskylensdb-umndpt:5432/<db>?schema=auth`, `JWT_EXPIRES_IN`, `JWT_REFRESH_TTL_DAYS`, `JWT_SESSION_MAX_DAYS`
   - `content`: `DATABASE_URL` con `svc_content` y `?schema=content`, `RESEND_*`
   - `store`: `DATABASE_URL` con `svc_store` y `?schema=store`, `RESEND_*`, `PAYPAL_*`
   - `media`: `S3_*`, `CLAMAV_HOST=jbskylens-clamav-tacezq`
4. **Ventana corta**: parar el monolito → `db/split-schemas.sql` (con las 3 contraseñas nuevas) → deploy de auth, content, store, media, events → deploy de gateway → mover el dominio `apidron.joaobarres.dev` al gateway (puerto 3000).
5. **PayPal webhook**: la URL no cambia (`/api/orders/paypal/webhook` pasa por el gateway a store).
6. **Rollback**: parar servicios → `db/unsplit-schemas.sql` → dominio de vuelta al monolito.

RAM extra aprox.: 5 procesos Node × 80–120 MB.
