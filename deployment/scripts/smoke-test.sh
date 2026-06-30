#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
DEPLOYMENT_DIR=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
COMPOSE_FILE="$DEPLOYMENT_DIR/docker-compose.yml"
ENV_FILE="$DEPLOYMENT_DIR/.env"
SECRETS_DIR="$DEPLOYMENT_DIR/.secrets"

if [ ! -f "$ENV_FILE" ]; then
  echo "arquivo ausente: $ENV_FILE" >&2
  exit 1
fi

if [ ! -d "$SECRETS_DIR" ]; then
  echo "diretorio ausente: $SECRETS_DIR" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
. "$ENV_FILE"
set +a

APP_HOST=${APP_HOST:-mastra.localhost}
TRAEFIK_HTTP_PORT=${TRAEFIK_HTTP_PORT:-80}
POSTGRES_DB=${POSTGRES_DB:-agents}
POSTGRES_USER=${POSTGRES_USER:-agents}
TELEGRAM_ENABLED=${TELEGRAM_ENABLED:-false}
TELEGRAM_PUBLIC_BASE_URL=${TELEGRAM_PUBLIC_BASE_URL:-}

BASIC_AUTH_USER=$(tr -d '\r\n' <"$SECRETS_DIR/traefik_username")
BASIC_AUTH_PASSWORD=$(tr -d '\r\n' <"$SECRETS_DIR/traefik_password")
TELEGRAM_BOT_TOKEN=$(tr -d '\r\n' <"$SECRETS_DIR/telegram_bot_token")
TELEGRAM_WEBHOOK_PATH_KEY=$(tr -d '\r\n' <"$SECRETS_DIR/telegram_webhook_path_key")
TELEGRAM_WEBHOOK_SECRET_TOKEN=$(tr -d '\r\n' <"$SECRETS_DIR/telegram_webhook_secret_token")

if [ "$TELEGRAM_ENABLED" != "true" ] && [ "$TELEGRAM_ENABLED" != "1" ]; then
  echo "TELEGRAM_ENABLED precisa estar true para o smoke do adapter Telegram" >&2
  exit 1
fi

if [ -z "$TELEGRAM_PUBLIC_BASE_URL" ]; then
  echo "TELEGRAM_PUBLIC_BASE_URL precisa estar configurada no deployment/.env" >&2
  exit 1
fi

wait_for_health() {
  service=$1
  retries=${2:-30}

  while [ "$retries" -gt 0 ]; do
    container_id=$(docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps -q "$service")
    if [ -n "$container_id" ]; then
      status=$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$container_id")
      if [ "$status" = "healthy" ] || [ "$status" = "running" ]; then
        return 0
      fi
    fi
    retries=$((retries - 1))
    sleep 2
  done

  echo "servico $service nao ficou saudavel" >&2
  exit 1
}

THREAD_ID="smoke-thread-$(date +%s)"
RESOURCE_ID="smoke-resource-$(date +%s)"
UPDATE_ID=$(date +%s)

docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --build

wait_for_health postgres
wait_for_health agents

curl -fsS \
  -u "$BASIC_AUTH_USER:$BASIC_AUTH_PASSWORD" \
  -H "Host: $APP_HOST" \
  "http://127.0.0.1:$TRAEFIK_HTTP_PORT/" >/dev/null

HEALTH_STATUS=$(curl -s -o /tmp/telegram-health.json -w '%{http_code}' \
  -u "$BASIC_AUTH_USER:$BASIC_AUTH_PASSWORD" \
  -H "Host: $APP_HOST" \
  "http://127.0.0.1:$TRAEFIK_HTTP_PORT/telegram/health")

if [ "$HEALTH_STATUS" -ne 503 ]; then
  echo "falha: health do telegram deveria sinalizar bloqueio de go-live local com 503" >&2
  exit 1
fi

if ! grep -q 'telegram_user_id real dos dois usuários iniciais ainda não provisionado' /tmp/telegram-health.json; then
  echo "falha: health do telegram nao expôs o bloqueio esperado de go-live" >&2
  exit 1
fi

WEBHOOK_STATUS=$(curl -s -o /tmp/telegram-webhook.json -w '%{http_code}' \
  -H "Host: $APP_HOST" \
  -H 'Content-Type: application/json' \
  -H "X-Telegram-Bot-Api-Secret-Token: $TELEGRAM_WEBHOOK_SECRET_TOKEN" \
  -d "{\"update_id\":$UPDATE_ID,\"message\":{\"message_id\":1,\"from\":{\"id\":123456789,\"username\":\"intruso\"},\"chat\":{\"id\":123456789,\"type\":\"private\"},\"text\":\"/help\"}}" \
  "http://127.0.0.1:$TRAEFIK_HTTP_PORT/telegram/webhook/$TELEGRAM_WEBHOOK_PATH_KEY")

if [ "$WEBHOOK_STATUS" -ne 200 ]; then
  echo "falha: webhook telegram deveria estar público e responder 200 ao payload sintético" >&2
  exit 1
fi

if ! grep -q '"reason":"telegram_user_not_allowed"' /tmp/telegram-webhook.json; then
  echo "falha: webhook telegram nao retornou deny controlado da allowlist" >&2
  exit 1
fi

EVENT_STATUS=$(docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T postgres \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Atc "SELECT status FROM agents.telegram_webhook_events WHERE update_id = $UPDATE_ID;")

if [ "$EVENT_STATUS" != "ignored" ]; then
  echo "falha: evento sintético do telegram nao foi persistido como ignored" >&2
  exit 1
fi

echo "smoke test do adapter telegram concluido com sucesso"
