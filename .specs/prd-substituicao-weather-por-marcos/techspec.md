<!-- spec-hash-prd: fc1570dfaf76735b535d09d891136762e22fad5360de0ed32b5e6a2b7f42517d -->
<!-- MANDATÓRIO: preenchido por `create-technical-specification` Etapa 7.1 com sha256 do PRD consumido.
     Rastreabilidade: `create-tasks` e `execute-task` comparam este hash com o atual do prd.md
     para detectar drift entre techspec e PRD. NÃO remover este comentário ao editar a techspec. -->

# Especificação Técnica: Substituição Completa do Weather pelo Agente Marcos

## Resumo Executivo

A implementação substituirá o runtime atual centrado em `weather-agent` por um runtime exclusivamente baseado em `Mastra`, com um único agente oficial `marcos-agent` exposto inicialmente apenas no canal Telegram. O serviço continuará sendo o workspace `agents`, preservando `PostgresStore`, `RequestContext`, `apiRoutes` customizadas e o adapter Telegram já existente, mas o domínio de clima será removido integralmente e trocado por uma arquitetura modular orientada a `Knowledge`, `Capabilities`, `Workflows`, `Operators`, `Tools` e `Memory`, conforme `docs/agents/marcos/`.

O desenho prioriza robustez operacional e redução de falso positivo. Nenhuma superfície de produção continuará roteando para `weather`, nenhum comportamento executivo de Marcos ficará codificado apenas em prompts inline, e nenhuma memória persistente será tratada como fonte oficial da verdade. O go-live de `main` só é permitido quando coexistirem: cobertura total do escopo documental de `docs/agents/marcos/`, aprovação humana obrigatória nas ações documentadas, observabilidade ponta a ponta e validação automatizada suficiente para impedir regressão silenciosa.

## Arquitetura do Sistema

### Visão Geral dos Componentes

- `agents/src/mastra/agents/marcos-agent.ts`
  - novo agente principal Mastra.
  - substitui `weather-agent` como único agente oficial do Telegram.
  - usa instruções compostas a partir da Constituição, System Prompt, políticas e contexto carregado dinamicamente.
- `agents/src/mastra/knowledge/marcos/`
  - manifesto versionado dos documentos em `docs/agents/marcos/`.
  - classifica cada documento por tipo: `constitution`, `system-prompt`, `capability`, `workflow`, `operator`, `tool`, `handbook`, `standard`, `architecture`.
- `agents/src/mastra/context/`
  - resolve estratégia de carregamento de contexto conforme `context_loading_strategy_v1.md`.
  - monta prompt/runtime context com priorização: Constituição -> System Prompt -> memória relevante -> capability/workflow -> RAG.
- `agents/src/mastra/workflows/core/`
  - workflows transversais: planejamento diário, aprovação humana, atualização de conhecimento, notificação, relatórios.
- `agents/src/mastra/workflows/business/`
  - workflows do domínio Marcos derivados de `docs/agents/marcos/*workflow*.md`.
- `agents/src/mastra/capabilities/`
  - módulos puros de raciocínio e transformação por capability documentada.
- `agents/src/mastra/operators/`
  - camada de orquestração operacional com validação, política, retries e logs estruturados.
- `agents/src/mastra/tools/`
  - integrações externas com contrato único inspirado em `tool_contract_standard.md`.
  - na V1, pode haver tool real, stub governado ou adapter read-only, mas cada tool documentada deve existir explicitamente com status implementacional rastreável.
- `agents/src/mastra/memory/`
  - configuração do `Memory` do Mastra, working memory, política de resumo e integração com storage.
- `agents/src/mastra/rag/`
  - pipeline de indexação e recuperação para os documentos oficiais de Marcos usando o stack Mastra compatível com PostgreSQL/pgvector.
- `agents/src/telegram/`
  - mantém webhook, allowlist, idempotência e persistência já existentes, mas troca o roteamento e runtime para `marcos-agent`.
- `agents/src/mastra/index.ts`
  - continua como entrypoint do serviço, registrando `marcosAgent`, workflows, scorers, storage e `apiRoutes`.

Fluxo principal:

1. Telegram entrega update ao adapter HTTP já existente.
2. O adapter valida origem, allowlist e idempotência.
3. O roteador determinístico seleciona `marcos-agent`.
4. `RequestContext` injeta `channel`, `telegramUserId`, `telegramChatId`, `allowedPersonKey` e metadados de aprovação.
5. `marcos-agent` resolve contexto documental, memória relevante e workflow/capability necessários.
6. Workflows e operators executam tools compatíveis com a política de aprovação.
7. O resultado é auditado, persistido, resumido em memória quando permitido e enviado ao Telegram.

## Design de Implementação

### Interfaces Chave

```ts
export type MarcosDocumentKind =
  | 'constitution'
  | 'system-prompt'
  | 'capability'
  | 'workflow'
  | 'operator'
  | 'tool'
  | 'handbook'
  | 'standard'
  | 'architecture';

export interface MarcosKnowledgeDocument {
  id: string;
  path: string;
  kind: MarcosDocumentKind;
  title: string;
  version: string | null;
  tags: string[];
  requiredForV1: true;
}

export interface MarcosContextAssembler {
  build(input: {
    taskText: string;
    threadId: string;
    resourceId: string;
    requestContext: RequestContext;
  }): Promise<MarcosExecutionContext>;
}

export interface MarcosExecutionContext {
  identityPrompt: string;
  applicableCapabilities: string[];
  applicableWorkflows: string[];
  retrievedKnowledge: MarcosKnowledgeChunk[];
  memoryPolicy: {
    readOnly: boolean;
    requiresApproval: boolean;
  };
}

export interface ApprovalDecision {
  status: 'approved' | 'rejected';
  approverId: string;
  reason?: string;
}

export interface MarcosToolContract<I, O> {
  execute(input: {
    operation: string;
    payload: I;
    context: MarcosExecutionContext;
    metadata: Record<string, unknown>;
    timeoutMs?: number;
    correlationId: string;
  }): Promise<{
    success: boolean;
    data?: O;
    metadata: Record<string, unknown>;
    executionTimeMs: number;
    provider: string;
    version: string;
    correlationId: string;
    error?: {
      errorCode: string;
      errorType: string;
      message: string;
      retryable: boolean;
      providerDetails?: unknown;
    };
  }>;
}
```

### Modelos de Dados

Reuso obrigatório do schema `agents` já adotado por `PostgresStore` e pelo adapter Telegram.

Tabelas/estruturas novas ou alteradas:

- Mastra storage já existente:
  - `mastra_threads`
  - `mastra_messages`
  - `mastra_resources`
  - `mastra_workflow_snapshot`
  - `mastra_traces`
  - `mastra_scorers`
- Tabelas novas sob `agents` para Marcos:
  - `agents.marcos_knowledge_documents`
    - catálogo dos arquivos oficiais carregados de `docs/agents/marcos/`.
    - colunas: `document_id`, `path`, `kind`, `title`, `version`, `checksum`, `active`, `created_at`, `updated_at`.
  - `agents.marcos_knowledge_chunks`
    - chunks indexáveis para RAG.
    - colunas: `chunk_id`, `document_id`, `chunk_order`, `content`, `token_count`, `metadata_json`, `created_at`.
  - `agents.marcos_execution_audit`
    - trilha de decisões de alto nível.
    - colunas: `id`, `thread_id`, `resource_id`, `workflow_id`, `capability_ids`, `approval_status`, `decision_summary`, `correlation_id`, `created_at`.
  - `agents.marcos_human_approvals`
    - suspensões e retomadas de workflow para aprovação.
    - colunas: `id`, `workflow_run_id`, `step_id`, `approval_type`, `status`, `requested_payload_json`, `resolved_payload_json`, `requested_at`, `resolved_at`, `resolved_by`.
  - `agents.marcos_tool_registry`
    - catálogo declarativo do status das tools documentadas.
    - colunas: `tool_id`, `source_doc`, `implementation_status`, `mode`, `created_at`, `updated_at`.

Observações:

- `marcos_knowledge_documents` e `marcos_knowledge_chunks` são domínio do produto e não substituem `mastra_resources`.
- working memory e message history continuam sob o storage do Mastra.
- dados sensíveis, secrets e documentos oficiais completos não entram em memória persistente; apenas metadados de recuperação, fatos consolidados e logs de auditoria.

### Endpoints de API

Endpoints mantidos:

- `POST /telegram/webhook/:webhookKey`
- `GET /telegram/health`

Endpoints novos via `apiRoutes` do Mastra:

- `GET /marcos/health`
  - readiness do runtime Marcos.
  - valida presença de knowledge catalog, storage, allowlist Telegram e registro do agente.
- `POST /marcos/approvals/:approvalId/resolve`
  - uso interno para retomar workflow suspenso com decisão humana.
  - `requiresAuth: false` não é permitido; deve ficar protegido por auth/borda operacional.
- `GET /marcos/knowledge/status`
  - inspeciona índice e sincronização entre `docs/agents/marcos/` e catálogo persistido.

Contratos:

- respostas de erro seguem `{"error":{"code":"...","message":"..."}}`.
- nenhuma rota de produção deve expor stack trace bruto.

## Pontos de Integração

- `Mastra`
  - runtime exclusivo e inegociável para agente, workflows, storage, memory, observability e custom routes.
  - uso explícito de `Agent`, `Memory`, `RequestContext`, `createWorkflow`/`createStep`, `PostgresStore` e `apiRoutes`.
- `PostgreSQL`
  - storage único para runtime Mastra, auditoria, catálogo documental e estado do Telegram.
- `Telegram Bot API`
  - único canal da V1.
  - continua no adapter já existente, sem fallback para outros canais.
- `RAG / pgvector`
  - pipeline obrigatório para os documentos oficiais de Marcos.
  - implementação usa o stack Mastra compatível com Postgres; a seleção exata de embedder deve ser verificada localmente no estágio de implementação, sem alterar esta arquitetura.
- `OpenRouter`
  - modelo conversacional atual permanece como baseline até decisão explícita em ADR futura.

Tratamento de erros:

- validação na fronteira com `zod`.
- erros de domínio e infraestrutura encapsulados em classes tipadas no padrão já usado pelo adapter Telegram.
- retries automáticos no máximo 2 vezes e apenas para falhas transitórias de integrações.
- workflows com ação externa mutável exigem aprovação ou idempotência explícita antes de retry.

## Abordagem de Testes

### Testes Unitários

Cobertura mínima obrigatória:

- roteador Telegram para garantir substituição completa de `weather` por `marcos-agent`.
- catálogo documental de `docs/agents/marcos/` e classificação por tipo.
- assembler de contexto respeitando a ordem: Constituição -> System Prompt -> memória -> capability/workflow -> RAG.
- contratos de tools e normalização de erros.
- política de memória: bloqueio de segredos, Knowledge prevalecendo sobre Memory, seleção de memória relevante.
- mapeamento de aprovação humana por workflow/ação.

Casos obrigatórios:

- comando legado `/weather` não aciona runtime de clima e não mantém `currentAgentId=weather-agent`.
- conflito documental produz saída estruturada de conflito.
- documento obrigatório ausente bloqueia readiness de Marcos.
- tool em modo `stub` nunca executa ação externa real.

### Testes de Integração

Sim. São obrigatórios porque:

- há IO crítico em PostgreSQL;
- há acoplamento entre adapter Telegram, storage do Mastra, workflow snapshots e trilha de aprovação;
- mocks isolados não comprovam correção do estado persistido.

Escopo:

- bootstrap do catálogo de knowledge.
- persistência de memory thread e recurso por chat Telegram.
- suspensão e retomada de workflow com aprovação humana.
- gravação de auditoria e atualização de `current_agent_id`.
- ausência de referências ativas ao `weather-agent`.

Dependências:

- PostgreSQL efêmero para testes de integração.
- doubles determinísticos para integrações externas.

### Testes E2E

Fluxos E2E obrigatórios:

- Telegram -> `marcos-agent` -> resposta auditada -> outbound enviado.
- tentativa de acionar comando legado -> resposta controlada sem usar runtime `weather`.
- workflow que exige aprovação -> suspensão -> resolução -> retomada -> outbound final.
- knowledge desatualizado -> `/marcos/health` retorna não pronto.

## Sequenciamento de Desenvolvimento

### Ordem de Build

1. Remoção controlada do legado `weather`
   - eliminar registro do agente, workflow, tool, scorer e roteamento de clima.
   - preservar adapter Telegram e storage existentes.
2. Fundação Marcos em Mastra
   - criar `marcos-agent`, runtime, catálogo documental e carregador de contexto.
3. Memória e auditoria
   - configurar `Memory` do Mastra, tabelas de auditoria e catálogo.
4. Workflows core
   - aprovações, atualização de conhecimento, notificação, relatório, planejamento diário.
5. Workflows/capabilities/operators/tools do domínio
   - incorporar todos os documentos de `docs/agents/marcos/` em componentes nomeados e rastreáveis.
6. RAG e readiness
   - indexação documental, status de knowledge, healthchecks e gates de produção.
7. Validação final
   - `npm run check` e smoke de `npm run dev`.

### Dependências Técnicas

- PostgreSQL disponível com schema `agents`.
- `TELEGRAM_ENABLED=true` e secrets válidos para smoke funcional do canal.
- validação local das APIs Mastra já instaladas; nenhum pacote Mastra deve ser trocado sem ADR.

## Monitoramento e Observabilidade

Logs estruturados obrigatórios:

- `agentId`
- `workflowId`
- `capabilityIds`
- `toolId`
- `approvalStatus`
- `telegramUserId`
- `telegramChatId`
- `correlationId`
- `latencyMs`
- `tokenUsage`
- `knowledgeDocumentIds`

Métricas mínimas:

- `marcos_requests_total`
- `marcos_request_failures_total`
- `marcos_workflow_suspensions_total`
- `marcos_workflow_resumes_total`
- `marcos_knowledge_sync_failures_total`
- `marcos_tool_stub_invocations_total`
- `marcos_legacy_weather_route_attempts_total`
- `marcos_context_build_latency_ms`

Princípios:

- continuar usando `Observability` com `MastraStorageExporter`.
- manter `SensitiveDataFilter`.
- readiness falha quando knowledge obrigatório não estiver sincronizado ou quando `marcos-agent` não estiver registrado.

## Considerações Técnicas

### Decisões Chave

- `Mastra` é o único runtime permitido para Marcos; não haverá execução paralela fora do framework.
- A documentação de `docs/agents/marcos/` vira inventário explícito de componentes e gate de readiness.
- Aprovação humana é parte estrutural dos workflows, usando suspensão/retomada do próprio Mastra.
- O adapter Telegram permanece como borda determinística, mas com `marcos-agent` como único destino oficial.

ADRs vinculadas:

- [ADR 001](</Users/jailtonjunior/Git/limateixeira-agents/.specs/prd-substituicao-weather-por-marcos/adr-001-runtime-exclusivo-mastra-e-substituicao-total-do-weather.md>)
- [ADR 002](</Users/jailtonjunior/Git/limateixeira-agents/.specs/prd-substituicao-weather-por-marcos/adr-002-documentacao-oficial-como-knowledge-e-gate-de-readiness.md>)
- [ADR 003](</Users/jailtonjunior/Git/limateixeira-agents/.specs/prd-substituicao-weather-por-marcos/adr-003-aprovacao-humana-obrigatoria-via-workflows-suspensiveis.md>)

### Riscos Conhecidos

- A V1 exige todo o escopo documental de `docs/agents/marcos/`; o principal risco é complexidade alta já na primeira entrega.
- Há risco de implementação nominal de tools sem integração real; o techspec mitiga isso exigindo catálogo de status e gates de produção.
- Há risco de Knowledge e código divergirem; mitigado com checksum, catálogo persistido e health endpoint.
- Há risco de regressão silenciosa no Telegram; mitigado com manutenção do adapter atual e testes E2E com canal único.

### Conformidade com Padrões

- `R-DDD-001`: domínio explícito para catálogo documental, auditoria e aprovação.
- `R-ERR-001`: erros tipados, mensagens estáveis, validação na borda.
- `R-SEC-001`: segredos só por ambiente, validação de input externo, escrita auditável.
- `R-TEST-001`: unitários e integração obrigatórios para IO e fluxos críticos.

### Mapeamento Requisito -> Decisão -> Teste

- `RF-01` a `RF-03`: remoção do runtime `weather` e roteamento único para `marcos-agent`.
  - Teste: unitário de router + integração de ausência de registro `weather`.
- `RF-04` a `RF-06`: knowledge catalog e gate de readiness documental.
  - Teste: sync status + conflito documental estruturado.
- `RF-07` a `RF-11A`: decomposição completa do ecossistema Marcos em agent/capabilities/workflows/operators/tools.
  - Teste: manifest coverage e smoke de registro Mastra.
- `RF-12` a `RF-17`: memória, RAG e políticas de Knowledge > Memory.
  - Teste: integração com storage e recuperação seletiva.
- `RF-18` a `RF-21`: auditoria, observabilidade, aprovação e contratos de tools.
  - Teste: workflow suspend/resume e validação de logs persistidos.
- `RF-22` a `RF-24`: readiness para produção e evolução segura.
  - Teste: `/marcos/health`, catálogo de tools e gate de check final.

### Arquivos Relevantes e Dependentes

- [agents/src/mastra/index.ts](/Users/jailtonjunior/Git/limateixeira-agents/agents/src/mastra/index.ts)
- [agents/src/mastra/config.ts](/Users/jailtonjunior/Git/limateixeira-agents/agents/src/mastra/config.ts)
- [agents/src/mastra/storage.ts](/Users/jailtonjunior/Git/limateixeira-agents/agents/src/mastra/storage.ts)
- [agents/src/telegram/router.ts](/Users/jailtonjunior/Git/limateixeira-agents/agents/src/telegram/router.ts)
- [agents/src/telegram/agent-runtime.ts](/Users/jailtonjunior/Git/limateixeira-agents/agents/src/telegram/agent-runtime.ts)
- [agents/src/telegram/service.ts](/Users/jailtonjunior/Git/limateixeira-agents/agents/src/telegram/service.ts)
- [agents/src/telegram/store.ts](/Users/jailtonjunior/Git/limateixeira-agents/agents/src/telegram/store.ts)
- [agents/src/telegram/bootstrap.ts](/Users/jailtonjunior/Git/limateixeira-agents/agents/src/telegram/bootstrap.ts)
- [agents/src/logger.ts](/Users/jailtonjunior/Git/limateixeira-agents/agents/src/logger.ts)
- [docs/agents/marcos](/Users/jailtonjunior/Git/limateixeira-agents/docs/agents/marcos)
- [.specs/prd-substituicao-weather-por-marcos/prd.md](/Users/jailtonjunior/Git/limateixeira-agents/.specs/prd-substituicao-weather-por-marcos/prd.md)
