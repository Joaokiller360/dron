-- Fresh database (no monolith data to move): one schema and one login role per
-- service; each service's `prisma migrate deploy` then creates its tables.
-- For an existing monolith database use db/split-schemas.sql instead.
--
--   psql "$ADMIN_DATABASE_URL" -v ON_ERROR_STOP=1 \
--     -v auth_password=… -v content_password=… -v store_password=… \
--     -f db/create-roles.sql

BEGIN;
CREATE ROLE svc_auth LOGIN PASSWORD :'auth_password';
CREATE ROLE svc_content LOGIN PASSWORD :'content_password';
CREATE ROLE svc_store LOGIN PASSWORD :'store_password';
CREATE SCHEMA auth AUTHORIZATION svc_auth;
CREATE SCHEMA content AUTHORIZATION svc_content;
CREATE SCHEMA store AUTHORIZATION svc_store;
COMMIT;
