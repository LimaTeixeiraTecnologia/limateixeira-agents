#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
DEPLOYMENT_DIR=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
COMPOSE_FILE="$DEPLOYMENT_DIR/docker-compose.yml"
ENV_FILE="$DEPLOYMENT_DIR/.env"
BACKUP_DIR="$DEPLOYMENT_DIR/backups"

mkdir -p "$BACKUP_DIR"

if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  . "$ENV_FILE"
  set +a
fi

OUTPUT_FILE=${1:-"$BACKUP_DIR/agents-$(date +%Y%m%d-%H%M%S).dump"}

docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T postgres \
  pg_dump \
  -U "${POSTGRES_USER:-agents}" \
  -d "${POSTGRES_DB:-agents}" \
  -n agents \
  -Fc >"$OUTPUT_FILE"

echo "backup criado em $OUTPUT_FILE"
