import { Hono } from 'hono';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  TELEGRAM_LEGACY_WEATHER_TEXT,
  TELEGRAM_OFFICIAL_AGENT_ID,
} from './constants';
import { TELEGRAM_HEALTH_PATH, TELEGRAM_WEBHOOK_PATH } from './constants';
import { DeterministicTelegramRouter } from './router';
import { TelegramService } from './service';
import { AdapterError } from './types';
import type {
  TelegramAgentExecutionInput,
  TelegramHealthReport,
  TelegramOutboundMessage,
  TelegramSendResult,
  TelegramStoreDependencies,
} from './types';

function createService() {
  const store: TelegramStoreDependencies = {
    resolveActiveUser: vi.fn(async (userId: bigint) =>
      userId === 999n
        ? {
            personKey: 'jailton-junior',
            displayName: 'Jailton Junior',
            referenceEmail: 'jailton.junior94@outlook.com',
            referencePhone: '+55 11 98689-6322',
            telegramUserId: 999n,
            telegramUsername: 'jailton',
            status: 'active' as const,
          }
        : null,
    ),
    registerIncoming: vi.fn(async (update: { updateId: bigint }) =>
      update.updateId === 1n ? 'duplicate' : 'new',
    ),
    markIgnored: vi.fn(async () => undefined),
    markProcessed: vi.fn(async () => undefined),
    markFailed: vi.fn(async () => undefined),
    getCurrentAgentId: vi.fn(async () => null),
    getOrCreateThread: vi.fn(async () => ({ mastraThreadId: 'thread-1' })),
    recordOutboundSent: vi.fn(async () => undefined),
    recordOutboundFailed: vi.fn(async () => undefined),
    getHealthReport: vi.fn(
      async (): Promise<TelegramHealthReport['allowlist']> => ({
        total: 2,
        active: 0,
        pendingLink: 2,
        disabled: 0,
      }),
    ),
  };

  const outboundClient = {
    sendText: vi.fn(
      async (_input: TelegramOutboundMessage): Promise<TelegramSendResult> => ({
        telegramMessageId: 77n,
      }),
    ),
  };

  const agentRuntime = {
    generateResponse: vi.fn(
      async (
        input: TelegramAgentExecutionInput,
      ) => ({
        approvalStatus: 'not_required' as const,
        capabilityIds: ['09-product-discovery-capability'],
        correlationId:
          (input.requestContext.get('correlationId') as string | undefined) ?? 'missing',
        knowledgeDocumentIds: ['00-system-prompt'],
        text: `agent:${input.agentId}:${input.normalizedPrompt}`,
        tokenUsage: 123,
        toolIds: [],
        workflowId: 'telegram-marcos-runtime',
      }),
    ),
  };

  const service = new TelegramService({
    config: {
      enabled: true,
      botToken: 'bot-token',
      webhookPathKey: 'path-key',
      webhookSecretToken: 'secret-token',
      allowedUpdates: ['message'],
      publicBaseUrl: 'https://telegram.example.com',
    },
    store,
    router: new DeterministicTelegramRouter(),
    outboundClient,
    agentRuntime,
    ensureSchema: vi.fn(async () => undefined),
    checkSchemaReady: vi.fn(async () => true),
  });

  return { service, store, outboundClient, agentRuntime };
}

function createApp(service: TelegramService): Hono {
  const app = new Hono();
  app.post(TELEGRAM_WEBHOOK_PATH, async c => service.handleWebhook(c as never));
  app.get(TELEGRAM_HEALTH_PATH, async c => service.handleHealth(c as never));
  return app;
}

describe('telegram service', () => {
  let service: TelegramService;
  let store: ReturnType<typeof createService>['store'];
  let agentRuntime: ReturnType<typeof createService>['agentRuntime'];

  beforeEach(() => {
    ({ service, store, agentRuntime } = createService());
  });

  it('ignora duplicatas sem segunda execução observável', async () => {
    const app = createApp(service);
    const response = await app.request('/telegram/webhook/path-key', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-telegram-bot-api-secret-token': 'secret-token',
      },
      body: JSON.stringify({
        update_id: 1,
        message: {
          message_id: 1,
          from: { id: 999, username: 'jailton' },
          chat: { id: 200, type: 'private' },
          text: 'Quero ajuda para priorizar o dia',
        },
      }),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'duplicate' });
    expect(agentRuntime.generateResponse).not.toHaveBeenCalled();
  });

  it('nega usuário fora da allowlist com rastreabilidade', async () => {
    const app = createApp(service);
    const response = await app.request('/telegram/webhook/path-key', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-telegram-bot-api-secret-token': 'secret-token',
      },
      body: JSON.stringify({
        update_id: 2,
        message: {
          message_id: 1,
          from: { id: 123, username: 'intruso' },
          chat: { id: 200, type: 'private' },
          text: 'Quero ajuda para priorizar o dia',
        },
      }),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      status: 'ignored',
      reason: 'telegram_user_not_allowed',
    });
    expect(store.markIgnored).toHaveBeenCalledWith(2n, 'telegram_user_not_allowed');
  });

  it('processa caminho feliz local com marcos-agent e outbound', async () => {
    const app = createApp(service);
    const response = await app.request('/telegram/webhook/path-key', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-telegram-bot-api-secret-token': 'secret-token',
      },
      body: JSON.stringify({
        update_id: 3,
        message: {
          message_id: 1,
          from: { id: 999, username: 'jailton' },
          chat: { id: 200, type: 'private' },
          text: 'Quero ajuda para priorizar o dia',
        },
      }),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'processed' });
    expect(agentRuntime.generateResponse).toHaveBeenCalledWith(
      expect.objectContaining({
        agentId: TELEGRAM_OFFICIAL_AGENT_ID,
        normalizedPrompt: 'Quero ajuda para priorizar o dia',
        requestContext: expect.objectContaining({
          get: expect.any(Function),
        }),
      }),
    );
  });

  it('responde /help via outbound sem disparar agente', async () => {
    const app = createApp(service);
    const response = await app.request('/telegram/webhook/path-key', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-telegram-bot-api-secret-token': 'secret-token',
      },
      body: JSON.stringify({
        update_id: 4,
        message: {
          message_id: 1,
          from: { id: 999, username: 'jailton' },
          chat: { id: 200, type: 'private' },
          text: '/help',
        },
      }),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'processed' });
    expect(agentRuntime.generateResponse).not.toHaveBeenCalled();
    expect(store.recordOutboundSent).toHaveBeenCalled();
  });

  it('marca evento e outbound como failed sem devolver 500 após registrar o update', async () => {
    const failing = createService();
    failing.outboundClient.sendText = vi.fn(async () => {
      throw new AdapterError(
        'telegram_outbound_failed',
        'falha de envio',
        { statusCode: 502, expose: false },
      );
    });
    const app = createApp(failing.service);

    const response = await app.request('/telegram/webhook/path-key', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-telegram-bot-api-secret-token': 'secret-token',
      },
      body: JSON.stringify({
        update_id: 5,
        message: {
          message_id: 1,
          from: { id: 999, username: 'jailton' },
          chat: { id: 200, type: 'private' },
          text: 'Quero ajuda para priorizar o dia',
        },
      }),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      status: 'failed',
      reason: 'telegram_outbound_failed',
    });
    expect(failing.store.markFailed).toHaveBeenCalledWith(
      5n,
      expect.objectContaining({ code: 'telegram_outbound_failed' }),
    );
    expect(failing.store.recordOutboundFailed).toHaveBeenCalledWith(
      expect.objectContaining({
        updateId: 5n,
        errorCode: 'telegram_outbound_failed',
      }),
    );
  });

  it('responde comando legado /weather sem executar runtime de agent', async () => {
    const app = createApp(service);
    const response = await app.request('/telegram/webhook/path-key', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-telegram-bot-api-secret-token': 'secret-token',
      },
      body: JSON.stringify({
        update_id: 6,
        message: {
          message_id: 1,
          from: { id: 999, username: 'jailton' },
          chat: { id: 200, type: 'private' },
          text: '/weather recife',
        },
      }),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'processed' });
    expect(agentRuntime.generateResponse).not.toHaveBeenCalled();
    expect(store.recordOutboundSent).toHaveBeenCalledWith(
      expect.objectContaining({
        updateId: 6n,
        responseText: TELEGRAM_LEGACY_WEATHER_TEXT,
      }),
    );
  });

  it('expõe health com bloqueio explícito de go-live', async () => {
    const app = createApp(service);
    const response = await app.request('/telegram/health');
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(payload.blockers).toContain(
      'telegram_user_id real dos dois usuários iniciais ainda não provisionado',
    );
  });
});
