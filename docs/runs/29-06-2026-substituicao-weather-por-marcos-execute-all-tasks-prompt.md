# Prompt Pronto para Uso: `execute-all-tasks` para `prd-substituicao-weather-por-marcos`

## Observação de path da skill

O nome canônico da skill no repositório é `.agents/skills/execute-all-tasks/` e o nome correto é `execute-all-tasks` no plural. Se existir mirror em `.github/skills/execute-all-tasks/`, use-o apenas como ponto de entrada compatível com GitHub/Copilot, sem divergir da lógica canônica. Não use `execute-all-task` no singular.

## Prompt pronto para copiar

```md
Inicie esta execução usando a skill `execute-all-tasks` para o PRD `.specs/prd-substituicao-weather-por-marcos/`.

Se houver mirror em `.github/skills/execute-all-tasks/`, use-o apenas como wrapper compatível, mas trate `.agents/skills/execute-all-tasks/SKILL.md` como a fonte canônica e obrigatória da orquestração. Não substitua a lógica por nenhuma skill com nome divergente, incluindo `execute-all-task`.

Objetivo:
Executar integralmente o PRD `substituicao-weather-por-marcos`, sem desvios, sem reinterpretação, sem flexibilização indevida, sem “modo legado”, sem falso positivo e com padrão real de production-ready/proof. A execução deve transformar o estado atual do repositório até o fechamento honesto de todas as tarefas ou até o primeiro bloqueio real, explícito e verificável.

Conjunto obrigatório de leitura e validação antes de qualquer mutação:
- `AGENTS.md`
- `.agents/skills/agent-governance/SKILL.md`
- `.agents/skills/node-implementation/SKILL.md`
- `.agents/skills/mastra/SKILL.md`
- `.agents/skills/execute-all-tasks/SKILL.md`
- `.agents/skills/execute-task/SKILL.md`
- `.specs/prd-substituicao-weather-por-marcos/prd.md`
- `.specs/prd-substituicao-weather-por-marcos/techspec.md`
- `.specs/prd-substituicao-weather-por-marcos/tasks.md`
- `.specs/prd-substituicao-weather-por-marcos/task-1.0-remover-legado-weather-e-fixar-marcos-no-telegram.md`
- `.specs/prd-substituicao-weather-por-marcos/task-2.0-criar-fundacao-do-marcos-agent-e-manifest-documental.md`
- `.specs/prd-substituicao-weather-por-marcos/task-3.0-implementar-catalogo-de-knowledge-e-rag-do-marcos.md`
- `.specs/prd-substituicao-weather-por-marcos/task-4.0-configurar-memoria-persistente-contexto-e-auditoria.md`
- `.specs/prd-substituicao-weather-por-marcos/task-5.0-implementar-workflows-core-com-aprovacao-humana.md`
- `.specs/prd-substituicao-weather-por-marcos/task-6.0-materializar-capabilities-operators-tools-e-tool-registry.md`
- `.specs/prd-substituicao-weather-por-marcos/task-7.0-integrar-telegram-ao-runtime-final-do-marcos.md`
- `.specs/prd-substituicao-weather-por-marcos/task-8.0-fechar-qualidade-readiness-e-validacao-final.md`
- `.specs/prd-substituicao-weather-por-marcos/adr-001-runtime-exclusivo-mastra-e-substituicao-total-do-weather.md`
- `.specs/prd-substituicao-weather-por-marcos/adr-002-documentacao-oficial-como-knowledge-e-gate-de-readiness.md`
- `.specs/prd-substituicao-weather-por-marcos/adr-003-aprovacao-humana-obrigatoria-via-workflows-suspensiveis.md`
- Todos os arquivos sob `docs/agents/marcos/`, sem reduzir o escopo a subconjunto mínimo.

Estado inicial obrigatório a respeitar:
- `tasks.md` contém 8 tarefas top-level, todas atualmente em `pending`.
- `tasks.md` está com `spec-hash-prd` e `spec-hash-techspec` zerados.
- Não há evidência prévia de execução consolidada deste PRD nesta pasta.
- Portanto, o orquestrador deve tratar este PRD como execução nova com preflight completo e sem mascarar drift, hash inválido, hook ausente ou evidência faltante.

Pré-voo obrigatório e sem degradação silenciosa:
- Resolver o slug corretamente para `.specs/prd-substituicao-weather-por-marcos/`.
- Invocar o hook `pre-execute-all-tasks.sh` pela cascata portátil definida na skill.
- Rodar o gate de profundidade de invocação pela lib canônica.
- Validar presença do binário `ai-spec`; se ausente, retornar `needs_input` com instrução objetiva de instalação.
- Executar `ai-spec skills --verify`.
- Executar `ai-spec check-spec-drift .specs/prd-substituicao-weather-por-marcos/tasks.md`.
- Se o fluxo oficial exigir sincronização de hash antes da execução, fazê-la somente pelo mecanismo canônico da stack `ai-spec`, nunca editando hash manualmente no arquivo.
- Não seguir adiante se houver drift, hook ausente, ciclo, contrato quebrado ou pré-condição não satisfeita.

Sequenciamento obrigatório:
- Respeitar exatamente a DAG definida em `tasks.md`.
- Ordem topológica esperada:
  - `1.0`
  - `2.0`
  - `3.0` e `4.0` podem rodar em paralelo somente se o tool realmente suportar paralelismo nativo seguro
  - `5.0`
  - `6.0`
  - `7.0`
  - `8.0`
- Não antecipar `5.0`, `6.0`, `7.0` ou `8.0`.
- Não paralelizar nada além do que está explicitamente permitido em `tasks.md`.

Escopo funcional obrigatório que deve ser entregue sem redução:
- Remover completamente o legado `weather` das superfícies ativas de runtime, roteamento, workflow, tool, scorer, help text, testes e referências operacionais relevantes.
- Registrar `marcos-agent` como único agente oficial do Telegram.
- Materializar a arquitetura modular em Mastra com separação clara entre `Knowledge`, `Capabilities`, `Tools`, `Operators`, `Workflows`, `Memory` e `Agent`.
- Tratar `docs/agents/marcos/` como fonte institucional obrigatória, com cobertura integral da V1.
- Implementar catálogo persistido de knowledge, sincronização documental, checksums, chunking e pipeline de RAG compatível com o stack Mastra realmente instalado.
- Implementar memória persistente governada, contexto seletivo e precedência explícita `Knowledge > Memory`.
- Implementar aprovação humana obrigatória na V1 por workflows suspensíveis nativos do Mastra, com persistência, retomada e auditoria.
- Materializar capabilities, operators e tools documentadas, inclusive `tool registry` com status real e rastreável.
- Integrar o adapter Telegram ao runtime final do Marcos preservando allowlist, idempotência, health, políticas de erro, correlação e outbound auditado.
- Fechar readiness, testes, evidências e validação final para `main`.

Regras invioláveis:
- Não inventar APIs, construtores, modelos, flags, helpers ou comportamentos do Mastra; verificar localmente em `.agents/skills/mastra/` e nos pacotes instalados em `agents/node_modules/@mastra/*`.
- Não criar runtime paralelo ao Mastra.
- Não manter coexistência ambígua entre `weather` e `Marcos`.
- Não deixar documento obrigatório de `docs/agents/marcos/` apenas como contexto informal de prompt.
- Não tratar memória persistente como fonte oficial da verdade.
- Não armazenar segredos, tokens, senhas, documentos oficiais completos nem regras permanentes de negócio em memória persistente.
- Não deslocar a governança de aprovação humana para o adapter Telegram ou para convenção de prompt.
- Não marcar tarefa como `done` sem teste executado, evidência física e atualização consistente de `tasks.md`.
- Não reclassificar problema real como detalhe opcional.
- Não seguir em frente com hooks ausentes ou contratos YAML inválidos.

Cobertura documental mínima obrigatória:
- Todo arquivo de `docs/agents/marcos/` deve cair em uma destas categorias verificáveis: `constitution`, `system-prompt`, `capability`, `workflow`, `operator`, `tool`, `handbook`, `standard` ou `architecture`.
- Todo documento obrigatório deve ter cobertura rastreável por manifesto, catálogo, componente executável, registry declarativo ou gate de readiness.
- Drift, checksum divergente, documento novo sem cobertura ou documento obrigatório ausente devem bloquear readiness e impedir encerramento falso como `done`.

Critérios de execução por tarefa:
- `1.0`: remover `weather-agent`, `weather-workflow`, `weather-tool`, `weather-scorer` e qualquer roteamento ativo associado; atualizar help text e testes para impedir retorno funcional ao clima.
- `2.0`: criar `marcos-agent`, manifest documental tipado e `GET /marcos/health` com falha explícita quando faltar cobertura mínima.
- `3.0`: persistir `marcos_knowledge_documents` e `marcos_knowledge_chunks`, sincronizar `docs/agents/marcos/`, expor `GET /marcos/knowledge/status` e bloquear readiness quando houver drift.
- `4.0`: configurar memória do Mastra, assembler de contexto, auditoria executiva e proteção contra gravação de dados proibidos.
- `5.0`: implementar workflows core, suspensão/retomada, persistência de aprovações e endpoint interno de resolução, sem bypass de aprovação humana.
- `6.0`: converter todo o inventário documental de capabilities/operators/tools em componentes concretos ou registry governado, com contrato único e estados reais como `real`, `stub` ou `read-only`.
- `7.0`: conectar Telegram ao runtime final do Marcos, propagar `RequestContext`, `correlationId`, approval status e auditoria, mantendo allowlist, deduplicação e tratamento de erro estáveis.
- `8.0`: consolidar cobertura automatizada, readiness final, `npm run check`, smoke de `npm run dev` e evidências objetivas para liberação em `main`.

Qualidade e prova operacional exigidas:
- Zero referência funcional ativa a `weather` após a conclusão.
- Zero go-live falso.
- Zero bypass de aprovação humana nas ações sensíveis.
- Zero readiness “verde” com documento obrigatório sem cobertura.
- Zero teste faltante nas tarefas que alterarem comportamento.
- Zero afirmação de production-ready sem evidência automática ou operacional objetiva.

Validação obrigatória ao longo da execução:
- Em cada tarefa, exigir criação ou atualização dos testes da própria tarefa antes de `done`, conforme o respectivo `task-*.md`.
- Rodar validações proporcionais durante a execução, sem pular testes direcionados.
- Ao final, rodar em `agents/`:
  - `npm run check`
  - `npm run dev` para confirmar que o runtime sobe corretamente, se houve toque em comportamento de runtime
- Confirmar que os endpoints de health/status relevantes respondem com estado coerente ao desenho final.
- Confirmar por teste e/ou evidência operacional:
  - ausência de `weather-agent` no runtime registrado
  - Telegram apontando apenas para `marcos-agent`
  - knowledge catalog sincronizado
  - approvals suspensíveis persistindo e retomando
  - auditoria executiva com `correlationId`
  - policies de memória impedindo gravação de dados proibidos

Contrato de orquestração obrigatório:
- Cada tarefa deve ser executada por subagent fresh via `execute-task`.
- O subagent deve retornar somente YAML canônico com `status`, `report_path` e `summary`.
- `report_path` deve ser relativo à raiz do repositório.
- Sem YAML válido, sem checkpoint válido ou sem evidência física, a tarefa deve falhar.
- O orquestrador não deve editar `tasks.md` diretamente fora do fluxo previsto pela skill.

Critério de encerramento:
- Encerrar como `done` apenas se as 8 tarefas estiverem efetivamente concluídas, com evidência física consistente, testes executados, validação final aprovada e `_orchestration_report.md` honesto.
- Encerrar como `partial`, `failed`, `blocked` ou `needs_input` se qualquer gate real impedir conclusão íntegra.
- Se houver bloqueio externo, drift, lacuna documental, falha de readiness, falta de binário, ausência de hook ou contrato quebrado, registrar explicitamente o motivo e não mascarar o estado.

Artefatos de saída esperados:
- `.specs/prd-substituicao-weather-por-marcos/<id>_execution_report.md` para cada tarefa executada
- `.specs/prd-substituicao-weather-por-marcos/_orchestration_report.md`
- Atualizações consistentes em `.specs/prd-substituicao-weather-por-marcos/tasks.md`
- Evidência objetiva de validação final no workspace `agents`
```
