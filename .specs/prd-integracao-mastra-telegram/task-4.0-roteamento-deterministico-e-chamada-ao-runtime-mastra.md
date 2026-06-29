# Tarefa 4.0: Roteamento determinístico e chamada ao runtime Mastra

<critical>Ler prd.md e techspec.md desta pasta — sua tarefa será invalidada se você pular</critical>

## Visão Geral

Implementar o `TelegramRouter`, a resolução do `mastra_thread_id`, o `RequestContext` do canal e a chamada controlada ao runtime Mastra, sem heurística aberta na borda.

<requirements>
- Cobrir RF-05, RF-06, RF-08 e RF-14.
- Escolher agente por regra determinística baseada em comando/contexto explícito.
- Reutilizar `mastra_thread_id` do chat ao invocar o agente.
- Não depender de handoff humano nem de classificação probabilística para decidir o destino.
</requirements>

## Subtarefas

- [ ] 4.1 Implementar mapa explícito `comando -> agentId`.
- [ ] 4.2 Construir `RequestContext` com `telegramUserId`, `telegramChatId`, `allowedPersonKey` e `channel=telegram`.
- [ ] 4.3 Invocar o agente Mastra com `threadId` persistido e prompt normalizado.
- [ ] 4.4 Implementar fallback controlado para comando desconhecido com resposta de ajuda.

## Detalhes de Implementação

Referenciar `techspec.md` para a decisão de roteamento determinístico e a documentação do Mastra para `RequestContext`. A tarefa deve preservar a responsabilidade da borda: o agente não decide qual agente executar, ele só processa a rota já resolvida.

## Critérios de Sucesso

- Mesmo input gera mesma resolução de agente enquanto o mapa de comandos não mudar.
- O contexto do chat é preservado entre mensagens do mesmo usuário.
- Comando desconhecido não dispara agente errado nem tool errada.
- O fluxo principal da v1 não depende de operação humana.

## Skills Necessárias

<!-- MANDATÓRIO: preenchido por `create-tasks` Etapa 4.1 via descoberta agnóstica em `.agents/skills/`.
     NÃO inclua aqui skills auto-carregadas em runtime: `agent-governance`, `execute-task`, `bugfix`,
     `review`, `refactor`, nem skills `*-implementation` (linguagem, inferida pelo diff).
     Use o conteúdo único `Nenhuma além das auto-carregadas (governance + linguagem).` se a tarefa
     não exigir skill processual extra. -->

- `mastra` — A tarefa usa `RequestContext`, invocação de agentes e convenções do runtime Mastra.

## Testes da Tarefa

- [ ] Testes unitários para roteamento por comando e fallback `/help`
- [ ] Testes de integração para reúso de `threadId` e chamada do agente com contexto do Telegram

<critical>SEMPRE CRIAR E EXECUTAR TESTES DA TAREFA ANTES DE CONSIDERAR A TAREFA COMO `done`</critical>

## Arquivos Relevantes
- `agents/src/mastra/index.ts`
- `agents/src/mastra/agents/`
- `agents/src/mastra/workflows/`
- `.specs/prd-integracao-mastra-telegram/techspec.md`
