# Prompt Enriquecido para `create-prd`

## Objetivo

Produzir um prompt em pt-BR, pronto para ser usado como input da skill `create-prd`, para definir a substituicao completa de tudo que hoje pertence a `weather` por um novo agente chamado `Marcos`, fiel aos documentos de `docs/agents/marcos` e enquadrado pelas restricoes obrigatorias de Mastra, persistencia e melhores praticas.

## Prompt Original x Prompt Enriquecido

| Prompt original | Prompt enriquecido |
| --- | --- |
| Eu quero que elimine TUDO de weather e crie o novo agente, chamado marcos e tudo que ele precisa fazer esta em: docs/agents/marcos siga fielmente todos os arquivos para construir utilizando @.agents/skills/mastra/ com persistencia e melhores praticas. E mandatorio e inegociavel ser robusto, production-ready/proof, 0 gaps, 0 lacunas, 0 falso positivo e seguindo as melhores praticas do mastra. O output desse prompt DEVE iniciar a skill @.agents/skills/create-prd/. Nao implemente nada, apenas crie/enriqueca o prompt. | Inicie esta tarefa executando a skill `create-prd` como primeira acao obrigatoria.<br><br>Nao implemente nada nesta etapa. Nao escreva codigo, diff, pseudocodigo, comandos, YAML, plano tecnico ou passos de execucao. O objetivo aqui e exclusivamente produzir um PRD em pt-BR, com foco de produto e funcionalidade, para orientar uma futura implementacao robusta.<br><br>Objetivo do PRD:<br>Definir a substituicao completa e definitiva de tudo que hoje pertence ao escopo `weather` por um novo agente chamado `Marcos`, tratado como agente oficial do projeto, aderente aos documentos em `docs/agents/marcos` e preparado para uma implementacao Mastra robusta, persistente, auditavel, observavel e production-ready.<br><br>Contexto e referencias obrigatorias antes de redigir o PRD:<br>- Ler `AGENTS.md`.<br>- Ler `.agents/skills/create-prd/SKILL.md`.<br>- Ler `.agents/skills/mastra/SKILL.md` como referencia obrigatoria de plataforma, persistencia e melhores praticas do framework.<br>- Ler todos os arquivos dentro de `docs/agents/marcos/` antes de redigir.<br>- Considerar como referencias centrais, no minimo, `01_constituicao_do_marcos.md`, `00_system_prompt.md`, `marcos_agent.md`, `ai_architecture_standard.md`, `implementation_guide_v1.md` e `memory_architecture_v1.md`.<br>- Se houver conflito entre documentos, explicitar o conflito e priorizar a constituicao oficial de Marcos, registrando impactos e assuncoes.<br><br>Problema a ser definido no PRD:<br>Como substituir integralmente o legado `weather` por um agente executivo virtual chamado `Marcos`, alinhado a identidade, missao, limites, memoria, arquitetura e qualidade documental do ecossistema `docs/agents/marcos`, preservando coerencia de produto e estabelecendo requisitos funcionais e nao funcionais claros para uma futura implementacao em Mastra.<br><br>Diretrizes obrigatorias para a resposta:<br>- Responder em pt-BR.<br>- Manter foco em produto, escopo, regras, objetivos, restricoes e criterios de sucesso; nao detalhar implementacao.<br>- Nao inventar APIs, modelos, construtores, componentes ou capacidades do Mastra fora do que for explicitamente conhecido pelas referencias obrigatorias.<br>- Tratar Mastra, persistencia, memoria, auditabilidade, observabilidade, baixo acoplamento, modularidade, conhecimento institucional e economia de tokens como restricoes obrigatorias do produto.<br>- Tratar `docs/agents/marcos/` como fonte institucional obrigatoria para identidade do agente, hierarquia documental, memoria, workflows, capabilities, operators, tools e criterios de qualidade.<br>- Tratar a eliminacao de `weather` como remocao total de referencias funcionais, documentais e operacionais ligadas ao agente anterior, sem deixar escopo residual indefinido.<br>- Se faltar contexto, seguir o fluxo da skill `create-prd`, fazendo no maximo as perguntas necessarias; se ainda houver lacunas, registrar em `Suposicoes e Questoes em Aberto` em vez de inventar fatos.<br><br>Estruture a resposta cobrindo explicitamente estas seis categorias antes de concluir o PRD:<br>1. problema e objetivo de negocio<br>2. usuario ou atores principais<br>3. escopo incluido<br>4. escopo excluido<br>5. restricoes e conformidade<br>6. criterios de sucesso mensuraveis<br><br>O PRD deve capturar explicitamente, no minimo, os seguintes requisitos de produto:<br>- substituicao completa de `weather` por `Marcos`;<br>- aderencia integral a identidade, missao, responsabilidades, autonomia e limites de Marcos;<br>- uso de documentacao institucional como fonte oficial da verdade;<br>- memoria persistente com politicas de atualizacao, esquecimento, seguranca e auditoria;<br>- arquitetura modular orientada a knowledge, capabilities, tools, operators, workflows e agents, sem duplicacao desnecessaria de conhecimento;<br>- rastreabilidade de decisoes e observabilidade obrigatorias;<br>- capacidade de evolucao futura sem acoplamento excessivo nem conhecimento implicito;<br>- criterios objetivos para garantir que nenhuma superficie suportada continue dependendo de `weather` apos a futura implementacao.<br><br>Criterios de aceitacao do output:<br>- O resultado deve estar pronto para ser salvo como PRD sem reescrita estrutural.<br>- Deve conter requisitos funcionais numerados, concretos e testaveis.<br>- Deve separar claramente escopo incluido e escopo excluido.<br>- Deve deixar explicitos os riscos, dependencias, restricoes e impactos da substituicao de `weather` por `Marcos`.<br>- Deve registrar requisitos nao funcionais de robustez, persistencia, auditabilidade, observabilidade e governanca documental.<br>- Deve incluir `Suposicoes e Questoes em Aberto` quando houver lacunas reais.<br>- Nao deve misturar PRD com tech spec, design de classes, desenho de APIs ou plano de implementacao.<br><br>Formato esperado da resposta:<br>- Responder em markdown.<br>- Comecar com um titulo claro da funcionalidade.<br>- Estruturar o conteudo em formato de PRD.<br>- Numerar os requisitos funcionais para rastreabilidade.<br>- Manter o documento orientado ao que e por que deve existir, nao ao como tecnico.<br><br>Se precisar assumir algo por falta de contexto, assuma o minimo necessario e explicite isso de forma objetiva no documento. |

## Ambiguidades identificadas

- "elimine TUDO de weather" define uma direcao forte, mas nao explicita quais superficies entram no escopo; o prompt enriquecido transforma isso em requisito de cobertura total sem permitir residuos indefinidos.
- "crie o novo agente" poderia induzir implementacao imediata, mas o destino correto e `create-prd`, entao o prompt foi enquadrado como definicao de produto, nao execucao tecnica.
- "siga fielmente todos os arquivos" exige hierarquia documental e tratamento de conflitos; o prompt enriquecido obriga leitura integral de `docs/agents/marcos/` e explicita a necessidade de registrar conflitos e assuncoes.
- "utilizando @.agents/skills/mastra/ com persistencia e melhores praticas" poderia virar tech spec prematura; o prompt enriquecido preserva isso como conjunto de restricoes obrigatorias do produto e nao como desenho de implementacao.

## Justificativas das adicoes

- Adicionei a instrucao para iniciar pela skill `create-prd` como primeira acao, porque isso foi definido como obrigatorio.
- Convertei a solicitacao de remocao de `weather` e criacao de `Marcos` em um problema de produto claro, adequado ao escopo de um PRD.
- Estruturei as seis categorias minimas exigidas pela skill `create-prd` para aumentar determinismo e reduzir lacunas.
- Transformei Mastra, persistencia, memoria, observabilidade e auditabilidade em restricoes obrigatorias de produto, mantendo o foco no que deve ser garantido sem cair em implementacao.
- Explicitei as referencias documentais obrigatorias de `docs/agents/marcos/` para impedir respostas superficiais ou desconectadas da arquitetura institucional.
- Adicionei criterios de aceitacao mensuraveis para bloquear respostas vagas, incompletas ou com falso positivo.

## Versao Pronta para Copiar

```md
Inicie esta tarefa executando a skill `create-prd` como primeira acao obrigatoria.

Nao implemente nada nesta etapa. Nao escreva codigo, diff, pseudocodigo, comandos, YAML, plano tecnico ou passos de execucao. O objetivo aqui e exclusivamente produzir um PRD em pt-BR, com foco de produto e funcionalidade, para orientar uma futura implementacao robusta.

Objetivo do PRD:
Definir a substituicao completa e definitiva de tudo que hoje pertence ao escopo `weather` por um novo agente chamado `Marcos`, tratado como agente oficial do projeto, aderente aos documentos em `docs/agents/marcos` e preparado para uma implementacao Mastra robusta, persistente, auditavel, observavel e production-ready.

Contexto e referencias obrigatorias antes de redigir o PRD:
- Ler `AGENTS.md`.
- Ler `.agents/skills/create-prd/SKILL.md`.
- Ler `.agents/skills/mastra/SKILL.md` como referencia obrigatoria de plataforma, persistencia e melhores praticas do framework.
- Ler todos os arquivos dentro de `docs/agents/marcos/` antes de redigir.
- Considerar como referencias centrais, no minimo, `01_constituicao_do_marcos.md`, `00_system_prompt.md`, `marcos_agent.md`, `ai_architecture_standard.md`, `implementation_guide_v1.md` e `memory_architecture_v1.md`.
- Se houver conflito entre documentos, explicitar o conflito e priorizar a constituicao oficial de Marcos, registrando impactos e assuncoes.

Problema a ser definido no PRD:
Como substituir integralmente o legado `weather` por um agente executivo virtual chamado `Marcos`, alinhado a identidade, missao, limites, memoria, arquitetura e qualidade documental do ecossistema `docs/agents/marcos`, preservando coerencia de produto e estabelecendo requisitos funcionais e nao funcionais claros para uma futura implementacao em Mastra.

Diretrizes obrigatorias para a resposta:
- Responder em pt-BR.
- Manter foco em produto, escopo, regras, objetivos, restricoes e criterios de sucesso; nao detalhar implementacao.
- Nao inventar APIs, modelos, construtores, componentes ou capacidades do Mastra fora do que for explicitamente conhecido pelas referencias obrigatorias.
- Tratar Mastra, persistencia, memoria, auditabilidade, observabilidade, baixo acoplamento, modularidade, conhecimento institucional e economia de tokens como restricoes obrigatorias do produto.
- Tratar `docs/agents/marcos/` como fonte institucional obrigatoria para identidade do agente, hierarquia documental, memoria, workflows, capabilities, operators, tools e criterios de qualidade.
- Tratar a eliminacao de `weather` como remocao total de referencias funcionais, documentais e operacionais ligadas ao agente anterior, sem deixar escopo residual indefinido.
- Se faltar contexto, seguir o fluxo da skill `create-prd`, fazendo no maximo as perguntas necessarias; se ainda houver lacunas, registrar em `Suposicoes e Questoes em Aberto` em vez de inventar fatos.

Estruture a resposta cobrindo explicitamente estas seis categorias antes de concluir o PRD:
1. problema e objetivo de negocio
2. usuario ou atores principais
3. escopo incluido
4. escopo excluido
5. restricoes e conformidade
6. criterios de sucesso mensuraveis

O PRD deve capturar explicitamente, no minimo, os seguintes requisitos de produto:
- substituicao completa de `weather` por `Marcos`;
- aderencia integral a identidade, missao, responsabilidades, autonomia e limites de Marcos;
- uso de documentacao institucional como fonte oficial da verdade;
- memoria persistente com politicas de atualizacao, esquecimento, seguranca e auditoria;
- arquitetura modular orientada a knowledge, capabilities, tools, operators, workflows e agents, sem duplicacao desnecessaria de conhecimento;
- rastreabilidade de decisoes e observabilidade obrigatorias;
- capacidade de evolucao futura sem acoplamento excessivo nem conhecimento implicito;
- criterios objetivos para garantir que nenhuma superficie suportada continue dependendo de `weather` apos a futura implementacao.

Criterios de aceitacao do output:
- O resultado deve estar pronto para ser salvo como PRD sem reescrita estrutural.
- Deve conter requisitos funcionais numerados, concretos e testaveis.
- Deve separar claramente escopo incluido e escopo excluido.
- Deve deixar explicitos os riscos, dependencias, restricoes e impactos da substituicao de `weather` por `Marcos`.
- Deve registrar requisitos nao funcionais de robustez, persistencia, auditabilidade, observabilidade e governanca documental.
- Deve incluir `Suposicoes e Questoes em Aberto` quando houver lacunas reais.
- Nao deve misturar PRD com tech spec, design de classes, desenho de APIs ou plano de implementacao.

Formato esperado da resposta:
- Responder em markdown.
- Comecar com um titulo claro da funcionalidade.
- Estruturar o conteudo em formato de PRD.
- Numerar os requisitos funcionais para rastreabilidade.
- Manter o documento orientado ao que e por que deve existir, nao ao como tecnico.

Se precisar assumir algo por falta de contexto, assuma o minimo necessario e explicite isso de forma objetiva no documento.
```
