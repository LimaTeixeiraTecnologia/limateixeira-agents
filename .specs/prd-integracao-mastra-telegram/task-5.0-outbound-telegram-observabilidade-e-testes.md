# Tarefa 5.0: Outbound Telegram, observabilidade e testes

<critical>Ler prd.md e techspec.md desta pasta — sua tarefa será invalidada se você pular</critical>

## Visão Geral

Implementar o envio explícito de respostas ao Telegram via Bot API, instrumentar logs/spans/métricas mínimas do canal e consolidar a suíte de testes unitários, integração e E2E local do adapter.

<requirements>
- Cobrir RF-06, RF-07, RF-09, RF-12 e RF-14.
- Usar `sendMessage` explícito em vez de resposta inline ao webhook.
- Registrar sucesso/falha do outbound com retries transitórios limitados.
- Produzir observabilidade suficiente para latência, duplicatas, denials e falhas de envio.
</requirements>

## Subtarefas

- [ ] 5.1 Implementar client outbound do Telegram com contratos de erro estáveis e retries limitados.
- [ ] 5.2 Persistir `telegram_outbound_messages` com correlação ao evento de entrada.
- [ ] 5.3 Enriquecer logs e spans do Mastra com metadados do canal Telegram.
- [ ] 5.4 Adicionar/ajustar harness de testes do workspace e cobrir unitário, integração e E2E local.

## Detalhes de Implementação

Usar `techspec.md` para os sinais mínimos de observabilidade, política de retries e validação de que o E2E local deve usar payload sintético, nunca rede real do Telegram. Se for necessário introduzir `vitest`, a configuração deve permanecer mínima e alinhada ao workspace `agents`.

## Critérios de Sucesso

- Resposta outbound é enviada e persistida com rastreabilidade completa.
- Falha transitória não gera resposta inventada nem loop indefinido de retry.
- A suíte de testes cobre caminho feliz, duplicata, usuário não autorizado e falha outbound.
- Os logs e spans permitem diagnosticar `update_id`, `agent_id`, status e latência.

## Skills Necessárias

<!-- MANDATÓRIO: preenchido por `create-tasks` Etapa 4.1 via descoberta agnóstica em `.agents/skills/`.
     NÃO inclua aqui skills auto-carregadas em runtime: `agent-governance`, `execute-task`, `bugfix`,
     `review`, `refactor`, nem skills `*-implementation` (linguagem, inferida pelo diff).
     Use o conteúdo único `Nenhuma além das auto-carregadas (governance + linguagem).` se a tarefa
     não exigir skill processual extra. -->

- `mastra` — A tarefa instrumenta o runtime Mastra e valida o fluxo completo do adapter dentro do servidor atual.

## Testes da Tarefa

- [ ] Testes unitários para outbound client e política de retries
- [ ] Testes de integração para persistência de outbound, eventos `processed/failed` e vínculos de correlação
- [ ] Testes E2E locais para webhook sintético com sucesso, duplicata e deny da allowlist

<critical>SEMPRE CRIAR E EXECUTAR TESTES DA TAREFA ANTES DE CONSIDERAR A TAREFA COMO `done`</critical>

## Arquivos Relevantes
- `agents/src/mastra/index.ts`
- `agents/src/mastra/`
- `agents/package.json`
- `agents/tsconfig.json`
- `.specs/prd-integracao-mastra-telegram/techspec.md`
