#!/bin/sh
set -e
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  alter role authenticator with password '${AUTHENTICATOR_PASSWORD}';
EOSQL
