# 02_Facebook.tool.md

# FACEBOOK TOOL

Versão: 1.0

Status: Documento Oficial

Classificação: Tool Corporativa

---

# OBJETIVO

Disponibilizar operações atômicas para integração com páginas do Facebook.

Esta Tool apenas executa ações solicitadas pelos Operators.

Não contém regras de negócio.

---

# RESPONSABILIDADES

- Publicar post.
- Publicar imagem.
- Publicar vídeo.
- Publicar carrossel (quando suportado).
- Agendar publicação.
- Editar publicação.
- Excluir publicação.
- Buscar métricas.
- Buscar comentários.
- Buscar insights da página.

---

# ENTRADAS

- Conteúdo aprovado.
- Arquivos de mídia.
- Legenda.
- Data e hora (quando aplicável).

---

# SAÍDAS

- ID da publicação.
- Status da execução.
- Métricas retornadas.
- Mensagens de erro.

---

# PRÉ-CONDIÇÕES

- Página conectada.
- Credenciais válidas.
- Permissões concedidas.
- Conteúdo previamente aprovado.

---

# PÓS-CONDIÇÕES

- Operação registrada.
- Resultado retornado ao Operator.

---

# TRATAMENTO DE ERROS

- Token inválido.
- Permissão insuficiente.
- Limite da API.
- Conteúdo inválido.
- Falha de conexão.

Os erros deverão ser estruturados e rastreáveis.

---

# SEGURANÇA

- Nunca armazenar tokens em texto.
- Utilizar apenas credenciais autorizadas.
- Respeitar políticas da Meta.

---

# OBSERVABILIDADE

Registrar:

- Operação executada.
- Data e hora.
- Tempo de resposta.
- Status.
- Código de erro.
- Consumo da API.

---

# KPIs

- Taxa de sucesso.
- Latência.
- Falhas por operação.
- Tempo médio de resposta.

---

# PRINCÍPIO FINAL

Uma Tool executa apenas operações técnicas.

Toda decisão sobre estratégia, validação ou prioridade pertence aos Operators e Workflows.

---

Facebook Tool

Versão 1.0
