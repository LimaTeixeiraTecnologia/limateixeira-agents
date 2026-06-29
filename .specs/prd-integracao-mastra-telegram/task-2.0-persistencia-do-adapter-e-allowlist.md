# Tarefa 2.0: Persistência do adapter e allowlist

<critical>Ler prd.md e techspec.md desta pasta — sua tarefa será invalidada se você pular</critical>

## Visão Geral

Implementar a camada de persistência do adapter Telegram: allowlist deny-by-default, trilha de eventos, deduplicação por `update_id`, vínculo `telegram_chat_id -> mastra_thread_id` e registro de outbound.

<requirements>
- Cobrir RF-02, RF-02a, RF-07, RF-08, RF-09, RF-11 e RF-12.
- Persistir eventos antes de qualquer chamada ao agente.
- Garantir unicidade de `update_id` e reuso de `mastra_thread_id` por `telegram_chat_id`.
- Persistir contatos de referência apenas para governança operacional, não para autorização em runtime.
</requirements>

## Subtarefas

- [ ] 2.1 Implementar repositório/serviço de allowlist baseado em `telegram_user_id`.
- [ ] 2.2 Implementar store de eventos com `registerIncoming`, `markIgnored`, `markProcessed` e `markFailed`.
- [ ] 2.3 Implementar store de sessões de chat com criação e reúso de `mastra_thread_id`.
- [ ] 2.4 Implementar persistência de outbound e contratos de erro estáveis para a borda.

## Detalhes de Implementação

Referenciar `techspec.md` para os modelos de dados, nomes de tabelas e status canônicos (`pending_link`, `active`, `disabled`, `received`, `ignored`, `processed`, `failed`). A deduplicação deve ser persistente, nunca em memória.

## Critérios de Sucesso

- Update duplicado não gera segunda execução observável do fluxo.
- Usuário `pending_link` ou ausente na allowlist é rejeitado com motivo rastreável.
- Vínculo `chat -> thread` é estável entre mensagens do mesmo chat.
- Eventos `processed` e `failed` deixam evidência consultável no PostgreSQL.

## Skills Necessárias

<!-- MANDATÓRIO: preenchido por `create-tasks` Etapa 4.1 via descoberta agnóstica em `.agents/skills/`.
     NÃO inclua aqui skills auto-carregadas em runtime: `agent-governance`, `execute-task`, `bugfix`,
     `review`, `refactor`, nem skills `*-implementation` (linguagem, inferida pelo diff).
     Use o conteúdo único `Nenhuma além das auto-carregadas (governance + linguagem).` se a tarefa
     não exigir skill processual extra. -->

Nenhuma além das auto-carregadas (governance + linguagem).

## Testes da Tarefa

- [ ] Testes unitários para regras de allowlist, deduplicação e mapeamento de status
- [ ] Testes de integração com Postgres para inserts idempotentes e criação/reúso de thread

<critical>SEMPRE CRIAR E EXECUTAR TESTES DA TAREFA ANTES DE CONSIDERAR A TAREFA COMO `done`</critical>

## Arquivos Relevantes
- `agents/src/mastra/storage.ts`
- `agents/src/mastra/`
- `.specs/prd-integracao-mastra-telegram/techspec.md`
