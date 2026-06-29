import { RequestContext } from '@mastra/core/request-context';
import { mastraLogger } from '../logger';
import { parseTelegramUpdate, toInboundMessage } from './schema';
import { TELEGRAM_SECRET_HEADER } from './constants';
import type {
  AdapterError,
  TelegramConfig,
  TelegramHealthReport,
  TelegramRouteResult,
  TelegramStoreDependencies,
} from './types';
import { AdapterError as TelegramAdapterError } from './types';
import type { TelegramAgentRuntime } from './agent-runtime';
import type { TelegramRouter, TelegramOutboundClient } from './types';

type ServiceDeps = {
  config: TelegramConfig;
  store: TelegramStoreDependencies;
  router: TelegramRouter;
  outboundClient: TelegramOutboundClient;
  agentRuntime: TelegramAgentRuntime;
  ensureSchema: () => Promise<void>;
  checkSchemaReady: () => Promise<boolean>;
};

function isJsonContentType(value: string | undefined): boolean {
  return value?.toLowerCase().includes('application/json') ?? false;
}

function errorResponseBody(error: AdapterError): { error: { code: string; message: string } } {
  return {
    error: {
      code: error.code,
      message: error.expose ? error.message : 'erro interno do adapter telegram',
    },
  };
}

export class TelegramService {
  constructor(private readonly deps: ServiceDeps) {}

  private assertWebhookGuards(c: any): void {
    const webhookKey = c.req.param('webhookKey');
    const secretHeader = c.req.header(TELEGRAM_SECRET_HEADER);
    const contentType = c.req.header('content-type');

    if (!isJsonContentType(contentType)) {
      throw new TelegramAdapterError(
        'telegram_invalid_content_type',
        'content-type do webhook telegram é incompatível',
        { statusCode: 415, expose: true },
      );
    }

    if (webhookKey !== this.deps.config.webhookPathKey) {
      throw new TelegramAdapterError(
        'telegram_invalid_secret',
        'webhookKey do telegram inválido',
        { statusCode: 401, expose: true },
      );
    }

    if (secretHeader !== this.deps.config.webhookSecretToken) {
      throw new TelegramAdapterError(
        'telegram_invalid_secret',
        'secret token do telegram inválido',
        { statusCode: 401, expose: true },
      );
    }
  }

  private buildRequestContext(input: {
    telegramUserId: bigint;
    telegramChatId: bigint;
    allowedPersonKey: string;
  }): RequestContext {
    const requestContext = new RequestContext();
    requestContext.set('channel', 'telegram');
    requestContext.set('telegramUserId', input.telegramUserId.toString());
    requestContext.set('telegramChatId', input.telegramChatId.toString());
    requestContext.set('allowedPersonKey', input.allowedPersonKey);
    return requestContext;
  }

  private async resolveRouteResult(input: {
    routeResult: TelegramRouteResult;
    envelope: ReturnType<typeof parseTelegramUpdate>;
    allowedPersonKey: string;
    currentAgentId: string | null;
  }): Promise<{ responseText: string; agentId: string | null; threadId: string | null }> {
    if (input.routeResult.kind === 'help') {
      const thread = await this.deps.store.getOrCreateThread({
        telegramChatId: input.envelope.telegramChatId,
        telegramUserId: input.envelope.telegramUserId,
        currentAgentId: input.currentAgentId ?? 'telegram-help',
      });

      return {
        responseText: input.routeResult.message,
        agentId: null,
        threadId: thread.mastraThreadId,
      };
    }

    const thread = await this.deps.store.getOrCreateThread({
      telegramChatId: input.envelope.telegramChatId,
      telegramUserId: input.envelope.telegramUserId,
      currentAgentId: input.routeResult.agentId,
    });

    const requestContext = this.buildRequestContext({
      telegramUserId: input.envelope.telegramUserId,
      telegramChatId: input.envelope.telegramChatId,
      allowedPersonKey: input.allowedPersonKey,
    });

    const result = await this.deps.agentRuntime.generateResponse({
      agentId: input.routeResult.agentId,
      normalizedPrompt: input.routeResult.normalizedPrompt,
      threadId: thread.mastraThreadId,
      resourceId: `telegram:${input.envelope.telegramUserId.toString()}`,
      requestContext,
    });

    return {
      responseText: result.text,
      agentId: input.routeResult.agentId,
      threadId: thread.mastraThreadId,
    };
  }

  async handleWebhook(c: any): Promise<Response> {
    const startedAt = Date.now();
    let updateId: bigint | null = null;
    let failedOutbound:
      | {
          telegramChatId: bigint;
          mastraThreadId: string;
          responseText: string;
        }
      | null = null;

    try {
      await this.deps.ensureSchema();
      this.assertWebhookGuards(c);

      const payload = await c.req.json();
      const envelope = parseTelegramUpdate(payload);
      updateId = envelope.updateId;

      const dedupe = await this.deps.store.registerIncoming(envelope);
      if (dedupe === 'duplicate') {
        return c.json({ status: 'duplicate' }, 200);
      }

      if (!this.deps.config.enabled) {
        await this.deps.store.markIgnored(envelope.updateId, 'telegram_channel_disabled');
        return c.json({ status: 'ignored', reason: 'telegram_channel_disabled' }, 200);
      }

      if (envelope.updateType !== 'message') {
        await this.deps.store.markIgnored(envelope.updateId, 'telegram_unsupported_update');
        return c.json({ status: 'ignored', reason: 'telegram_unsupported_update' }, 200);
      }

      const allowedUser = await this.deps.store.resolveActiveUser(envelope.telegramUserId);
      if (!allowedUser) {
        await this.deps.store.markIgnored(envelope.updateId, 'telegram_user_not_allowed');
        return c.json({ status: 'ignored', reason: 'telegram_user_not_allowed' }, 200);
      }

      const currentAgentId = await this.deps.store.getCurrentAgentId(
        envelope.telegramChatId,
      );
      const routeResult = await this.deps.router.route(
        toInboundMessage(envelope),
        currentAgentId,
      );

      const execution = await this.resolveRouteResult({
        routeResult,
        envelope,
        allowedPersonKey: allowedUser.personKey,
        currentAgentId,
      });

      if (execution.threadId) {
        failedOutbound = {
          telegramChatId: envelope.telegramChatId,
          mastraThreadId: execution.threadId,
          responseText: execution.responseText,
        };
        const sendResult = await this.deps.outboundClient.sendText({
          updateId: envelope.updateId,
          telegramChatId: envelope.telegramChatId,
          mastraThreadId: execution.threadId,
          responseText: execution.responseText,
        });
        await this.deps.store.recordOutboundSent({
          updateId: envelope.updateId,
          telegramChatId: envelope.telegramChatId,
          mastraThreadId: execution.threadId,
          responseText: execution.responseText,
          telegramMessageId: sendResult.telegramMessageId,
        });
        failedOutbound = null;
      }

      await this.deps.store.markProcessed(envelope.updateId, {
        agentId: execution.agentId,
        mastraThreadId: execution.threadId,
        responseText: execution.responseText,
      });

      mastraLogger.info('telegram update processado', {
        updateId: envelope.updateId.toString(),
        telegramUserId: envelope.telegramUserId.toString(),
        chatId: envelope.telegramChatId.toString(),
        agentId: execution.agentId,
        eventStatus: 'processed',
        latencyMs: Date.now() - startedAt,
      });

      return c.json({ status: 'processed' }, 200);
    } catch (error) {
      const adapterError =
        error instanceof TelegramAdapterError
          ? error
          : new TelegramAdapterError(
              'telegram_internal_error',
              'erro interno no adapter telegram',
              { cause: error, statusCode: 500, expose: false },
            );

      if (updateId) {
        await this.deps.store.markFailed(updateId, adapterError);
        if (failedOutbound) {
          await this.deps.store.recordOutboundFailed({
            updateId,
            telegramChatId: failedOutbound.telegramChatId,
            mastraThreadId: failedOutbound.mastraThreadId,
            responseText: failedOutbound.responseText,
            errorCode: adapterError.code,
          });
        }
      }

      mastraLogger.error('falha no processamento do telegram', {
        code: adapterError.code,
        error: adapterError.message,
        latencyMs: Date.now() - startedAt,
      });

      if (updateId) {
        return c.json(
          {
            status: 'failed',
            reason: adapterError.code,
          },
          200,
        );
      }

      return c.json(errorResponseBody(adapterError), {
        status: adapterError.statusCode as 200,
      });
    }
  }

  async getHealthReport(): Promise<TelegramHealthReport> {
    const schemaReady = await this.deps.checkSchemaReady();
    const allowlist = schemaReady
      ? await this.deps.store.getHealthReport()
      : { total: 0, active: 0, pendingLink: 0, disabled: 0 };
    const blockers: string[] = [];

    if (!this.deps.config.botToken) {
      blockers.push('bot token do telegram ausente');
    }
    if (!this.deps.config.webhookPathKey) {
      blockers.push('webhookPathKey ausente');
    }
    if (!this.deps.config.webhookSecretToken) {
      blockers.push('webhookSecretToken ausente');
    }
    if (!this.deps.config.publicBaseUrl) {
      blockers.push('domínio público HTTPS do webhook não configurado');
    }
    if (allowlist.active < 2) {
      blockers.push('telegram_user_id real dos dois usuários iniciais ainda não provisionado');
    }
    if (!schemaReady) {
      blockers.push('schema telegram_* indisponível');
    }

    return {
      enabled: this.deps.config.enabled,
      configValid:
        Boolean(this.deps.config.botToken) &&
        Boolean(this.deps.config.webhookPathKey) &&
        Boolean(this.deps.config.webhookSecretToken),
      schemaReady,
      ready: schemaReady && blockers.length === 0 && this.deps.config.enabled,
      allowlist,
      blockers,
    };
  }

  async handleHealth(c: any): Promise<Response> {
    const health = await this.getHealthReport();
    return c.json(health, { status: (health.ready ? 200 : 503) as 200 });
  }
}
