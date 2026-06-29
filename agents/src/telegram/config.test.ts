import { afterEach, describe, expect, it } from 'vitest';

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe('telegram config', () => {
  it('aceita telegram desabilitado sem segredos', async () => {
    process.env.DATABASE_URL = 'postgres://agents:secret@localhost:5432/agents';
    const { parseMastraConfig } = await import('../mastra/config');
    const config = parseMastraConfig({
      DATABASE_URL: 'postgres://agents:secret@localhost:5432/agents',
      OPENROUTER_API_KEY: undefined,
      MASTRA_PG_DATABASE: 'agents',
      MASTRA_PG_HOST: 'localhost',
      MASTRA_PG_PASSWORD: undefined,
      MASTRA_PG_PORT: '5432',
      MASTRA_PG_USER: 'agents',
      MASTRA_HOST: '0.0.0.0',
      MASTRA_STORAGE_SCHEMA: 'agents',
      PORT: '4111',
      TELEGRAM_ALLOWED_UPDATES: 'message',
      TELEGRAM_BOT_TOKEN: undefined,
      TELEGRAM_ENABLED: '',
      TELEGRAM_PUBLIC_BASE_URL: undefined,
      TELEGRAM_WEBHOOK_PATH_KEY: undefined,
      TELEGRAM_WEBHOOK_SECRET_TOKEN: undefined,
    });

    expect(config.TELEGRAM_ENABLED).toBe(false);
  });

  it('falha cedo quando telegram habilitado sem secrets obrigatórios', async () => {
    process.env.DATABASE_URL = 'postgres://agents:secret@localhost:5432/agents';
    const { parseMastraConfig } = await import('../mastra/config');
    expect(() =>
      parseMastraConfig({
        DATABASE_URL: 'postgres://agents:secret@localhost:5432/agents',
        OPENROUTER_API_KEY: undefined,
        MASTRA_PG_DATABASE: 'agents',
        MASTRA_PG_HOST: 'localhost',
        MASTRA_PG_PASSWORD: undefined,
        MASTRA_PG_PORT: '5432',
        MASTRA_PG_USER: 'agents',
        MASTRA_HOST: '0.0.0.0',
        MASTRA_STORAGE_SCHEMA: 'agents',
        PORT: '4111',
        TELEGRAM_ALLOWED_UPDATES: 'message',
        TELEGRAM_BOT_TOKEN: undefined,
        TELEGRAM_ENABLED: '1',
        TELEGRAM_PUBLIC_BASE_URL: undefined,
        TELEGRAM_WEBHOOK_PATH_KEY: undefined,
        TELEGRAM_WEBHOOK_SECRET_TOKEN: undefined,
      }),
    ).toThrow(/TELEGRAM_BOT_TOKEN/);
  });
});
