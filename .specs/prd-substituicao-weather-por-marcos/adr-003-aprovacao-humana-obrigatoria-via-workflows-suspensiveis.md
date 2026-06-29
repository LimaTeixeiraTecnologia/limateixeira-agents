# Registro de Decisão Arquitetural (ADR)

## Metadados

- **Título:** Aprovação humana obrigatória via workflows suspensíveis do Mastra
- **Data:** 2026-06-29
- **Status:** Aceita
- **Decisores:** Produto, arquitetura, implementação
- **Relacionados:** [PRD](</Users/jailtonjunior/Git/limateixeira-agents/.specs/prd-substituicao-weather-por-marcos/prd.md>), [Tech Spec](</Users/jailtonjunior/Git/limateixeira-agents/.specs/prd-substituicao-weather-por-marcos/techspec.md>)

## Contexto

O PRD fixa aprovação humana obrigatória desde a V1. A documentação de Marcos também separa autonomia intelectual de autonomia societária, financeira e jurídica, e exige governança clara para ações sensíveis.

## Decisão

Implementar aprovações humanas como parte nativa dos workflows de Marcos usando suspensão e retomada de workflow do `Mastra`, com persistência do estado em `PostgresStore` e trilha de auditoria dedicada.

## Alternativas Consideradas

- Aprovação humana fora do workflow, apenas por convenção de prompt
  - Vantagens: menos implementação inicial.
  - Desvantagens: sem estado persistido, sem rastreabilidade, alto risco de bypass.
  - Motivo da rejeição: insuficiente para produção.
- Aprovação humana por flags ad hoc no adapter Telegram
  - Vantagens: simples para o canal atual.
  - Desvantagens: acopla governança à borda do canal e não ao domínio.
  - Motivo da rejeição: não escala para o ecossistema documental de Marcos.

## Consequências

### Benefícios Esperados

- Governança forte e auditável.
- Continuidade segura de execução após intervenção humana.
- Menor risco de ação indevida por tools ou workflows.

### Trade-offs e Custos

- Mais estados de execução para testar.
- Necessidade de endpoint/processo operacional para resolver aprovações.

### Riscos e Mitigações

- Risco: workflows suspensos sem resolução operacional.
- Impacto: backlog e latência alta.
- Estratégia de mitigação: endpoint/status de aprovações pendentes, métricas e runbook claro.
- Plano de rollback: pausar funcionalidades sensíveis mantendo o agente em modo consultivo.

## Plano de Implementação

1. Definir matriz de ações que exigem aprovação.
2. Criar steps suspensíveis com `resumeSchema` e `suspendSchema`.
3. Persistir solicitações e resoluções de aprovação.
4. Cobrir fluxo completo com testes de integração e E2E.

## Monitoramento e Validação

- Medir quantidade de suspensões, retomadas e rejeições.
- Verificar tempo médio até resolução.
- Confirmar que ações sensíveis nunca executam sem aprovação.

## Impacto em Documentação e Operação

- Documentar fluxo de aprovação no runbook.
- Definir responsáveis por aprovar ou rejeitar.
- Incluir troubleshooting para workflows suspensos.

## Revisão Futura

- Revisitar quando houver UI dedicada de approvals ou expansão para múltiplos canais.
