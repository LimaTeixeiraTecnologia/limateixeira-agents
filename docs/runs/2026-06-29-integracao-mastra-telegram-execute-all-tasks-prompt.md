# Prompt Pronto para Uso: `execute-all-tasks`

## Skill alvo real no repositório

Use a skill `.agents/skills/execute-all-tasks/` para executar o PRD `integracao-mastra-telegram`.

## Prompt pronto para copiar

```md
Execute a skill `.agents/skills/execute-all-tasks/` para o PRD `integracao-mastra-telegram`.

Objetivo:
Executar integralmente e em modo production-ready o conjunto de tarefas definido em `.specs/prd-integracao-mastra-telegram/tasks.md`, respeitando estritamente:
- `.specs/prd-integracao-mastra-telegram/prd.md`
- `.specs/prd-integracao-mastra-telegram/techspec.md`
- `.specs/prd-integracao-mastra-telegram/task-*.md`
- `.specs/prd-integracao-mastra-telegram/adr-*.md`
- `AGENTS.md`
- `.agents/skills/agent-governance/SKILL.md`
- `.agents/skills/node-implementation/SKILL.md`
- `.agents/skills/mastra/SKILL.md`
- `.agents/skills/execute-all-tasks/SKILL.md`
- `.agents/skills/execute-task/SKILL.md`

Regras de execução obrigatórias:
- Não simplificar, não resumir, não reinterpretar escopo e não introduzir desvios em relação ao PRD, tech spec, ADRs e tasks.
- Não deixar gaps, lacunas, placeholders, TODOs vagos, decisões implícitas ou comportamento “para depois”.
- Não usar heurística aberta onde a spec exige comportamento determinístico.
- Não abrir o canal para usuários fora da allowlist.
- Não usar e-mail ou telefone como identidade de autorização em runtime; usar apenas `telegram_user_id` conforme a tech spec.
- Não considerar go-live concluído sem:
  - `telegram_user_id` numérico real dos dois usuários iniciais provisionado
  - domínio público com HTTPS válido para webhook do Telegram
  - webhook protegido por `webhookKey` + `X-Telegram-Bot-Api-Secret-Token`
  - deduplicação persistente por `update_id`
  - roteamento determinístico antes de qualquer chamada ao agente
  - testes unitários, integração e E2E local cobrindo caminho feliz, duplicata, deny da allowlist e falha outbound
  - validação final com os comandos obrigatórios do repositório
- Não degradar silenciosamente quando algum pré-requisito, binário, secret, doc, ID ou superfície técnica estiver ausente. Se faltar algo bloqueante, parar com status explícito e diagnóstico objetivo.
- Não pular hooks, drift checks, spec-hash checks, validações de DAG, validações de skills nem checagens de evidência física dos reports.

Foco de qualidade:
- Production-ready de verdade, sem “happy path only”.
- Robustez operacional acima de conveniência.
- Zero falso positivo na borda Telegram.
- Zero dupla execução de update.
- Zero resposta inventada em caso de erro.
- Zero handoff humano na v1.
- Zero exposição indevida de rotas protegidas pelo Traefik.

Expectativa de arquitetura a preservar:
- `Telegram Bot API -> Traefik -> custom route no serviço agents -> adapter determinístico -> Mastra -> PostgreSQL`
- Não substituir esse desenho por acesso direto do Telegram ao runtime Mastra nem por microserviço paralelo fora da spec.

Expectativa de execução:
- Executar as tarefas em ordem de dependência definida em `tasks.md`.
- Respeitar o halt-first do orquestrador.
- Usar paralelismo apenas se `tasks.md` permitir e se o tool suportar sem risco de integração.
- Atualizar `tasks.md` e gerar relatórios de execução por tarefa com evidência real.
- Ao final, gerar `_orchestration_report.md` completo, com status real, evidências, bloqueios remanescentes e próximos passos estritamente factuais.

Validação final obrigatória:
- Rodar `npm run check` no workspace `agents/`.
- Se a mudança tocar comportamento de runtime, confirmar também que `npm run dev` ainda sobe corretamente.
- Executar todas as validações e testes exigidos pelas tasks e pela governança.
- Não marcar nenhuma tarefa como `done` sem teste executado e evidência correspondente.

Se houver bloqueio real externo, como ausência de `telegram_user_id` real dos usuários iniciais ou ausência de domínio HTTPS público, implemente tudo o que for possível sem violar a spec e deixe o bloqueio final explicitamente registrado como bloqueio de go-live, nunca como detalhe opcional.
```
