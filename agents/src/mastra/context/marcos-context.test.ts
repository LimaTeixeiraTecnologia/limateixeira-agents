import { RequestContext } from '@mastra/core/request-context';
import { describe, expect, it } from 'vitest';
import { buildMarcosExecutionContext, describeMarcosContextHierarchy } from './marcos-context';
import type { MarcosKnowledgeChunk } from '../knowledge/marcos';

describe('marcos context assembler', () => {
  it('mantém a ordem de precedência documental e explica a origem do contexto', async () => {
    const requestContext = new RequestContext();
    requestContext.set('correlationId', 'telegram:1');

    const context = await buildMarcosExecutionContext(
      { query: async () => ({ rows: [] }) } as never,
      {
        memoryFacts: [
          {
            key: 'current_goal',
            scope: 'working',
            source: 'audit',
            value: 'priorizar backlog de produto',
          },
        ],
        queryText: 'preciso priorizar backlog de produto',
        requestContext,
      },
      {
        retrieveKnowledge: async () =>
          [
            {
              chunkId: 'chunk-1',
              chunkOrder: 0,
              content: 'Capability de product discovery aplicada ao backlog.',
              metadata: {
                capability: '09-product-discovery-capability',
                category: 'capability',
                date: '2026-06-29T00:00:00.000Z',
                diretor: 'marcos',
                documento: '09_product_discovery_capability.md',
                headingPath: ['# Product Discovery'],
                id: '09-product-discovery-capability',
                namespace: 'product',
                tags: ['product'],
                version: '1.0',
                workflow: '03-task-execution-workflow',
              },
              score: 8,
              tokenCount: 42,
            } satisfies MarcosKnowledgeChunk & { score: number },
          ] as never,
      },
    );

    expect(describeMarcosContextHierarchy()).toEqual([
      'constitution',
      'system-prompt',
      'memory',
      'capability',
      'workflow',
      'rag',
    ]);
    expect(context.sourceTrace.map(source => source.kind).slice(0, 4)).toEqual([
      'constitution',
      'system-prompt',
      'memory',
      'capability',
    ]);
    expect(context.applicableCapabilities).toContain(
      '09-product-discovery-capability',
    );
    expect(context.applicableWorkflows).toContain('03-task-execution-workflow');
    expect(context.requestContextSnapshot).toEqual(
      expect.objectContaining({ correlationId: 'telegram:1' }),
    );
    expect(context.tokenEstimate).toBeGreaterThan(0);
  });
});
