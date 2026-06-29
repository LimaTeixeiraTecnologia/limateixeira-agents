# Context_Loading_Strategy_v1.md

# CONTEXT LOADING STRATEGY V1.0

Versão: 1.0

Status: Documento Oficial

Classificação: Arquitetura Corporativa

---

# OBJETIVO

Definir como os Diretores Virtuais constroem o contexto enviado ao LLM, garantindo máxima qualidade de resposta com o menor consumo possível de tokens.

Esta estratégia é obrigatória para todos os Agents da plataforma.

---

# PRINCÍPIO CENTRAL

O Agent nunca deve carregar toda a documentação.

Cada execução deve carregar apenas o contexto estritamente necessário para cumprir a tarefa.

---

# ORDEM DE CARREGAMENTO

A construção do contexto deve seguir obrigatoriamente a sequência abaixo:

1. Constitution
2. System Prompt
3. Session Memory
4. Long Term Memory relevante
5. Capability necessária
6. Business Workflow
7. Core Workflow (quando aplicável)
8. RAG (chunks relevantes)
9. Entrada do usuário

---

# REGRAS DE CARREGAMENTO

## Constitution

Sempre carregar.

Representa a identidade permanente do Diretor Virtual.

---

## System Prompt

Sempre carregar.

Define comportamento permanente.

---

## Memory

Carregar apenas memória relacionada ao contexto atual.

Nunca carregar toda a memória persistente.

---

## Capabilities

Carregar somente as Capabilities utilizadas na execução.

Nunca carregar Capabilities desnecessárias.

---

## Workflows

Carregar apenas o Workflow ativo e seus Core Workflows dependentes.

---

## RAG

Executar recuperação apenas quando:

- faltar conhecimento;
- existir documentação relacionada;
- houver necessidade de consulta.

Nunca executar RAG por padrão.

---

# LIMITES

Prioridade de consumo:

1. Constitution
2. System Prompt
3. Memory
4. Capability
5. Workflow
6. RAG

Caso o limite de contexto seja atingido:

- reduzir quantidade de chunks;
- resumir memória;
- remover informações menos relevantes.

Nunca remover Constitution ou System Prompt.

---

# CONTROLE DE TOKENS

Objetivos:

- minimizar contexto;
- evitar duplicação;
- evitar documentos completos;
- reutilizar resumos.

---

# CACHE

Sempre que possível reutilizar:

- Capabilities já carregadas;
- Resumos recentes;
- Chunks frequentemente utilizados.

---

# FALLBACK

Se o contexto ficar insuficiente:

1. Executar novo RAG.
2. Buscar memória adicional.
3. Solicitar esclarecimento ao usuário.

---

# OBSERVABILIDADE

Registrar:

- tokens carregados;
- memória utilizada;
- chunks recuperados;
- workflows ativos;
- capabilities carregadas;
- tempo de montagem.

---

# KPIs

- tokens por execução;
- tempo de montagem;
- precisão das respostas;
- taxa de recuperação RAG;
- custo por execução.

---

# PRINCÍPIO FINAL

O contexto ideal é o menor contexto capaz de produzir a melhor resposta.

Toda estratégia de carregamento deve priorizar precisão, velocidade e economia de tokens.

---

Context Loading Strategy

Versão 1.0
