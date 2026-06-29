# Registro de Decisão Arquitetural (ADR)

## Metadados

- **Título:** Segurança do webhook e allowlist baseada em `telegram_user_id`
- **Data:** 2026-06-29
- **Status:** Aceita
- **Decisores:** Produto, arquitetura, implementação
- **Relacionados:** [PRD](</Users/jailtonjunior/Git/limateixeira-agents/.specs/prd-integracao-mastra-telegram/prd.md>), [Tech Spec](</Users/jailtonjunior/Git/limateixeira-agents/.specs/prd-integracao-mastra-telegram/techspec.md>)

## Contexto

O Traefik atual protege toda a superfície `mastra.localhost` com BasicAuth, mas webhooks do Telegram não devem depender desse mecanismo. Além disso, o PRD limita a v1 a dois usuários específicos, mas os contatos de referência fornecidos não são identidades confiáveis em runtime para o webhook.

## Decisão

Remover BasicAuth somente do path do webhook e proteger o canal com camadas cumulativas:

- `webhookKey` secreto no path
- header `X-Telegram-Bot-Api-Secret-Token`
- processamento apenas de `message` em chat privado
- allowlist deny-by-default por `telegram_user_id` numérico previamente vinculado

## Alternativas Consideradas

- Manter BasicAuth no webhook
  - Vantagens: aproveita configuração atual.
  - Desvantagens: incompatível com o modelo de entrega do Telegram.
  - Motivo da rejeição: inviável operacionalmente.
- Autorizar por e-mail ou telefone
  - Vantagens: usa dados já conhecidos.
  - Desvantagens: esses dados não são identidade confiável do webhook.
  - Motivo da rejeição: alto risco de lacuna e falso positivo.
- Confiar apenas no `secret_token`
  - Vantagens: configuração simples.
  - Desvantagens: uma única barreira para a borda pública.
  - Motivo da rejeição: robustez insuficiente para o objetivo do canal.

## Consequências

### Benefícios Esperados

- Fronteira pública mínima e verificável.
- Autorização coerente com a identidade real que o Telegram entrega.
- Menor risco de processamento de updates indevidos.

### Trade-offs e Custos

- Exige onboarding prévio dos `telegram_user_id` dos dois usuários.
- Introduz configuração adicional de secrets no deploy.

### Riscos e Mitigações

- Risco: `telegram_user_id` ainda não provisionado no go-live.
- Impacto: usuários legítimos não conseguem usar o canal.
- Estratégia de mitigação: bloquear entrada `active` sem ID numérico confirmado e validar onboarding antes de registrar o webhook.
- Plano de rollback: desativar router do webhook e remover webhook no Bot API.

## Plano de Implementação

1. Adicionar config e secrets do Telegram.
2. Criar tabela de allowlist com status `pending_link`.
3. Validar segredos e allowlist no início do request.
4. Persistir auditoria de eventos ignorados e falhos.

## Monitoramento e Validação

- Acompanhar `telegram_allowlist_denials_total`.
- Revisar logs de `telegram_invalid_secret`.
- Verificar que updates de chat não privado são sempre ignorados.

## Impacto em Documentação e Operação

- Documentar como capturar e registrar `telegram_user_id`.
- Atualizar procedimento de rotação de secrets do webhook.
- Documentar que contatos humanos são só referência operacional.

## Revisão Futura

- Revisitar quando houver necessidade de abertura do canal para mais usuários ou fluxo de auto-onboarding.
