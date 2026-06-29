<!-- spec-version: 1 -->

# PRD - Substituicao Completa do Weather pelo Agente Marcos

## Visao Geral

Este PRD define a substituicao completa e definitiva de tudo que hoje pertence ao escopo `weather` por um novo agente oficial chamado `Marcos`. O objetivo e encerrar o legado funcional, documental e operacional associado ao `weather-agent` e estabelecer Marcos como diretor virtual executivo do projeto, fiel aos documentos institucionais em `docs/agents/marcos/`.

No estado atual identificado no repositorio, o escopo `weather` aparece explicitamente no roteamento do Telegram, no runtime do agente, no registro Mastra e nos artefatos de workflow, tool e scorer associados ao agente de clima. O produto alvo deixa de oferecer uma experiencia pontual de consulta de clima e passa a oferecer uma capacidade executiva orientada a growth, marketing, produto, branding, conteudo, analytics e inteligencia operacional, com implementacao obrigatoriamente baseada em Mastra, memoria persistente, rastreabilidade e observabilidade obrigatorias.

## Objetivos

- Substituir integralmente o agente `weather` por `Marcos` sem deixar dependencias funcionais residuais do legado.
- Tornar `docs/agents/marcos/` a fonte institucional obrigatoria para identidade, comportamento, limites, workflows, capabilities, operators, tools e criterios de qualidade do novo agente.
- Garantir que a futura implementacao utilize Mastra de forma obrigatoria como framework base do agente e de sua orquestracao, com separacao entre Knowledge, Capabilities, Tools, Operators, Workflows e Agents.
- Exigir memoria persistente, auditavel e segura, com politicas claras de atualizacao, esquecimento, rastreabilidade e economia de tokens.
- Definir criterios mensuraveis para validar que Marcos entrega valor executivo ao negocio e que a remocao de `weather` foi completa.

## Problema e Objetivo de Negocio

Hoje o repositorio ainda possui um agente `weather` de escopo estreito, focado em previsao do tempo, que nao representa a identidade institucional desejada nem a ambicao do ecossistema de diretores virtuais documentado para Marcos. Isso cria desalinhamento entre a arquitetura alvo, a documentacao institucional e a funcionalidade efetivamente exposta ao usuario.

O objetivo de negocio e substituir esse legado por um agente executivo virtual que ajude a empresa a crescer de forma sustentavel, fortalecer a marca, apoiar decisoes dos fundadores e transformar conhecimento institucional em operacao auditavel e reaproveitavel.

## Usuarios ou Atores Principais

- Fundadores e lideranca do MeControla, que utilizam Marcos como colaborador executivo virtual para planejamento, analise, recomendacao, execucao coordenada e aprendizado institucional.
- Operadores internos e mantenedores do projeto, que precisam de um agente coerente com a arquitetura oficial, com observabilidade, rastreabilidade e baixo acoplamento.
- Usuarios finais dos canais suportados pelo projeto, que deixam de interagir com um agente de clima e passam a interagir com um agente orientado ao contexto de negocio autorizado.
- Demais agentes, workflows, operators e tools do ecossistema, que dependem de contratos claros e da hierarquia documental correta para interoperar com Marcos.

## Historias de Usuario

- Como fundador do MeControla, quero interagir com Marcos como um diretor virtual executivo para receber analises, recomendacoes e operacao alinhadas a missao, marca e estrategia da empresa.
- Como mantenedor do projeto, quero remover completamente o legado `weather` para evitar rotas, registros, testes, documentacao e dependencias incoerentes com a arquitetura oficial.
- Como operador interno, quero que Marcos utilize documentacao oficial, memoria persistente e criterios de qualidade auditaveis para que as decisoes sejam reproduziveis e seguras.
- Como gestor do ecossistema de agentes, quero que Marcos siga uma arquitetura modular e extensivel para permitir evolucao futura sem duplicacao de conhecimento nem acoplamento excessivo.

## Escopo Incluido

- Definicao do agente `Marcos` como substituto oficial e exclusivo de tudo que pertence ao escopo funcional `weather`.
- Remocao total das referencias funcionais, operacionais e documentais do legado `weather`, incluindo superficies de entrada, roteamento, registro de agente e demais artefatos suportados pela futura implementacao.
- Aderencia obrigatoria a constituicao, system prompt, definicao do agente, arquitetura de IA, memoria, RAG, contratos de tools, standards de desenvolvimento, avaliacao e workflows documentados em `docs/agents/marcos/`.
- Uso obrigatorio de Mastra como base de runtime, composicao e orquestracao do agente, conforme as convencoes locais e as melhores praticas verificadas pela skill vendorizada `.agents/skills/mastra/`.
- Definicao de Marcos como agente executivo com foco em growth, marketing, marca, produto, conteudo, analytics, pesquisa, operacao e inteligencia artificial aplicada.
- Exigencia de arquitetura modular com papeis claros para Knowledge, Capabilities, Tools, Operators, Workflows e Agent.
- Exigencia de memoria persistente cobrindo, no minimo, Session Memory, Working Memory, Long Term Memory, Episodic Memory e Semantic Memory, com politicas de seguranca e governanca.
- Exigencia de rastreabilidade, observabilidade, logs estruturados, correlation ID, auditoria de decisoes e medicao de qualidade, eficiencia, confiabilidade e valor de negocio.
- Definicao de mecanismos de aprovacao humana, notificacao, atualizacao de conhecimento e avaliacao continua como requisitos de produto quando aplicaveis aos fluxos de Marcos.
- Definicao de cobertura documental e criterios objetivos para impedir que qualquer superficie suportada continue dependendo de `weather` apos a futura implementacao.
- Limitacao explicita da primeira versao ao canal Telegram, sem obrigacao inicial de cobrir outros canais.
- Cobertura integral, ja na V1, de tudo que esta documentado em `docs/agents/marcos/` como fonte de escopo do agente.
- Aprovacao humana obrigatoria desde a V1, conforme os workflows e regras corporativas aplicaveis ao agente Marcos.

## Escopo Excluido

- Implementacao tecnica, diff, desenho de classes, contratos de API, schema de banco, CLI, YAML ou plano de execucao.
- Escolha detalhada de provedores, modelos, embeddings, vector store, credenciais ou configuracoes de infraestrutura.
- Expansao de escopo para departamentos ou objetivos nao descritos na documentacao oficial de Marcos.
- Migracoes de produto nao relacionadas a substituicao de `weather` por Marcos.
- Alteracao da constituicao, da hierarquia documental ou da identidade institucional de Marcos sem deliberacao explicita dos fundadores.

## Funcionalidades Core

### 1. Identidade executiva institucional

Marcos deve operar como diretor virtual executivo, nao como chatbot generico nem assistente pontual. Isso e essencial para alinhar comportamento, linguagem, autonomia e responsabilidade ao papel documentado.

### 2. Tomada de decisao baseada em documentacao

O agente deve priorizar conhecimento institucional, explicitar conflitos documentais e registrar suposicoes quando faltarem fatos. Isso protege a coerencia do negocio e reduz respostas arbitrarias.

### 3. Orquestracao modular do ecossistema

Marcos deve coordenar capabilities, workflows, operators e tools sem concentrar conhecimento duplicado. Isso viabiliza expansao sustentavel e baixo acoplamento.

### 4. Memoria persistente e governada

O produto deve preservar continuidade operacional e aprendizado institucional com politicas de atualizacao, esquecimento, seguranca e auditoria. Isso permite contexto persistente sem confundir memoria com fonte oficial da verdade.

### 5. Observabilidade e auditoria de ponta a ponta

Toda execucao relevante deve ser mensuravel, rastreavel e auditavel. Isso e necessario para robustez operacional, melhoria continua e confianca dos fundadores.

### 6. Remocao completa do legado weather

A substituicao precisa cobrir entradas, fluxos, referenciais e validacoes relacionadas ao `weather-agent`, para que nao exista coexistencia ambigua entre o agente antigo e o novo.

## Requisitos Funcionais

- RF-01: O produto deve substituir integralmente o agente `weather` por `Marcos` como agente oficial do escopo atualmente suportado.
- RF-02: O produto deve impedir que novas interacoes sejam roteadas para `weather` apos a entrada em vigor da substituicao.
- RF-02A: A primeira versao de Marcos deve operar obrigatoriamente e exclusivamente no canal Telegram.
- RF-03: O produto deve definir criterios objetivos de cobertura para remocao de todas as referencias funcionais, operacionais, documentais e de validacao ligadas a `weather`.
- RF-04: O produto deve tratar `docs/agents/marcos/` como fonte institucional obrigatoria da verdade para identidade, missao, principios, autonomia, limites e qualidade do agente.
- RF-05: O produto deve exigir que Marcos consulte documentacao institucional antes de responder ou executar fluxos relevantes.
- RF-06: O produto deve exigir que conflitos entre documentos sejam explicitados, com indicacao do documento prioritario e registro de impactos.
- RF-07: O produto deve posicionar Marcos como diretor virtual executivo com escopo de atuacao em marketing, growth, branding, produto, conteudo, analytics, pesquisa, UX conversacional e inteligencia artificial aplicada, conforme documentacao oficial.
- RF-08: O produto deve permitir que Marcos proponha melhorias, identifique riscos, questione solicitacoes inconsistentes e apoie decisoes dos fundadores dentro de seus limites de autonomia.
- RF-09: O produto deve impedir que Marcos altere missao, visao, posicionamento, documentos oficiais ou decisoes financeiras e juridicas fora de sua competencia.
- RF-10: O produto deve estruturar a futura capacidade do agente segundo a arquitetura oficial separando Knowledge, Capabilities, Tools, Operators, Workflows e Agent.
- RF-10A: O produto deve adotar Mastra obrigatoriamente como framework base da futura implementacao de Marcos, sem alternativa paralela de runtime para o agente principal.
- RF-11: O produto deve exigir que Workflows de Marcos cubram planejamento, execucao, analise, relatorios, atualizacao de conhecimento, aprovacao humana e notificacoes quando aplicavel ao dominio.
- RF-11A: A V1 deve considerar como escopo funcional obrigatorio todo o conjunto documental existente em `docs/agents/marcos/`, sem reduzir o escopo para um subconjunto minimo de workflows ou capacidades.
- RF-12: O produto deve exigir memoria persistente com, no minimo, Session Memory, Working Memory, Long Term Memory, Episodic Memory e Semantic Memory.
- RF-13: O produto deve definir que Knowledge prevalece sobre Memory sempre que houver conflito.
- RF-14: O produto deve exigir politicas explicitas para atualizacao, expiração, sobrescrita, arquivamento, anonimização e exclusao de memoria.
- RF-15: O produto deve proibir o armazenamento de segredos, tokens, senhas, documentos oficiais completos e regras permanentes de negocio em memoria persistente.
- RF-16: O produto deve exigir uso eficiente de contexto e economia de tokens, incluindo carregamento seletivo de memoria e recuperacao apenas do conhecimento relevante.
- RF-17: O produto deve prever uso de RAG como mecanismo de recuperacao de conhecimento institucional, sem substituir Knowledge nem Memory.
- RF-18: O produto deve exigir observabilidade de execucao com registro de workflow, tools utilizadas, tempo, latencia, tokens, correlation ID, status e falhas.
- RF-19: O produto deve exigir auditoria de decisoes, aprovacoes, incidentes, aprendizados e alteracoes relevantes produzidas por Marcos.
- RF-19A: O produto deve exigir aprovacao humana obrigatoria desde a V1 para as acoes e fluxos que a documentacao oficial de Marcos enquadrar como sujeitos a aprovacao.
- RF-20: O produto deve exigir contratos padronizados para Tools e respostas de erro estruturadas, de forma consistente com a documentacao institucional.
- RF-21: O produto deve exigir criterios de qualidade e avaliacao continua para Agents, Workflows, Operators, Tools e Capabilities.
- RF-22: O produto deve definir criterios de aceite que comprovem que Marcos entrega valor para o negocio, respeita a arquitetura e nao duplica conhecimento institucional.
- RF-23: O produto deve permitir evolucao futura de Marcos sem acoplamento excessivo, sem conhecimento implicito e sem duplicacao desnecessaria entre componentes.
- RF-24: O produto deve prever que resultados relevantes gerados por Marcos possam ser convertidos em aprendizado institucional e atualizacao documental sob governanca apropriada.

## Experiencia do Usuario

Marcos deve oferecer uma experiencia de interacao de nivel executivo, com respostas claras, objetivas, fundamentadas e orientadas a decisao. A jornada esperada e:

1. O usuario apresenta um objetivo ou demanda de negocio.
2. Marcos interpreta a intencao e consulta a documentacao e o contexto relevantes.
3. Marcos retorna conclusao, justificativa, recomendacao e proximos passos quando aplicavel.
4. Quando houver risco, conflito documental, dependencia externa ou necessidade de aprovacao humana, o agente explicita isso de forma objetiva.
5. O conhecimento util gerado e tratado como potencial ativo institucional, sem depender de memoria informal.

Nao faz parte da experiencia alvo responder como um assistente generico de clima, nem manter comandos ou fluxos cujo objetivo principal seja previsao meteorologica. Na V1, essa experiencia deve estar restrita ao canal Telegram.

## Restricoes e Conformidade

- O PRD deve permanecer orientado a produto e nao detalhar implementacao.
- A futura implementacao deve usar Mastra obrigatoriamente e respeitar suas melhores praticas verificadas localmente, sem inventar APIs ou capacidades nao confirmadas.
- A arquitetura deve seguir os principios documentados de modularidade, baixo acoplamento, alta coesao, reutilizacao, observabilidade nativa e economia de tokens.
- A governanca documental deve priorizar a Constituicao do Marcos em caso de conflito, seguida da hierarquia institucional descrita nos documentos oficiais.
- Memoria persistente e RAG devem respeitar LGPD, menor privilegio, controle de acesso, auditoria e rastreabilidade.
- O produto deve ser preparado para operacao robusta, auditavel, observavel e orientada a evidencias.
- A futura substituicao deve preservar clareza sobre o que foi removido do legado e o que foi incorporado ao novo agente.

## Criterios de Sucesso Mensuraveis

- 100% das superficies suportadas no canal Telegram que hoje dependem explicitamente de `weather` passam a depender de `Marcos` ou sao removidas por decisao de produto documentada.
- 0 referencias funcionais ativas para `weather` permanecem acessiveis aos usuarios apos a substituicao.
- 100% das execucoes relevantes de Marcos registram trilha minima de auditoria e observabilidade definida pelo produto.
- 100% dos fluxos suportados por Marcos consultam documentacao institucional apropriada ou registram explicitamente ausencia de contexto suficiente.
- 100% das politicas de memoria persistente exigidas pelo PRD possuem criterio de aceite verificavel na futura implementacao.
- A avaliacao do agente cobre, no minimo, qualidade, eficiencia, confiabilidade, seguranca e valor para o negocio.
- 100% do escopo documental de `docs/agents/marcos/` esta contemplado na V1 como base funcional obrigatoria do agente.

## Restricoes Tecnicas de Alto Nivel

- O produto deve ser implementado obrigatoriamente sobre o ecossistema Mastra adotado no repositorio.
- A futura implementacao deve suportar persistencia de memoria, logs estruturados, correlation ID e mecanismos de avaliacao.
- O produto deve preservar separacao entre conhecimento oficial, memoria operacional e integracoes externas.
- O produto deve permitir incorporacao incremental de workflows, capabilities, operators e tools documentados para Marcos, sem exigir reescrita estrutural do ecossistema.

## Fora de Escopo

- Definicao de prompts detalhados de cada capability alem do necessario para enquadramento de produto.
- Implementacao imediata de todas as tools e operators documentadas em `docs/agents/marcos/`.
- Reorganizacao completa de outros agentes do repositorio que nao pertençam ao escopo de substituicao de `weather`.
- Publicacao de novos canais alem do Telegram como parte da substituicao inicial.

## Dependencias, Riscos e Impactos

- Dependencia da documentacao de `docs/agents/marcos/` como fonte de verdade para definicao de escopo e comportamento.
- Risco de escopo excessivo e alta complexidade inicial, porque a V1 foi definida para cobrir integralmente tudo que esta em `docs/agents/marcos/`, apesar do legado `weather` ser muito mais estreito.
- Risco de residuos do legado caso a remocao de `weather` nao cubra roteamento, testes, runtime, registros e demais referencias indiretas.
- Risco de desalinhamento se a implementacao tratar memoria como conhecimento oficial ou ignorar a hierarquia documental.
- Impacto direto na experiencia dos usuarios do Telegram, que deixarao de ter uma funcionalidade de clima e passarao a interagir com um agente executivo de negocio.

## Suposicoes e Questoes em Aberto

- Suposicao: a superficie de entrada atualmente confirmada para `weather` no repositorio e o fluxo do Telegram, incluindo o comando `/weather` e o runtime associado.
- Suposicao: nao existe PRD anterior para esta substituicao, portanto este documento inaugura o escopo do trabalho.
- Suposicao: nao ha baseline oficial de metricas de negocio definida nesta etapa; a futura implementacao podera medir operacao e qualidade sem meta de negocio inicial formalizada.
