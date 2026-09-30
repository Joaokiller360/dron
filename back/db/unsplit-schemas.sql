-- Rollback of db/split-schemas.sql: every table back to "public", the store's
-- settings row back into public.site_settings, service schemas and roles gone.
-- Only for going back to the monolith (branch remaster); keeps every row,
-- including orders placed while the microservices ran. Stop the services first.
--
--   psql "$ADMIN_DATABASE_URL" -v ON_ERROR_STOP=1 -f db/unsplit-schemas.sql
--
-- Refuses to run if a service added migrations after 0_init: those changes
-- would not exist in the monolith's schema.

BEGIN;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM auth._prisma_migrations WHERE migration_name <> '0_init')
    OR EXISTS (SELECT 1 FROM content._prisma_migrations WHERE migration_name <> '0_init')
    OR EXISTS (SELECT 1 FROM store._prisma_migrations WHERE migration_name <> '0_init') THEN
    RAISE EXCEPTION 'A service has migrations after 0_init; undo them by hand before going back to the monolith';
  END IF;
END $$;

-- ── store ─────────────────────────────────────────────────────────────────
INSERT INTO content.site_settings ("key", "value", "updated_at")
SELECT "key", "value", "updated_at" FROM store.site_settings
ON CONFLICT ("key") DO UPDATE SET "value" = EXCLUDED."value", "updated_at" = EXCLUDED."updated_at";
DROP TABLE store.site_settings;
ALTER TABLE store.products SET SCHEMA public;
ALTER TABLE store.orders SET SCHEMA public;
ALTER TYPE store."PaymentMethod" SET SCHEMA public;
ALTER TYPE store."OrderStatus" SET SCHEMA public;

-- ── content ───────────────────────────────────────────────────────────────
ALTER TABLE content.categories SET SCHEMA public;
ALTER TABLE content.contact_messages SET SCHEMA public;
ALTER TABLE content.projects SET SCHEMA public;
ALTER TABLE content.team_members SET SCHEMA public;
ALTER TABLE content.clients SET SCHEMA public;
ALTER TABLE content.services SET SCHEMA public;
ALTER TABLE content.legal_pages SET SCHEMA public;
ALTER TABLE content.promotions SET SCHEMA public;
ALTER TABLE content.site_settings SET SCHEMA public;
ALTER TABLE content.testimonials SET SCHEMA public;
ALTER TABLE content.venues SET SCHEMA public;
ALTER TYPE content."ContactStatus" SET SCHEMA public;
ALTER TYPE content."CategoryType" SET SCHEMA public;

-- ── auth ──────────────────────────────────────────────────────────────────
ALTER TABLE auth.admin_users SET SCHEMA public;
ALTER TABLE auth.refresh_tokens SET SCHEMA public;

-- ── ownership back to whoever runs this (the monolith's user) ─────────────
REASSIGN OWNED BY svc_auth, svc_content, svc_store TO CURRENT_USER;
DROP SCHEMA auth CASCADE;
DROP SCHEMA content CASCADE;
DROP SCHEMA store CASCADE;
DROP OWNED BY svc_auth, svc_content, svc_store;
DROP ROLE svc_auth;
DROP ROLE svc_content;
DROP ROLE svc_store;

COMMIT;

\echo 'Done: back to the monolith layout (everything in public)'
