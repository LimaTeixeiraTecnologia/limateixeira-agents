# LimaTeixeira Agents

![Node.js >=22.13.0](https://img.shields.io/badge/node-%3E%3D22.13.0-2f6f3e?style=flat-square)
![TypeScript](https://img.shields.io/badge/typescript-ESM-1f6feb?style=flat-square)
![Mastra](https://img.shields.io/badge/mastra-1.16.0-111111?style=flat-square)
![Status](https://img.shields.io/badge/status-ativo-0a7f5a?style=flat-square)

Codebase para agentes de IA da Lima Teixeira, com governanca para execucao assistida por agentes, workspace Mastra em TypeScript e integracao Telegram para operacao conversacional.

Last reviewed: 2026-06-29

## Visao Geral

Este repositorio concentra tres camadas complementares:

1. Um conjunto de skills, hooks e artefatos de governanca para orientar agentes de IA durante analise, planejamento, execucao, revisao e validacao.
2. Um workspace aplicacional em `agents/`, construido com Mastra, responsavel por executar agentes, workflows, ferramentas e adaptadores.
3. Uma stack local de deploy em `deployment/`, com Traefik, PostgreSQL persistente e scripts operacionais para smoke test, backup e restore.

Na pratica, o repositorio serve tanto como base de governanca para agentes quanto como aplicacao executavel para casos reais, hoje incluindo um fluxo com Mastra + Telegram.

## Resumo Executivo

- Repositorio unificado para governanca, implementacao e operacao de agentes.
- Baseado em Mastra para runtime de agents, workflows, tools e observabilidade.
- Integra canal Telegram com controle de allowlist, deduplicacao e persistencia.
- Inclui stack local de deploy com Traefik, PostgreSQL e scripts operacionais.

## O Que Existe No Codebase

| Caminho | Papel |
|---------|-------|
| `.agents/` | Skills canonicas, hooks, scripts de validacao e referencias de governanca |
| `.claude/` | Adaptadores e espelhos de configuracao voltados ao Claude Code |
| `.codex/` | Adaptadores e configuracoes voltados ao Codex |
| `agents/` | Aplicacao Mastra em Node.js/TypeScript |
| `deployment/` | Stack local de deploy com Docker Compose, Traefik e PostgreSQL |
| `docs/` | Prompts e registros de execucao usados no processo de construcao |
| `.specs/` | PRD, tech spec, ADRs, tarefas e relatorios de execucao |
| `scripts/` | Bibliotecas shell compartilhadas por hooks e automacoes |
| `AGENTS.md` | Instrucao canonica de sessao para agentes neste repositorio |

## Para Quem Este Repositorio Serve

- Pessoas mantendo a governanca de agentes e skills reutilizaveis.
- Desenvolvedores que precisam evoluir o servico Mastra.
- Operadores que sobem a stack local com proxy, banco e integracao Telegram.
- Novos integrantes que precisam entender rapidamente como o sistema esta organizado.

## Arquitetura Em Alto Nivel

O fluxo principal atual parte de um webhook do Telegram, passa pelo adapter HTTP registrado no servidor do Mastra, aplica validacoes de seguranca e allowlist, roteia a mensagem para um agente, persiste estado no PostgreSQL e devolve a resposta ao usuario no proprio Telegram.

```text
Telegram
  -> Traefik
    -> Mastra HTTP server
      -> Telegram adapter
        -> Router deterministico
          -> Mastra agent runtime
            -> Agent / Workflow / Tools
              -> PostgresStore + tabelas do adapter
        -> Cliente outbound do Telegram
          -> Telegram API
```

## Como Funciona

### 1. Governanca para agentes

O repositorio define um contrato de execucao para agentes em `AGENTS.md` e centraliza os fluxos procedurais em `.agents/skills/`. Isso inclui:

- carga obrigatoria de contexto antes de alterar codigo;
- separacao entre skills de planejamento, execucao, revisao e correcao;
- scripts e hooks para validar prerequisitos e evidencias;
- referencias auxiliares de DDD, testes, seguranca, observabilidade e tratamento de erros.

### 2. Aplicacao Mastra

O workspace `agents/` executa a aplicacao principal:

- inicializa uma instancia `Mastra`;
- registra workflows, agents, scorers e storage;
- configura observabilidade;
- adiciona rotas HTTP do adapter Telegram no mesmo servidor.

Pontos de entrada importantes:

- `agents/src/mastra/index.ts`: composicao do runtime Mastra.
- `agents/src/mastra/config.ts`: leitura e validacao de configuracao.
- `agents/src/mastra/storage.ts`: integracao de storage com PostgreSQL.
- `agents/src/mastra/agents/`: definicao de agents.
- `agents/src/mastra/workflows/`: workflows executados pelo runtime.
- `agents/src/mastra/tools/`: ferramentas chamadas pelos agents.

### 3. Adapter Telegram

O modulo `agents/src/telegram/` adiciona a borda conversacional:

- `index.ts`: cria o adapter e registra as rotas HTTP.
- `service.ts`: coordena o processamento de webhooks.
- `store.ts`: persiste eventos, sessoes, allowlist e mensagens outbound.
- `router.ts`: decide para qual agent a mensagem deve ir.
- `outbound.ts`: envia respostas de volta para a API do Telegram.
- `bootstrap.ts` e `schema.ts`: garantem schema e contratos de entrada.

Comportamento principal do webhook:

1. valida `content-type`, `webhookKey` e `secret token`;
2. persiste o update recebido com controle de deduplicacao;
3. bloqueia canal desabilitado, update nao suportado e usuario fora da allowlist;
4. resolve ou cria a thread Mastra associada ao chat;
5. executa o agent apropriado;
6. registra o envio outbound e marca o evento como processado ou falho.

### 4. Persistencia e observabilidade

- O storage principal usa PostgreSQL com schema dedicado `agents`.
- O adapter Telegram cria tabelas auxiliares para allowlist, sessoes, eventos de webhook e mensagens de saida.
- A observabilidade usa os exporters do ecossistema Mastra e aplica filtro de dados sensiveis.

## Estrutura Tecnica

### Stack principal

- Node.js `>= 22.13.0`
- TypeScript com ES modules
- Mastra `1.16.0`
- PostgreSQL
- Vitest
- Docker Compose + Traefik para ambiente local de deploy

### Estrutura resumida

```text
.
|-- .agents/
|-- .claude/
|-- .codex/
|-- .specs/
|-- agents/
|   |-- src/
|   |   |-- mastra/
|   |   `-- telegram/
|   |-- package.json
|   `-- README.md
|-- deployment/
|   |-- docker-compose.yml
|   |-- traefik/
|   `-- scripts/
|-- docs/
|-- scripts/
|-- AGENTS.md
`-- Makefile
```

## Como Executar

### Pre-requisitos

- Node.js `>= 22.13.0`
- npm
- PostgreSQL disponivel com schema dedicado `agents`
- Docker Engine + Docker Compose Plugin se for usar a stack de `deployment/`

### Execucao rapida do workspace `agents`

1. Entre no workspace:

```sh
cd agents
```

2. Instale as dependencias:

```sh
npm install
```

3. Configure o ambiente local:

```sh
cp .env.example .env
```

4. Preencha ao menos as variaveis necessarias:

- `DATABASE_URL`
- `OPENROUTER_API_KEY`

5. Inicie em modo desenvolvimento:

```sh
npm run dev
```

Quando o servidor estiver ativo:

- Mastra Studio: `http://localhost:4111`
- Health do Telegram: `GET /telegram/health`
- Webhook do Telegram: `POST /telegram/webhook/:webhookKey`

### Comandos principais

No workspace `agents/`:

```sh
npm run dev
npm run build
npm run typecheck
npm run test
npm run check
```

No topo do repositorio, via `Makefile`:

```sh
make help
make agents-install
make agents-dev
make agents-check
make deploy-local-up
make deploy-local-proof
```

### Fluxo recomendado para primeiro uso

1. Leia `AGENTS.md` para entender o contrato de governanca do repositorio.
2. Execute `cd agents && npm install`.
3. Configure `agents/.env` com `DATABASE_URL` e `OPENROUTER_API_KEY`.
4. Rode `npm run check` para validar ambiente, tipos, testes e build.
5. Inicie `npm run dev` e valide o acesso ao Studio e ao health do adapter.

## Como Subir O Deploy Local Completo

Use a stack em `deployment/` quando quiser executar proxy, banco e servico juntos.

## Acesso Local

### Chrome

URL canônica do Mastra Studio local no Chrome:

```text
http://mastra.localhost:8080/
```

Esse acesso passa obrigatoriamente pelo Traefik.

O proxy exige BasicAuth. As credenciais locais ficam em:

- usuário: `deployment/.secrets/traefik_username`
- senha: `deployment/.secrets/traefik_password`

Healths úteis no navegador:

- `http://mastra.localhost:8080/marcos/health`
- `http://mastra.localhost:8080/marcos/knowledge/status`
- `http://mastra.localhost:8080/telegram/health`

### DBeaver

O PostgreSQL do Compose fica exposto no host para acesso local do DBeaver.

Use esta configuração:

- Host: `127.0.0.1`
- Port: `55432`
- Database: `agents`
- Username: `agents`
- Password: conteúdo de `deployment/.secrets/postgres_password`

Observação importante:

- o password do banco da stack Docker não é o `agents/.env`
- o password correto para o DBeaver é sempre o secret gerado em `deployment/.secrets/postgres_password`

### Caminho canonico obrigatorio

Para um ambiente local funcional com Docker Compose, Traefik e Mastra Studio no proxy, o fluxo canonico deste repositorio passa a ser:

```sh
make deploy-local-up
make deploy-local-proof
```

Esse caminho:

- cria `deployment/.env` com defaults locais se ele ainda nao existir;
- gera `deployment/.secrets/` com valores locais de smoke se ainda nao existir;
- sobe `traefik`, `postgres` e `agents`;
- valida o Studio em `http://mastra.localhost:8080/`;
- valida `GET /marcos/knowledge/status`;
- valida `GET /marcos/health` com blocker controlado de allowlist local nao provisionada.
- expõe o PostgreSQL local na porta `55432` para inspeção externa via DBeaver.

### Passo a passo

1. Gere os secrets locais:

```sh
make deploy-secrets \
  OPENROUTER_API_KEY="<OPENROUTER_API_KEY>" \
  BASIC_AUTH_PASSWORD="<BASIC_AUTH_PASSWORD>" \
  TELEGRAM_BOT_TOKEN="<TELEGRAM_BOT_TOKEN>" \
  TELEGRAM_WEBHOOK_PATH_KEY="<TELEGRAM_WEBHOOK_PATH_KEY>" \
  TELEGRAM_WEBHOOK_SECRET_TOKEN="<TELEGRAM_WEBHOOK_SECRET_TOKEN>"
```

2. Gere `deployment/.env` se ainda nao existir:

```sh
make deploy-env
```

3. Ajuste `deployment/.env` para o canal Telegram:

```dotenv
TELEGRAM_ENABLED=true
TELEGRAM_PUBLIC_BASE_URL=https://<dominio-publico-com-https>
TELEGRAM_ALLOWED_UPDATES=message
```

4. Suba a stack:

```sh
make deploy-up
```

5. Rode o smoke test:

```sh
make deploy-smoke
```

6. Rode a prova local completa do proxy + Studio:

```sh
make deploy-local-proof
```

### Endpoints e operacao

- Aplicacao e Studio via proxy Traefik: `http://mastra.localhost:8080/`
- Health agregado do runtime Marcos: `http://mastra.localhost:8080/marcos/health`
- Status detalhado do knowledge: `http://mastra.localhost:8080/marcos/knowledge/status`
- Health do Telegram: `http://mastra.localhost:8080/telegram/health`
- Webhook local: `http://mastra.localhost:8080/telegram/webhook/<webhookPathKey>`

O acesso HTTP local passa obrigatoriamente pelo Traefik. O `agents` nao expoe porta publica direta no Compose; o ponto de entrada externo e a porta `8080` do proxy.

Comandos operacionais:

```sh
make deploy-ps
make deploy-logs
make deploy-backup
make deploy-restore FILE=deployment/backups/arquivo.dump
```

## Validacao E Qualidade

O comando padrao de validacao do projeto aplicacional e:

```sh
cd agents
npm run check
```

Esse fluxo executa:

- typecheck;
- testes com Vitest;
- build do Mastra com Studio.

Para mudancas de codigo neste repositorio, `AGENTS.md` define `npm run check` como gate minimo de validacao no workspace `agents/`.

## Troubleshooting

### `npm run dev` falha ao subir o workspace

**Sintoma**: o runtime Mastra nao inicia ou encerra logo no bootstrap.  
**Causa mais comum**: `DATABASE_URL` invalida, PostgreSQL indisponivel ou variaveis obrigatorias ausentes.  
**Como verificar**:

```sh
cd agents
cat .env
npm run typecheck
```

### O Studio nao abre no deploy local

**Sintoma**: `http://mastra.localhost:8080/` nao responde `Mastra Studio`.  
**Causa mais comum**: stack local nao foi subida pelo fluxo canonico ou o proxy nao recebeu os secrets locais.  
**Como verificar**:

```sh
make deploy-ps
make deploy-local-proof
```

Se `make deploy-local-proof` passar, o Studio esta funcional atras do Traefik e o health agregado do Marcos esta respondendo conforme esperado para o ambiente local.

**Acao**: confirme conectividade com o banco, valores do `.env` e se o schema `agents` esta acessivel.

### O Telegram responde como ignorado

**Sintoma**: o webhook retorna `ignored` em vez de `processed`.  
**Causa mais comum**: canal desabilitado, update nao suportado ou usuario fora da allowlist.  
**Acao**:

- confirme `TELEGRAM_ENABLED=true`;
- revise `TELEGRAM_ALLOWED_UPDATES`;
- valide se o `telegram_user_id` esta cadastrado como ativo nas tabelas do schema `agents`.

### O webhook falha com erro de segredo

**Sintoma**: retorno relacionado a `telegram_invalid_secret`.  
**Causa mais comum**: `webhookKey` ou `secret token` diferente do configurado.  
**Acao**:

- verifique `TELEGRAM_WEBHOOK_PATH_KEY`;
- verifique `TELEGRAM_WEBHOOK_SECRET_TOKEN`;
- confirme se o emissor do webhook esta usando exatamente os mesmos valores.

### O deploy local sobe, mas o acesso HTTP nao funciona

**Sintoma**: `http://mastra.localhost` nao responde como esperado.  
**Causa mais comum**: stack nao inicializada por completo, erro no Traefik ou credenciais BasicAuth incorretas.  
**Acao**:

```sh
make deploy-ps
make deploy-logs
make deploy-smoke
```

Use tambem as credenciais geradas em `deployment/.secrets/`.

## Roadmap

- Expandir o catalogo de agents e workflows especializados por dominio.
- Evoluir a observabilidade com painis e rotinas operacionais mais detalhadas.
- Endurecer o fluxo de go-live do Telegram com runbooks adicionais de seguranca.
- Consolidar mais automacoes de governanca para execucao assistida por agentes.

## Documentacao E Artefatos Importantes

- `AGENTS.md`: regras canonicas para agentes atuando neste repositorio.
- `CLAUDE.md`: adaptacao de orientacoes para Claude Code.
- `agents/README.md`: runbook focado no workspace Mastra.
- `deployment/README.md`: operacao da stack local completa.
- `.specs/prd-integracao-mastra-telegram/`: PRD, tech spec, ADRs, tasks e relatorios da entrega atual.

## Observacoes Operacionais

- O canal Telegram so fica pronto para go-live com `TELEGRAM_ENABLED=true`, secrets validos, dominio publico HTTPS e allowlist configurada com `telegram_user_id` real.
- O acesso HTTP geral via Traefik fica protegido com BasicAuth; apenas o path do webhook fica liberado localmente.
- Artefatos locais como `.env`, `.mastra/`, `node_modules/` e bancos locais nao devem ser tratados como parte do fluxo versionado.

## Contribuicao

1. Leia `AGENTS.md` antes de alterar codigo.
2. Use as skills e referencias locais quando a tarefa exigir fluxo guiado por agentes.
3. Mantenha mudancas pequenas, verificaveis e alinhadas ao comportamento existente.
4. Rode `npm run check` em `agents/` antes de concluir mudancas aplicacionais.

## Proximas Leituras

- [agents/README.md](agents/README.md)
- [deployment/README.md](deployment/README.md)
- [AGENTS.md](AGENTS.md)
- [.specs/prd-integracao-mastra-telegram/techspec.md](.specs/prd-integracao-mastra-telegram/techspec.md)
