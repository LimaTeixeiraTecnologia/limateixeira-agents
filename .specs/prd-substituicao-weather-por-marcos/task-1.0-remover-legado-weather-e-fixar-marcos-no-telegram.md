# Tarefa 1.0: Remover o legado weather e fixar marcos-agent como único destino do Telegram

**Status:** done

<critical>Ler prd.md e techspec.md desta pasta — sua tarefa será invalidada se você pular</critical>

## Visão Geral

Eliminar completamente o legado `weather` do runtime ativo e garantir que o adapter Telegram só reconheça `marcos-agent` como destino oficial. Esta tarefa prepara a base da migração sem coexistência ambígua entre o agente antigo e o novo.

<requirements>
- Remover `weather-agent`, `weather-workflow`, `weather-tool` e `weather-scorer` das superfícies ativas do serviço.
- Atualizar roteamento, help text, runtime e testes do Telegram para impedir qualquer execução futura de `weather`.
- Manter o adapter Telegram operacional e previsível durante a transição.
- Cobrir explicitamente RF-01, RF-02, RF-02A e RF-03.
</requirements>

## Subtarefas

- [ ] 1.1 Inventariar todas as referências ativas a `weather` em `agents/src`, testes e documentação operacional local.
- [ ] 1.2 Remover registro e execução do runtime `weather` no entrypoint Mastra e no adapter Telegram.
- [ ] 1.3 Atualizar help text, roteador e suites de teste para o novo comportamento centrado em Marcos.
- [ ] 1.4 Validar que nenhuma rota ativa, teste crítico ou estado persistido continue apontando para `weather-agent`.

## Detalhes de Implementação

Referenciar `techspec.md` nas seções de arquitetura do sistema, abordagem de testes e mapeamento `RF-01` a `RF-03`. Esta tarefa deve preservar o adapter Telegram e trocar apenas o domínio ativo.

## Critérios de Sucesso

- Nenhum componente ativo de produção continua registrando ou chamando `weather-agent`.
- O Telegram deixa de aceitar o fluxo de clima como comportamento oficial do canal.
- As suites relevantes detectam qualquer regressão que reintroduza `weather`.
- O diff é pequeno o suficiente para ser revisado objetivamente antes de avançar para a fundação do Marcos.

## Skills Necessárias

<!-- MANDATÓRIO: preenchido por `create-tasks` Etapa 4.1 via descoberta agnóstica em `.agents/skills/`.
     NÃO inclua aqui skills auto-carregadas em runtime: `agent-governance`, `execute-task`, `bugfix`,
     `review`, `refactor`, nem skills `*-implementation` (linguagem, inferida pelo diff).
     Use o conteúdo único `Nenhuma além das auto-carregadas (governance + linguagem).` se a tarefa
     não exigir skill processual extra. -->

- `mastra` — Verificar APIs e convenções atuais do runtime Mastra ao remover o agente legado e atualizar o registro oficial.

## Testes da Tarefa

- [ ] Testes unitários do roteador/runtime Telegram cobrindo ausência de `weather-agent`
- [ ] Testes de integração assegurando que o entrypoint Mastra não expõe mais o legado

<critical>SEMPRE CRIAR E EXECUTAR TESTES DA TAREFA ANTES DE CONSIDERAR A TAREFA COMO `done`</critical>

## Arquivos Relevantes
- `agents/src/mastra/index.ts`
- `agents/src/mastra/agents/weather-agent.ts`
- `agents/src/mastra/workflows/weather-workflow.ts`
- `agents/src/mastra/tools/weather-tool.ts`
- `agents/src/mastra/scorers/weather-scorer.ts`
- `agents/src/telegram/router.ts`
- `agents/src/telegram/agent-runtime.ts`
- `agents/src/telegram/constants.ts`
- `agents/src/telegram/*.test.ts`

## Evidências de Execução
- Relatório: `.specs/prd-substituicao-weather-por-marcos/1.0_execution_report.md`
- `ai-spec verify` -> pass
- `ai-spec check-spec-drift .specs/prd-substituicao-weather-por-marcos/tasks.md` -> pass
- `cd agents && npm run typecheck` -> pass
- `cd agents && npm run test` -> pass (`24` testes aprovados)
- `cd agents && npm run check` -> pass
- `cd agents && npm run dev` -> blocked por `ECONNREFUSED 127.0.0.1:55432` no PostgreSQL local durante o smoke
