# JB.SKYLENS backend

NestJS API backing the JB.SKYLENS site.

| Tecnología | Versión | Uso |
|---|---|---|
| Node.js | 20.x | Runtime |
| NestJS | 10.x | Framework principal |
| TypeScript | 5.x | Lenguaje |
| PostgreSQL | 16.x | Base de datos |
| Prisma | 5.x | ORM |
| JWT | — | Autenticación |
| Bcrypt | — | Hash de contraseñas |
| Swagger/OpenAPI | 7.x | Documentación |
| Docker | — | Contenedores |
| Winston | — | Logging |

## Estructura

```
back/
├── src/
│   ├── auth/            # login (JWT), guard, estrategia passport-jwt
│   ├── users/           # AdminUser lookups usados por auth
│   ├── contact/         # POST público (form de contacto) + CRUD admin
│   ├── projects/        # portfolio/galería: lectura pública + CRUD admin
│   ├── health/          # GET /api/health (ping a la DB)
│   ├── prisma/          # PrismaService/PrismaModule (@Global)
│   ├── common/          # filtro de excepciones, interceptor de logging, winston
│   ├── config/          # configuration.ts + validación de env (class-validator)
│   ├── app.module.ts
│   └── main.ts          # helmet, CORS, ValidationPipe, Swagger en /api/docs
├── prisma/
│   ├── schema.prisma    # AdminUser, ContactMessage, Project
│   └── seed.ts          # crea el admin inicial desde ADMIN_EMAIL/ADMIN_PASSWORD
├── Dockerfile
├── docker-compose.yml   # postgres + api
└── .env.example
```

## Modelo de datos

- **AdminUser** — cuentas de staff para el panel admin (email + passwordHash con bcrypt).
- **ContactMessage** — mismos campos que el form en `front/app/[locale]/(site)/contact/ContactClient.tsx` (name, phone, email, message) + status (new/read/archived).
- **Project** — reemplaza el contenido estático de portfolio/galería en `front/translate/{es,en}.json`: slug, category, title/description es+en, coverUrl, mediaUrls[], published, sortOrder.

## Correr en local

```bash
cp .env.example .env        # completa DATABASE_URL, JWT_SECRET, etc.
npm install
npm run prisma:migrate:dev  # crea las tablas
npm run prisma:seed         # crea el admin (ADMIN_EMAIL/ADMIN_PASSWORD del .env)
npm run start:dev
```

- API: `http://localhost:3001/api`
- Swagger: `http://localhost:3001/api/docs`
- Health: `http://localhost:3001/api/health`

Necesitas un Postgres corriendo; el más rápido es `docker compose up -d db` (usa el mismo `.env`).

## Correr todo con Docker

```bash
cp .env.example .env
docker compose up -d --build
```

Esto levanta Postgres + la API (corre `prisma migrate deploy` al arrancar). Falta correr el seed del admin una vez:

```bash
docker compose exec api npm run prisma:seed
```

## Endpoints principales

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/auth/login` | — | Login admin, devuelve JWT |
| GET | `/api/auth/me` | Bearer | Usuario autenticado actual |
| POST | `/api/contact-messages` | — | Público: enviar form de contacto (rate-limited) |
| GET | `/api/contact-messages` | Bearer | Admin: listar mensajes |
| PATCH | `/api/contact-messages/:id/status` | Bearer | Admin: marcar new/read/archived |
| GET | `/api/projects` | — | Público: proyectos publicados |
| GET | `/api/projects/admin` | Bearer | Admin: todos los proyectos |
| POST/PATCH/DELETE | `/api/projects[...]` | Bearer | Admin: CRUD de proyectos |
| GET | `/api/health` | — | Liveness/readiness |

## Qué falta para desplegar

1. **Host** que corra Docker (VPS, Railway, Render, Fly.io) — usa `docker-compose.yml` como base, o separa Postgres administrado (Neon/Supabase/RDS) de la API.
2. **Secrets reales**: `POSTGRES_PASSWORD`, `JWT_SECRET` (32+ bytes random), `ADMIN_PASSWORD` — nunca los del `.env.example`, y nunca commiteados.
3. **TLS + dominio** delante de la API (Nest sirve HTTP plano); usa el proxy/HTTPS del proveedor o Caddy/nginx.
4. **CORS_ORIGIN** apuntando al dominio real del front (`front/`), no `*`, una vez en producción.
5. **Conectar el front**: reemplazar la llamada a EmailJS en `front/app/hooks/from-email/index.tsx` por un `fetch('POST', '${API_URL}/api/contact-messages')`.
6. **Backups** del volumen `pgdata` si el Postgres es autogestionado.
