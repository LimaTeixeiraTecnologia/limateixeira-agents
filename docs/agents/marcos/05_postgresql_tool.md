# 05_PostgreSQL.tool.md

# POSTGRESQL TOOL

Versão: 1.0

Status: Documento Oficial

Classificação: Tool Corporativa

---

# OBJETIVO

Disponibilizar operações atômicas e seguras para acesso ao banco PostgreSQL.

Esta Tool não contém regras de negócio.

Seu único papel é executar operações de persistência e consulta.

---

# RESPONSABILIDADES

- Inserir registros.
- Atualizar registros.
- Excluir registros (quando permitido).
- Consultar registros.
- Executar consultas paginadas.
- Executar transações.
- Executar operações em lote.
- Verificar existência de registros.
- Executar procedimentos armazenados.
- Gerenciar rollback de transações.

---

# ENTRADAS

- Operação solicitada.
- Entidade.
- Parâmetros.
- Critérios de consulta.
- Dados para persistência.

---

# SAÍDAS

- Dados consultados.
- Quantidade de registros afetados.
- Status da operação.
- Tempo de execução.
- Mensagens de erro.

---

# PRÉ-CONDIÇÕES

- Conexão válida.
- Credenciais autorizadas.
- Schema disponível.
- Validação realizada pelo Operator.

---

# PÓS-CONDIÇÕES

- Operação registrada em log.
- Transação confirmada ou revertida.
- Resultado retornado ao Operator.

---

# OPERAÇÕES SUPORTADAS

- SELECT
- INSERT
- UPDATE
- DELETE
- UPSERT
- COUNT
- EXISTS
- BEGIN
- COMMIT
- ROLLBACK

Sempre utilizando consultas parametrizadas.

---

# SEGURANÇA

- Nunca executar SQL concatenado.
- Utilizar parâmetros preparados.
- Menor privilégio possível.
- Não expor credenciais.
- Auditoria obrigatória.

---

# PERFORMANCE

- Utilizar paginação.
- Limitar consultas extensas.
- Evitar SELECT *.
- Priorizar índices existentes.
- Registrar consultas lentas.

---

# TRATAMENTO DE ERROS

- Timeout.
- Deadlock.
- Violação de chave.
- Conexão indisponível.
- Constraint violation.
- Transação inválida.

Todos os erros devem retornar estrutura padronizada.

---

# OBSERVABILIDADE

Registrar:

- Operação.
- Entidade.
- Tempo de execução.
- Registros afetados.
- Status.
- Erros.

---

# KPIs

- Latência média.
- Taxa de sucesso.
- Tempo médio de consulta.
- Tempo médio de escrita.
- Quantidade de erros.

---

# PRINCÍPIO FINAL

Esta Tool apenas acessa o banco de dados.

Toda regra de negócio pertence aos Operators, Workflows e Use Cases da aplicação.

---

PostgreSQL Tool

Versão 1.0
