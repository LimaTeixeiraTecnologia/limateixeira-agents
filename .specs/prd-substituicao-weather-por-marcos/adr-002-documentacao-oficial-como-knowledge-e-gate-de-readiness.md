# Registro de Decisão Arquitetural (ADR)

## Metadados

- **Título:** Documentação oficial como knowledge e gate de readiness
- **Data:** 2026-06-29
- **Status:** Aceita
- **Decisores:** Produto, arquitetura, implementação
- **Relacionados:** [PRD](</Users/jailtonjunior/Git/limateixeira-agents/.specs/prd-substituicao-weather-por-marcos/prd.md>), [Tech Spec](</Users/jailtonjunior/Git/limateixeira-agents/.specs/prd-substituicao-weather-por-marcos/techspec.md>)

## Contexto

O PRD exige que `docs/agents/marcos/` seja a fonte institucional obrigatória da verdade e que toda a V1 cubra o escopo documental completo. O maior risco técnico é transformar esses arquivos apenas em contexto solto de prompt, sem sincronização verificável entre documentação e código.

## Decisão

Tratar `docs/agents/marcos/` como inventário formal de knowledge e componentes. Cada arquivo será catalogado, classificado, checksummado e refletido em um componente executável, catálogo declarativo ou artefato de governança. O serviço não fica `ready` se houver documento obrigatório sem cobertura registrada.

## Alternativas Consideradas

- Copiar trechos dos documentos diretamente para prompts estáticos
  - Vantagens: implementação rápida.
  - Desvantagens: drift silencioso, duplicação, baixa auditabilidade.
  - Motivo da rejeição: não atende ao requisito de 0 lacunas.
- Usar os documentos apenas como referência manual para desenvolvedores
  - Vantagens: menos código de suporte.
  - Desvantagens: sem garantia operacional.
  - Motivo da rejeição: não produz readiness verificável.

## Consequências

### Benefícios Esperados

- Fonte de verdade única.
- Detecção objetiva de drift documental.
- Base robusta para RAG e contexto seletivo.

### Trade-offs e Custos

- Introduz catálogo persistido, checksums e pipeline de sincronização.
- Aumenta o gate de go-live.

### Riscos e Mitigações

- Risco: documento novo adicionado sem cobertura correspondente.
- Impacto: escopo do agente fica incompleto.
- Estratégia de mitigação: endpoint de status, readiness gate e teste automatizado de manifest coverage.
- Plano de rollback: bloquear readiness e impedir deploy até sincronização.

## Plano de Implementação

1. Construir manifest de documentos obrigatórios.
2. Persistir catálogo e chunks.
3. Criar verificador de cobertura e checksums.
4. Expor health/status de knowledge.

## Monitoramento e Validação

- Acompanhar falhas de sincronização de knowledge.
- Verificar checksums divergentes.
- Exigir 100% de cobertura documental antes de liberar `main`.

## Impacto em Documentação e Operação

- Documentar convenção de classificação dos arquivos em `docs/agents/marcos/`.
- Definir rotina operacional para reindexação após mudança documental.
- Incluir status de knowledge no runbook de incidentes.

## Revisão Futura

- Revisitar quando houver automação editorial centralizada ou fonte externa oficial de documentos.
