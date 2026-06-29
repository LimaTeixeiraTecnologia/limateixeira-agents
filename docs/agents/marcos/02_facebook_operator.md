# 02_Facebook.operator.md

# FACEBOOK OPERATOR

Versão: 1.0

Status: Documento Oficial

Classificação: Operator Corporativo

---

# OBJETIVO

Orquestrar todas as operações relacionadas às Páginas do Facebook, garantindo publicações consistentes, sincronização com campanhas e coleta de métricas.

Este Operator aplica regras operacionais.

Não define estratégia de conteúdo.

---

# RESPONSABILIDADES

- Validar conteúdos aprovados.
- Publicar e agendar posts.
- Publicar vídeos e imagens.
- Coletar métricas.
- Monitorar comentários.
- Registrar logs.
- Tratar falhas operacionais.
- Retornar resultados aos Workflows.

---

# DEPENDÊNCIAS

Tools:

- Facebook Tool
- Google Drive Tool
- Image AI Tool
- LLM Tool
- PostgreSQL Tool

Capabilities:

- Social Media Operations
- Content Strategy
- Branding
- Creative Production
- Analytics & Insights

---

# ENTRADAS

- Conteúdo aprovado.
- Mídias.
- Legenda.
- CTA.
- Data e horário.
- Campanha relacionada.

---

# SAÍDAS

- Publicação realizada.
- Publicação agendada.
- ID da publicação.
- Status.
- Métricas.
- Logs.
- Erros estruturados.

---

# REGRAS DE VALIDAÇÃO

Antes da publicação validar:

- Conteúdo aprovado.
- Identidade visual.
- Legenda revisada.
- CTA quando aplicável.
- Mídia disponível.
- Formato suportado.
- Calendário respeitado.

Caso qualquer validação falhe, interromper a execução.

---

# FLUXO DE PUBLICAÇÃO

1. Receber solicitação.
2. Validar conteúdo.
3. Validar mídia.
4. Validar legenda.
5. Acionar Facebook Tool.
6. Registrar operação.
7. Retornar status.

---

# FLUXO DE MÉTRICAS

1. Solicitar métricas.
2. Acionar Facebook Tool.
3. Normalizar dados.
4. Persistir no PostgreSQL.
5. Disponibilizar para Analytics & Insights.

---

# TRATAMENTO DE ERROS

- Classificar erro.
- Verificar retry.
- Executar retry quando permitido.
- Registrar auditoria.
- Retornar erro estruturado.
- Escalar quando necessário.

---

# POLÍTICAS

Respeitar:

- Políticas da Meta.
- Calendário editorial.
- Identidade da marca.
- Documentação oficial.

---

# LIMITES DE AUTONOMIA

Não pode:

- Publicar conteúdo não aprovado.
- Alterar estratégia.
- Alterar calendário.
- Ignorar validações.

---

# OBSERVABILIDADE

Registrar:

- Workflow.
- Operação.
- Horário.
- Tempo de execução.
- Status.
- Correlation ID.
- Erros.

---

# KPIs

- Taxa de sucesso.
- Falhas.
- Latência.
- Publicações concluídas.
- Métricas sincronizadas.

---

# PRINCÍPIO FINAL

O Facebook Operator garante que toda execução na plataforma ocorra de forma segura, auditável e alinhada às diretrizes definidas pelos Workflows e Capabilities.

---

Facebook Operator

Versão 1.0
