# Memory_Architecture_v1.md

# MEMORY ARCHITECTURE V1.0

Versão: 1.0

Status: Documento Oficial

Classificação: Arquitetura Corporativa

---

# OBJETIVO

Definir a arquitetura oficial de memória da Plataforma de Diretores Virtuais, garantindo continuidade de contexto, economia de tokens, segurança de dados e separação clara entre memória temporária, memória operacional e conhecimento permanente.

---

# PRINCÍPIO CENTRAL

Memória não é conhecimento oficial.

Conhecimento oficial pertence à camada Knowledge.

A memória serve para manter contexto, histórico e continuidade operacional.

---

# TIPOS DE MEMÓRIA

## 1. Session Memory

Memória temporária da conversa atual.

Uso:

- contexto imediato;
- últimos pedidos do usuário;
- decisões recentes da sessão;
- estado da execução atual.

Duração:

- enquanto a sessão estiver ativa.

Não deve ser usada como fonte permanente da verdade.

---

## 2. Working Memory

Memória operacional de curto prazo utilizada durante a execução de um Workflow.

Uso:

- etapa atual;
- entradas intermediárias;
- resultados temporários;
- erros transitórios;
- decisões em andamento.

Duração:

- até o encerramento do Workflow.

---

## 3. Long Term Memory

Memória persistente de fatos relevantes sobre usuários, preferências, histórico e padrões recorrentes.

Uso:

- preferências dos fundadores;
- padrões operacionais;
- histórico de interações relevantes;
- contexto empresarial recorrente.

Deve ser controlada, auditável e atualizável.

---

## 4. Episodic Memory

Registro histórico de eventos e execuções.

Uso:

- decisões passadas;
- execuções de Workflows;
- aprovações;
- alterações;
- incidentes;
- aprendizados.

Serve para rastreabilidade e auditoria.

---

## 5. Semantic Memory

Memória estruturada de conceitos, relações e entidades importantes.

Uso:

- entidades da empresa;
- campanhas;
- produtos;
- planos;
- canais;
- diretores virtuais;
- relacionamentos entre componentes.

---

# O QUE NÃO DEVE IR PARA MEMÓRIA

Nunca armazenar em memória:

- segredos;
- tokens;
- senhas;
- dados sensíveis desnecessários;
- documentos oficiais completos;
- regras de negócio permanentes;
- conhecimento que deve estar em Knowledge.

---

# RELAÇÃO ENTRE MEMORY E KNOWLEDGE

Knowledge é a fonte oficial da verdade.

Memory é apoio contextual.

Se houver conflito entre Memory e Knowledge, Knowledge sempre prevalece.

---

# POLÍTICA DE ATUALIZAÇÃO

A memória só deve ser atualizada quando:

- o dado for recorrente;
- o dado for útil para futuras execuções;
- o dado não pertencer a Knowledge;
- houver base suficiente para persistência.

---

# POLÍTICA DE ESQUECIMENTO

A memória deve permitir:

- expiração;
- sobrescrita;
- arquivamento;
- anonimização;
- exclusão mediante solicitação.

---

# ECONOMIA DE TOKENS

O Agent nunca deve carregar toda a memória.

Deve carregar apenas:

- memória relevante para a tarefa;
- resumo da sessão;
- fatos persistentes aplicáveis;
- eventos recentes relacionados.

---

# SUMARIZAÇÃO

Conversas longas devem ser resumidas periodicamente.

O resumo deve preservar:

- decisões;
- contexto relevante;
- pendências;
- próximos passos;
- restrições.

---

# SEGURANÇA

Toda memória persistente deve respeitar:

- LGPD;
- princípio do menor privilégio;
- auditoria;
- rastreabilidade;
- controle de acesso.

---

# OBSERVABILIDADE

Registrar:

- criação de memória;
- atualização;
- exclusão;
- uso em contexto;
- origem da informação;
- agente responsável.

---

# KPIs

- taxa de reutilização de memória;
- redução de tokens;
- precisão contextual;
- erros causados por memória desatualizada;
- tempo médio de recuperação.

---

# PRINCÍPIO FINAL

A memória deve tornar os Diretores Virtuais mais consistentes, eficientes e econômicos, sem substituir a documentação oficial nem comprometer a segurança dos dados.

---

Memory Architecture

Versão 1.0
