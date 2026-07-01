# deployment

Stack local de deploy para o workspace `agents` com Traefik, Mastra, adapter Telegram e PostgreSQL persistente.

O roteamento local continua usando `mastra.localhost`, e o roteamento de
producao fica preparado para `api.limateixeira.com.br`.

## Requisitos

- Docker Engine e Docker Compose Plugin
- Entrada local para `mastra.localhost`
  - em sistemas atuais, `*.localhost` normalmente resolve para `127.0.0.1`
- Dominio publicado `api.limateixeira.com.br` apontando para o IP publico do VPS
- Porta `80` e `443` liberadas no host
- Chave válida de `OPENROUTER_API_KEY`
- Secrets do Telegram:
  - `TELEGRAM_BOT_TOKEN`
  - `TELEGRAM_WEBHOOK_PATH_KEY`
  - `TELEGRAM_WEBHOOK_SECRET_TOKEN`

## Preparação

1. Gerar secrets locais:

```sh
make deploy-secrets \
  OPENROUTER_API_KEY="<OPENROUTER_API_KEY>" \
  BASIC_AUTH_PASSWORD="<BASIC_AUTH_PASSWORD>" \
  TELEGRAM_BOT_TOKEN="<TELEGRAM_BOT_TOKEN>" \
  TELEGRAM_WEBHOOK_PATH_KEY="<TELEGRAM_WEBHOOK_PATH_KEY>" \
  TELEGRAM_WEBHOOK_SECRET_TOKEN="<TELEGRAM_WEBHOOK_SECRET_TOKEN>" \
  [BASIC_AUTH_USER=admin]
```

2. Copiar o `.env`:

```sh
make deploy-env
```

3. Ajustar `deployment/.env` para o adapter Telegram:

```dotenv
ACME_EMAIL=<EMAIL_PARA_LETS_ENCRYPT>
TELEGRAM_ENABLED=true
TELEGRAM_PUBLIC_BASE_URL=https://api.limateixeira.com.br
TELEGRAM_ALLOWED_UPDATES=message
```

4. Em producao, apontar `api.limateixeira.com.br` para o IP do VPS no
Cloudflare.

- Para a primeira emissao do certificado, prefira `DNS only` no Cloudflare.
- Depois da emissao e validacao do HTTPS, voce pode decidir se quer reativar o
  proxy da Cloudflare.

5. Subir a stack:

```sh
make deploy-up
```

Depois da subida, o acesso ao proxy exige BasicAuth usando as credenciais gravadas em:

- `deployment/.secrets/traefik_username`
- `deployment/.secrets/traefik_password`

Endpoints:

- Mastra e Studio: `http://mastra.localhost`
- Health do adapter Telegram: `http://mastra.localhost/telegram/health` via BasicAuth
- Webhook público do Telegram: `http://mastra.localhost/telegram/webhook/<webhookPathKey>` sem BasicAuth no ambiente local
- Produção: `https://api.limateixeira.com.br`
- Health em produção: `https://api.limateixeira.com.br/telegram/health` via BasicAuth
- Webhook público em produção: `https://api.limateixeira.com.br/telegram/webhook/<webhookPathKey>` sem BasicAuth
- Banco: acessível apenas na rede interna do Compose
- O roteamento do Traefik usa provider `file`, evitando expor o socket Docker no proxy
- Apenas o path `/telegram/webhook/*` fica sem `agents-auth`; o restante continua atrás de BasicAuth
- O Traefik persiste certificados ACME no volume `agents_traefik_acme`

## Persistência

- Os dados do PostgreSQL ficam no volume nomeado `agents_postgres_data`
- O schema dedicado do Mastra é `agents`
- O bootstrap do adapter também cria as tabelas `telegram_allowed_users`, `telegram_chat_sessions`, `telegram_webhook_events` e `telegram_outbound_messages`

## Operação

Smoke test ponta a ponta:

```sh
make deploy-smoke
```

O smoke do Telegram valida:

- `GET /telegram/health` protegido por BasicAuth e retornando bloqueio explícito de go-live local
- `POST /telegram/webhook/:webhookKey` acessível sem BasicAuth
- deny controlado da allowlist com payload sintético
- persistência de `telegram_webhook_events` no PostgreSQL

Backup lógico do schema `agents`:

```sh
make deploy-backup
```

Restore de um dump:

```sh
make deploy-restore FILE=deployment/backups/agents-YYYYMMDD-HHMMSS.dump
```

## Estrutura

- `agents.Dockerfile`: build multi-stage do workspace `agents`
- `postgres/init/01-init-agents-schema.sh`: bootstrap do schema PostgreSQL
- `traefik/traefik.yml`: configuração estática do Traefik
- `traefik/dynamic/mastra.yml`: roteamento, headers e BasicAuth do proxy
- `scripts/`: geração de secrets, smoke test, backup e restore

## Go-live real

O deploy local não equivale a go-live. Antes de registrar o webhook real no Telegram, ainda é obrigatório:

- provisionar os `telegram_user_id` numéricos reais dos dois usuários iniciais
- publicar um domínio externo com HTTPS válido apontando para o Traefik
- configurar `setWebhook` com `secret_token` idêntico a `TELEGRAM_WEBHOOK_SECRET_TOKEN`
- confirmar que o health do adapter não apresenta blockers
