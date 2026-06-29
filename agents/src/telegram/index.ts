import type { Pool } from 'pg';
import { registerApiRoute } from '@mastra/core/server';
import { mastraLogger } from '../logger';
import { bootstrapTelegramSchema } from './bootstrap';
import { TELEGRAM_HEALTH_PATH, TELEGRAM_WEBHOOK_PATH } from './constants';
import { MastraTelegramAgentRuntime } from './agent-runtime';
import { HttpTelegramOutboundClient } from './outbound';
import { DeterministicTelegramRouter } from './router';
import { TelegramService } from './service';
import { PostgresTelegramStore } from './store';
import type { TelegramConfig } from './types';

export function createTelegramAdapter(options: {
  config: TelegramConfig;
  pool: Pick<Pool, 'connect' | 'query'>;
}) {
  const store = new PostgresTelegramStore(options.pool);
  let schemaReady = false;

  async function ensureSchema(): Promise<void> {
    if (schemaReady) {
      return;
    }

    await bootstrapTelegramSchema(options.pool);
    schemaReady = true;
  }

  async function checkSchemaReady(): Promise<boolean> {
    try {
      const result = await options.pool.query(
        `SELECT 1
           FROM information_schema.tables
          WHERE table_schema = 'agents'
            AND table_name = 'telegram_allowed_users'`,
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      mastraLogger.warn('health do telegram sem schema pronto', {
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  const service = new TelegramService({
    config: options.config,
    store,
    router: new DeterministicTelegramRouter(),
    outboundClient: new HttpTelegramOutboundClient(options.config),
    agentRuntime: new MastraTelegramAgentRuntime(),
    ensureSchema,
    checkSchemaReady,
  });

  return {
    ensureSchema,
    service,
    apiRoutes: [
      registerApiRoute(TELEGRAM_WEBHOOK_PATH, {
        method: 'POST',
        requiresAuth: false,
        handler: async c => service.handleWebhook(c as never),
      }),
      registerApiRoute(TELEGRAM_HEALTH_PATH, {
        method: 'GET',
        handler: async c => service.handleHealth(c as never),
      }),
    ],
  };
}
