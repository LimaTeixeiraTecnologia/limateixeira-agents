import { readFileSync } from 'node:fs';
import { z } from 'zod';
import type { TelegramConfig } from '../telegram/types';

function readEnvOrFile(name: string): string | undefined {
  const value = process.env[name];
  if (value && value.length > 0) {
    return value;
  }

  const filePath = process.env[`${name}_FILE`];
  if (!filePath) {
    return undefined;
  }

  return readFileSync(filePath, 'utf8').trim();
}

function resolveConfigInput() {
  const databaseUrl = process.env.DATABASE_URL;
  const postgresPassword = readEnvOrFile('MASTRA_PG_PASSWORD');
  const openrouterApiKey = readEnvOrFile('OPENROUTER_API_KEY');
  const telegramBotToken = readEnvOrFile('TELEGRAM_BOT_TOKEN');
  const telegramWebhookPathKey = readEnvOrFile('TELEGRAM_WEBHOOK_PATH_KEY');
  const telegramWebhookSecretToken = readEnvOrFile('TELEGRAM_WEBHOOK_SECRET_TOKEN');

  return {
    DATABASE_URL: databaseUrl,
    MASTRA_PG_DATABASE: process.env.MASTRA_PG_DATABASE,
    MASTRA_PG_HOST: process.env.MASTRA_PG_HOST,
    MASTRA_PG_PASSWORD: postgresPassword,
    MASTRA_PG_PORT: process.env.MASTRA_PG_PORT,
    MASTRA_PG_USER: process.env.MASTRA_PG_USER,
    OPENROUTER_API_KEY: openrouterApiKey,
    MASTRA_HOST: process.env.MASTRA_HOST,
    MASTRA_STORAGE_SCHEMA: process.env.MASTRA_STORAGE_SCHEMA,
    PORT: process.env.PORT,
    TELEGRAM_ALLOWED_UPDATES: process.env.TELEGRAM_ALLOWED_UPDATES,
    TELEGRAM_BOT_TOKEN: telegramBotToken,
    TELEGRAM_ENABLED: process.env.TELEGRAM_ENABLED,
    TELEGRAM_PUBLIC_BASE_URL: process.env.TELEGRAM_PUBLIC_BASE_URL,
    TELEGRAM_WEBHOOK_PATH_KEY: telegramWebhookPathKey,
    TELEGRAM_WEBHOOK_SECRET_TOKEN: telegramWebhookSecretToken,
  };
}

const mastraConfigSchema = z.object({
  DATABASE_URL: z.string().min(1).optional(),
  MASTRA_PG_DATABASE: z.string().min(1).default('agents'),
  MASTRA_PG_HOST: z.string().min(1).default('localhost'),
  MASTRA_PG_PASSWORD: z.string().min(1, 'MASTRA_PG_PASSWORD precisa ser informada').optional(),
  MASTRA_PG_PORT: z.coerce.number().int().positive().default(5432),
  MASTRA_PG_USER: z.string().min(1).default('agents'),
  OPENROUTER_API_KEY: z.string().min(1).optional(),
  MASTRA_HOST: z.string().default('0.0.0.0'),
  MASTRA_STORAGE_SCHEMA: z.string().min(1).default('agents'),
  PORT: z.coerce.number().int().positive().default(4111),
  TELEGRAM_ALLOWED_UPDATES: z.literal('message').default('message'),
  TELEGRAM_BOT_TOKEN: z.string().min(1).optional(),
  TELEGRAM_ENABLED: z.coerce.boolean().default(false),
  TELEGRAM_PUBLIC_BASE_URL: z.string().url().optional(),
  TELEGRAM_WEBHOOK_PATH_KEY: z.string().min(1).optional(),
  TELEGRAM_WEBHOOK_SECRET_TOKEN: z.string().min(1).optional(),
}).superRefine((value, ctx) => {
  if (!value.DATABASE_URL && !value.MASTRA_PG_PASSWORD) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Informe DATABASE_URL ou MASTRA_PG_PASSWORD',
      path: ['DATABASE_URL'],
    });
  }

  if (value.TELEGRAM_ENABLED) {
    for (const [key, val] of [
      ['TELEGRAM_BOT_TOKEN', value.TELEGRAM_BOT_TOKEN],
      ['TELEGRAM_WEBHOOK_PATH_KEY', value.TELEGRAM_WEBHOOK_PATH_KEY],
      ['TELEGRAM_WEBHOOK_SECRET_TOKEN', value.TELEGRAM_WEBHOOK_SECRET_TOKEN],
    ] as const) {
      if (!val) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${key} precisa ser informada quando TELEGRAM_ENABLED=true`,
          path: [key],
        });
      }
    }
  }
});

export type MastraConfig = z.infer<typeof mastraConfigSchema>;

export function parseMastraConfig(input = resolveConfigInput()): MastraConfig {
  return mastraConfigSchema.parse(input);
}

export const mastraConfig: MastraConfig = parseMastraConfig();

export const telegramConfig: TelegramConfig = {
  enabled: mastraConfig.TELEGRAM_ENABLED,
  botToken: mastraConfig.TELEGRAM_BOT_TOKEN,
  webhookPathKey: mastraConfig.TELEGRAM_WEBHOOK_PATH_KEY,
  webhookSecretToken: mastraConfig.TELEGRAM_WEBHOOK_SECRET_TOKEN,
  allowedUpdates: ['message'],
  publicBaseUrl: mastraConfig.TELEGRAM_PUBLIC_BASE_URL,
};
