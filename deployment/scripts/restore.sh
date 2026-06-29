#!/bin/sh
set -eu

if [ "$#" -ne 1 ]; then
  echo "uso: $0 <arquivo.dump>" >&2
  exit 1
fi

DUMP_FILE=$1

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
DEPLOYMENT_DIR=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
COMPOSE_FILE="$DEPLOYMENT_DIR/docker-compose.yml"
ENV_FILE="$DEPLOYMENT_DIR/.env"

if [ ! -f "$DUMP_FILE" ]; then
  echo "dump nao encontrado: $DUMP_FILE" >&2
  exit 1
fi

if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  . "$ENV_FILE"
  set +a
fi

docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T postgres \
  psql -U "${POSTGRES_USER:-agents}" -d "${POSTGRES_DB:-agents}" \
  -c "DROP SCHEMA IF EXISTS agents CASCADE; CREATE SCHEMA agents AUTHORIZATION \"${POSTGRES_USER:-agents}\";"

cat "$DUMP_FILE" | docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T postgres \
  pg_restore \
  -U "${POSTGRES_USER:-agents}" \
  -d "${POSTGRES_DB:-agents}" \
  --clean \
  --if-exists \
  --no-owner \
  --schema=agents

echo "restore concluido de $DUMP_FILE"
