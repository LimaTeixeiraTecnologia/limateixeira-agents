import { describe, expect, it } from 'vitest';
import { newDb } from 'pg-mem';
import {
  bootstrapMarcosHumanApprovalsSchema,
  createMarcosHumanApproval,
  getMarcosHumanApprovalById,
  resolveMarcosHumanApproval,
} from './marcos-human-approvals';

async function createPool() {
  const db = newDb();
  const { Pool } = db.adapters.createPg();
  return new Pool();
}

describe('marcos human approvals store', () => {
  it('persiste aprovação pendente e permite resolução posterior', async () => {
    const pool = await createPool();

    await bootstrapMarcosHumanApprovalsSchema({
      connect: async () => pool.connect(),
    } as never);
    const created = await createMarcosHumanApproval(pool as never, {
      approvalType: 'daily_planning',
      requestedPayload: {
        summary: 'Plano diário com impacto operacional relevante.',
      },
      stepId: 'marcos-daily-planning-approval',
      workflowId: 'marcos-daily-planning',
      workflowRunId: 'run-1',
    });
    const resolved = await resolveMarcosHumanApproval(pool as never, created.id, {
      decision: 'approved',
      resolvedBy: 'founder-1',
      resolvedPayload: { notes: 'seguir com o plano' },
    });

    expect(created.status).toBe('pending');
    expect(resolved).toEqual(
      expect.objectContaining({
        resolvedBy: 'founder-1',
        status: 'approved',
      }),
    );
    expect(await getMarcosHumanApprovalById(pool as never, created.id)).toEqual(
      expect.objectContaining({
        id: created.id,
        status: 'approved',
      }),
    );

    await pool.end();
  });
});
