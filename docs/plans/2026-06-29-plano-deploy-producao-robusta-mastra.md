# Plano de Deploy em Producao Robusta para Mastra

## Resumo Executivo

Este documento consolida a recomendacao final de deploy para o projeto `agents`,
considerando o codebase atual, a arquitetura existente, o uso de `Mastra`,
`Traefik` e `PostgreSQL`, e os requisitos declarados ao longo da conversa:

- foco em robustez
- foco em eficiencia
- foco em economia
- ambiente pronto para uso em producao
- sem lacunas operacionais evitaveis

A conclusao objetiva e:

- `US$0` nao atende de forma confiavel ao nivel de robustez pedido
- a melhor arquitetura para este projeto e `Traefik + Mastra + PostgreSQL` no
  mesmo `VPS Linux`
- a melhor recomendacao custo/robustez para o estado atual do projeto e um
  `DigitalOcean Droplet` pequeno
- o deploy deve reaproveitar a stack ja existente em `deployment/`

Para o volume informado de apenas `2 usuarios ativos`, essa topologia entrega a
melhor relacao entre simplicidade, previsibilidade, custo e operacao.

## Contexto Observado no Repositorio

O repositorio ja traz uma base concreta de deploy e operacao para o workspace
`agents`, o que reduz o risco de desvio arquitetural na recomendacao.

### Estrutura de runtime identificada

- Aplicacao `Mastra` no workspace `agents/`
- Proxy reverso com `Traefik`
- Persistencia principal via `PostgresStore`
- Bootstrap automatico de schemas e tabelas auxiliares
- Adapter Telegram no mesmo servidor HTTP do Mastra
- Endpoints de health e status dedicados
- Build containerizado pronto em `deployment/agents.Dockerfile`
- Orquestracao via `deployment/docker-compose.yml`

### Evidencias relevantes do codebase

- `agents/package.json`
  - `npm run dev` usa `mastra dev`
  - `npm run build` usa `mastra build --studio`
  - `npm run start` usa `mastra start`
  - o app depende de `@mastra/pg`
- `agents/src/mastra/storage.ts`
  - o storage principal e `PostgresStore`
  - o app aceita `DATABASE_URL` ou configuracao `MASTRA_PG_*`
- `agents/src/mastra/index.ts`
  - o runtime sobe `Mastra` com rotas HTTP adicionais
  - o adapter Telegram e inicializado no mesmo processo
  - ha bootstrap de schemas de auditoria, approvals, catalogo e tool registry
- `deployment/docker-compose.yml`
  - a stack atual ja define `traefik`, `agents` e `postgres`
  - o `postgres` usa volume persistente
  - o `agents` usa secrets montados por arquivo
  - o `agents` ja sobe atras do `Traefik`
- `deployment/traefik/dynamic/mastra.yml`
  - o roteamento atual protege rotas gerais com BasicAuth
  - apenas o webhook do Telegram fica publico
- `deployment/scripts/smoke-test.sh`
  - ja existe um fluxo de smoke test ponta a ponta
  - o script valida health, webhook publico e persistencia no PostgreSQL

## Requisitos e Decisoes Registradas

Ao longo da conversa, as preferencias e restricoes foram consolidadas assim:

- o PostgreSQL pode ser movido junto com a aplicacao
- a prioridade inicial era custo zero
- depois, o requisito dominante passou a ser:
  - robustez
  - eficiencia
  - economia
  - pronto para producao
  - sem gaps operacionais aceitaveis
- diante do conflito real de mercado entre `US$0` e robustez de producao, a
  decisao final foi:
  - aceitar baixo custo

Essa decisao e importante porque muda a resposta tecnica. A partir dela, a
recomendacao deixa de perseguir free tier e passa a priorizar previsibilidade.

## Conflito Objetivo Entre US$0 e Producao Sem Lacunas

Foi avaliado explicitamente se seria possivel atingir o objetivo com custo
mensal `US$0`.

A conclusao e negativa para este caso.

### Motivos

- tiers gratuitos nao oferecem o mesmo compromisso operacional de um VPS pago
- tiers gratuitos costumam impor uma ou mais destas restricoes:
  - suspensao por inatividade
  - ausencia de SLA significativo
  - recursos instaveis ou limitados
  - politicas de retomada menos previsiveis
  - suporte reduzido ou inexistente
- o projeto depende de:
  - processo HTTP sempre disponivel
  - `HTTPS` publico para webhook do Telegram
  - banco persistente
  - secrets
  - rotinas de backup e restore

Com isso, `US$0` pode ser aceitavel para experimento, laboratorio ou hobby, mas
nao para a exigencia declarada de ambiente “pronto para producao” sem lacunas
relevantes.

## Arquitetura Recomendada

### Recomendacao principal

Hospedar `Traefik + Mastra + PostgreSQL` juntos no mesmo `VPS Linux` pequeno.

### Provedor recomendado

`DigitalOcean Droplet` pequeno, como opcao default de operacao.

### Justificativa da escolha

- custo inicial baixo
- operacao simples
- suporte direto ao modelo de deploy atual do repositorio
- compatibilidade natural com:
  - Docker
  - Docker Compose
  - Traefik
  - volumes persistentes
  - PostgreSQL local
- evita latencia e dependencias desnecessarias entre app e banco
- reduz superficie de falha para um caso de uso pequeno

Para `2 usuarios ativos`, nao existe necessidade tecnica de separar proxy, app e
banco em hosts diferentes.

## Topologia Alvo

### Componentes

- `1 VPS Linux` com Ubuntu LTS
- `Traefik` exposto em `80/443`
- `agents` rodando a imagem do app Mastra
- `PostgreSQL` local no mesmo host
- volume persistente para dados
- dominio publico com `HTTPS`

### Fluxo de rede

1. O usuario acessa o dominio publico
2. O `Traefik` termina TLS
3. O `Traefik` encaminha trafego para o container `agents`
4. O app `agents` acessa o `postgres` pela rede interna do Compose
5. O Telegram chama o webhook publico em `HTTPS`

### Beneficios da topologia

- menos moving parts
- menor custo
- menor latencia entre app e banco
- backup e restore mais simples
- troubleshooting mais rapido
- onboarding operacional mais direto

## Banco de Dados

### Decisao

Mover o `PostgreSQL` para junto da aplicacao.

### Motivos

- elimina dependencia do banco externo em `member5-9.smarterasp.net`
- evita trafego de rede inter-provedor entre app e banco
- simplifica diagnostico, backup e restauracao
- reduz risco de falha por DNS, firewall, rota ou latencia entre provedores
- combina com o desenho atual do `docker-compose`

### Quando nao separar banco e app

Para este caso de uso, nao ha ganho pratico em colocar o banco em um provedor e
o app em outro. Isso so aumentaria acoplamento operacional sem necessidade.

## Traefik e HTTPS

### Decisao

Manter o `Traefik` em producao.

### Motivos

- o repositorio ja contem a configuracao base do proxy
- o projeto ja esta desenhado para operar atras do `Traefik`
- o Telegram exige endpoint publico com `HTTPS`
- a separacao entre rota publica do webhook e rotas administrativas ja existe

### Ajustes necessarios para go-live

- substituir `Host(\`mastra.localhost\`)` pelo dominio real de producao
- expor `443` alem de `80`
- configurar TLS valido para o dominio final
- preservar o webhook do Telegram como rota publica
- manter rotas administrativas protegidas

## Aplicacao Mastra

### Decisao

Publicar o app como container, reaproveitando `deployment/agents.Dockerfile`.

### Motivos

- o Dockerfile multi-stage ja esta preparado
- a imagem final ja sobe o bundle gerado em `.mastra/output/index.mjs`
- o processo ja foi modelado para ambiente containerizado

### Variaveis e configuracoes relevantes

- `PORT=4111`
- `MASTRA_HOST=0.0.0.0`
- `DATABASE_URL` ou conjunto `MASTRA_PG_*`
- `MASTRA_STORAGE_SCHEMA=agents`
- `OPENROUTER_API_KEY`
- `TELEGRAM_ENABLED`
- `TELEGRAM_PUBLIC_BASE_URL`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_WEBHOOK_PATH_KEY`
- `TELEGRAM_WEBHOOK_SECRET_TOKEN`

### Secrets

Manter o padrao atual de secrets fora do git, por arquivo ou mecanismo
equivalente seguro.

## Operacao e Hardening Minimo

### Medidas recomendadas

- `restart: unless-stopped` para os servicos principais
- healthcheck do app habilitado
- firewall abrindo apenas:
  - `22`
  - `80`
  - `443`
- PostgreSQL sem exposicao publica desnecessaria
- acesso administrativo protegido
- backup diario automatizado
- copia offsite dos backups
- restore testado periodicamente

### Observabilidade operacional minima

- validar regularmente:
  - disponibilidade de `GET /marcos/health`
  - disponibilidade de `GET /marcos/knowledge/status`
  - disponibilidade de `GET /telegram/health`
- inspecionar logs do container `agents`
- acompanhar uso de CPU, memoria e disco do VPS
- acompanhar crescimento do volume do PostgreSQL

## Backup, Restore e Recuperacao

### Decisao

Usar os scripts operacionais ja existentes como base do processo de backup e
restore.

### Fluxo recomendado

- backup logico diario do schema `agents`
- retention minima de varios pontos recentes
- copia dos dumps para local externo ao VPS
- teste de restore em base separada de tempos em tempos

### Motivo

Sem rotina de restore testada, backup sozinho nao fecha a lacuna operacional.

## Testes de Aceite para Producao

O ambiente so deve ser considerado pronto quando todos os itens abaixo estiverem
fechando:

- `docker compose up -d --build` sobe sem intervencao manual
- `GET /marcos/health` retorna `200` e `ready=true`
- `GET /marcos/knowledge/status` retorna `200`
- `GET /telegram/health` retorna estado coerente com a configuracao real
- webhook do Telegram responde em `HTTPS`
- o webhook usa `secret_token` consistente
- reinicio do VPS nao perde os dados do banco
- backup executa com sucesso
- restore recompõe o ambiente sem perda estrutural
- atualizacao da imagem do app nao quebra o webhook nem o banco

## Opcao Rejeitada: Manter US$0

### Avaliacao

Foi considerada a possibilidade de usar free tier.

### Resultado

Nao recomendada para este objetivo.

### Motivo

Robustez de producao, continuidade operacional e custo zero entram em conflito
para este tipo de stack com webhook publico e banco persistente.

## Opcao Rejeitada: App Fora e Banco no SmarterASP

### Avaliacao

Foi considerada a combinacao:

- aplicacao em um provedor
- PostgreSQL em `member5-9.smarterasp.net`

### Resultado

Nao recomendada como arquitetura principal.

### Motivos

- mais latencia
- mais pontos de falha
- maior dependencia de rede externa
- backup e troubleshooting mais complexos
- nenhum ganho real para apenas `2 usuarios ativos`

## Opcao Rejeitada: SmarterASP Shared Hosting para o App

### Avaliacao

Foi considerada a permanencia integral no ecossistema `SmarterASP`.

### Resultado

Nao recomendada para o app neste projeto.

### Motivos

- o projeto ja esta estruturado para `Docker Compose`
- o deploy recomendado exige flexibilidade de `VPS`
- o Linux VPS da `SmarterASP` parte de um custo muito acima do necessario para
  este caso

## Alternativas Secundarias

### Hetzner Cloud

Alternativa forte quando o foco for custo ainda menor do que provedores mais
populares, mantendo o modelo de VPS.

### SmarterASP Linux VPS

Alternativa apenas se houver exigencia comercial ou operacional de concentrar a
infra no mesmo fornecedor.

## Configuracao Operacional Minima

### Infra

- `1 VPS Linux`
- `1 dominio` ou subdominio publico
- `DNS` apontando para o IP do VPS
- `HTTPS` valido

### Containers

- `traefik`
- `agents`
- `postgres`

### Persistencia

- volume de dados do PostgreSQL
- diretorio seguro para secrets
- area para dumps de backup

### Runtime

- `TELEGRAM_ENABLED=true`
- `TELEGRAM_PUBLIC_BASE_URL=https://<dominio-real>`
- segredos validos para Telegram
- `OPENROUTER_API_KEY` valido

## Implementacao Recomendada no Repositorio

Para colocar a recomendacao em pratica, o caminho natural e:

1. manter `deployment/docker-compose.yml` como base de producao
2. adaptar `deployment/traefik/dynamic/mastra.yml` para o dominio real
3. revisar a exposicao de portas para producao real
4. manter `deployment/agents.Dockerfile` como imagem oficial do app
5. configurar secrets fora do versionamento
6. executar smoke test apos o deploy

## Riscos Residuais e Limites

Mesmo com a arquitetura recomendada, ainda existem limites naturais:

- um unico VPS nao e alta disponibilidade
- falha total do host afeta proxy, app e banco ao mesmo tempo
- resiliencia maior exigiria:
  - custo maior
  - backup ainda mais rigoroso
  - possivelmente banco gerenciado ou segundo host

Ainda assim, para `2 usuarios ativos`, esse e o melhor equilibrio pratico entre
robustez, economia e simplicidade de operacao.

## Recomendacao Final

Se o objetivo e producao robusta, eficiente, economica e sem lacunas
operacionais evitaveis, a escolha mais recomendada para este projeto e:

- `1 VPS Linux pequeno`
- `Traefik + Mastra + PostgreSQL` no mesmo host
- `Docker Compose`
- `HTTPS` publico
- `backup + restore testado`

Entre as opcoes avaliadas, a recomendacao default e:

- `DigitalOcean Droplet` pequeno

## Fontes

- Oracle Cloud Free Tier:
  - https://www.oracle.com/cloud/free/
- Oracle Cloud Free Tier FAQ:
  - https://www.oracle.com/cloud/free/faq/
- SmarterASP PostgreSQL:
  - https://www.smarterasp.net/postgresql_hosting
- SmarterASP Hosting Plans:
  - https://www.smarterasp.net/hosting_plans
- SmarterASP FAQ:
  - https://www.smarterasp.net/faq
- SmarterASP Linux VPS:
  - https://www.smarterasp.net/vps_linux
- DigitalOcean Droplets Pricing:
  - https://www.digitalocean.com/pricing/droplets
- DigitalOcean Droplets:
  - https://www.digitalocean.com/products/droplets
