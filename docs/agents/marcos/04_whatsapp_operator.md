# 04_WhatsApp.operator.md

# WHATSAPP OPERATOR

Versão: 1.0

Status: Documento Oficial

Classificação: Operator Corporativo

---

# OBJETIVO

Orquestrar a operação do WhatsApp Business Platform, garantindo envio, recebimento, roteamento e registro de mensagens com segurança, continuidade de contexto e alinhamento às regras do MeControla.

Este Operator é responsável pela ponte operacional entre usuários, agentes, Workflows e Tools.

---

# RESPONSABILIDADES

- Receber mensagens via webhook.
- Enviar mensagens.
- Enviar templates aprovados.
- Validar janela de atendimento.
- Roteirizar conversas.
- Encaminhar interações para Agents ou Workflows.
- Registrar histórico de mensagens.
- Consultar dados do usuário.
- Controlar contexto de sessão.
- Tratar erros operacionais.
- Retornar status aos Workflows.

---

# DEPENDÊNCIAS

## Tools

- WhatsApp Tool
- PostgreSQL Tool
- Kiwify Tool
- LLM Tool

## Capabilities

- UX Conversation
- Copywriting
- Analytics & Insights
- Product Discovery

---

# ENTRADAS

- Mensagem recebida.
- Identificador do usuário.
- Status da sessão.
- Evento de webhook.
- Template autorizado.
- Contexto conversacional.
- Workflow de origem.

---

# SAÍDAS

- Mensagem enviada.
- Sessão atualizada.
- Histórico registrado.
- Evento processado.
- Erro estruturado.
- Status da operação.

---

# REGRAS DE VALIDAÇÃO

Antes de enviar qualquer mensagem validar:

- Usuário identificado.
- Janela de atendimento ativa ou template aprovado.
- Mensagem compatível com políticas da Meta.
- Contexto suficiente.
- Canal autorizado.
- Workflow válido.

Caso qualquer validação falhe, interromper a execução e retornar erro estruturado.

---

# FLUXO DE RECEBIMENTO

1. Receber evento via webhook.
2. Validar origem.
3. Identificar usuário.
4. Registrar mensagem.
5. Recuperar contexto.
6. Encaminhar para Agent ou Workflow adequado.
7. Registrar decisão.
8. Retornar status.

---

# FLUXO DE ENVIO

1. Receber solicitação de envio.
2. Validar janela ou template.
3. Validar conteúdo.
4. Acionar WhatsApp Tool.
5. Registrar envio.
6. Atualizar contexto.
7. Retornar status.

---

# GESTÃO DE CONTEXTO

O contexto da conversa deverá ser curto, objetivo e suficiente para continuidade.

Não armazenar excesso de informações em sessão.

Conhecimento permanente deverá estar no banco ou na documentação oficial.

---

# INTEGRAÇÃO COM KIWIIFY

Quando aplicável, este Operator poderá consultar status de pagamento, assinatura, cancelamento ou inadimplência através da Kiwify Tool.

Não deve aplicar regras comerciais sozinho.

Apenas encaminhar os dados ao Workflow responsável.

---

# TRATAMENTO DE ERROS

Em caso de erro:

1. Classificar o tipo de falha.
2. Verificar se é retryable.
3. Executar retry quando permitido.
4. Registrar o erro.
5. Retornar resposta estruturada.
6. Escalar para revisão humana quando necessário.

---

# POLÍTICAS

Respeitar obrigatoriamente:

- Políticas do WhatsApp Business Platform.
- Políticas da Meta.
- LGPD.
- Documentação oficial do MeControla.
- Regras de onboarding e atendimento.

---

# LIMITES DE AUTONOMIA

Este Operator não pode:

- Criar mensagens fora dos Workflows autorizados.
- Ignorar janela de atendimento.
- Enviar templates não aprovados.
- Alterar regras de negócio.
- Acessar dados sem necessidade operacional.
- Tomar decisões financeiras ou comerciais.

---

# OBSERVABILIDADE

Registrar:

- Evento recebido.
- Mensagem enviada.
- Usuário.
- Workflow.
- Agent envolvido.
- Tempo de execução.
- Status.
- Erros.
- Correlation ID.

---

# KPIs

- Taxa de entrega.
- Taxa de resposta.
- Latência.
- Falhas por operação.
- Tempo médio de atendimento.
- Taxa de roteamento correto.
- Eventos processados com sucesso.

---

# PRINCÍPIO FINAL

O WhatsApp Operator é o guardião operacional do principal canal de relacionamento do MeControla.

Ele garante que cada interação seja segura, rastreável, contextualizada e corretamente encaminhada dentro do ecossistema de agentes virtuais.

---

WhatsApp Operator

Versão 1.0
