-- One-time move from the monolith database (every table in "public") to one
-- schema and one login role per service. Keeps every row; run it once, as the
-- database superuser, with the API stopped, right before starting the services.
--
--   psql "$ADMIN_DATABASE_URL" -v ON_ERROR_STOP=1 \
--     -v auth_password="$AUTH_DB_PASSWORD" \
--     -v content_password="$CONTENT_DB_PASSWORD" \
--     -v store_password="$STORE_DB_PASSWORD" \
--     -f db/split-schemas.sql
--
-- (in Dokploy: `docker exec -i <postgres container> psql -U <user> -d <db> -v ON_ERROR_STOP=1 -v … < db/split-schemas.sql`)
--
-- Afterwards each service connects as its own role:
--   DATABASE_URL=postgresql://svc_auth:<pwd>@<host>:5432/<db>?schema=auth     (content, store alike)
-- and can't read another service's tables (no USAGE on the other schemas).
--
-- Undo: db/unsplit-schemas.sql

\if :{?auth_password}
\else
  \echo 'Missing -v auth_password=…'
  \quit
\endif
\if :{?content_password}
\else
  \echo 'Missing -v content_password=…'
  \quit
\endif
\if :{?store_password}
\else
  \echo 'Missing -v store_password=…'
  \quit
\endif

BEGIN;

-- The monolith must be fully migrated (its last migration is 20260928090000_refresh_tokens)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public._prisma_migrations
    WHERE migration_name = '20260928090000_refresh_tokens' AND finished_at IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Monolith migrations are not up to date; deploy the last monolith version first';
  END IF;
END $$;

CREATE ROLE svc_auth LOGIN PASSWORD :'auth_password';
CREATE ROLE svc_content LOGIN PASSWORD :'content_password';
CREATE ROLE svc_store LOGIN PASSWORD :'store_password';

CREATE SCHEMA auth AUTHORIZATION svc_auth;
CREATE SCHEMA content AUTHORIZATION svc_content;
CREATE SCHEMA store AUTHORIZATION svc_store;

-- ── auth ──────────────────────────────────────────────────────────────────
ALTER TABLE public.admin_users SET SCHEMA auth;
ALTER TABLE public.refresh_tokens SET SCHEMA auth;

-- ── content ───────────────────────────────────────────────────────────────
ALTER TYPE public."ContactStatus" SET SCHEMA content;
ALTER TYPE public."CategoryType" SET SCHEMA content;
ALTER TABLE public.categories SET SCHEMA content;
ALTER TABLE public.contact_messages SET SCHEMA content;
ALTER TABLE public.projects SET SCHEMA content;
ALTER TABLE public.team_members SET SCHEMA content;
ALTER TABLE public.clients SET SCHEMA content;
ALTER TABLE public.services SET SCHEMA content;
ALTER TABLE public.legal_pages SET SCHEMA content;
ALTER TABLE public.promotions SET SCHEMA content;
ALTER TABLE public.site_settings SET SCHEMA content;
ALTER TABLE public.testimonials SET SCHEMA content;
ALTER TABLE public.venues SET SCHEMA content;

-- ── store ─────────────────────────────────────────────────────────────────
ALTER TYPE public."PaymentMethod" SET SCHEMA store;
ALTER TYPE public."OrderStatus" SET SCHEMA store;
ALTER TABLE public.products SET SCHEMA store;
ALTER TABLE public.orders SET SCHEMA store;
-- The store's switches/payments/shipping row moves to the store's own settings table
CREATE TABLE store.site_settings (
  "key" TEXT NOT NULL,
  "value" JSONB NOT NULL,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "site_settings_pkey" PRIMARY KEY ("key")
);
INSERT INTO store.site_settings SELECT "key", "value", "updated_at" FROM content.site_settings WHERE "key" = 'store';
DELETE FROM content.site_settings WHERE "key" = 'store';

-- ── ownership: each role owns (and may migrate) only its schema ───────────
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT n.nspname, c.relname
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname IN ('auth', 'content', 'store') AND c.relkind = 'r'
  LOOP
    EXECUTE format('ALTER TABLE %I.%I OWNER TO %I', r.nspname, r.relname, 'svc_' || r.nspname);
  END LOOP;
  FOR r IN
    SELECT n.nspname, t.typname
    FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname IN ('auth', 'content', 'store') AND t.typtype = 'e'
  LOOP
    EXECUTE format('ALTER TYPE %I.%I OWNER TO %I', r.nspname, r.typname, 'svc_' || r.nspname);
  END LOOP;
END $$;

-- ── migration history: each service starts from its 0_init baseline ──────
-- Checksums are the SHA-256 of apps/<service>/prisma/migrations/0_init/migration.sql
-- (checked by db/split-schemas.spec.ts), so `prisma migrate deploy` sees it applied.
CREATE TABLE auth._prisma_migrations (
  "id" VARCHAR(36) PRIMARY KEY NOT NULL,
  "checksum" VARCHAR(64) NOT NULL,
  "finished_at" TIMESTAMPTZ,
  "migration_name" VARCHAR(255) NOT NULL,
  "logs" TEXT,
  "rolled_back_at" TIMESTAMPTZ,
  "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "applied_steps_count" INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE content._prisma_migrations (LIKE auth._prisma_migrations INCLUDING ALL);
CREATE TABLE store._prisma_migrations (LIKE auth._prisma_migrations INCLUDING ALL);
ALTER TABLE auth._prisma_migrations OWNER TO svc_auth;
ALTER TABLE content._prisma_migrations OWNER TO svc_content;
ALTER TABLE store._prisma_migrations OWNER TO svc_store;

INSERT INTO auth._prisma_migrations (id, checksum, finished_at, migration_name, applied_steps_count)
VALUES (gen_random_uuid()::text, '5b3e0ff0cea8d800e40af8b84e51f0b65b5a51b50e49eef1d22fa488acf557a7', now(), '0_init', 1);
INSERT INTO content._prisma_migrations (id, checksum, finished_at, migration_name, applied_steps_count)
VALUES (gen_random_uuid()::text, '5019a6ecc3cbc5e9a786d59a96f818814339ebdae33de80ca483af331df96eb9', now(), '0_init', 1);
INSERT INTO store._prisma_migrations (id, checksum, finished_at, migration_name, applied_steps_count)
VALUES (gen_random_uuid()::text, '762019e146b6dc3364403744fabe137b3beda015f1c7688b04664920542ad9b8', now(), '0_init', 1);

COMMIT;

\echo 'Done: schemas auth, content, store with roles svc_auth, svc_content, svc_store'
