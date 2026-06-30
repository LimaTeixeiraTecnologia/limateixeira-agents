import { describe, expect, it } from 'vitest';
import { TELEGRAM_OFFICIAL_AGENT_ID } from '../telegram/constants';
import { createMarcosHealthReport, getMarcosHealthReport } from './marcos-health';

describe('marcos health report', () => {
  it('fica pronto quando o agente oficial está registrado e o manifesto é válido', () => {
    const report = getMarcosHealthReport({
      listAgents: () => ({
        marcosAgent: { id: TELEGRAM_OFFICIAL_AGENT_ID },
      }),
    });

    expect(report.ready).toBe(true);
    expect(report.officialAgentId).toBe(TELEGRAM_OFFICIAL_AGENT_ID);
    expect(report.blockers).toEqual([]);
  });

  it('bloqueia quando o runtime não registra o agente oficial esperado', () => {
    const report = getMarcosHealthReport({
      listAgents: () => ({
        legacy: { id: 'weather-agent' },
      }),
    });

    expect(report.ready).toBe(false);
    expect(report.blockers).toEqual(
      expect.arrayContaining([
        expect.stringContaining('agente oficial não registrado'),
        expect.stringContaining('registro Mastra contém agentes extras'),
      ]),
    );
  });

  it('bloqueia readiness quando o catálogo persistido está em drift', () => {
    const report = createMarcosHealthReport(
      {
        listAgents: () => ({
          marcosAgent: { id: TELEGRAM_OFFICIAL_AGENT_ID },
        }),
      },
      {
        blockers: ['checksum divergente no catálogo para 00-system-prompt'],
        checksumDrift: [
          {
            actualChecksum: 'abc',
            documentId: '00-system-prompt',
            expectedChecksum: 'def',
          },
        ],
        documentsByKind: getMarcosHealthReport({
          listAgents: () => ({
            marcosAgent: { id: TELEGRAM_OFFICIAL_AGENT_ID },
          }),
        }).manifest.documentsByKind,
        manifest: getMarcosHealthReport({
          listAgents: () => ({
            marcosAgent: { id: TELEGRAM_OFFICIAL_AGENT_ID },
          }),
        }).manifest,
        missingChunks: [],
        missingDocuments: [],
        persistedActiveDocuments: 1,
        rag: {
          chunkCount: 1,
          embeddingsConfigured: false,
          indexName: 'marcos_knowledge_chunks',
          namespaces: ['governance'],
          retrievalMode: 'metadata-selective',
          vectorStore: 'pgvector-ready',
        },
        ready: false,
        staleDocuments: [],
        syncedAt: '2026-06-29T00:00:00.000Z',
        totalExpectedDocuments: 1,
      },
    );

    expect(report.ready).toBe(false);
    expect(report.blockers).toEqual(
      expect.arrayContaining([expect.stringContaining('checksum divergente')]),
    );
  });

  it('bloqueia go-live quando telegram, approvals ou tool registry não estão prontos', () => {
    const report = createMarcosHealthReport(
      {
        listAgents: () => ({
          marcosAgent: { id: TELEGRAM_OFFICIAL_AGENT_ID },
        }),
      },
      undefined,
      {
        approvals: {
          approved: 0,
          pending: 0,
          rejected: 0,
          schemaReady: false,
        },
        telegram: {
          allowlist: { active: 0, disabled: 0, pendingLink: 2, total: 2 },
          blockers: ['telegram_user_id real dos dois usuários iniciais ainda não provisionado'],
          configValid: true,
          enabled: true,
          ready: false,
          schemaReady: true,
        },
        tools: {
          expectedTotal: 7,
          readOnly: 3,
          real: 0,
          registeredTotal: 6,
          schemaReady: true,
          stub: 3,
          synced: false,
        },
      },
    );

    expect(report.ready).toBe(false);
    expect(report.blockers).toEqual(
      expect.arrayContaining([
        expect.stringContaining('telegram: telegram_user_id real'),
        expect.stringContaining('schema de aprovações humanas indisponível'),
        expect.stringContaining('tool registry incompleto'),
      ]),
    );
  });
});
