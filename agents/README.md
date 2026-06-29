# agents

Mastra application workspace for this repository.

## Canonical project guidance

- Repository-wide agent instructions live in `../AGENTS.md`.
- Claude Code compatibility lives in `../CLAUDE.md`.
- The official Mastra skill vendored for this repo lives in `../.agents/skills/mastra/`.
- The vendored skill pin is recorded in `../.agents/skills/mastra.upstream.txt`.

Use the local Mastra skill before relying on memory. It is the primary source for current Mastra workflow guidance in this project.

## Environment

Required:

- Node `>=22.13.0`
- PostgreSQL com um schema dedicado `agents`
- An `.env` file with `DATABASE_URL` e `OPENROUTER_API_KEY`

Setup:

```sh
cp .env.example .env
```

## Commands

```sh
npm run dev
npm run build
npm run typecheck
npm run check
```

`npm run check` is the default local validation command. It runs TypeScript checks and then bundles the Mastra app.

## Runtime notes

- Mastra Studio is available at `http://localhost:4111` when `npm run dev` is running.
- O storage principal do Mastra usa `PostgresStore` no schema `agents`.
- O adapter Telegram expõe `POST /telegram/webhook/:webhookKey` e `GET /telegram/health` no mesmo servidor do Mastra.
- O canal Telegram só fica pronto para go-live com `TELEGRAM_ENABLED=true`, secrets válidos, domínio público HTTPS e `telegram_user_id` real dos dois usuários iniciais.
- The current model is `openrouter/openai/gpt-5-mini`.
- Source code lives under `src/mastra/`.
- The npm cache is forced to `../.npm-cache` by project scripts to avoid global cache drift and local permission collisions during Mastra bundling.

## Container deployment

- A stack local com Docker Compose, Traefik e PostgreSQL persistente fica em `../deployment/`.
- O Compose cria o schema `agents` e persiste o banco no volume nomeado `agents_postgres_data`.
- O acesso ao Mastra acontece apenas atrás do Traefik em `http://mastra.localhost`.

## Dependency status

The Mastra stack in this workspace was audited on 2026-06-29 and already matches the latest published versions in use here:

- `mastra 1.16.0`
- `@mastra/core 1.47.0`
- `@mastra/evals 1.5.0`
- `@mastra/loggers 1.2.0`
- `@mastra/memory 1.21.2`
- `@mastra/observability 1.15.2`
- `@mastra/pg 1.14.2`
