# Prompt Enriquecido para `create-prd`

## Objetivo

Produzir um prompt em pt-BR, pronto para ser usado como input da skill `create-prd`, para definir a funcionalidade de integracao entre um projeto Mastra e o Telegram em um contexto com Traefik e persistencia em PostgreSQL.

## Prompt Original x Prompt Enriquecido

| Prompt original | Prompt enriquecido |
| --- | --- |
| Eu quero que o mastra se comunique com telegram, mas usando o traefik e Você é um staff engineer experiente em arquitetura de agentes. Eu tenho um projeto mastra com agentes especializados e persistência no PostgreSQL e Proxy reverso no traefik. Como eu íntegro ao telegram? | Você deve atuar no fluxo da skill `create-prd` e produzir um PRD em pt-BR, com foco de produto e funcionalidade, nao de implementacao. O objetivo e definir a feature de integracao entre um projeto Mastra e o Telegram.<br><br>Contexto conhecido do projeto:<br>- Existe um projeto Mastra com agentes especializados.<br>- O sistema usa persistencia em PostgreSQL.<br>- O ambiente exposto externamente usa Traefik como proxy reverso.<br>- A necessidade e permitir comunicacao entre usuarios no Telegram e o ecossistema de agentes do projeto.<br><br>O problema a ser definido no PRD e: como disponibilizar uma integracao oficial com Telegram para que mensagens enviadas por usuarios no Telegram possam ser recebidas, roteadas com seguranca para o projeto baseado em Mastra e respondidas de volta por esse sistema, respeitando o contexto operacional com Traefik e persistencia existente.<br><br>Quero que voce estruture a resposta como entrada adequada para a skill `create-prd`, cobrindo explicitamente as categorias abaixo antes de redigir o PRD:<br>1. problema e objetivo de negocio<br>2. usuario ou ator principal<br>3. escopo incluido<br>4. escopo excluido<br>5. restricoes e conformidade<br>6. criterios de sucesso mensuraveis<br><br>Restricoes obrigatorias para a resposta:<br>- Responder em pt-BR.<br>- Tratar Traefik, PostgreSQL e Mastra como restricoes e contexto de produto, nao como plano detalhado de implementacao.<br>- Nao escrever codigo, pseudocodigo, YAML, Docker, configuracao de webhook ou detalhes de SDK.<br>- Nao transformar a resposta em tutorial tecnico.<br>- Se algum ponto critico estiver ambiguo, explicitar em `Suposicoes e Questoes em Aberto` em vez de inventar fatos.<br>- Manter o foco no que e por que a feature existe, incluindo riscos, dependencias externas e impacto esperado no produto.<br><br>Criterios de aceitacao do output:<br>- O resultado deve estar pronto para ser salvo como um PRD sem depender de reescrita estrutural.<br>- Deve conter requisitos funcionais numerados e testaveis.<br>- Deve separar claramente escopo incluido e escopo excluido.<br>- Deve mencionar Telegram como canal, Traefik como restricao de exposicao/rede e PostgreSQL como contexto de persistencia existente.<br>- Deve incluir metricas ou criterios objetivos de sucesso para a feature.<br>- Deve incluir a secao `Suposicoes e Questoes em Aberto` se houver lacunas de contexto.<br><br>Formato esperado da resposta:<br>- Responda em markdown.<br>- Comece com um titulo claro da funcionalidade.<br>- Estruture o conteudo em formato de PRD, com requisitos funcionais numerados.<br>- Evite qualquer detalhe de implementacao que pertenca a uma futura tech spec.<br><br>Se precisar assumir algo por falta de contexto, assuma o minimo necessario e deixe isso explicito no documento. |

## Ambiguidades identificadas

- "Como eu integro ao Telegram?" tende a puxar uma resposta de implementacao tecnica, mas o destino correto aqui e um input para `create-prd`, que exige definicao de produto.
- O papel de Traefik pode ser interpretado como detalhe de infraestrutura ou restricao de exposicao/rede; para este prompt, ele foi enquadrado como restricao de contexto.
- Nao foram fornecidos objetivos de negocio detalhados, perfis de usuario, requisitos de conformidade ou metas numericas; o prompt enriquecido pede que isso seja explicitado e registre suposicoes quando faltar contexto.

## Justificativas das adicoes

- Adicionei o enquadramento explicito para `create-prd` para evitar que a resposta vire desenho tecnico ou passo a passo.
- Estruturei as seis categorias minimas exigidas pela skill de PRD para aumentar determinismo e compatibilidade com o fluxo esperado.
- Inclui restricoes negativas claras para bloquear codigo, configuracoes e detalhes de implementacao.
- Converti Mastra, Telegram, Traefik e PostgreSQL em contexto e restricoes de produto, preservando o objetivo original sem desviar para execucao tecnica.
- Defini criterios de aceitacao objetivos para que o output gerado ja possa seguir para o proximo artefato sem retrabalho estrutural.

## Versao Pronta para Copiar

```md
Você deve atuar no fluxo da skill `create-prd` e produzir um PRD em pt-BR, com foco de produto e funcionalidade, nao de implementacao. O objetivo e definir a feature de integracao entre um projeto Mastra e o Telegram.

Contexto conhecido do projeto:
- Existe um projeto Mastra com agentes especializados.
- O sistema usa persistencia em PostgreSQL.
- O ambiente exposto externamente usa Traefik como proxy reverso.
- A necessidade e permitir comunicacao entre usuarios no Telegram e o ecossistema de agentes do projeto.

O problema a ser definido no PRD e: como disponibilizar uma integracao oficial com Telegram para que mensagens enviadas por usuarios no Telegram possam ser recebidas, roteadas com seguranca para o projeto baseado em Mastra e respondidas de volta por esse sistema, respeitando o contexto operacional com Traefik e persistencia existente.

Quero que voce estruture a resposta como entrada adequada para a skill `create-prd`, cobrindo explicitamente as categorias abaixo antes de redigir o PRD:
1. problema e objetivo de negocio
2. usuario ou ator principal
3. escopo incluido
4. escopo excluido
5. restricoes e conformidade
6. criterios de sucesso mensuraveis

Restricoes obrigatorias para a resposta:
- Responder em pt-BR.
- Tratar Traefik, PostgreSQL e Mastra como restricoes e contexto de produto, nao como plano detalhado de implementacao.
- Nao escrever codigo, pseudocodigo, YAML, Docker, configuracao de webhook ou detalhes de SDK.
- Nao transformar a resposta em tutorial tecnico.
- Se algum ponto critico estiver ambiguo, explicitar em `Suposicoes e Questoes em Aberto` em vez de inventar fatos.
- Manter o foco no que e por que a feature existe, incluindo riscos, dependencias externas e impacto esperado no produto.

Criterios de aceitacao do output:
- O resultado deve estar pronto para ser salvo como um PRD sem depender de reescrita estrutural.
- Deve conter requisitos funcionais numerados e testaveis.
- Deve separar claramente escopo incluido e escopo excluido.
- Deve mencionar Telegram como canal, Traefik como restricao de exposicao/rede e PostgreSQL como contexto de persistencia existente.
- Deve incluir metricas ou criterios objetivos de sucesso para a feature.
- Deve incluir a secao `Suposicoes e Questoes em Aberto` se houver lacunas de contexto.

Formato esperado da resposta:
- Responda em markdown.
- Comece com um titulo claro da funcionalidade.
- Estruture o conteudo em formato de PRD, com requisitos funcionais numerados.
- Evite qualquer detalhe de implementacao que pertenca a uma futura tech spec.

Se precisar assumir algo por falta de contexto, assuma o minimo necessario e deixe isso explicito no documento.
```
