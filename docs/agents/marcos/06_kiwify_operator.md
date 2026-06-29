# 06_Kiwify.operator.md

# KIWIFY OPERATOR

Versão: 1.0

Status: Documento Oficial

Classificação: Operator Corporativo

---

# OBJETIVO

Orquestrar toda a comunicação entre o ecossistema do MeControla e a plataforma Kiwify, garantindo sincronização de assinaturas, pagamentos, afiliados e eventos financeiros.

Este Operator centraliza a operação financeira, sem implementar regras de negócio.

---

# RESPONSABILIDADES

- Processar webhooks.
- Sincronizar assinaturas.
- Sincronizar pagamentos.
- Sincronizar cancelamentos.
- Sincronizar renovações.
- Processar reembolsos.
- Atualizar status de clientes.
- Sincronizar afiliados.
- Sincronizar cupons.
- Registrar auditoria.

---

# DEPENDÊNCIAS

## Tools

- Kiwify Tool
- PostgreSQL Tool

## Capabilities

- Analytics & Insights

---

# ENTRADAS

- Eventos da Kiwify.
- Identificador do cliente.
- Identificador da assinatura.
- Produto.
- Plano.
- Workflow solicitante.

---

# SAÍDAS

- Dados sincronizados.
- Eventos registrados.
- Status atualizado.
- Logs.
- Erros estruturados.

---

# REGRAS DE VALIDAÇÃO

Validar:

- Assinatura do webhook.
- Evento conhecido.
- Cliente existente (quando aplicável).
- Integridade dos dados.
- Idempotência do evento.

Eventos duplicados não deverão ser processados novamente.

---

# EVENTOS SUPORTADOS

- Compra aprovada.
- Compra recusada.
- Assinatura criada.
- Renovação.
- Cancelamento.
- Reembolso.
- Chargeback.
- Expiração.
- Atualização de afiliado.
- Atualização de cupom.

---

# FLUXO DE SINCRONIZAÇÃO

1. Receber evento.
2. Validar autenticidade.
3. Validar idempotência.
4. Consultar Kiwify Tool quando necessário.
5. Atualizar PostgreSQL.
6. Registrar auditoria.
7. Notificar Workflow correspondente.

---

# TRATAMENTO DE ERROS

- Webhook inválido.
- Evento desconhecido.
- Timeout.
- Cliente inexistente.
- Falha de sincronização.
- Erro de persistência.

Todos os erros deverão ser registrados e estruturados.

---

# POLÍTICAS

- Nunca alterar dados financeiros manualmente.
- Toda alteração deve possuir origem rastreável.
- Garantir consistência entre Kiwify e PostgreSQL.

---

# LIMITES DE AUTONOMIA

Este Operator não pode:

- Aprovar pagamentos.
- Cancelar assinaturas diretamente.
- Alterar valores.
- Criar produtos.
- Modificar regras comerciais.

---

# OBSERVABILIDADE

Registrar:

- Evento.
- Cliente.
- Produto.
- Plano.
- Workflow.
- Tempo de execução.
- Status.
- Correlation ID.

---

# KPIs

- Eventos sincronizados.
- Tempo de sincronização.
- Falhas de sincronização.
- Eventos duplicados evitados.
- Consistência entre plataformas.

---

# PRINCÍPIO FINAL

O Kiwify Operator garante que todas as informações comerciais e financeiras permaneçam sincronizadas, auditáveis e disponíveis para o restante do ecossistema.

---

Kiwify Operator

Versão 1.0
