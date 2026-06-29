# Tarefa 3.0: Implementar o catálogo de knowledge, sincronização documental e pipeline de RAG do Marcos

<critical>Ler prd.md e techspec.md desta pasta — sua tarefa será invalidada se você pular</critical>

## Visão Geral

Transformar `docs/agents/marcos/` em knowledge operacional verificável, com catálogo persistido, checksum, chunking e pipeline de RAG compatível com o stack Mastra adotado pelo repositório. Esta tarefa evita drift silencioso entre documentação e runtime.

<requirements>
- Persistir catálogo documental e chunks indexáveis.
- Implementar sincronização entre arquivos oficiais e storage.
- Expor status de knowledge e preparar o RAG do Marcos.
- Cobrir RF-04, RF-05, RF-06, RF-11A, RF-16, RF-17, RF-22 e RF-23.
</requirements>

## Subtarefas

- [ ] 3.1 Criar tabelas/estruturas para `marcos_knowledge_documents` e `marcos_knowledge_chunks`.
- [ ] 3.2 Implementar sincronização com checksum e classificação por tipo documental.
- [ ] 3.3 Implementar chunking e metadados necessários para recuperação seletiva.
- [ ] 3.4 Expor `GET /marcos/knowledge/status` e bloquear readiness quando houver drift.

## Detalhes de Implementação

Referenciar `techspec.md` nas seções "Modelos de Dados", "Pontos de Integração" e "Riscos Conhecidos". A escolha de APIs de RAG e memory/vector deve ser verificada na documentação embutida do Mastra antes de codificar.

## Critérios de Sucesso

- Todo arquivo obrigatório de `docs/agents/marcos/` tem representação rastreável no catálogo.
- Checksums divergentes ou cobertura incompleta aparecem no status e bloqueiam `ready`.
- O pipeline de chunking preserva metadados suficientes para retrieval seletivo.
- Nenhum documento oficial é usado apenas como prompt inline solto.

## Skills Necessárias

<!-- MANDATÓRIO: preenchido por `create-tasks` Etapa 4.1 via descoberta agnóstica em `.agents/skills/`.
     NÃO inclua aqui skills auto-carregadas em runtime: `agent-governance`, `execute-task`, `bugfix`,
     `review`, `refactor`, nem skills `*-implementation` (linguagem, inferida pelo diff).
     Use o conteúdo único `Nenhuma além das auto-carregadas (governance + linguagem).` se a tarefa
     não exigir skill processual extra. -->

- `mastra` — Confirmar as APIs atuais de memory/vector/RAG e o uso correto do storage PostgreSQL no runtime Mastra.

## Testes da Tarefa

- [ ] Testes unitários de classificação, checksum e chunking
- [ ] Testes de integração de persistência e status de sincronização

<critical>SEMPRE CRIAR E EXECUTAR TESTES DA TAREFA ANTES DE CONSIDERAR A TAREFA COMO `done`</critical>

## Arquivos Relevantes
- `agents/src/mastra/knowledge/`
- `agents/src/mastra/rag/`
- `agents/src/mastra/storage.ts`
- `agents/src/mastra/index.ts`
- `docs/agents/marcos/`
