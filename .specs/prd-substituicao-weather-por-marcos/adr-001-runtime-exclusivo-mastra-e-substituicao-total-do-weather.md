# Registro de Decisão Arquitetural (ADR)

## Metadados

- **Título:** Runtime exclusivo em Mastra e substituição total do weather
- **Data:** 2026-06-29
- **Status:** Aceita
- **Decisores:** Produto, arquitetura, implementação
- **Relacionados:** [PRD](</Users/jailtonjunior/Git/limateixeira-agents/.specs/prd-substituicao-weather-por-marcos/prd.md>), [Tech Spec](</Users/jailtonjunior/Git/limateixeira-agents/.specs/prd-substituicao-weather-por-marcos/techspec.md>)

## Contexto

O repositório já opera um serviço `agents` com `Mastra`, `PostgresStore`, adapter Telegram e um conjunto pequeno de componentes orientados ao `weather-agent`. O novo escopo exige um agente executivo amplo, persistente, auditável e production-ready, e o usuário reforçou explicitamente que o uso de `Mastra` é obrigatório e inegociável.

## Decisão

Manter um único runtime no serviço `agents`, exclusivamente em `Mastra`, removendo integralmente `weather-agent`, `weather-workflow`, `weather-tool` e `weather-scorer` como superfícies ativas de produção. Toda a nova capacidade de Marcos será registrada e executada apenas via componentes Mastra.

## Alternativas Consideradas

- Coexistência entre `weather` e `Marcos`
  - Vantagens: migração aparentemente mais simples.
  - Desvantagens: ambiguidade funcional, risco de roteamento incorreto, dívida operacional.
  - Motivo da rejeição: viola o PRD de substituição completa.
- Runtime híbrido com parte fora de Mastra
  - Vantagens: liberdade para soluções ad hoc.
  - Desvantagens: quebra da exigência do projeto, observabilidade fragmentada, maior risco de lacuna.
  - Motivo da rejeição: incompatível com a restrição mandatória de uso de Mastra.

## Consequências

### Benefícios Esperados

- Um único stack operacional.
- Observabilidade e persistência consistentes.
- Redução de falso positivo por eliminar rotas legadas de clima.

### Trade-offs e Custos

- Migração maior logo no início.
- Necessidade de cobrir todo o escopo documental em componentes Mastra rastreáveis.

### Riscos e Mitigações

- Risco: remoção incompleta do legado `weather`.
- Impacto: rota residual ou teste enganoso em produção.
- Estratégia de mitigação: busca exaustiva por referências, testes de regressão e health gate para ausência de registro `weather`.
- Plano de rollback: branch/commit rollback antes do go-live; não há rollback parcial de coexistência em produção.

## Plano de Implementação

1. Catalogar e remover todas as referências ativas a `weather`.
2. Registrar `marcos-agent` e runtime associado.
3. Atualizar roteamento Telegram para destino exclusivo `marcos-agent`.
4. Validar ausência do legado via testes e revisão de codebase.

## Monitoramento e Validação

- Medir tentativas de uso do comando legado.
- Verificar que `mastra.listAgents()` não expõe `weather-agent`.
- Confirmar que `current_agent_id` do Telegram nunca volta para `weather-agent`.

## Impacto em Documentação e Operação

- Atualizar runbooks do canal Telegram.
- Remover help text e referências operacionais a clima.
- Documentar `Marcos` como único agente oficial do canal.

## Revisão Futura

- Revisitar apenas se houver novo PRD autorizando mais de um agente em produção no Telegram.
