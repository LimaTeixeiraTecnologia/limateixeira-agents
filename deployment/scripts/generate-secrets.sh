#!/bin/sh
set -eu

if [ "$#" -lt 5 ] || [ "$#" -gt 6 ]; then
  echo "uso: $0 <openrouter_api_key> <basic_auth_password> <telegram_bot_token> <telegram_webhook_path_key> <telegram_webhook_secret_token> [basic_auth_user]" >&2
  exit 1
fi

OPENROUTER_API_KEY=$1
BASIC_AUTH_PASSWORD=$2
TELEGRAM_BOT_TOKEN=$3
TELEGRAM_WEBHOOK_PATH_KEY=$4
TELEGRAM_WEBHOOK_SECRET_TOKEN=$5
BASIC_AUTH_USER=${6:-admin}

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
DEPLOYMENT_DIR=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
SECRETS_DIR="$DEPLOYMENT_DIR/.secrets"

mkdir -p "$SECRETS_DIR"

POSTGRES_PASSWORD=$(LC_ALL=C tr -dc 'A-Za-z0-9' </dev/urandom | head -c 32)

printf '%s\n' "$OPENROUTER_API_KEY" >"$SECRETS_DIR/openrouter_api_key"
printf '%s\n' "$POSTGRES_PASSWORD" >"$SECRETS_DIR/postgres_password"
printf '%s\n' "$TELEGRAM_BOT_TOKEN" >"$SECRETS_DIR/telegram_bot_token"
printf '%s\n' "$TELEGRAM_WEBHOOK_PATH_KEY" >"$SECRETS_DIR/telegram_webhook_path_key"
printf '%s\n' "$TELEGRAM_WEBHOOK_SECRET_TOKEN" >"$SECRETS_DIR/telegram_webhook_secret_token"
printf '%s\n' "$BASIC_AUTH_USER" >"$SECRETS_DIR/traefik_username"
printf '%s\n' "$BASIC_AUTH_PASSWORD" >"$SECRETS_DIR/traefik_password"

docker run --rm httpd:2.4-alpine htpasswd -nbB "$BASIC_AUTH_USER" "$BASIC_AUTH_PASSWORD" | tr -d '\r' >"$SECRETS_DIR/traefik_users"

chmod 600 "$SECRETS_DIR"/*

cat <<EOF
Secrets gerados em $SECRETS_DIR
- openrouter_api_key
- postgres_password
- telegram_bot_token
- telegram_webhook_path_key
- telegram_webhook_secret_token
- traefik_username
- traefik_password
- traefik_users
EOF
