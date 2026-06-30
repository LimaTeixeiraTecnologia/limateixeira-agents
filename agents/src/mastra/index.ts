import { Mastra } from '@mastra/core/mastra';
import { Observability, MastraStorageExporter, MastraPlatformExporter, SensitiveDataFilter } from '@mastra/observability';
import { mastraConfig, telegramConfig } from './config';
import { mastraLogger } from '../logger';
import { mastraStorage, postgresPool } from './storage';
import { createTelegramAdapter } from '../telegram';
import { marcosAgent } from './agents/marcos-agent';
import { MARCOS_AGENT_REGISTRY_KEY } from './agents/constants';
import { bootstrapMarcosExecutionAuditSchema } from './audit/marcos-execution-audit';
import { marcosApprovalResolveRoute } from './marcos-approvals';
import { marcosHealthRoute, marcosKnowledgeStatusRoute } from './marcos-health';
import { ensureMarcosKnowledgeCatalog } from './knowledge/marcos';
import { bootstrapMarcosToolRegistrySchema, syncMarcosToolRegistry } from './tools/marcos-tool-contract';
import { bootstrapMarcosHumanApprovalsSchema, marcosCoreWorkflows } from './workflows/core';

const telegramAdapter = createTelegramAdapter({
  config: telegramConfig,
  pool: postgresPool,
});

await telegramAdapter.ensureSchema();
await bootstrapMarcosExecutionAuditSchema(postgresPool);
await bootstrapMarcosHumanApprovalsSchema(postgresPool);
await bootstrapMarcosToolRegistrySchema(postgresPool);
await syncMarcosToolRegistry(postgresPool);
await ensureMarcosKnowledgeCatalog(postgresPool);

export const mastra = new Mastra({
  agents: {
    [MARCOS_AGENT_REGISTRY_KEY]: marcosAgent,
  },
  workflows: marcosCoreWorkflows,
  storage: mastraStorage,
  logger: mastraLogger,
  server: {
    host: mastraConfig.MASTRA_HOST,
    port: mastraConfig.PORT,
    apiRoutes: [
      ...telegramAdapter.apiRoutes,
      marcosHealthRoute,
      marcosKnowledgeStatusRoute,
      marcosApprovalResolveRoute,
    ],
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
