# Registro de Decisão Arquitetural (ADR)

## Metadados

- **Título:** Adapter Telegram no mesmo serviço `agents`
- **Data:** 2026-06-29
- **Status:** Aceita
- **Decisores:** Produto, arquitetura, implementação
- **Relacionados:** [PRD](</Users/jailtonjunior/Git/limateixeira-agents/.specs/prd-integracao-mastra-telegram/prd.md>), [Tech Spec](</Users/jailtonjunior/Git/limateixeira-agents/.specs/prd-integracao-mastra-telegram/techspec.md>)

## Contexto

O repositório atual já possui um único serviço `agents` exposto atrás do Traefik, com runtime Mastra e persistência no PostgreSQL. A integração Telegram precisa entrar com o menor número possível de componentes adicionais, mas sem acoplar responsabilidades de borda diretamente aos agentes.

## Decisão

Implementar o canal Telegram como um adapter HTTP no mesmo serviço `agents`, usando `registerApiRoute()` do Mastra para expor o webhook e um conjunto local de serviços para validação, persistência, roteamento e outbound.

## Alternativas Consideradas

- Telegram chamando rotas internas padrão do Mastra diretamente
  - Vantagens: menos código inicial.
  - Desvantagens: borda, autenticação, allowlist e idempotência ficariam dispersas.
  - Motivo da rejeição: aumenta risco operacional e falso positivo.
- Microserviço separado só para Telegram
  - Vantagens: isolamento forte.
  - Desvantagens: mais deploy, mais observabilidade cruzada, mais superfície de falha.
  - Motivo da rejeição: complexidade desproporcional para 2 usuários e v1.

## Consequências

### Benefícios Esperados

- Uma única unidade de deploy.
- Menor latência entre adapter e agentes.
- Observabilidade e persistência concentradas no mesmo workspace.

### Trade-offs e Custos

- O serviço `agents` passa a ter mais responsabilidades.
- A borda HTTP do canal Telegram precisa ser cuidadosamente isolada das rotas já existentes.

### Riscos e Mitigações

- Risco: mistura de rotas públicas e rotas protegidas.
- Impacto: exposição indevida de superfícies internas.
- Estratégia de mitigação: path dedicado, router dedicado no Traefik e validações explícitas no adapter.
- Plano de rollback: desabilitar router do webhook e remover webhook no Telegram.

## Plano de Implementação

1. Adicionar route customizada do webhook.
2. Implementar camada local de guard, store, router e outbound.
3. Ajustar Traefik para roteamento path-specific.
4. Validar com testes e smoke operacional.

## Monitoramento e Validação

- Medir taxa de sucesso do webhook.
- Verificar ausência de regressão nas rotas atuais do Mastra.
- Confirmar que duplicatas não geram dupla execução.

## Impacto em Documentação e Operação

- Atualizar runbook de deploy com webhook público.
- Documentar secrets novos do Telegram.
- Incluir smoke de webhook sintético.

## Revisão Futura

- Revisitar quando houver mais de 5 agentes especializados ou necessidade de isolamento operacional por canal.
