import { afterEach, describe, expect, it, vi } from 'vitest';
import { TELEGRAM_OFFICIAL_AGENT_ID } from '../telegram/constants';
import { MARCOS_HEALTH_PATH, getMarcosHealthReport } from './marcos-health';

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  vi.resetModules();
  vi.restoreAllMocks();
});

describe('mastra entrypoint', () => {
  it('registra o marcos-agent como runtime oficial e expõe health dedicado', async () => {
    process.env.DATABASE_URL = 'postgres://agents:secret@localhost:5432/agents';
    process.env.TELEGRAM_ENABLED = '';

    vi.doMock('./storage', () => ({
      mastraStorage: undefined,
      postgresPool: {},
    }));

    vi.doMock('../telegram', () => ({
      createTelegramAdapter: () => ({
        ensureSchema: vi.fn(async () => undefined),
        apiRoutes: [],
      }),
    }));
    vi.doMock('./audit/marcos-execution-audit', () => ({
      bootstrapMarcosExecutionAuditSchema: vi.fn(async () => undefined),
    }));
    vi.doMock('./workflows/core', async importOriginal => {
      const actual = await importOriginal<typeof import('./workflows/core')>();
      return {
        ...actual,
        bootstrapMarcosHumanApprovalsSchema: vi.fn(async () => undefined),
      };
    });
    vi.doMock('./tools/marcos-tool-contract', async importOriginal => {
      const actual =
        await importOriginal<typeof import('./tools/marcos-tool-contract')>();
      return {
        ...actual,
        bootstrapMarcosToolRegistrySchema: vi.fn(async () => undefined),
        syncMarcosToolRegistry: vi.fn(async () => undefined),
      };
    });
    vi.doMock('./knowledge/marcos', async importOriginal => {
      const actual = await importOriginal<typeof import('./knowledge/marcos')>();
      return {
        ...actual,
        ensureMarcosKnowledgeCatalog: vi.fn(async () => ({
          blockers: [],
          checksumDrift: [],
          documentsByKind: actual.validateMarcosKnowledgeManifest().documentsByKind,
          manifest: actual.validateMarcosKnowledgeManifest(),
          missingChunks: [],
          missingDocuments: [],
          persistedActiveDocuments: actual.marcosKnowledgeManifest.length,
          rag: {
            chunkCount: 1,
            embeddingsConfigured: false as const,
            indexName: 'marcos_knowledge_chunks' as const,
            namespaces: ['governance'],
            retrievalMode: 'metadata-selective' as const,
            vectorStore: 'pgvector-ready' as const,
          },
          ready: true,
          staleDocuments: [],
          syncedAt: new Date().toISOString(),
          totalExpectedDocuments: actual.marcosKnowledgeManifest.length,
        })),
      };
    });

    const { mastra } = await import('./index');
    const report = getMarcosHealthReport(mastra);

    expect(mastra.getAgent('marcosAgent').id).toBe(TELEGRAM_OFFICIAL_AGENT_ID);
    expect(mastra.listAgents()).toEqual({
      marcosAgent: expect.objectContaining({ id: TELEGRAM_OFFICIAL_AGENT_ID }),
    });
    expect(report.ready).toBe(true);
    expect(report.registeredAgentKeys).toEqual(['marcosAgent']);
    expect(
      mastra.getServer()?.apiRoutes?.some(route => route.path === MARCOS_HEALTH_PATH),
    ).toBe(true);
  });
});
