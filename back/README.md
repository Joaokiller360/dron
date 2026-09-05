# JB.SKYLENS backend (PostgREST)

Postgres + PostgREST, exposing two tables from `db/schema.sql`:

- `api.contact_messages` — mirrors the fields in `front/app/[locale]/(site)/contact/ContactClient.tsx` (name, phone, email, message). Insert-only via the `web_anon`/`web_contact` role; only `web_admin` (authenticated) can read/update.
- `api.projects` — portfolio/gallery items, meant to replace the static entries currently hardcoded in `front/translate/es.json` / `en.json` under `portfolio` and `home.gallery`. Public read of published rows; `web_admin` manages writes.

## Local run

```bash
cp .env.example .env   # fill in real passwords/secret
docker compose up -d
```

PostgREST will be at `http://localhost:3001`. Try:

```bash
curl http://localhost:3001/projects
curl -X POST http://localhost:3001/contact_messages \
  -H "Content-Type: application/json" \
  -d '{"name":"Joao","phone":"0987654321","email":"a@b.com","message":"hola"}'
```

The anon role can only insert into `contact_messages` and read `projects` where `published = true` (enforced by RLS policies in `schema.sql`). Reading/managing everything else requires a JWT with `role: web_admin`, signed with `PGRST_JWT_SECRET`.

## What's needed to deploy this for real

1. **A host to run two long-lived processes**: Postgres and PostgREST. Options, cheapest/simplest first:
   - A single VPS (e.g. a $6/mo box) running this `docker-compose.yml` directly — least moving parts.
   - Managed Postgres (Supabase, Neon, Railway Postgres, RDS) + PostgREST run separately as a container (Railway, Fly.io, Render) pointed at that DB via `PGRST_DB_URI`.
   - Supabase specifically already *is* Postgres+PostgREST — if you go that route you don't need this compose file at all, just apply `schema.sql` to their SQL editor.
2. **TLS + a domain** in front of PostgREST (it only speaks plain HTTP). A reverse proxy (Caddy/nginx/Traefik) or the platform's built-in HTTPS (Railway/Fly/Render all do this for you).
3. **Real secrets**: strong `POSTGRES_PASSWORD`, `AUTHENTICATOR_PASSWORD`, and a `PGRST_JWT_SECRET` (32+ random bytes) — never the placeholders in `.env.example`. These must NOT go in the git repo.
4. **A way to issue JWTs** for the `web_admin` role if you want an admin panel to manage `projects`/read `contact_messages` — e.g. a tiny login endpoint (could live in `front/` as a Next.js API route) that checks a password and signs a JWT with `{"role": "web_admin"}` using `PGRST_JWT_SECRET`.
5. **Point the contact form at it**: swap (or complement) the EmailJS call in `front/app/hooks/from-email/index.tsx` for a `fetch('POST /contact_messages')` against the deployed PostgREST URL, using the anon key/role — no JWT needed for that one since it's insert-only.
6. **Backups** for the Postgres volume (`pgdata`) if you self-host — managed Postgres providers handle this for you.
7. **CORS**: if the front and PostgREST are on different domains, set `PGRST_SERVER_CORS_ALLOWED_ORIGINS` (or handle CORS at the reverse proxy) to the front's origin.

Tell me which hosting route you want (VPS+compose, or managed Postgres + separate PostgREST container, or Supabase) and I'll wire the actual deploy config next.
