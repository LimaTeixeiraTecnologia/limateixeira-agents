import { describe, expect, it } from 'vitest';
import { newDb } from 'pg-mem';
import {
  bootstrapMarcosToolRegistrySchema,
  marcosToolRegistry,
  syncMarcosToolRegistry,
} from './marcos-tool-contract';

async function createPool() {
  const db = newDb();
  const { Pool } = db.adapters.createPg();
  return new Pool();
}

describe('marcos tool contract', () => {
  it('expõe resultado padronizado e bloqueia execução sem aprovação quando necessário', async () => {
    const result = await marcosToolRegistry['01-instagram-tool'].execute({
      context: { approvalRequired: true, workflowId: 'wf-1' },
      correlationId: 'corr-1',
      metadata: {},
      operation: 'publish-post',
      payload: {},
    });

    expect(result.success).toBe(false);
    expect(result.error?.errorCode).toBe('approval_required');
  });

  it('sincroniza o registry persistido no banco', async () => {
    const pool = await createPool();
    await bootstrapMarcosToolRegistrySchema({
      connect: async () => pool.connect(),
    } as never);
    await syncMarcosToolRegistry(pool as never);

    const result = await pool.query(
      'SELECT COUNT(*)::int AS total FROM agents.marcos_tool_registry',
    );

    expect(result.rows[0]?.total).toBe(Object.keys(marcosToolRegistry).length);
    await pool.end();
  });
});
