import { describe, expect, it } from 'vitest';
import { newDb } from 'pg-mem';
import {
  bootstrapMarcosKnowledgeSchema,
  getMarcosKnowledgeStatus,
  marcosKnowledgeManifest,
  syncMarcosKnowledgeCatalog,
} from './knowledge/marcos';

async function createPool() {
  const db = newDb();
  const { Pool } = db.adapters.createPg();
  const pool = new Pool();
  return pool;
}

describe('marcos knowledge status', () => {
  it('sincroniza o catálogo oficial e expõe status pronto para readiness', async () => {
    const pool = await createPool();

    await bootstrapMarcosKnowledgeSchema({
      connect: async () => pool.connect(),
    } as never);
    const syncReport = await syncMarcosKnowledgeCatalog({
      connect: async () => pool.connect(),
    } as never);
    const status = await getMarcosKnowledgeStatus(pool as never);

    expect(syncReport.syncedDocuments).toBe(marcosKnowledgeManifest.length);
    expect(status.ready).toBe(true);
    expect(status.totalExpectedDocuments).toBe(marcosKnowledgeManifest.length);
    expect(status.persistedActiveDocuments).toBe(marcosKnowledgeManifest.length);
    expect(status.missingDocuments).toEqual([]);
    expect(status.missingChunks).toEqual([]);
    expect(status.rag.chunkCount).toBeGreaterThan(marcosKnowledgeManifest.length);
    expect(status.rag.namespaces).toEqual(
      expect.arrayContaining(['corporate', 'governance', 'growth', 'marketing', 'product']),
    );

    await pool.end();
  });

  it('detecta drift de checksum e cobertura incompleta no catálogo persistido', async () => {
    const pool = await createPool();

    await bootstrapMarcosKnowledgeSchema({
      connect: async () => pool.connect(),
    } as never);
    await syncMarcosKnowledgeCatalog({
      connect: async () => pool.connect(),
    } as never);

    await pool.query(`
      UPDATE agents.marcos_knowledge_documents
      SET checksum = 'checksum-divergente'
      WHERE document_id = '00-system-prompt'
    `);
    await pool.query(`
      DELETE FROM agents.marcos_knowledge_chunks
      WHERE document_id = '01-constituicao-do-marcos'
    `);

    const status = await getMarcosKnowledgeStatus(pool as never);

    expect(status.ready).toBe(false);
    expect(status.checksumDrift).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ documentId: '00-system-prompt' }),
      ]),
    );
    expect(status.missingChunks).toEqual(
      expect.arrayContaining(['01-constituicao-do-marcos']),
    );
    expect(status.blockers).toEqual(
      expect.arrayContaining([
        expect.stringContaining('checksum divergente'),
        expect.stringContaining('documento sem chunks persistidos'),
      ]),
    );

    await pool.end();
  });
});
