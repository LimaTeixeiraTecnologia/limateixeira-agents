<!-- spec-hash-prd: 1cfb10110b11a1a29fd0ecb9fde11425b9a2a5f8b070e1a478fbafea19a482c2 -->
<!-- MANDATÓRIO: preenchido por `create-technical-specification` Etapa 7.1 com sha256 do PRD consumido.
     Rastreabilidade: `create-tasks` e `execute-task` comparam este hash com o atual do prd.md
     para detectar drift entre techspec e PRD. NÃO remover este comentário ao editar a techspec. -->

# Especificação Técnica: Integração Mastra + Telegram

## Resumo Executivo

A solução será implementada como um adapter HTTP dedicado no mesmo serviço `agents`, exposto pelo servidor do Mastra via `registerApiRoute()`. O fluxo será `Telegram Bot API -> Traefik -> webhook route do adapter -> validação e idempotência -> roteador determinístico -> agente Mastra -> envio explícito de resposta via Bot API -> PostgreSQL`.

O desenho prioriza previsibilidade operacional e redução de falso positivo. O adapter será a única fronteira pública do canal Telegram, concentrando verificação de origem, allowlist, deduplicação, auditoria, roteamento e política de erro. O runtime Mastra continua responsável apenas por execução dos agentes e tools, sem absorver diretamente responsabilidades de borda do Telegram.

## Arquitetura do Sistema

### Visão Geral dos Componentes

- `TelegramWebhookRoute`:
  rota `POST /telegram/webhook/:webhookKey` registrada no servidor Mastra; recebe updates do Telegram e retorna `2xx` mesmo em cenários idempotentes ou ignorados.
- `TelegramWebhookGuard`:
  valida método, `Content-Type`, `:webhookKey`, header `X-Telegram-Bot-Api-Secret-Token`, tipo de update e chat privado.
- `TelegramAllowlistService`:
  aplica deny-by-default usando IDs numéricos do Telegram; e-mail e telefone ficam apenas como referência operacional, não como chave de autorização.
- `TelegramEventStore`:
  persiste update bruto, status de processamento, deduplicação por `update_id` e trilha de auditoria.
- `TelegramConversationStore`:
  mantém vínculo estável `telegram_chat_id -> mastra_thread_id` para continuidade do contexto.
- `TelegramRouter`:
  decide qual agente Mastra chamar usando regras determinísticas baseadas em comando/canal, nunca por classificação probabilística na borda.
- `TelegramOutboundClient`:
  chama explicitamente a Bot API (`sendMessage`) após a execução do agente; não usa resposta inline do webhook.
- `Mastra runtime`:
  executa agentes/tools já registrados, recebendo `threadId` e `requestContext` com metadados do Telegram.
- `PostgreSQL schema agents`:
  armazena tabelas novas do adapter no mesmo schema já usado pelo Mastra para que backup/restore existentes continuem cobrindo todo o conjunto.

Fluxo principal:

1. Telegram entrega um `Update` por HTTPS ao webhook público.
2. Traefik roteia o path do webhook para `agents` sem BasicAuth e mantém headers de segurança.
3. O adapter valida segredo de path, header secreto do Telegram e elegibilidade do update.
4. O adapter registra o evento com chave única `update_id`; duplicatas retornam `200` sem reprocessar.
5. O adapter resolve o usuário autorizado e o `mastra_thread_id` do chat.
6. O `TelegramRouter` escolhe o agente por regra determinística.
7. O adapter chama o agente Mastra com `requestContext` e `threadId`.
8. O adapter envia a resposta ao Telegram por `sendMessage`, registra o resultado e fecha o evento como `processed` ou `failed`.

## Design de Implementação

### Interfaces Chave

```ts
type TelegramWebhookConfig = {
  botToken: string;
  webhookPathKey: string;
  webhookSecretToken: string;
  allowedUpdates: ['message'];
};

type TelegramIdentityStatus = 'pending_link' | 'active' | 'disabled';
type TelegramEventStatus = 'received' | 'ignored' | 'processed' | 'failed';

interface TelegramAllowlistService {
  resolveActiveUser(telegramUserId: bigint): Promise<AllowedTelegramUser | null>;
}

interface TelegramEventStore {
  registerIncoming(update: TelegramUpdateEnvelope): Promise<'new' | 'duplicate'>;
  markIgnored(updateId: bigint, reason: string): Promise<void>;
  markProcessed(updateId: bigint, result: TelegramProcessResult): Promise<void>;
  markFailed(updateId: bigint, error: AdapterError): Promise<void>;
}

interface TelegramConversationStore {
  getOrCreateThread(input: TelegramConversationInput): Promise<{ mastraThreadId: string }>;
}

interface TelegramRouter {
  route(message: TelegramInboundMessage): Promise<{ agentId: string; normalizedPrompt: string }>;
}

interface TelegramOutboundClient {
  sendText(input: TelegramOutboundMessage): Promise<TelegramSendResult>;
}
```

### Modelos de Dados

Tabelas novas no schema `agents`:

- `agents.telegram_allowed_users`
  - `person_key text primary key`
  - `display_name text not null`
  - `reference_email text not null`
  - `reference_phone text not null`
  - `telegram_user_id bigint unique null`
  - `telegram_username text null`
  - `status text not null check (status in ('pending_link','active','disabled'))`
  - `created_at timestamptz not null default now()`
  - `updated_at timestamptz not null default now()`
- `agents.telegram_chat_sessions`
  - `telegram_chat_id bigint primary key`
  - `telegram_user_id bigint not null`
  - `mastra_thread_id text unique not null`
  - `current_agent_id text not null`
  - `created_at timestamptz not null default now()`
  - `last_seen_at timestamptz not null default now()`
- `agents.telegram_webhook_events`
  - `update_id bigint primary key`
  - `telegram_user_id bigint null`
  - `telegram_chat_id bigint null`
  - `update_type text not null`
  - `status text not null check (status in ('received','ignored','processed','failed'))`
  - `ignore_reason text null`
  - `error_code text null`
  - `payload_json jsonb not null`
  - `received_at timestamptz not null default now()`
  - `processed_at timestamptz null`
- `agents.telegram_outbound_messages`
  - `id uuid primary key`
  - `update_id bigint not null references agents.telegram_webhook_events(update_id)`
  - `telegram_chat_id bigint not null`
  - `mastra_thread_id text not null`
  - `status text not null check (status in ('sent','failed'))`
  - `telegram_message_id bigint null`
  - `response_text text not null`
  - `error_code text null`
  - `created_at timestamptz not null default now()`
  - `sent_at timestamptz null`

Dados seed iniciais em `telegram_allowed_users`:

- `jailton-junior` com e-mail `jailton.junior94@outlook.com` e telefone `+55 11 98689-6322`
- `stefany-kelly-lima` com e-mail `stefanykelly.lima@hotmail.com` e telefone `+55 11 93011-1763`

Regra obrigatória:

- nenhum usuário entra em produção como `active` sem `telegram_user_id` numérico previamente confirmado;
- e-mail e telefone não devem ser usados como sinal de autorização em runtime, porque o webhook do Telegram não fornece esses atributos como identidade confiável do remetente.

Bootstrap de schema:

- adicionar um bootstrap idempotente no startup do app para criar as tabelas `telegram_*` com `CREATE TABLE IF NOT EXISTS`;
- proteger o bootstrap com advisory lock para evitar corrida entre múltiplas instâncias;
- manter tudo no schema `agents`, preservando compatibilidade com `backup.sh` e `restore.sh`.

### Endpoints de API

- `POST /telegram/webhook/:webhookKey`
  - endpoint público consumido pelo Telegram.
  - `requiresAuth: false` no Mastra route.
  - aceita apenas `Update.message` de chat privado.
  - retorna:
    - `200` para update processado, ignorado ou duplicado.
    - `401` para segredo inválido.
    - `415` para payload incompatível.
    - `500` apenas para falha interna antes do registro do evento.
- `GET /telegram/health`
  - endpoint interno de diagnóstico do adapter.
  - continua protegido por BasicAuth do Traefik.
  - verifica bootstrap do schema e presença de config obrigatória do Telegram.

Contratos do webhook:

- path deve incluir `:webhookKey` secreto e não derivado do bot token.
- header `X-Telegram-Bot-Api-Secret-Token` deve coincidir com o segredo configurado em `setWebhook`.
- `allowed_updates` deve ser configurado como `["message"]`.
- updates fora de `message`, `private chat` ou `text` devem ser marcados como `ignored`.

## Pontos de Integração

- Telegram Bot API
  - entrada via `setWebhook` com `secret_token`.
  - saída via `sendMessage`.
  - referência oficial: `setWebhook` suporta `secret_token`, HTTPS e portas `443`, `80`, `88`, `8443`; webhook retorna retries em respostas não `2xx`.
  - o deploy público precisa atender os requisitos de HTTPS/TLS 1.2+ e domínio acessível externamente.
- Traefik
  - criar um router específico para `PathPrefix(/telegram/webhook/)` sem `agents-auth`.
  - manter `agents-security`.
  - manter as rotas existentes com BasicAuth para Studio e APIs atuais.
- Mastra
  - usar `registerApiRoute()` para expor o webhook no mesmo servidor.
  - usar `RequestContext` para passar `telegramUserId`, `telegramChatId`, `allowedPersonKey` e `channel=telegram`.

Tratamento de erros:

- erros de validação e autorização devem virar respostas controladas e códigos estáveis (`telegram_invalid_secret`, `telegram_user_not_allowed`, `telegram_unsupported_update`);
- falhas externas transitórias de `sendMessage` podem ter até 2 retries imediatos;
- falhas definitivas devem marcar o evento como `failed` e nunca gerar resposta inventada pelo agente.

## Abordagem de Testes

### Testes Unitários

Cobertura mínima:

- parsing e validação do payload do webhook;
- comparação do `webhookKey` e do header secreto;
- allowlist deny-by-default;
- roteamento determinístico por comando;
- deduplicação por `update_id`;
- mapeamento de erro técnico para payload HTTP consistente.

Casos obrigatórios:

- usuário fora da allowlist;
- usuário conhecido com status `pending_link`;
- update duplicado;
- update sem texto;
- update de grupo/canal;
- comando desconhecido;
- falha do outbound `sendMessage`.

Ferramenta recomendada:

- adicionar `vitest` como runner de unidade do workspace `agents`, porque o projeto ainda não tem harness de testes próprio e a validação exige doubles simples e determinísticos.

### Testes de Integração

Sim. Este projeto precisa de integration tests porque:

- há fronteiras críticas de IO em PostgreSQL;
- a correção da deduplicação e do vínculo `chat -> thread` não é garantida só com mocks;
- o custo de um Postgres efêmero é proporcional ao risco coberto.

Escopo:

- bootstrap do schema `telegram_*`;
- inserção idempotente por `update_id`;
- criação e reúso de `mastra_thread_id`;
- persistência de eventos `processed` e `failed`.

Estratégia:

- usar container Postgres efêmero no teste de integração;
- não depender de Telegram real nem de rede externa;
- mockar somente o outbound HTTP para a Bot API.

### Testes E2E

Adicionar um fluxo E2E local, acionando `POST /telegram/webhook/:webhookKey` com payload sintético:

- request autenticado -> evento persistido -> agente invocado -> outbound chamado;
- request duplicado -> `200` sem segunda invocação;
- usuário não autorizado -> `200` com evento `ignored`.

O E2E local não valida webhook real do Telegram. A validação real de webhook fica como smoke operacional em ambiente público HTTPS.

## Sequenciamento de Desenvolvimento

### Ordem de Build

1. Configuração e bootstrap
   - adicionar config do Telegram e bootstrap do schema.
2. Persistência do adapter
   - implementar `telegram_allowed_users`, `telegram_webhook_events`, `telegram_chat_sessions`, `telegram_outbound_messages`.
3. Borda HTTP
   - registrar routes Mastra, validação e política de erro.
4. Roteamento e chamada ao Mastra
   - implementar `TelegramRouter`, `RequestContext` e chamada ao agente.
5. Saída e observabilidade
   - implementar `TelegramOutboundClient`, logs e spans.
6. Deploy e smoke
   - ajustar Traefik, secrets e runbook de `setWebhook`.

### Dependências Técnicas

- domínio público com HTTPS válido para o webhook;
- segredo `webhookPathKey`;
- segredo `X-Telegram-Bot-Api-Secret-Token`;
- bot token do Telegram;
- IDs numéricos de Telegram dos dois usuários iniciais antes do go-live.

## Monitoramento e Observabilidade

Sinais mínimos:

- log estruturado por update com `update_id`, `telegram_user_id`, `chat_id`, `event_status`, `agent_id`, `latency_ms`;
- spans do Mastra enriquecidos com `channel=telegram` e `allowedPersonKey`;
- contadores derivados de logs ou métricas:
  - `telegram_updates_total{status}`
  - `telegram_allowlist_denials_total`
  - `telegram_duplicate_updates_total`
  - `telegram_outbound_total{status}`
  - `telegram_first_response_latency_ms`

Alertas operacionais:

- aumento de `failed` em `telegram_webhook_events`;
- `pending_update_count` elevado no `getWebhookInfo`;
- ausência de respostas outbound por janela configurada.

## Considerações Técnicas

### Decisões Chave

- usar adapter no mesmo serviço `agents`, não um microserviço separado;
- expor webhook em route customizada do Mastra;
- remover BasicAuth apenas do path do webhook e substituí-lo por segredo de path + `secret_token`;
- autorizar somente `telegram_user_id` previamente vinculado;
- roteamento determinístico por comando explícito na v1.

Decisões e ADRs:

- [adr-001-telegram-adapter-no-servico-agents.md](</Users/jailtonjunior/Git/limateixeira-agents/.specs/prd-integracao-mastra-telegram/adr-001-telegram-adapter-no-servico-agents.md>)
- [adr-002-seguranca-do-webhook-e-allowlist.md](</Users/jailtonjunior/Git/limateixeira-agents/.specs/prd-integracao-mastra-telegram/adr-002-seguranca-do-webhook-e-allowlist.md>)
- [adr-003-roteamento-deterministico-e-idempotencia.md](</Users/jailtonjunior/Git/limateixeira-agents/.specs/prd-integracao-mastra-telegram/adr-003-roteamento-deterministico-e-idempotencia.md>)

### Riscos Conhecidos

- os contatos de referência fornecidos no PRD não bastam para autorização em runtime sem o `telegram_user_id` numérico real;
- o host `mastra.localhost` atual não atende ao requisito de webhook público HTTPS do Telegram;
- roteamento por comandos reduz falso positivo, mas sacrifica flexibilidade conversacional livre na borda;
- ausência de framework de migração exige bootstrap idempotente bem testado.

Mitigações:

- bloquear go-live até provisionar os dois `telegram_user_id`;
- documentar webhook apenas para domínio público com TLS válido;
- responder `/help` e erro controlado para comandos desconhecidos;
- cobrir bootstrap, idempotência e allowlist com integração.

### Conformidade com Padrões

- `R-ERR-001` tratamento de erros com códigos estáveis e `cause`
- `R-SEC-001` segredos em ambiente, validação de input externo e deny-by-default
- `R-TEST-001` cobertura obrigatória para validadores, adapter HTTP e persistência crítica

### Arquivos Relevantes e Dependentes

- `agents/src/mastra/index.ts`
- `agents/src/mastra/config.ts`
- `agents/src/mastra/storage.ts`
- `deployment/traefik/dynamic/mastra.yml`
- `deployment/docker-compose.yml`
- `deployment/postgres/init/01-init-agents-schema.sh`
