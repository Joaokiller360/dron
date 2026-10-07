#!/bin/sh
# Container entrypoint: apply this service's migrations (if it has a database), then run it.
set -e

if [ -f prisma/schema.prisma ]; then
  # Each service owns one Postgres schema through its own role (db/split-schemas.sql).
  # Migrating with any other URL (the admin user, no ?schema=) would run this
  # service's 0_init against the monolith's "public" schema and leave a failed
  # row in its _prisma_migrations, which stops the monolith from booting (P3009).
  case "$DATABASE_URL" in
    *"://svc_${APP}:"*) ;;
    *)
      echo "Refusing to migrate: DATABASE_URL must log in as svc_${APP} (postgresql://svc_${APP}:<password>@<host>:5432/<db>?schema=${APP})" >&2
      exit 1
      ;;
  esac
  case "$DATABASE_URL" in
    *"?schema=${APP}" | *"?schema=${APP}&"* | *"&schema=${APP}" | *"&schema=${APP}&"*) ;;
    *)
      echo "Refusing to migrate: DATABASE_URL must select its own schema with ?schema=${APP}" >&2
      exit 1
      ;;
  esac
  npx prisma migrate deploy --schema prisma/schema.prisma
fi

# exec: node replaces the shell as PID 1 so it receives SIGTERM on redeploys
exec node dist/main
