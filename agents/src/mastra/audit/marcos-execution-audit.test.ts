import { describe, expect, it } from 'vitest';
import { newDb } from 'pg-mem';
import {
  bootstrapMarcosExecutionAuditSchema,
  listMarcosExecutionAuditByThread,
  recordMarcosExecutionAudit,
} from './marcos-execution-audit';

async function createPool() {
  const db = newDb();
  const { Pool } = db.adapters.createPg();
  return new Pool();
}

describe('marcos execution audit', () => {
  it('persiste trilha executiva com correlation id, workflow e capabilities', async () => {
    const pool = await createPool();

    await bootstrapMarcosExecutionAuditSchema({
      connect: async () => pool.connect(),
    } as never);
    await recordMarcosExecutionAudit(pool as never, {
      approvalStatus: 'approved',
      capabilityIds: ['09-product-discovery-capability'],
      correlationId: 'telegram:42',
      decisionSummary: 'Backlog priorizado com foco em impacto e urgência.',
      knowledgeDocumentIds: ['09-product-discovery-capability'],
      memoryFacts: [
        {
          key: 'current_goal',
          scope: 'working',
          source: 'audit',
          value: 'priorizar backlog',
        },
      ],
      resourceId: 'telegram:1',
      threadId: 'thread-1',
      workflowId: '03-task-execution-workflow',
    });

    const records = await listMarcosExecutionAuditByThread(
      pool as never,
      'thread-1',
    );

    expect(records).toHaveLength(1);
    expect(records[0]).toEqual(
      expect.objectContaining({
        approvalStatus: 'approved',
        capabilityIds: ['09-product-discovery-capability'],
        correlationId: 'telegram:42',
        workflowId: '03-task-execution-workflow',
      }),
    );

    await pool.end();
  });

  it('registra fatos bloqueados sem persistir conteúdo proibido', async () => {
    const pool = await createPool();

    await bootstrapMarcosExecutionAuditSchema({
      connect: async () => pool.connect(),
    } as never);
    const persisted = await recordMarcosExecutionAudit(pool as never, {
      approvalStatus: 'not_required',
      capabilityIds: [],
      correlationId: 'telegram:43',
      decisionSummary: 'Execução transitória do Marcos.',
      knowledgeDocumentIds: [],
      memoryFacts: [
        {
          key: 'apiToken',
          scope: 'long_term',
          source: 'user',
          value: 'sk-secret-123',
        },
      ],
      resourceId: 'telegram:2',
      threadId: 'thread-2',
      workflowId: 'telegram-transition',
    });

    expect(persisted.memoryFacts).toEqual([]);
    expect(persisted.blockedMemoryFacts).toEqual([
      expect.objectContaining({ key: 'apiToken' }),
    ]);

    await pool.end();
  });
});
