# Prompt Pronto para Uso: `execute-all-tasks` para `prd-integracao-mastra-telegram`

## Observação de path da skill

O nome canônico da skill no repositório é `.agents/skills/execute-all-tasks/` e o nome correto é `execute-all-tasks` no plural. Se existir um mirror em `.github/skills/execute-all-tasks/`, ele deve ser tratado apenas como espelho da skill canônica, nunca como fonte divergente de instrução.

## Prompt pronto para copiar

```md
Inicie esta execução usando a skill `execute-all-tasks` para o PRD `integracao-mastra-telegram`.

Se houver mirror instalado em `.github/skills/execute-all-tasks/`, use-o como ponto de entrada compatível com GitHub/Copilot, mas trate `.agents/skills/execute-all-tasks/SKILL.md` como a fonte canônica e obrigatória da lógica de orquestração. Não use nenhuma skill com nome divergente como `execute-all-task`.

Objetivo:
Executar ou revalidar integralmente o PRD `.specs/prd-integracao-mastra-telegram/`, sem desvios, sem reinterpretação de escopo, sem flexibilidade indevida e com padrão real de production-ready/proof. O conjunto obrigatório de artefatos de entrada é:
- `.specs/prd-integracao-mastra-telegram/prd.md`
- `.specs/prd-integracao-mastra-telegram/techspec.md`
- `.specs/prd-integracao-mastra-telegram/tasks.md`
- `.specs/prd-integracao-mastra-telegram/task-*.md`
- `.specs/prd-integracao-mastra-telegram/adr-*.md`
- `AGENTS.md`
- `.agents/skills/agent-governance/SKILL.md`
- `.agents/skills/node-implementation/SKILL.md`
- `.agents/skills/mastra/SKILL.md`
- `.agents/skills/execute-all-tasks/SKILL.md`
- `.agents/skills/execute-task/SKILL.md`

Contexto obrigatório do estado atual:
- O PRD alvo é `prd-integracao-mastra-telegram`.
- `tasks.md` já existe e todas as tarefas estão atualmente em estado `done`.
- Há `_orchestration_report.md` e `*_execution_report.md` já gerados.
- Portanto, esta execução não deve reabrir, rebaixar, sobrescrever ou reexecutar tarefas concluídas sem causa objetiva detectada por preflight, drift, hash mismatch, evidência ausente, regressão real ou bloqueio externo verificável.

Modo de execução obrigatório:
- Rodar o preflight completo do orquestrador.
- Validar hooks, DAG, spec-hash, coverage, contract YAML, evidence files e drift antes de qualquer mutação.
- Reexecutar tarefas `done` apenas se houver uma destas condições:
  - `ai-spec check-spec-drift` reportar drift
  - hash de `tasks.md`, `prd.md` ou `techspec.md` estiver divergente
  - report físico estiver ausente, vazio ou inconsistente
  - evidência no git ou no report indicar reversão, regressão ou estado inválido
  - houver bloqueio externo que impeça considerar o canal realmente pronto para go-live
- Se nenhuma dessas condições existir, preservar o estado `done`, validar os artefatos e encerrar com relatório factual, sem churn artificial.

Regras invioláveis:
- Não simplificar, não resumir, não reinterpretar e não “melhorar” escopo fora do que está nos artefatos.
- Não introduzir microserviço paralelo, atalho operacional, fallback silencioso ou rota fora do desenho aprovado.
- Não inventar APIs, construtores, modelos, flags ou comportamentos do Mastra; verificar localmente no runtime e na documentação embutida instalada.
- Não usar heurística aberta onde a spec exige comportamento determinístico.
- Não abrir o canal para usuários fora da allowlist.
- Não usar e-mail ou telefone como identidade de autorização em runtime; usar somente `telegram_user_id` conforme a tech spec.
- Não considerar o fluxo pronto para go-live real sem:
  - `telegram_user_id` numérico real dos dois usuários iniciais provisionado
  - domínio público com HTTPS válido para webhook do Telegram
  - `webhookKey` e `X-Telegram-Bot-Api-Secret-Token` válidos e exigidos
  - deduplicação persistente por `update_id`
  - roteamento determinístico antes de qualquer chamada ao agente
  - persistência e vínculo estável `telegram_chat_id -> mastra_thread_id`
  - testes unitários, integração e E2E local cobrindo caminho feliz, duplicata, usuário fora da allowlist, status `pending_link`, comando desconhecido e falha outbound
  - validação final com os comandos obrigatórios do repositório
- Não degradar silenciosamente quando faltar hook, binário, secret, ID, evidência, domínio público, HTTPS, config ou doc. Falta real bloqueante deve virar status explícito com diagnóstico objetivo.
- Não pular hooks, `check-spec-drift`, `sync-spec-hash`, validações de DAG, validações de skills, validações de contract YAML nem checagens de evidência física.

Foco de qualidade obrigatório:
- Production-ready de verdade, não “aparentemente pronto”.
- Robustez operacional acima de conveniência.
- Zero gaps, zero lacunas e zero falso positivo.
- Zero dupla execução de update Telegram.
- Zero resposta inventada em caso de falha.
- Zero perda silenciosa de evento.
- Zero exposição indevida de rota protegida pelo Traefik.
- Zero handoff humano na v1, conforme RF-14.
- Zero go-live falso: se faltar pré-requisito externo real, registrar como bloqueio de go-live, não como detalhe opcional.

Arquitetura que deve ser preservada:
- `Telegram Bot API -> Traefik -> custom route no serviço agents -> adapter determinístico -> runtime Mastra -> PostgreSQL`
- Não substituir isso por acesso direto do Telegram ao runtime Mastra, nem por integração fora do serviço `agents`, nem por design alternativo não aprovado.

Expectativa de execução:
- Respeitar a DAG de `tasks.md`.
- Respeitar halt-first do orquestrador.
- Paralelismo somente se `tasks.md` permitir e se o tool suportar sem risco de corrida ou integração incorreta.
- Atualizar artefatos apenas quando a própria lógica do orquestrador exigir.
- Manter consistência entre `tasks.md`, `task-*.md`, reports individuais e `_orchestration_report.md`.
- Ao final, produzir um `_orchestration_report.md` factual, com:
  - snapshot inicial e final
  - tarefas preservadas, reexecutadas ou bloqueadas
  - evidências reais
  - drift encontrado ou ausência de drift
  - bloqueios externos remanescentes
  - conclusão honesta sobre “pronto para main” versus “pronto para go-live”

Validação final obrigatória:
- Rodar `npm run check` no workspace `agents/`.
- Se a execução tocar comportamento de runtime, confirmar também que `npm run dev` sobe corretamente.
- Executar as validações e testes exigidos por `tasks.md`, `task-*.md`, governança e tech spec.
- Não marcar nenhuma tarefa como `done` sem evidência correspondente.
- Não afirmar “production-ready” se existir qualquer bloqueio real de go-live externo ou qualquer lacuna de evidência.

Critério de encerramento esperado:
- Se todos os artefatos estiverem consistentes, sem drift e com evidência íntegra, encerrar preservando o estado `done` já existente e registrar que o PRD está executado no escopo implementável atual.
- Se houver bloqueio externo real, encerrar com diagnóstico explícito de bloqueio de go-live.
- Se houver drift, regressão, ausência de evidência ou contrato violado, parar, registrar e não mascarar o problema.
```
