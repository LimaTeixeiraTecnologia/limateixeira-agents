# Tarefa 1.0: Configuração Telegram e bootstrap do schema

<critical>Ler prd.md e techspec.md desta pasta — sua tarefa será invalidada se você pular</critical>

## Visão Geral

Adicionar a configuração obrigatória do canal Telegram ao serviço `agents`, incluindo secrets, validação tipada, bootstrap idempotente do schema `agents` e seed inicial da allowlist com os dois usuários definidos no PRD.

<requirements>
- Cobrir RF-01, RF-02, RF-02a, RF-10 e RF-11.
- Não usar e-mail ou telefone como identidade de autorização em runtime.
- Bloquear configuração inválida quando faltarem `botToken`, `webhookPathKey` ou `webhookSecretToken`.
- Criar bootstrap seguro das tabelas `telegram_*` com advisory lock e `CREATE TABLE IF NOT EXISTS`.
</requirements>

## Subtarefas

- [ ] 1.1 Estender `config.ts` com variáveis e validações do Telegram.
- [ ] 1.2 Implementar bootstrap idempotente do schema/tabelas `telegram_*`.
- [ ] 1.3 Seedar `telegram_allowed_users` com os dois usuários iniciais em estado seguro.
- [ ] 1.4 Documentar no código os invariantes mínimos de configuração e bootstrap.

## Detalhes de Implementação

Usar `techspec.md` como fonte para os nomes de secrets, tabelas `telegram_allowed_users`, `telegram_chat_sessions`, `telegram_webhook_events` e `telegram_outbound_messages`, além da regra de que usuários só ficam `active` com `telegram_user_id` confirmado.

## Critérios de Sucesso

- Config do Telegram validada por schema tipado e erro estável quando incompleta.
- Bootstrap executável em restart sem recriar nem corromper objetos existentes.
- Seed inicial criada de forma idempotente com os dois contatos de referência do PRD.
- Nenhuma dependência nova de framework de migração é introduzida nesta etapa.

## Skills Necessárias

<!-- MANDATÓRIO: preenchido por `create-tasks` Etapa 4.1 via descoberta agnóstica em `.agents/skills/`.
     NÃO inclua aqui skills auto-carregadas em runtime: `agent-governance`, `execute-task`, `bugfix`,
     `review`, `refactor`, nem skills `*-implementation` (linguagem, inferida pelo diff).
     Use o conteúdo único `Nenhuma além das auto-carregadas (governance + linguagem).` se a tarefa
     não exigir skill processual extra. -->

Nenhuma além das auto-carregadas (governance + linguagem).

## Testes da Tarefa

- [ ] Testes unitários para validação de config e comportamento idempotente do bootstrap
- [ ] Testes de integração cobrindo criação das tabelas e seed inicial

<critical>SEMPRE CRIAR E EXECUTAR TESTES DA TAREFA ANTES DE CONSIDERAR A TAREFA COMO `done`</critical>

## Arquivos Relevantes
- `agents/src/mastra/config.ts`
- `agents/src/mastra/storage.ts`
- `deployment/postgres/init/01-init-agents-schema.sh`
- `.specs/prd-integracao-mastra-telegram/techspec.md`
