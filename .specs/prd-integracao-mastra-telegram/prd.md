<!-- spec-version: 3 -->

# PRD: Integracao Oficial entre Mastra e Telegram

## Visao Geral

Esta funcionalidade define uma integracao oficial entre o ecossistema de agentes baseado em Mastra e o canal Telegram, permitindo que usuarios iniciem e mantenham conversas com o sistema diretamente pelo aplicativo de mensagens. O objetivo e transformar o Telegram em um ponto de entrada confiavel para interacoes com agentes especializados, sem exigir que o usuario acesse uma interface proprietaria dedicada.

O valor de negocio esta em ampliar a acessibilidade do produto, reduzir friccao no primeiro contato e habilitar um canal de comunicacao amplamente adotado para casos de uso operacionais, suporte assistido e automacoes conversacionais. A feature deve respeitar o contexto operacional existente, no qual a exposicao externa passa por Traefik e a persistencia de dados do sistema utiliza PostgreSQL.

## Objetivos

- Disponibilizar um canal oficial de atendimento e interacao via Telegram para o sistema baseado em Mastra.
- Restringir o uso inicial do canal a usuarios previamente autorizados, permitindo rollout operacional controlado.
- Limitar a primeira versao a exatamente dois usuarios autorizados, para validar operacao real com escopo minimo.
- Reduzir o tempo para o usuario iniciar uma conversa produtiva com o ecossistema de agentes.
- Garantir que mensagens recebidas pelo Telegram sejam processadas de forma segura, rastreavel e coerente com os fluxos existentes do produto.
- Preservar o contexto operacional atual, tratando Traefik como restricao de exposicao/rede e PostgreSQL como base de persistencia ja adotada.
- Medir sucesso da feature por meio de adocao, confiabilidade operacional e qualidade do fluxo conversacional.

Metricas iniciais de sucesso:

- Pelo menos 25% das novas conversas externas com agentes devem ocorrer via Telegram nos primeiros 90 dias apos o lancamento.
- Pelo menos 95% das mensagens validas recebidas pelo canal devem resultar em processamento concluido ou resposta de erro controlada.
- O tempo mediano entre recebimento da mensagem valida e emissao da primeira resposta deve ser de ate 30 segundos no percentil 50.
- Menos de 1% das mensagens aceitas pelo canal devem exigir intervencao manual por falha de roteamento ou perda de contexto.

## Historias de Usuario

- Como usuario autorizado que ja utiliza Telegram no dia a dia, quero enviar mensagens para o sistema sem instalar uma nova interface, para interagir com os agentes de forma conveniente.
- Como operador de negocio responsavel pelo canal, quero que o Telegram funcione como um canal oficial e rastreavel, para ampliar o alcance do produto sem comprometer controle operacional.
- Como administrador do produto, quero que as conversas do Telegram respeitem as restricoes de seguranca, exposicao e persistencia existentes, para evitar desvios de arquitetura e risco operacional.
- Como time responsavel pelos agentes, quero que as mensagens vindas do Telegram sejam associadas a uma identidade propria do Telegram e ao contexto da conversa, para manter continuidade nas interacoes sem depender de conta interna do produto.

## Funcionalidades Core

### 1. Recepcao de mensagens do Telegram

O produto deve aceitar mensagens de texto enviadas por usuarios autorizados em um canal oficial do Telegram e reconhece-las como eventos validos de entrada. Essa capacidade e essencial para transformar o Telegram em porta de entrada real do sistema com rollout controlado.

Na primeira versao, o grupo inicial autorizado sera composto apenas por:

- Jailton Junior, contato de referencia `jailton.junior94@outlook.com` e `+55 11 98689-6322`
- Stefany Kelly Lima, contato de referencia `stefanykelly.lima@hotmail.com` e `+55 11 93011-1763`

### 2. Roteamento seguro para o ecossistema Mastra

Mensagens recebidas devem ser encaminhadas ao fluxo correto do produto, respeitando validacoes, autenticidade da origem e regras de processamento existentes. O foco aqui e garantir que o canal Telegram seja tratado como extensao oficial do sistema, e nao como integracao paralela sem governanca.

### 3. Resposta conversacional ao usuario

O sistema deve devolver respostas ao usuario pelo proprio Telegram, mantendo a expectativa de interacao bidirecional. Isso garante fechamento do ciclo conversacional no mesmo canal em que a solicitacao foi iniciada.

### 4. Persistencia e rastreabilidade de interacoes

As interacoes relevantes do canal precisam ser registradas de forma compativel com a persistencia existente, possibilitando rastreabilidade basica, analise de uso e continuidade de contexto quando aplicavel.

### 5. Controles operacionais do canal

O produto deve prever estados e comportamentos operacionais minimos, como indisponibilidade controlada, tratamento de falhas externas e visibilidade basica sobre o funcionamento do canal, sem incluir handoff humano nesta primeira versao e sem transformar o PRD em desenho tecnico.

## Requisitos Funcionais

- RF-01: O produto deve disponibilizar pelo menos um ponto oficial de contato no Telegram para recebimento de mensagens de usuarios.
- RF-02: O produto deve restringir o acesso inicial ao canal Telegram a usuarios previamente autorizados por uma allowlist operacional.
- RF-02a: A allowlist inicial da primeira versao deve conter exatamente dois usuarios: Jailton Junior (`jailton.junior94@outlook.com`, `+55 11 98689-6322`) e Stefany Kelly Lima (`stefanykelly.lima@hotmail.com`, `+55 11 93011-1763`).
- RF-03: O produto deve aceitar apenas mensagens de texto enviadas por usuarios autorizados no Telegram como entrada valida para o ecossistema de agentes.
- RF-04: O produto deve validar a origem e a integridade basica das requisicoes recebidas do Telegram antes de encaminha-las ao processamento do sistema.
- RF-05: O produto deve encaminhar cada mensagem valida recebida no Telegram para o fluxo conversacional apropriado do sistema baseado em Mastra.
- RF-06: O produto deve retornar a resposta do sistema ao usuario no proprio Telegram, preservando o modelo de interacao bidirecional no mesmo canal.
- RF-07: O produto deve registrar metadados essenciais das interacoes do Telegram em persistencia compativel com o contexto existente do sistema.
- RF-08: O produto deve manter associacao minima entre mensagens de um mesmo usuario ou conversa usando a identidade propria do Telegram, sem exigir vinculacao obrigatoria com conta interna do produto nesta versao.
- RF-09: O produto deve tratar falhas de processamento ou indisponibilidade do canal com resposta controlada ou registro operacional rastreavel, sem perda silenciosa da solicitacao.
- RF-10: O produto deve permitir que o canal Telegram opere respeitando a exposicao externa mediada por Traefik como restricao obrigatoria de ambiente.
- RF-11: O produto deve respeitar a persistencia existente em PostgreSQL como contexto oficial para armazenamento das informacoes necessarias a operacao da feature.
- RF-12: O produto deve produzir evidencias minimas para monitoramento operacional da integracao, incluindo volume de mensagens, falhas de entrega, taxa de sucesso de processamento e tempo para primeira resposta.
- RF-13: O produto deve permitir desabilitacao controlada do canal Telegram sem impactar de forma indevida outros canais ou fluxos centrais do sistema.
- RF-14: O produto nao deve depender de handoff humano, fila operacional manual ou escalonamento para concluir o fluxo principal da primeira versao.

## Experiencia do Usuario

Para o usuario final, a experiencia esperada e simples: localizar o canal oficial no Telegram, estar previamente autorizado para uso, iniciar uma conversa textual e receber respostas do sistema no mesmo contexto conversacional. O fluxo deve exigir o minimo de atrito possivel e comunicar de forma clara quando uma solicitacao nao puder ser atendida naquele momento.

Para operadores internos, a experiencia desejada e a de um canal previsivel e governado, com comportamento consistente em relacao aos demais pontos de entrada do produto. A feature nao exige interface grafica nova neste escopo, mas precisa gerar sinais suficientes para acompanhamento operacional.

## Restricoes Tecnicas de Alto Nivel

- O Telegram deve ser tratado como dependencia externa e canal oficial de entrada e saida de mensagens.
- O ambiente ja utiliza Traefik como proxy reverso, portanto a feature deve respeitar esse modelo como restricao de exposicao e conectividade externa.
- O ambiente ja utiliza PostgreSQL como persistencia, portanto a feature deve considerar esse contexto como base de armazenamento existente.
- O ecossistema conversacional existente e baseado em Mastra com agentes especializados; a integracao deve se encaixar nesse modelo sem redefinir a arquitetura do produto neste PRD.
- A feature deve considerar autenticidade da origem, rastreabilidade basica das interacoes e tratamento seguro de dados trocados pelo canal.
- A primeira versao deve operar com identidade propria do Telegram e nao exige autenticacao de conta interna nem vinculacao obrigatoria entre identidades.
- A primeira versao deve considerar como publico operacional inicial apenas dois usuarios nomeados na allowlist, usando seus contatos de referencia apenas para governanca do acesso.
- O PRD nao define detalhes de implementacao como SDKs, webhooks, configuracoes de proxy, schemas, filas ou desenho de runtime; esses itens pertencem a uma futura especificacao tecnica.

## Fora de Escopo

- Criacao de uma estrategia multicanal completa envolvendo WhatsApp, Slack, e-mail ou outros canais alem do Telegram.
- Redesenho da arquitetura de agentes, dos fluxos internos do Mastra ou do modelo de dados geral do produto.
- Definicao detalhada de infraestrutura, configuracao do Traefik, topologia de rede, segredos, certificados ou pipeline de deploy.
- Suporte a imagens, audio, arquivos, video ou outros tipos de mensagem alem de texto.
- Abertura publica do canal para qualquer usuario do Telegram sem controle por allowlist.
- Vinculacao obrigatoria entre identidade do Telegram e conta interna do produto.
- Implementacao de handoff humano, fila manual de atendimento ou escalonamento operacional nesta primeira versao.
- Implementacao de recursos avancados especificos do Telegram, como menus complexos, pagamentos, mini apps ou experiencias ricas, salvo se forem adicionados em um PRD futuro.
- Politicas detalhadas de retencao de dados, LGPD, moderacao, antiabuso ou onboarding juridico, que dependem de direcionamento adicional do produto e compliance.
- Construir painel administrativo dedicado para operacao do canal nesta primeira versao.

## Suposicoes e Questoes em Aberto

- Supoe-se que o objetivo principal da feature permanece abrir um canal oficial de conversa com agentes, e nao um canal de notificacoes unidirecionais.
- Nao foram definidos neste PRD requisitos formais de compliance juridico, retencao legal ou fluxo de exclusao de dados alem da necessidade de rastreabilidade basica.
- Nao foi definido neste PRD o processo operacional de inclusao, remocao, revisao periodica ou substituicao dos dois usuarios iniciais da allowlist.
