# Tarefa 5.0: Implementar workflows core com aprovação humana obrigatória e endpoints operacionais

**Status:** done

<critical>Ler prd.md e techspec.md desta pasta — sua tarefa será invalidada se você pular</critical>

## Visão Geral

Implementar os workflows core de Marcos em Mastra, com aprovação humana obrigatória desde a V1, suspensão/retomada persistida e endpoints operacionais para resolver aprovações e inspecionar prontidão.

<requirements>
- Implementar workflows core de planejamento diário, aprovação humana, atualização de conhecimento, notificação e relatórios.
- Usar suspensão/retomada nativas do Mastra para ações sujeitas a aprovação.
- Persistir solicitações e resoluções de aprovação.
- Cobrir RF-11, RF-18, RF-19, RF-19A, RF-21 e RF-24.
</requirements>

## Subtarefas

- [ ] 5.1 Criar workflows core com steps suspensíveis e schemas de `suspend`/`resume`.
- [ ] 5.2 Implementar persistência de aprovações e status operacional.
- [ ] 5.3 Expor endpoint interno de resolução de aprovações.
- [ ] 5.4 Garantir que ações sujeitas a aprovação não executem sem decisão humana explícita.

## Detalhes de Implementação

Referenciar `techspec.md` nas seções "Visão Geral dos Componentes", "Endpoints de API", "Pontos de Integração" e ADR 003. Toda modelagem de aprovação deve permanecer dentro do runtime Mastra, não no adapter Telegram.

## Critérios de Sucesso

- Workflows sensíveis suspendem e retomam corretamente com estado persistido.
- Aprovação humana obrigatória está implementada desde a V1, sem bypass por prompt ou rota paralela.
- Os endpoints operacionais não expõem superfícies públicas indevidas.
- A auditoria registra pedidos, resoluções, rejeições e retomadas.

## Skills Necessárias

<!-- MANDATÓRIO: preenchido por `create-tasks` Etapa 4.1 via descoberta agnóstica em `.agents/skills/`.
     NÃO inclua aqui skills auto-carregadas em runtime: `agent-governance`, `execute-task`, `bugfix`,
     `review`, `refactor`, nem skills `*-implementation` (linguagem, inferida pelo diff).
     Use o conteúdo único `Nenhuma além das auto-carregadas (governance + linguagem).` se a tarefa
     não exigir skill processual extra. -->

- `mastra` — Verificar o uso atual de workflows suspensíveis, custom routes e persistência de snapshots no Mastra instalado no projeto.

## Testes da Tarefa

- [ ] Testes unitários dos steps de aprovação e regras de bloqueio
- [ ] Testes de integração cobrindo `start`, `suspend`, `resume` e `reject`

<critical>SEMPRE CRIAR E EXECUTAR TESTES DA TAREFA ANTES DE CONSIDERAR A TAREFA COMO `done`</critical>

## Arquivos Relevantes
- `agents/src/mastra/workflows/`
- `agents/src/mastra/index.ts`
- `agents/src/mastra/storage.ts`
- `docs/agents/marcos/04_human_approval_workflow.md`
- `docs/agents/marcos/06_knowledge_update_workflow.md`
- `docs/agents/marcos/07_notification_workflow.md`
- `docs/agents/marcos/05_report_generation_workflow.md`
- `docs/agents/marcos/01_daily_planning_workflow.md`

## Evidências de Execução
- Relatório: `.specs/prd-substituicao-weather-por-marcos/5.0_execution_report.md`
- `ai-spec verify .` -> pass
- `ai-spec check-spec-drift .specs/prd-substituicao-weather-por-marcos/tasks.md` -> pass
- `cd agents && npm run typecheck` -> pass
- `cd agents && npm run test` -> pass (`52` testes aprovados)
- `cd agents && npm run check` -> pass
- `cd agents && npm run dev` -> blocked por `ECONNREFUSED 127.0.0.1:55432` no PostgreSQL local durante o smoke
