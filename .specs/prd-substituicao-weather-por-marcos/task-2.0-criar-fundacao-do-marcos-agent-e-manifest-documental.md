# Tarefa 2.0: Criar a fundação do marcos-agent e o manifest documental obrigatório em Mastra

**Status:** done

<critical>Ler prd.md e techspec.md desta pasta — sua tarefa será invalidada se você pular</critical>

## Visão Geral

Criar o `marcos-agent` como agente principal do serviço, registrar o inventário documental obrigatório de `docs/agents/marcos/` e implementar o primeiro gate de readiness que bloqueia execução quando a cobertura documental mínima não existe.

<requirements>
- Registrar `marcos-agent` exclusivamente em Mastra.
- Criar manifesto tipado dos documentos oficiais com classificação por `kind`.
- Implementar health/status inicial para provar presença do agente e do manifest.
- Cobrir RF-04, RF-05, RF-06, RF-07, RF-08, RF-09, RF-10 e RF-10A.
</requirements>

## Subtarefas

- [ ] 2.1 Criar o arquivo do `marcos-agent` com instruções compostas e modelo validado pelas convenções atuais do Mastra.
- [ ] 2.2 Estruturar o manifest documental de `docs/agents/marcos/` com tipagem e metadados obrigatórios.
- [ ] 2.3 Registrar o agente e o status inicial no entrypoint do serviço.
- [ ] 2.4 Implementar `GET /marcos/health` com falha explícita quando faltarem manifest ou registro do agente.

## Detalhes de Implementação

Referenciar `techspec.md` nas seções "Visão Geral dos Componentes", "Interfaces Chave" e "Endpoints de API". A fundação deve ser 100% Mastra, sem runtime paralelo.

## Critérios de Sucesso

- `marcos-agent` existe, está registrado e é o único agente oficial planejado para o canal Telegram.
- O inventário documental de Marcos está explícito em código, sem depender de contexto implícito.
- O healthcheck falha corretamente quando o inventário obrigatório está ausente ou incompleto.
- A implementação não inventa APIs do Mastra fora das referências locais instaladas.

## Skills Necessárias

<!-- MANDATÓRIO: preenchido por `create-tasks` Etapa 4.1 via descoberta agnóstica em `.agents/skills/`.
     NÃO inclua aqui skills auto-carregadas em runtime: `agent-governance`, `execute-task`, `bugfix`,
     `review`, `refactor`, nem skills `*-implementation` (linguagem, inferida pelo diff).
     Use o conteúdo único `Nenhuma além das auto-carregadas (governance + linguagem).` se a tarefa
     não exigir skill processual extra. -->

- `mastra` — Verificar a forma atual de registrar agentes, custom routes e configuração de runtime no Mastra instalado no projeto.

## Testes da Tarefa

- [ ] Testes unitários do manifest documental e do health inicial
- [ ] Testes de integração confirmando registro do `marcos-agent` no serviço Mastra

<critical>SEMPRE CRIAR E EXECUTAR TESTES DA TAREFA ANTES DE CONSIDERAR A TAREFA COMO `done`</critical>

## Arquivos Relevantes
- `agents/src/mastra/index.ts`
- `agents/src/mastra/config.ts`
- `agents/src/mastra/agents/`
- `agents/src/mastra/knowledge/`
- `docs/agents/marcos/`

## Evidências de Execução
- Relatório: `.specs/prd-substituicao-weather-por-marcos/2.0_execution_report.md`
- `ai-spec verify` -> pass
- `ai-spec check-spec-drift .specs/prd-substituicao-weather-por-marcos/tasks.md` -> pass
- `cd agents && npm run typecheck` -> pass
- `cd agents && npm run test` -> pass (`28` testes aprovados)
- `cd agents && npm run check` -> pass
- `cd agents && npm run dev` -> blocked por `ECONNREFUSED 127.0.0.1:55432` no PostgreSQL local durante o smoke
