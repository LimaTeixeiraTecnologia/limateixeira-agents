# Tarefa 6.0: Deploy, Traefik e smoke operacional

<critical>Ler prd.md e techspec.md desta pasta — sua tarefa será invalidada se você pular</critical>

## Visão Geral

Ajustar a borda de deploy para expor somente o webhook do Telegram sem BasicAuth, manter o restante protegido, documentar os novos secrets e provar o fluxo com smoke operacional controlado.

<requirements>
- Cobrir RF-01, RF-09, RF-10, RF-12 e RF-13.
- Criar router específico do Traefik para `PathPrefix(/telegram/webhook/)` sem `agents-auth`.
- Manter `agents-security` e a proteção atual das demais rotas.
- Atualizar runbook e smoke para o fluxo do Telegram sem depender de Telegram real na automação local.
</requirements>

## Subtarefas

- [ ] 6.1 Ajustar `deployment/traefik/dynamic/mastra.yml` para separar webhook público das rotas autenticadas.
- [ ] 6.2 Adicionar/configurar novos secrets e variáveis do Telegram no deploy.
- [ ] 6.3 Atualizar `deployment/README.md` com onboarding, limites e pré-requisitos do webhook público HTTPS.
- [ ] 6.4 Criar ou ajustar smoke operacional com payload sintético para validar a borda configurada.

## Detalhes de Implementação

Referenciar `techspec.md` para a exigência de domínio público com HTTPS, `webhookKey`, `secret_token` e manutenção do restante da superfície atrás de BasicAuth. A automação local deve validar a configuração do adapter sem tentar registrar webhook real no Telegram.

## Critérios de Sucesso

- O path do webhook fica acessível sem BasicAuth e o restante continua protegido.
- Os novos secrets e variáveis ficam documentados e coerentes com a config do app.
- O smoke falha de forma diagnóstica quando a borda pública ou o adapter não estão prontos.
- O runbook deixa explícito que go-live depende de domínio público e `telegram_user_id` dos dois usuários.

## Skills Necessárias

<!-- MANDATÓRIO: preenchido por `create-tasks` Etapa 4.1 via descoberta agnóstica em `.agents/skills/`.
     NÃO inclua aqui skills auto-carregadas em runtime: `agent-governance`, `execute-task`, `bugfix`,
     `review`, `refactor`, nem skills `*-implementation` (linguagem, inferida pelo diff).
     Use o conteúdo único `Nenhuma além das auto-carregadas (governance + linguagem).` se a tarefa
     não exigir skill processual extra. -->

Nenhuma além das auto-carregadas (governance + linguagem).

## Testes da Tarefa

- [ ] Testes unitários
- [ ] Testes de integração/smoke da borda Traefik + adapter com payload sintético

<critical>SEMPRE CRIAR E EXECUTAR TESTES DA TAREFA ANTES DE CONSIDERAR A TAREFA COMO `done`</critical>

## Arquivos Relevantes
- `deployment/traefik/dynamic/mastra.yml`
- `deployment/docker-compose.yml`
- `deployment/README.md`
- `deployment/scripts/smoke-test.sh`
- `.specs/prd-integracao-mastra-telegram/techspec.md`
