# Analise de Codebase, Deploy e Cloud com Custo Minimo

Data de referencia da analise: `2026-07-01`.

## 1. Resumo executivo

- Cadastre-se agora na **Hetzner Cloud**.
- Essa e a melhor escolha para 2 usuarios porque o codebase pede um deploy
  simples em um unico host com Docker Compose, Traefik e PostgreSQL, e a
  Hetzner hoje entrega isso com custo menor que PaaS e com melhor relacao
  memoria/preco que a entrada realista de DigitalOcean e Linode.

## 2. Evidencias do codebase

- `deployment/docker-compose.yml`
  - define exatamente tres servicos: `traefik`, `agents` e `postgres`
  - indica topologia de host unico, rede interna de containers e volume nomeado
    para persistencia do banco
  - mostra que o app espera PostgreSQL self-hosted no mesmo ambiente e nao banco
    gerenciado por default
- `deployment/agents.Dockerfile`
  - prova que o runtime ja esta preparado para imagem containerizada multi-stage
  - copia `docs/agents/marcos` para dentro da imagem, logo o deploy nao depende
    de object storage externo para subir
- `deployment/traefik/traefik.yml`
  - mostra proxy reverso simples via file provider, sem dependencia de socket do
    Docker nem de load balancer gerenciado
- `deployment/traefik/dynamic/mastra.yml`
  - deixa claro que so o webhook do Telegram fica publico
  - o restante da superficie fica atras de BasicAuth, o que favorece deploy em
    VPS simples com reverse proxy padrao
- `deployment/README.md`
  - descreve operacao local com `make deploy-up`, smoke test, backup e restore
  - registra explicitamente que o go-live real exige dominio publico com HTTPS e
    provisao dos `telegram_user_id` reais dos 2 usuarios iniciais
- `deployment/scripts/smoke-test.sh`
  - valida health, webhook publico e persistencia do evento no PostgreSQL
  - prova que o repositorio ja assume verificacao operacional ponta a ponta sem
    servicos cloud proprietarios
- `deployment/scripts/backup.sh` e `deployment/scripts/restore.sh`
  - provam que o modelo operacional esperado e banco local em Postgres com
    backup logico e restore manual, sem dependencia de managed database
- `deployment/.env.example`
  - mostra que o ambiente minimo so precisa de host, portas, PostgreSQL e
    configuracao Telegram
- `agents/package.json`
  - confirma runtime Node 22, build Mastra, testes Vitest e `npm run check`
  - nao ha indicio de Kubernetes, serverless ou pipeline de deploy amarrado a
    cloud especifica
- `agents/src/mastra/storage.ts`
  - storage principal e `PostgresStore` de `@mastra/pg`
  - aceita `DATABASE_URL` ou variaveis `MASTRA_PG_*`, o que facilita migracao
    entre VPS e banco gerenciado no futuro
- `agents/src/mastra/index.ts`
  - sobe Mastra, adapter Telegram, schemas de auditoria, approvals, tool
    registry e catalogo de knowledge no mesmo processo
  - reforca que a arquitetura real e um processo Node unico apoiado por
    PostgreSQL
- `agents/src/mastra/marcos-health.ts`
  - o health falha com `503` quando faltam schema, allowlist, dominio HTTPS ou
    prerequisitos do Telegram
  - isso mostra que a producao minima precisa de endpoint HTTPS publico, mas nao
    pede servicos cloud avancados
- `agents/src/mastra/config.ts`
  - segredos podem vir de env ou de arquivos `_FILE`, compativel com Docker
    secrets e facil de portar entre provedores
- `agents/src/telegram/service.ts`
  - confirma idempotencia por update, allowlist, webhook secreto e dependencia
    de dominio publico HTTPS
- `agents/src/telegram/constants.ts`
  - explicita que o cenario inicial e de exatamente 2 usuarios aprovados

## 3. Arquitetura atual inferida

Arquitetura atual inferida:

- 1 processo Node/Mastra containerizado
- 1 PostgreSQL persistente
- 1 Traefik como proxy reverso e gate HTTP
- 1 webhook Telegram publico
- secrets locais por arquivo
- backup e restore por script shell

Componentes obrigatorios:

- app `agents`
- PostgreSQL
- Traefik ou proxy equivalente com HTTPS
- dominio publico
- storage persistente em disco
- segredos de OpenRouter e Telegram

Componentes opcionais:

- Mastra Platform exporter, porque no codigo ele so envia eventos se houver
  token correspondente
- qualquer servico externo de observabilidade
- banco gerenciado
- object storage

Suspeitas de sobrecusto para este momento:

- separar app, proxy e banco em hosts diferentes
- managed database desde o dia 1
- PaaS para app mais banco gerenciado em paralelo
- Kubernetes, ECS, Nomad ou cluster multi-node
- CDN, fila dedicada, cache dedicado ou observabilidade paga desde o inicio

## 4. Requisitos reais para producao minima

Obrigatorio para 2 usuarios:

- 1 VPS Linux
- Docker Engine + Docker Compose
- 1 IP publico IPv4
- 1 dominio apontando para o host
- HTTPS valido no proxy
- Traefik
- app `agents`
- PostgreSQL com volume persistente
- secrets fora do git
- backup diario do schema `agents`
- smoke test apos subir
- provisao dos 2 `telegram_user_id` reais

Excesso para o momento atual:

- banco gerenciado
- auto-scaling
- multi-AZ
- load balancer dedicado
- cluster de containers
- separacao de banco em host proprio
- monitoramento comercial pago
- WAF separado

## 5. Analise de portabilidade e lock-in

Lock-in atual ou potencial:

- dependencia funcional de Telegram para o canal
- dependencia de OpenRouter para a chave de modelo em runtime
- dependencia parcial de Mastra no nivel da aplicacao, nao no nivel da cloud

O que facilita migracao futura:

- Dockerfile pronto
- Docker Compose como orquestracao inicial
- Traefik padrao
- PostgreSQL portavel
- secrets por arquivo ou env
- ausencia de servicos gerenciados obrigatorios da cloud
- backup e restore shell do banco
- health e smoke test locais

O que deve ser evitado desde o inicio:

- migrar para PaaS com componentes proprietarios sem necessidade
- usar banco gerenciado so por conforto inicial
- espalhar storage e banco entre provedores diferentes
- depender de add-ons exclusivos de uma cloud quando o stack atual ja e
  portavel

## 6. Recomendacao final de cloud provider

Recomendacao principal: **Hetzner Cloud**.

Tipo de oferta ideal: **1 VPS simples de entrada, com Docker Compose, Traefik,
app `agents` e PostgreSQL no mesmo host**.

Justificativa:

- o codebase ja esta moldado para essa topologia
- o stack atual pede mais RAM previsivel do que servicos gerenciados
- a VPS unica elimina custo duplo de app + banco
- a cloud nao precisa oferecer nada alem de compute, disco e IP publico
- a Hetzner hoje continua competitiva em preco para VPS simples
- a portabilidade continua alta porque o deploy fica em Docker + PostgreSQL +
  Traefik

Base atual de comparacao de oferta oficial:

- Hetzner publicou ajuste em `2026-06-15`; no material oficial, `CX23` aparece
  a **US$ 6.49/mes** excluindo IPv4, e `CAX11` a **US$ 6.99/mes** excluindo
  IPv4
  - fonte: https://docs.hetzner.com/general/infrastructure-and-availability/price-adjustment/
- a Hetzner cobra **US$ 0.60/mes** por Primary IPv4
  - fonte: https://docs.hetzner.com/cloud/servers/primary-ips/overview/
- a pagina de produto da Hetzner posiciona o plano regular como apropriado para
  web applications, small databases e low to medium CPU usage
  - fonte: https://www.hetzner.com/cloud/regular-performance

Quando essa recomendacao deixa de ser a melhor:

- quando voce precisar de operacao quase totalmente gerenciada e aceitar pagar
  bem mais por isso
- quando a exigencia passar a ser alta disponibilidade nativa multi-node
- quando compliance, regiao ou politica interna exigirem outro provedor
- quando o app crescer a ponto de separar banco e app trazer ganho operacional
  real

## 7. Alternativas ranqueadas

1. **DigitalOcean Droplet**
   - perde por custo total realista pior para esse stack
   - a pagina oficial mostra `US$ 6.00` para 1 GiB / 1 vCPU / 25 GiB, mas esse
     tamanho e apertado para `Traefik + app + PostgreSQL` no mesmo host
   - a opcao mais realista para este repositorio tende a ser 2 GiB por
     `US$ 12.00/mes`
   - fonte: https://www.digitalocean.com/pricing/droplets
2. **Linode Shared CPU**
   - perde porque o ponto de entrada oficial citado e `US$ 5.00` com 1 vCPU e
     1 GB, novamente um degrau de memoria apertado para este stack co-localizado
   - continua sendo alternativa valida se voce valorizar mais ecossistema e
     documentacao do que densidade de recurso por dolar
   - fonte: https://techdocs.akamai.com/cloud-computing/docs/shared-cpu-compute-instances
3. **DigitalOcean App Platform + banco separado**
   - perde porque encarece cedo e desalinha do desenho atual do repositorio
   - so o app parte de `US$ 10.00` a `US$ 12.00/mes`; PostgreSQL gerenciado da
     propria DigitalOcean parte de cerca de `US$ 15.15/mes`
   - isso compra conveniencia, mas quebra a meta de custo minimo realista para
     2 usuarios
   - fontes:
     - https://docs.digitalocean.com/products/app-platform/details/pricing/
     - https://www.digitalocean.com/pricing/managed-databases

## 8. Estrategia de deploy mais economica e segura

Desenho recomendado:

- 1 VPS Linux
- Traefik na frente
- container `agents`
- container `postgres`
- volume local persistente para o banco
- secrets montados por arquivo
- dominio com HTTPS

O que deve ficar no mesmo host agora:

- Traefik
- app `agents`
- PostgreSQL
- rotinas de backup local

O que nao precisa ser separado ainda:

- banco de dados
- proxy
- observabilidade
- storage de documentos
- ambiente de worker

Coerencia com o codebase:

- ja existe `deployment/docker-compose.yml`
- ja existe `deployment/agents.Dockerfile`
- ja existe roteamento Traefik pronto
- ja existem scripts de backup, restore e smoke

## 9. Passo a passo obrigatorio

1. Criar conta na Hetzner Cloud.
2. Provisionar 1 VPS Linux pequeno com IPv4 publico.
3. Apontar um dominio para esse IP.
4. Instalar Docker Engine e Docker Compose no host.
5. Copiar o repositorio e manter o diretorio `deployment/` como base de verdade
   operacional.
6. Gerar os secrets locais usando o fluxo esperado pelo repositorio.
7. Preencher `deployment/.env` com dominio publico HTTPS e flags do Telegram.
8. Ajustar o host do Traefik para o dominio real e habilitar TLS valido no
   ambiente final.
9. Subir a stack pelo Compose.
10. Executar o smoke test do repositorio para validar app, proxy, webhook e
    persistencia.
11. Provisionar os `telegram_user_id` reais dos 2 usuarios iniciais.
12. Confirmar que o health deixa de expor blockers de go-live.
13. Configurar backup diario do schema `agents`.
14. Copiar os dumps para fora do host em rotina simples.
15. Registrar restore testado pelo menos uma vez antes de depender do ambiente.

Melhores praticas realmente alinhadas a economia e eficiencia:

- manter tudo em um host enquanto o uso real continuar baixo
- nao contratar banco gerenciado no inicio
- nao criar cluster
- manter so portas `80/443` publicas e banco apenas na rede interna
- tratar `deployment/` como fonte de verdade e evitar reescrever a arquitetura
  sem necessidade

## 10. Custos estimados

Faixa mensal inicial mais provavel:

- **aprox. US$ 8 a US$ 12/mes** se seguir a recomendacao principal com 1 VPS,
  IPv4 e dominio amortizado

Custos obrigatorios:

- VPS Hetzner de entrada
  - referencia oficial recente: `CX23` a `US$ 6.49/mes` excl IPv4 ou `CAX11` a
    `US$ 6.99/mes` excl IPv4
- Primary IPv4 Hetzner
  - `US$ 0.60/mes`
- dominio
  - normalmente baixo e anual; na pratica, costuma adicionar algo perto de
    `US$ 1 a US$ 2/mes` quando amortizado

Custos opcionais:

- armazenamento externo barato para copia dos dumps
- monitoramento pago
- banco gerenciado no futuro
- ambiente de staging separado

O que pode ficar para depois:

- observabilidade paga
- banco gerenciado
- segundo host
- hardening mais caro de rede
- HA real

## 11. Riscos, limites e pontos de atencao

Riscos operacionais:

- host unico e um ponto unico de falha
- banco no mesmo host exige disciplina de backup e restore
- health do Telegram vai continuar bloqueando go-live enquanto os 2 usuarios
  reais nao forem provisionados

Riscos tecnicos:

- 1 GB de RAM tende a ser agressivo demais para esse stack; buscar custo minimo
  absoluto pode gerar instabilidade
- esquecer TLS valido quebra o webhook do Telegram
- expor o banco publicamente contraria o desenho atual

Riscos financeiros:

- entrar em PaaS + banco gerenciado cedo demais eleva custo sem necessidade
- misturar provedores para app e banco aumenta retrabalho operacional

O que pode quebrar a premissa de baixo custo ou migracao facil:

- adotar servicos proprietarios cedo
- separar banco da aplicacao antes de existir carga para isso
- depender de features de cloud especifica fora de Docker, Postgres e proxy
- ignorar rotina de backup e depois precisar escalar via incidentes

## 12. Decisao final sem ambiguidade

`Cadastre-se em: Hetzner Cloud`
`Modelo inicial: 1 VPS Linux unica com Traefik + agents + PostgreSQL via Docker Compose`
`Evite agora: PaaS, banco gerenciado, cluster multi-node e separacao prematura de componentes para apenas 2 usuarios`
