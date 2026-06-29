# Tarefa 8.0: Fechar qualidade de produção, readiness gates e validação final para main

<critical>Ler prd.md e techspec.md desta pasta — sua tarefa será invalidada se você pular</critical>

## Visão Geral

Consolidar a prontidão para produção da substituição, com suites automáticas, readiness gates, verificação de ausência de drift documental e validação operacional final do serviço Mastra antes de liberar `main`.

<requirements>
- Implementar e estabilizar a suíte final de testes unitários, integração e E2E.
- Validar readiness gates de health, knowledge, approvals e ausência do legado `weather`.
- Executar os comandos de validação do workspace `agents`, incluindo `npm run check` e smoke de `npm run dev`.
- Cobrir RF-03, RF-18, RF-21, RF-22, RF-23 e RF-24.
</requirements>

## Subtarefas

- [ ] 8.1 Consolidar cobertura automatizada de regressão para knowledge, memory, workflows e Telegram.
- [ ] 8.2 Implementar gate final de readiness e checklist de go-live.
- [ ] 8.3 Rodar validações do workspace `agents` e capturar evidências objetivas.
- [ ] 8.4 Confirmar que o runtime está apto para `main` sem referências ativas ao legado nem gaps conhecidos abertos.

## Detalhes de Implementação

Referenciar `techspec.md` nas seções "Abordagem de Testes", "Monitoramento e Observabilidade", "Riscos Conhecidos" e "Sequenciamento de Desenvolvimento". Esta tarefa é o bloqueio final para merge.

## Critérios de Sucesso

- `npm run check` passa no workspace `agents`.
- `npm run dev` sobe sem erro e os health endpoints relevantes reportam estado coerente.
- Todas as verificações críticas do PRD/techspec têm evidência automatizada ou operacional objetiva.
- Não restam referências funcionais ativas ao legado `weather` nem lacunas documentadas sem tratamento.

## Skills Necessárias

<!-- MANDATÓRIO: preenchido por `create-tasks` Etapa 4.1 via descoberta agnóstica em `.agents/skills/`.
     NÃO inclua aqui skills auto-carregadas em runtime: `agent-governance`, `execute-task`, `bugfix`,
     `review`, `refactor`, nem skills `*-implementation` (linguagem, inferida pelo diff).
     Use o conteúdo único `Nenhuma além das auto-carregadas (governance + linguagem).` se a tarefa
     não exigir skill processual extra. -->

- `mastra` — Verificar os comandos, healthchecks e comportamentos do runtime Mastra exigidos para evidência final de prontidão em produção.

## Testes da Tarefa

- [ ] Testes unitários consolidados
- [ ] Testes de integração e E2E consolidados, além de `npm run check`

<critical>SEMPRE CRIAR E EXECUTAR TESTES DA TAREFA ANTES DE CONSIDERAR A TAREFA COMO `done`</critical>

## Arquivos Relevantes
- `agents/package.json`
- `agents/README.md`
- `agents/src/`
- `.specs/prd-substituicao-weather-por-marcos/prd.md`
- `.specs/prd-substituicao-weather-por-marcos/techspec.md`
- `.specs/prd-substituicao-weather-por-marcos/task-*.md`
