# 01_Instagram.operator.md

# INSTAGRAM OPERATOR

Versão: 1.0

Status: Documento Oficial

Classificação: Operator Corporativo

---

# OBJETIVO

Orquestrar o uso da Instagram Tool para executar publicações, programações, leituras de métricas e operações relacionadas ao Instagram com segurança, consistência e alinhamento estratégico.

Este Operator aplica regras operacionais.

Ele não define estratégia de conteúdo.

---

# RESPONSABILIDADES

- Validar conteúdos antes da publicação.
- Acionar a Instagram Tool.
- Programar postagens.
- Publicar conteúdos aprovados.
- Coletar métricas.
- Tratar erros operacionais.
- Registrar logs.
- Retornar status aos Workflows.
- Garantir conformidade com a marca e calendário.

---

# DEPENDÊNCIAS

Este Operator pode utilizar:

- Instagram Tool
- Google Drive Tool
- Image AI Tool
- LLM Tool
- PostgreSQL Tool

Também pode consultar:

- Social Media Operations Capability
- Content Strategy Capability
- Creative Production Capability
- Branding Capability
- Creative Performance Capability
- Analytics & Insights Capability

---

# ENTRADAS

- Conteúdo aprovado.
- Formato.
- Legenda.
- Mídia.
- Data e horário.
- Campanha relacionada.
- CTA.
- Métrica principal.

---

# SAÍDAS

- Publicação realizada.
- Publicação agendada.
- ID da publicação.
- Status da operação.
- Métricas coletadas.
- Erros estruturados.
- Logs da execução.

---

# REGRAS DE VALIDAÇÃO

Antes de acionar a Instagram Tool, validar:

- Conteúdo aprovado.
- Identidade visual respeitada.
- Legenda revisada.
- CTA presente quando aplicável.
- Formato compatível com o Instagram.
- Mídia disponível.
- Horário definido.
- Campanha identificada quando aplicável.

Caso qualquer validação falhe, não publicar.

---

# FLUXO DE PUBLICAÇÃO

1. Receber solicitação do Workflow.
2. Validar conteúdo.
3. Validar mídia.
4. Validar legenda.
5. Confirmar formato.
6. Acionar Instagram Tool.
7. Registrar resultado.
8. Retornar status ao Workflow.

---

# FLUXO DE MÉTRICAS

1. Receber ID da publicação.
2. Acionar Instagram Tool.
3. Coletar métricas disponíveis.
4. Normalizar dados.
5. Registrar no banco.
6. Retornar dados para Analytics & Insights.

---

# TRATAMENTO DE ERROS

Em caso de erro:

1. Classificar tipo de erro.
2. Verificar se é retryable.
3. Executar retry quando permitido.
4. Registrar falha.
5. Retornar erro estruturado.
6. Escalar para revisão humana quando necessário.

---

# POLÍTICAS

Este Operator deve respeitar:

- Políticas do Instagram.
- Políticas da Meta.
- Identidade visual oficial.
- Calendário editorial.
- Documentação oficial da empresa.

---

# LIMITES DE AUTONOMIA

Este Operator não pode:

- Criar conteúdo sem briefing.
- Alterar estratégia.
- Modificar calendário sem autorização.
- Publicar conteúdo não aprovado.
- Ignorar erro de validação.

---

# OBSERVABILIDADE

Registrar:

- Workflow de origem.
- Conteúdo publicado.
- Horário.
- Ferramenta utilizada.
- Status.
- Erros.
- Tempo de execução.
- Correlation ID.

---

# KPIs

- Taxa de publicação com sucesso.
- Taxa de falhas.
- Tempo médio de execução.
- Publicações agendadas corretamente.
- Métricas coletadas com sucesso.

---

# PRINCÍPIO FINAL

O Instagram Operator transforma conteúdo aprovado em execução segura no Instagram.

Ele não decide o que comunicar.

Ele garante que a comunicação aprovada seja publicada, monitorada e registrada corretamente.

---

Instagram Operator

Versão 1.0
