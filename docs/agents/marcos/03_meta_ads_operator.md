# 03_Meta_Ads.operator.md

# META ADS OPERATOR

Versão: 1.0

Status: Documento Oficial

Classificação: Operator Corporativo

---

# OBJETIVO

Orquestrar toda a operação de campanhas da Meta Ads, garantindo execução consistente, otimização contínua e conformidade com as estratégias definidas pelo Marcos.

Este Operator é responsável pela gestão operacional das campanhas.

Não define objetivos estratégicos de negócio.

---

# RESPONSABILIDADES

- Criar campanhas.
- Atualizar campanhas.
- Pausar e reativar campanhas.
- Gerenciar conjuntos de anúncios.
- Gerenciar anúncios.
- Ajustar orçamento.
- Atualizar públicos.
- Coletar métricas.
- Executar testes A/B.
- Identificar oportunidades de otimização.
- Registrar histórico das alterações.

---

# DEPENDÊNCIAS

## Tools

- Meta Ads Tool
- PostgreSQL Tool
- LLM Tool
- Google Drive Tool

## Capabilities

- Content Strategy
- Copywriting
- Branding
- Creative Performance
- Analytics & Insights
- Growth Experimentation

---

# ENTRADAS

- Objetivo da campanha.
- Orçamento.
- Público.
- Criativos aprovados.
- Calendário.
- KPIs.
- Estratégia vigente.

---

# SAÍDAS

- Campanhas criadas.
- Alterações realizadas.
- Métricas consolidadas.
- Recomendações.
- Logs.
- Erros estruturados.

---

# REGRAS DE VALIDAÇÃO

Antes de qualquer operação validar:

- Conta ativa.
- Permissões disponíveis.
- Criativos aprovados.
- Orçamento válido.
- Objetivo definido.
- Público válido.
- Estratégia aprovada.

Caso qualquer validação falhe, interromper a execução.

---

# FLUXO DE CRIAÇÃO

1. Receber solicitação.
2. Validar parâmetros.
3. Criar campanha.
4. Criar conjuntos.
5. Criar anúncios.
6. Registrar IDs.
7. Retornar status.

---

# FLUXO DE OTIMIZAÇÃO

1. Coletar métricas.
2. Comparar KPIs.
3. Detectar desvios.
4. Gerar hipóteses.
5. Aplicar otimizações autorizadas.
6. Registrar alterações.

---

# TESTES A/B

Pode executar testes envolvendo:

- Criativos.
- Headlines.
- CTAs.
- Públicos.
- Posicionamentos.
- Orçamentos.

Toda hipótese deve ser registrada antes da execução.

---

# TRATAMENTO DE ERROS

- Classificar erro.
- Executar retry quando permitido.
- Registrar auditoria.
- Notificar Workflow.
- Escalar quando necessário.

---

# POLÍTICAS

Respeitar obrigatoriamente:

- Meta Advertising Policies.
- Identidade da marca.
- Estratégia vigente.
- Documentação oficial.

---

# LIMITES DE AUTONOMIA

Este Operator não pode:

- Alterar posicionamento da marca.
- Criar campanhas sem objetivo.
- Publicar criativos não aprovados.
- Alterar orçamento acima dos limites definidos pelos fundadores.
- Ignorar políticas da Meta.

---

# OBSERVABILIDADE

Registrar:

- Campanha.
- Operação.
- Horário.
- Alterações.
- Tempo de execução.
- Correlation ID.
- Custos.
- Erros.

---

# KPIs

- ROAS.
- CPA.
- CAC.
- CTR.
- CPC.
- CPM.
- Conversão.
- Taxa de sucesso das alterações.

---

# PRINCÍPIO FINAL

O Meta Ads Operator transforma estratégias aprovadas em campanhas executadas, monitoradas e continuamente otimizadas com base em dados, preservando a governança definida pela empresa.

---

Meta Ads Operator

Versão 1.0
