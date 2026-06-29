# 04_WhatsApp.tool.md

# WHATSAPP TOOL

Versão: 1.0

Status: Documento Oficial

Classificação: Tool Corporativa

---

# OBJETIVO

Disponibilizar operações atômicas para integração com a WhatsApp Business Platform.

Esta Tool executa apenas operações técnicas.

Não interpreta contexto, não toma decisões e não aplica regras de negócio.

---

# RESPONSABILIDADES

- Enviar mensagens.
- Receber mensagens.
- Enviar mídia.
- Enviar documentos.
- Enviar templates aprovados.
- Consultar histórico.
- Marcar mensagens como lidas.
- Gerenciar contatos.
- Consultar status das mensagens.
- Receber webhooks.

---

# ENTRADAS

- Identificador do contato.
- Conteúdo da mensagem.
- Arquivos de mídia (quando aplicável).
- Template aprovado (quando aplicável).

---

# SAÍDAS

- ID da mensagem.
- Status do envio.
- Status de entrega.
- Dados recebidos via webhook.
- Mensagens de erro.

---

# PRÉ-CONDIÇÕES

- Credenciais válidas.
- Número ativo.
- Permissões concedidas.
- Template aprovado pela Meta (quando necessário).

---

# PÓS-CONDIÇÕES

- Operação registrada em log.
- Resultado retornado ao Operator.

---

# TRATAMENTO DE ERROS

- Token inválido.
- Número inexistente.
- Janela de atendimento encerrada.
- Template rejeitado.
- Limite da API.
- Falha de conexão.

Todos os erros deverão possuir estrutura padronizada.

---

# SEGURANÇA

- Nunca armazenar tokens em texto.
- Utilizar conexões seguras.
- Respeitar as políticas da Meta.
- Proteger dados pessoais dos usuários.

---

# OBSERVABILIDADE

Registrar:

- Operação.
- Data e hora.
- Tempo de resposta.
- Status.
- Código de erro.
- Consumo da API.

---

# KPIs

- Taxa de entrega.
- Taxa de sucesso.
- Latência.
- Falhas por operação.

---

# PRINCÍPIO FINAL

Esta Tool fornece apenas acesso técnico à WhatsApp Business Platform.

Toda lógica conversacional pertence aos Agents, Workflows e Operators.

---

WhatsApp Tool

Versão 1.0
