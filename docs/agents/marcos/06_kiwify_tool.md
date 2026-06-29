# 06_Kiwify.tool.md

# KIWIFY TOOL

Versão: 1.0

Status: Documento Oficial

Classificação: Tool Corporativa

---

# OBJETIVO

Disponibilizar operações atômicas para integração com a plataforma Kiwify.

Esta Tool executa somente operações técnicas e nunca aplica regras de negócio.

---

# RESPONSABILIDADES

- Consultar produtos.
- Consultar planos.
- Consultar clientes.
- Consultar assinaturas.
- Consultar pagamentos.
- Consultar cupons.
- Consultar afiliados.
- Consultar comissões.
- Registrar webhooks.
- Validar eventos recebidos.
- Consultar reembolsos.
- Sincronizar informações.

---

# EVENTOS SUPORTADOS

- Nova compra.
- Assinatura criada.
- Renovação.
- Pagamento aprovado.
- Pagamento recusado.
- Cancelamento.
- Reembolso.
- Chargeback.
- Expiração da assinatura.

---

# ENTRADAS

- Produto.
- Cliente.
- Assinatura.
- Pagamento.
- Evento.
- Identificadores.

---

# SAÍDAS

- Dados consultados.
- Status da operação.
- Eventos normalizados.
- Mensagens de erro.

---

# PRÉ-CONDIÇÕES

- Credenciais válidas.
- Webhooks configurados.
- Produto existente.
- Permissões autorizadas.

---

# PÓS-CONDIÇÕES

- Evento registrado.
- Dados sincronizados.
- Resultado retornado ao Operator.

---

# SEGURANÇA

- Validar assinatura dos webhooks.
- Nunca armazenar segredos em texto.
- Utilizar HTTPS.
- Registrar auditoria de eventos.

---

# TRATAMENTO DE ERROS

- Token inválido.
- Evento inválido.
- Produto inexistente.
- Cliente inexistente.
- Timeout.
- Falha de conexão.

Todos os erros deverão possuir estrutura padronizada.

---

# OBSERVABILIDADE

Registrar:

- Evento.
- Data e hora.
- Tempo de execução.
- Status.
- Origem.
- Código de erro.

---

# KPIs

- Taxa de sincronização.
- Latência.
- Eventos processados.
- Falhas por evento.
- Disponibilidade.

---

# PRINCÍPIO FINAL

Esta Tool apenas integra a Kiwify.

Toda lógica de assinatura, cobrança, onboarding, cancelamento, afiliados e regras financeiras pertence aos Operators e Workflows.

---

Kiwify Tool

Versão 1.0
