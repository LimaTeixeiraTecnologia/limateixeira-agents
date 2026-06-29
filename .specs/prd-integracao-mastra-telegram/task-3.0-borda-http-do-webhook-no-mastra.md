# Tarefa 3.0: Borda HTTP do webhook no Mastra

<critical>Ler prd.md e techspec.md desta pasta — sua tarefa será invalidada se você pular</critical>

## Visão Geral

Expor a borda HTTP do canal Telegram no próprio serviço `agents` usando route customizada do Mastra, com validação de método, segredos, tipo de update, chat privado e política consistente de erro.

<requirements>
- Cobrir RF-01, RF-03, RF-04, RF-09, RF-10 e RF-13.
- Registrar `POST /telegram/webhook/:webhookKey` com `requiresAuth: false`.
- Expor `GET /telegram/health` para diagnóstico do adapter sem abrir a superfície inteira.
- Responder com códigos estáveis e corpo consistente para erros de validação/autorização.
</requirements>

## Subtarefas

- [ ] 3.1 Registrar as custom routes do Telegram via `registerApiRoute()`.
- [ ] 3.2 Implementar guard de segurança do webhook (`webhookKey`, secret token, `Content-Type`, tipo de update).
- [ ] 3.3 Implementar filtro de updates fora de `message`, `private chat` e `text`.
- [ ] 3.4 Implementar respostas HTTP e códigos de erro canônicos para cenários de borda.

## Detalhes de Implementação

Usar `techspec.md` e a documentação instalada do Mastra como fonte para `registerApiRoute()` e `requiresAuth: false`. Esta tarefa define a fronteira pública do canal; não mover regras de allowlist ou roteamento determinístico para dentro do agente.

## Critérios de Sucesso

- O webhook fica acessível como route customizada do Mastra sem quebrar as rotas existentes.
- Update inválido ou não suportado é tratado de forma explícita e rastreável.
- A rota de health do adapter permite verificar readiness sem expor segredos.
- O contrato HTTP fica estável o suficiente para smoke e documentação operacional.

## Skills Necessárias

<!-- MANDATÓRIO: preenchido por `create-tasks` Etapa 4.1 via descoberta agnóstica em `.agents/skills/`.
     NÃO inclua aqui skills auto-carregadas em runtime: `agent-governance`, `execute-task`, `bugfix`,
     `review`, `refactor`, nem skills `*-implementation` (linguagem, inferida pelo diff).
     Use o conteúdo único `Nenhuma além das auto-carregadas (governance + linguagem).` se a tarefa
     não exigir skill processual extra. -->

- `mastra` — A tarefa depende de `registerApiRoute()` e convenções atuais do servidor Mastra.

## Testes da Tarefa

- [ ] Testes unitários para guards de método, segredo e tipo de update
- [ ] Testes de integração/HTTP para `POST /telegram/webhook/:webhookKey` e `GET /telegram/health`

<critical>SEMPRE CRIAR E EXECUTAR TESTES DA TAREFA ANTES DE CONSIDERAR A TAREFA COMO `done`</critical>

## Arquivos Relevantes
- `agents/src/mastra/index.ts`
- `agents/src/mastra/config.ts`
- `.specs/prd-integracao-mastra-telegram/techspec.md`
