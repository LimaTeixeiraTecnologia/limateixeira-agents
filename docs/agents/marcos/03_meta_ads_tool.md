# 03_Meta_Ads.tool.md

# META ADS TOOL

Versão: 1.0

Status: Documento Oficial

Classificação: Tool Corporativa

---

# OBJETIVO

Disponibilizar operações atômicas para integração com a Meta Marketing API.

Esta Tool apenas executa operações técnicas.

Não toma decisões estratégicas e não aplica regras de negócio.

---

# RESPONSABILIDADES

- Criar campanha.
- Atualizar campanha.
- Pausar campanha.
- Ativar campanha.
- Excluir campanha.
- Criar conjunto de anúncios.
- Atualizar conjunto.
- Criar anúncios.
- Atualizar anúncios.
- Buscar métricas.
- Buscar insights.
- Buscar status de aprovação.
- Alterar orçamento.
- Alterar segmentação.
- Alterar criativos.
- Duplicar campanhas.

---

# ENTRADAS

- Conta de anúncios.
- Objetivo.
- Configuração.
- Público.
- Criativos.
- Orçamento.
- Cronograma.

---

# SAÍDAS

- IDs criados.
- Status da operação.
- Métricas.
- Insights.
- Mensagens de erro.

---

# PRÉ-CONDIÇÕES

- Credenciais válidas.
- Permissões suficientes.
- Conta ativa.
- Objetos previamente validados.

---

# PÓS-CONDIÇÕES

- Operação registrada.
- Resultado devolvido ao Operator.

---

# TRATAMENTO DE ERROS

- Token expirado.
- Permissão insuficiente.
- Limite da API.
- Campanha inexistente.
- Criativo inválido.
- Política da Meta.
- Falha de conexão.

Todos os erros devem retornar estrutura padronizada.

---

# SEGURANÇA

- Nunca armazenar credenciais em texto.
- Utilizar apenas credenciais autorizadas.
- Respeitar integralmente as políticas da Meta.

---

# OBSERVABILIDADE

Registrar:

- Operação.
- Data e hora.
- Latência.
- Status.
- Código de erro.
- Consumo da API.

---

# KPIs

- Taxa de sucesso.
- Tempo médio de resposta.
- Falhas por operação.
- Disponibilidade.

---

# PRINCÍPIO FINAL

Esta Tool executa operações técnicas sobre a Meta Marketing API.

Toda inteligência de otimização pertence ao Meta Ads Operator.

---

Meta Ads Tool

Versão 1.0
