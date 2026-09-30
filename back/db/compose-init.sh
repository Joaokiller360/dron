#!/bin/sh
# Runs once when the docker-compose Postgres volume is created (docker-entrypoint-initdb.d)
set -e
psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  -v auth_password="$AUTH_DB_PASSWORD" \
  -v content_password="$CONTENT_DB_PASSWORD" \
  -v store_password="$STORE_DB_PASSWORD" \
  -f /db/create-roles.sql
