# Tarefa 7.0: Integrar o adapter Telegram ao runtime final do Marcos com observabilidade e políticas de erro

**Status:** done

<critical>Ler prd.md e techspec.md desta pasta — sua tarefa será invalidada se você pular</critical>

## Visão Geral

Conectar o adapter Telegram existente ao runtime final do `marcos-agent`, garantindo comportamento executivo, observabilidade ponta a ponta, políticas de erro consistentes e ausência total do fluxo de clima no canal.

<requirements>
- Atualizar o adapter Telegram para chamar apenas o runtime final do Marcos.
- Propagar `RequestContext`, `correlationId`, approval status e trilha de auditoria.
- Preservar allowlist, deduplicação, health e políticas de erro do canal.
- Cobrir RF-01, RF-02, RF-02A, RF-03, RF-18, RF-19, RF-20 e RF-22.
</requirements>

## Subtarefas

- [ ] 7.1 Atualizar router e runtime do Telegram para `marcos-agent`.
- [ ] 7.2 Integrar o contexto do canal com memória, workflows e auditoria do Marcos.
- [ ] 7.3 Garantir respostas controladas para legado, conflitos, suspensões e falhas operacionais.
- [ ] 7.4 Validar que o Telegram segue como único canal da V1 e que não há regressão na borda HTTP.

## Detalhes de Implementação

Referenciar `techspec.md` nas seções "Fluxo principal", "Endpoints de API", "Monitoramento e Observabilidade" e "Abordagem de Testes". O adapter Telegram continua determinístico e não assume governança de domínio.

## Critérios de Sucesso

- O Telegram só aciona o `marcos-agent`.
- O fluxo do canal preserva idempotência, allowlist, outbound auditado e tratamento de erro estável.
- Suspensões por aprovação humana são tratadas de forma explícita e operacionalmente segura.
- Não existe qualquer caminho funcional de retorno ao domínio `weather`.

## Skills Necessárias

<!-- MANDATÓRIO: preenchido por `create-tasks` Etapa 4.1 via descoberta agnóstica em `.agents/skills/`.
     NÃO inclua aqui skills auto-carregadas em runtime: `agent-governance`, `execute-task`, `bugfix`,
     `review`, `refactor`, nem skills `*-implementation` (linguagem, inferida pelo diff).
     Use o conteúdo único `Nenhuma além das auto-carregadas (governance + linguagem).` se a tarefa
     não exigir skill processual extra. -->

- `mastra` — Verificar a integração correta entre custom routes, `RequestContext`, agent runtime e observabilidade no Mastra atual do projeto.

## Testes da Tarefa

- [ ] Testes unitários do roteador/runtime Telegram para o Marcos
- [ ] Testes de integração do webhook com execução, suspensão e outbound auditado

<critical>SEMPRE CRIAR E EXECUTAR TESTES DA TAREFA ANTES DE CONSIDERAR A TAREFA COMO `done`</critical>

## Arquivos Relevantes
- `agents/src/telegram/router.ts`
- `agents/src/telegram/agent-runtime.ts`
- `agents/src/telegram/service.ts`
- `agents/src/telegram/store.ts`
- `agents/src/telegram/bootstrap.ts`
- `agents/src/mastra/index.ts`
- `agents/src/mastra/agents/`
- `agents/src/logger.ts`

## Evidências de Execução
- Relatório: `.specs/prd-substituicao-weather-por-marcos/7.0_execution_report.md`
- `ai-spec verify .` -> pass
- `ai-spec check-spec-drift .specs/prd-substituicao-weather-por-marcos/tasks.md` -> pass
- `cd agents && npm run typecheck` -> pass
- `cd agents && npm run test -- src/telegram/agent-runtime.test.ts src/telegram/router.test.ts src/telegram/service.test.ts` -> pass (`17` testes aprovados)
- `cd agents && npm run test` -> pass (`58` testes aprovados)
- `cd agents && npm run check` -> pass
- `cd agents && npm run dev` -> blocked por `ECONNREFUSED 127.0.0.1:55432` no PostgreSQL local durante o smoke
