# Tarefa 4.0: Configurar memória persistente, política de contexto e auditoria executiva do Marcos

**Status:** done

<critical>Ler prd.md e techspec.md desta pasta — sua tarefa será invalidada se você pular</critical>

## Visão Geral

Configurar a memória do `marcos-agent`, implementar a política de contexto seletivo e criar a trilha de auditoria executiva exigida pelo PRD. Esta tarefa garante persistência segura, economia de tokens e separação clara entre Knowledge e Memory.

<requirements>
- Configurar `Memory` do Mastra com política explícita para working memory e histórico.
- Implementar o assembler de contexto respeitando a hierarquia documental.
- Persistir auditoria executiva e fatos relevantes sem armazenar dados proibidos.
- Cobrir RF-12, RF-13, RF-14, RF-15, RF-16, RF-18, RF-19 e RF-24.
</requirements>

## Subtarefas

- [ ] 4.1 Configurar a memória do agente com política de leitura/escrita e contexto seletivo.
- [ ] 4.2 Implementar o assembler de contexto com precedência `Knowledge > Memory`.
- [ ] 4.3 Criar tabelas/estruturas de `marcos_execution_audit` e regras de persistência.
- [ ] 4.4 Bloquear armazenamento de segredos e documentos oficiais completos na memória persistente.

## Detalhes de Implementação

Referenciar `techspec.md` nas seções "Interfaces Chave", "Modelos de Dados", "Monitoramento e Observabilidade" e "Mapeamento Requisito -> Decisão -> Teste".

## Critérios de Sucesso

- O `marcos-agent` usa memória persistente sem tratar memória como fonte oficial da verdade.
- O assembler de contexto carrega apenas o necessário e consegue explicar a origem do contexto usado.
- A trilha de auditoria cobre workflow, capabilities, approval status e correlation ID.
- Existe proteção explícita contra gravação de dados proibidos.

## Skills Necessárias

<!-- MANDATÓRIO: preenchido por `create-tasks` Etapa 4.1 via descoberta agnóstica em `.agents/skills/`.
     NÃO inclua aqui skills auto-carregadas em runtime: `agent-governance`, `execute-task`, `bugfix`,
     `review`, `refactor`, nem skills `*-implementation` (linguagem, inferida pelo diff).
     Use o conteúdo único `Nenhuma além das auto-carregadas (governance + linguagem).` se a tarefa
     não exigir skill processual extra. -->

- `mastra` — Validar o uso atual de `Memory`, `RequestContext` e storage persistente do Mastra antes de implementar políticas de contexto e memória.

## Testes da Tarefa

- [ ] Testes unitários do assembler de contexto e das políticas de memória
- [ ] Testes de integração com storage persistente e auditoria executiva

<critical>SEMPRE CRIAR E EXECUTAR TESTES DA TAREFA ANTES DE CONSIDERAR A TAREFA COMO `done`</critical>

## Arquivos Relevantes
- `agents/src/mastra/memory/`
- `agents/src/mastra/context/`
- `agents/src/mastra/storage.ts`
- `agents/src/mastra/index.ts`
- `agents/src/telegram/store.ts`
- `docs/agents/marcos/memory_architecture_v1.md`
- `docs/agents/marcos/context_loading_strategy_v1.md`

## Evidências de Execução
- Relatório: `.specs/prd-substituicao-weather-por-marcos/4.0_execution_report.md`
- `ai-spec verify .` -> pass
- `ai-spec check-spec-drift .specs/prd-substituicao-weather-por-marcos/tasks.md` -> pass
- `cd agents && npm run typecheck` -> pass
- `cd agents && npm run test` -> pass (`48` testes aprovados)
- `cd agents && npm run check` -> pass
- `cd agents && npm run dev` -> blocked por `ECONNREFUSED 127.0.0.1:55432` no PostgreSQL local durante o smoke
