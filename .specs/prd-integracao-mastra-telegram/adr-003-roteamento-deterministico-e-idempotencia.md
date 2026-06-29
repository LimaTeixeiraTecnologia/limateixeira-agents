# Registro de Decisão Arquitetural (ADR)

## Metadados

- **Título:** Roteamento determinístico e idempotência rígida na borda Telegram
- **Data:** 2026-06-29
- **Status:** Aceita
- **Decisores:** Produto, arquitetura, implementação
- **Relacionados:** [PRD](</Users/jailtonjunior/Git/limateixeira-agents/.specs/prd-integracao-mastra-telegram/prd.md>), [Tech Spec](</Users/jailtonjunior/Git/limateixeira-agents/.specs/prd-integracao-mastra-telegram/techspec.md>)

## Contexto

O objetivo declarado é minimizar lacunas e falso positivo. O runtime Mastra deve evoluir para até 5 agentes com tools, mas a borda Telegram não pode decidir dinamicamente o destino com heurística aberta, nem reexecutar o mesmo update quando o Telegram fizer retry.

## Decisão

Adotar duas regras estruturais:

- roteamento por regras determinísticas baseadas em comando e contexto conhecido do canal;
- idempotência obrigatória por `update_id`, com registro persistente antes de qualquer chamada ao agente.

Além disso, o envio de resposta ao Telegram será feito por `sendMessage` explícito, e não por resposta inline ao webhook.

## Alternativas Consideradas

- Roteamento por intenção com LLM na borda
  - Vantagens: conversa mais livre.
  - Desvantagens: maior risco de agente errado, ferramenta errada e falso positivo.
  - Motivo da rejeição: não atende ao foco de previsibilidade.
- Responder inline ao webhook
  - Vantagens: menos uma chamada HTTP.
  - Desvantagens: menos observabilidade e menos controle sobre retry/falha.
  - Motivo da rejeição: robustez operacional inferior.
- Idempotência só em memória
  - Vantagens: implementação rápida.
  - Desvantagens: falha em restart ou múltiplas instâncias.
  - Motivo da rejeição: incompatível com confiabilidade desejada.

## Consequências

### Benefícios Esperados

- Redução drástica de dupla execução.
- Comportamento previsível ao crescer para múltiplos agentes.
- Auditoria completa de entrada e saída.

### Trade-offs e Custos

- Usuário precisa respeitar comandos suportados na v1.
- Há mais código de persistência e controle antes de chamar o agente.

### Riscos e Mitigações

- Risco: comandos não contemplados frustram o usuário.
- Impacto: queda de usabilidade.
- Estratégia de mitigação: resposta `/help` clara e expansão incremental do mapa de comandos.
- Plano de rollback: manter um único agente default por comando conhecido enquanto amplia o roteamento.

## Plano de Implementação

1. Persistir `update_id` com chave única.
2. Reutilizar `mastra_thread_id` por `telegram_chat_id`.
3. Implementar mapa explícito `comando -> agentId`.
4. Registrar outbound e status final do evento.

## Monitoramento e Validação

- Acompanhar `telegram_duplicate_updates_total`.
- Revisar taxa de comandos desconhecidos.
- Validar que um mesmo `update_id` nunca chama o agente duas vezes.

## Impacto em Documentação e Operação

- Documentar comandos suportados na v1.
- Documentar política de expansão para novos agentes.
- Atualizar smoke para cobrir retry/deduplicação.

## Revisão Futura

- Revisitar quando houver confiança operacional suficiente para adicionar roteamento híbrido ou agente concierge controlado.
