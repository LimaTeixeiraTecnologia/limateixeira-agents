import { Mastra } from '@mastra/core/mastra';
import { Observability, MastraStorageExporter, MastraPlatformExporter, SensitiveDataFilter } from '@mastra/observability';
import { weatherWorkflow } from './workflows/weather-workflow';
import { weatherAgent } from './agents/weather-agent';
import { toolCallAppropriatenessScorer, completenessScorer, translationScorer } from './scorers/weather-scorer';
import { mastraConfig, telegramConfig } from './config';
import { mastraLogger } from '../logger';
import { mastraStorage, postgresPool } from './storage';
import { createTelegramAdapter } from '../telegram';

const telegramAdapter = createTelegramAdapter({
  config: telegramConfig,
  pool: postgresPool,
});

await telegramAdapter.ensureSchema();

export const mastra = new Mastra({
  workflows: { weatherWorkflow },
  agents: { weatherAgent },
  scorers: { toolCallAppropriatenessScorer, completenessScorer, translationScorer },
  storage: mastraStorage,
  logger: mastraLogger,
  server: {
    host: mastraConfig.MASTRA_HOST,
    port: mastraConfig.PORT,
    apiRoutes: telegramAdapter.apiRoutes,
  },
  observability: new Observability({
    configs: {
      default: {
        serviceName: 'mastra',
        exporters: [
          new MastraStorageExporter(), // Persists observability events to Mastra Storage
          new MastraPlatformExporter(), // Sends observability events to Mastra Platform (if MASTRA_PLATFORM_ACCESS_TOKEN is set)
        ],
        spanOutputProcessors: [
          new SensitiveDataFilter(), // Redacts sensitive data like passwords, tokens, keys
        ],
      },
    },
  }),
});
