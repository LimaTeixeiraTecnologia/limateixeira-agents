# 01_Instagram.tool.md

# INSTAGRAM TOOL

Versão: 1.0

Status: Documento Oficial

Classificação: Tool Corporativa

---

# OBJETIVO

Disponibilizar operações atômicas para integração com o Instagram.

Esta Tool não toma decisões.

Executa apenas ações solicitadas pelos Operators.

---

# RESPONSABILIDADES

- Publicar post.
- Publicar carrossel.
- Publicar Reel.
- Publicar Story.
- Agendar publicação.
- Editar legenda.
- Excluir publicação.
- Buscar métricas.
- Buscar comentários.
- Buscar insights.

---

# ENTRADAS

- Conteúdo aprovado.
- Mídias.
- Legenda.
- Hashtags.
- Data e hora (quando aplicável).

---

# SAÍDAS

- ID da publicação.
- Status da operação.
- Métricas retornadas.
- Mensagens de erro.

---

# PRÉ-CONDIÇÕES

- Credenciais válidas.
- Permissões concedidas.
- Conteúdo aprovado.
- Mídias válidas.

---

# PÓS-CONDIÇÕES

- Operação registrada em log.
- Resultado retornado ao Operator.

---

# TRATAMENTO DE ERROS

- Falha de autenticação.
- Permissão insuficiente.
- Limite de API.
- Conteúdo inválido.
- Falha de conexão.

Todos os erros deverão ser estruturados e nunca ocultados.

---

# SEGURANÇA

- Nunca armazenar credenciais em texto.
- Utilizar apenas tokens autorizados.
- Respeitar permissões do Meta.

---

# OBSERVABILIDADE

Registrar:

- Data e hora.
- Operação.
- Tempo de execução.
- Status.
- Código de erro.
- Consumo de API.

---

# KPIs

- Taxa de sucesso.
- Latência.
- Falhas por operação.
- Tempo médio de resposta.

---

# PRINCÍPIO FINAL

Uma Tool executa apenas uma ação específica.

Ela não interpreta contexto, não decide prioridades e não aplica regras de negócio.

Essas responsabilidades pertencem aos Operators.

---

Instagram Tool

Versão 1.0
