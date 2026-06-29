# Tarefa 6.0: Materializar capabilities, operators, tools e tool registry cobrindo todo docs/agents/marcos

<critical>Ler prd.md e techspec.md desta pasta — sua tarefa será invalidada se você pular</critical>

## Visão Geral

Converter o inventário documental completo de `docs/agents/marcos/` em componentes explícitos e rastreáveis: capabilities, operators, tools e um `tool registry` que informe o estado real de cada integração na V1. O objetivo é eliminar lacunas implícitas entre documentação e implementação.

<requirements>
- Criar componentes nomeados para todas as capabilities, operators e tools documentadas.
- Implementar `tool registry` com status real por item (`real`, `stub`, `read-only` ou equivalente aprovado no código).
- Padronizar contratos de tool e tratamento de erro.
- Cobrir RF-07, RF-08, RF-10, RF-11A, RF-20, RF-21, RF-22 e RF-23.
</requirements>

## Subtarefas

- [ ] 6.1 Mapear todos os documentos de capabilities, operators e tools para componentes concretos no código.
- [ ] 6.2 Implementar contrato único de tool e catálogo de status implementacional.
- [ ] 6.3 Criar stubs governados ou adapters read-only onde a integração real ainda não existir.
- [ ] 6.4 Garantir que nenhuma capability ou tool obrigatória permaneça apenas documental.

## Detalhes de Implementação

Referenciar `techspec.md` nas seções "Visão Geral dos Componentes", "Interfaces Chave", "Riscos Conhecidos" e "Conformidade com Padrões". Stubs só são aceitos se forem explícitos, seguros e testáveis.

## Critérios de Sucesso

- Cada documento obrigatório de capability/operator/tool tem representação clara no código ou no registry.
- O `tool registry` informa estado, origem documental e modo de operação de cada tool.
- Nenhuma integração externa executa ação real fora das políticas de aprovação e erro definidas.
- A implementação evita duplicação de conhecimento entre capability, workflow e prompt.

## Skills Necessárias

<!-- MANDATÓRIO: preenchido por `create-tasks` Etapa 4.1 via descoberta agnóstica em `.agents/skills/`.
     NÃO inclua aqui skills auto-carregadas em runtime: `agent-governance`, `execute-task`, `bugfix`,
     `review`, `refactor`, nem skills `*-implementation` (linguagem, inferida pelo diff).
     Use o conteúdo único `Nenhuma além das auto-carregadas (governance + linguagem).` se a tarefa
     não exigir skill processual extra. -->

- `mastra` — Confirmar os contratos atuais de agent, tool e composição de runtime no Mastra para materializar o ecossistema do Marcos sem abstrações inválidas.

## Testes da Tarefa

- [ ] Testes unitários do tool registry, contratos de tool e classification coverage
- [ ] Testes de integração dos componentes essenciais registrados no runtime

<critical>SEMPRE CRIAR E EXECUTAR TESTES DA TAREFA ANTES DE CONSIDERAR A TAREFA COMO `done`</critical>

## Arquivos Relevantes
- `agents/src/mastra/capabilities/`
- `agents/src/mastra/operators/`
- `agents/src/mastra/tools/`
- `agents/src/mastra/knowledge/`
- `docs/agents/marcos/`
