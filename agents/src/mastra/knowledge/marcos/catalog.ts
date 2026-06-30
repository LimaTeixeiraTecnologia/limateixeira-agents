import { createHash } from 'node:crypto';
import { readFileSync, statSync } from 'node:fs';
import { basename } from 'node:path';
import type { Pool, PoolClient } from 'pg';
import {
  type MarcosDocumentKind,
  marcosKnowledgeManifest,
  type MarcosKnowledgeManifestEntry,
  type MarcosKnowledgeValidationReport,
  resolveMarcosKnowledgePath,
  validateMarcosKnowledgeManifest,
} from './manifest';

const MARCOS_KNOWLEDGE_STATUS_PATH = '/marcos/knowledge/status';
const MAX_CHUNK_TOKENS = 900;
const MIN_CHUNK_TOKENS = 500;

type Queryable = Pick<Pool, 'query'>;
type TransactionPool = Pick<Pool, 'connect'>;

type PersistedDocumentRow = {
  active: boolean;
  checksum: string;
  document_id: string;
  kind: MarcosDocumentKind;
  path: string;
  tags_json: unknown;
  title: string;
  updated_at: Date | string;
  version: string | null;
};

type ChunkCountRow = {
  chunk_count: string | number;
  document_id: string;
};

export type MarcosKnowledgeChunk = {
  chunkId: string;
  chunkOrder: number;
  content: string;
  metadata: {
    capability: string | null;
    category: MarcosDocumentKind;
    date: string;
    diretor: 'marcos';
    documento: string;
    headingPath: string[];
    id: string;
    namespace: MarcosKnowledgeNamespace;
    tags: string[];
    version: string | null;
    workflow: string | null;
  };
  tokenCount: number;
};

export type MarcosKnowledgeNamespace =
  | 'corporate'
  | 'governance'
  | 'growth'
  | 'marketing'
  | 'product'
  | 'shared';

export type MarcosKnowledgeDocumentSnapshot = {
  checksum: string;
  chunks: MarcosKnowledgeChunk[];
  kind: MarcosDocumentKind;
  namespace: MarcosKnowledgeNamespace;
  path: string;
  tags: string[];
  title: string;
  updatedAt: string;
  version: string | null;
};

export type MarcosKnowledgeSyncReport = {
  changedDocuments: string[];
  skippedDocuments: string[];
  syncedChunks: number;
  syncedDocuments: number;
};

export type MarcosKnowledgeStatusReport = {
  blockers: string[];
  checksumDrift: Array<{
    actualChecksum: string | null;
    documentId: string;
    expectedChecksum: string;
  }>;
  documentsByKind: Record<MarcosDocumentKind, number>;
  manifest: MarcosKnowledgeValidationReport;
  missingChunks: string[];
  missingDocuments: string[];
  persistedActiveDocuments: number;
  rag: {
    chunkCount: number;
    embeddingsConfigured: false;
    indexName: 'marcos_knowledge_chunks';
    namespaces: MarcosKnowledgeNamespace[];
    retrievalMode: 'metadata-selective';
    vectorStore: 'pgvector-ready';
  };
  ready: boolean;
  staleDocuments: string[];
  syncedAt: string | null;
  totalExpectedDocuments: number;
};

export async function ensureMarcosKnowledgeCatalog(
  pool: Queryable & TransactionPool,
): Promise<MarcosKnowledgeStatusReport> {
  await bootstrapMarcosKnowledgeSchema(pool);
  await syncMarcosKnowledgeCatalog(pool);
  return getMarcosKnowledgeStatus(pool);
}

export async function bootstrapMarcosKnowledgeSchema(
  pool: TransactionPool,
): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query('CREATE SCHEMA IF NOT EXISTS agents');
    await client.query(`
      CREATE TABLE IF NOT EXISTS agents.marcos_knowledge_documents (
        document_id TEXT PRIMARY KEY,
        path TEXT NOT NULL UNIQUE,
        kind TEXT NOT NULL,
        title TEXT NOT NULL,
        version TEXT NULL,
        checksum TEXT NOT NULL,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        tags_json JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS agents.marcos_knowledge_chunks (
        chunk_id TEXT PRIMARY KEY,
        document_id TEXT NOT NULL REFERENCES agents.marcos_knowledge_documents(document_id) ON DELETE CASCADE,
        chunk_order INTEGER NOT NULL,
        content TEXT NOT NULL,
        token_count INTEGER NOT NULL,
        metadata_json JSONB NOT NULL,
        checksum TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS marcos_knowledge_chunks_document_order_uidx
      ON agents.marcos_knowledge_chunks (document_id, chunk_order)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS marcos_knowledge_documents_active_idx
      ON agents.marcos_knowledge_documents (active, kind)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS marcos_knowledge_chunks_document_idx
      ON agents.marcos_knowledge_chunks (document_id)
    `);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function syncMarcosKnowledgeCatalog(
  pool: TransactionPool,
  entries: readonly MarcosKnowledgeManifestEntry[] = marcosKnowledgeManifest,
): Promise<MarcosKnowledgeSyncReport> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const existingRows = await client.query<PersistedDocumentRow>(
      `
        SELECT document_id, checksum, active, path, kind, title, version, tags_json, updated_at
        FROM agents.marcos_knowledge_documents
      `,
    );
    const existingById = new Map(
      existingRows.rows.map(row => [
        row.document_id,
        { checksum: row.checksum, active: row.active },
      ]),
    );

    const changedDocuments: string[] = [];
    const skippedDocuments: string[] = [];
    let syncedChunks = 0;

    const entryIds = new Set(entries.map(entry => entry.id));
    const staleIds = existingRows.rows
      .map(row => row.document_id)
      .filter(documentId => !entryIds.has(documentId));

    for (const staleId of staleIds) {
      await client.query(
        `
          UPDATE agents.marcos_knowledge_documents
          SET active = FALSE, updated_at = CURRENT_TIMESTAMP
          WHERE document_id = $1
        `,
        [staleId],
      );
    }

    for (const entry of entries) {
      const snapshot = readMarcosKnowledgeSnapshot(entry);
      const existing = existingById.get(entry.id);
      const shouldReindex =
        !existing || existing.checksum !== snapshot.checksum || !existing.active;

      await upsertDocument(client, entry, snapshot);

      if (!shouldReindex) {
        skippedDocuments.push(entry.id);
        continue;
      }

      changedDocuments.push(entry.id);
      await client.query(
        'DELETE FROM agents.marcos_knowledge_chunks WHERE document_id = $1',
        [entry.id],
      );

      for (const chunk of snapshot.chunks) {
        syncedChunks += 1;
        await client.query(
          `
            INSERT INTO agents.marcos_knowledge_chunks (
              chunk_id,
              document_id,
              chunk_order,
              content,
              token_count,
              metadata_json,
              checksum
            ) VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)
          `,
          [
            chunk.chunkId,
            entry.id,
            chunk.chunkOrder,
            chunk.content,
            chunk.tokenCount,
            JSON.stringify(chunk.metadata),
            snapshot.checksum,
          ],
        );
      }
    }

    await client.query('COMMIT');

    return {
      changedDocuments,
      skippedDocuments,
      syncedChunks,
      syncedDocuments: entries.length,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function getMarcosKnowledgeStatus(
  pool: Queryable,
  entries: readonly MarcosKnowledgeManifestEntry[] = marcosKnowledgeManifest,
): Promise<MarcosKnowledgeStatusReport> {
  const manifest = validateMarcosKnowledgeManifest(entries);

  if (!manifest.ready) {
    return {
      blockers: [...manifest.blockers],
      checksumDrift: [],
      documentsByKind: manifest.documentsByKind,
      manifest,
      missingChunks: [],
      missingDocuments: [],
      persistedActiveDocuments: 0,
      rag: {
        chunkCount: 0,
        embeddingsConfigured: false,
        indexName: 'marcos_knowledge_chunks',
        namespaces: [],
        retrievalMode: 'metadata-selective',
        vectorStore: 'pgvector-ready',
      },
      ready: false,
      staleDocuments: [],
      syncedAt: null,
      totalExpectedDocuments: entries.length,
    };
  }

  let persistedDocumentsResult;
  let chunkCountsResult;

  try {
    persistedDocumentsResult = await pool.query<PersistedDocumentRow>(`
      SELECT document_id, path, kind, title, version, checksum, active, tags_json, updated_at
      FROM agents.marcos_knowledge_documents
      WHERE active = TRUE
    `);
    chunkCountsResult = await pool.query<ChunkCountRow>(`
      SELECT document_id, COUNT(*) AS chunk_count
      FROM agents.marcos_knowledge_chunks
      GROUP BY document_id
    `);
  } catch {
    return {
      blockers: ['catálogo de knowledge ainda não foi bootstrapado no storage'],
      checksumDrift: [],
      documentsByKind: manifest.documentsByKind,
      manifest,
      missingChunks: entries.map(entry => entry.id),
      missingDocuments: entries.map(entry => entry.id),
      persistedActiveDocuments: 0,
      rag: {
        chunkCount: 0,
        embeddingsConfigured: false,
        indexName: 'marcos_knowledge_chunks',
        namespaces: [],
        retrievalMode: 'metadata-selective',
        vectorStore: 'pgvector-ready',
      },
      ready: false,
      staleDocuments: [],
      syncedAt: null,
      totalExpectedDocuments: entries.length,
    };
  }

  const persistedById = new Map(
    persistedDocumentsResult.rows.map(row => [row.document_id, row]),
  );
  const chunkCountByDocumentId = new Map(
    chunkCountsResult.rows.map(row => [
      row.document_id,
      typeof row.chunk_count === 'string'
        ? Number.parseInt(row.chunk_count, 10)
        : row.chunk_count,
    ]),
  );

  const missingDocuments: string[] = [];
  const missingChunks: string[] = [];
  const checksumDrift: MarcosKnowledgeStatusReport['checksumDrift'] = [];
  const namespaces = new Set<MarcosKnowledgeNamespace>();
  let syncedAt: string | null = null;

  for (const entry of entries) {
    const snapshot = readMarcosKnowledgeSnapshot(entry);
    namespaces.add(snapshot.namespace);

    const persisted = persistedById.get(entry.id);
    if (!persisted) {
      missingDocuments.push(entry.id);
      missingChunks.push(entry.id);
      continue;
    }

    const updatedAt = new Date(persisted.updated_at);
    if (!syncedAt || updatedAt.toISOString() > syncedAt) {
      syncedAt = updatedAt.toISOString();
    }

    if (persisted.checksum !== snapshot.checksum) {
      checksumDrift.push({
        actualChecksum: persisted.checksum,
        documentId: entry.id,
        expectedChecksum: snapshot.checksum,
      });
    }

    const chunkCount = chunkCountByDocumentId.get(entry.id) ?? 0;
    if (chunkCount === 0) {
      missingChunks.push(entry.id);
    }
  }

  const staleDocuments = persistedDocumentsResult.rows
    .map(row => row.document_id)
    .filter(documentId => !entries.some(entry => entry.id === documentId))
    .sort();

  const blockers = [
    ...manifest.blockers,
    ...missingDocuments.map(documentId => `documento sem catálogo persistido: ${documentId}`),
    ...checksumDrift.map(
      drift =>
        `checksum divergente no catálogo para ${drift.documentId}: esperado ${drift.expectedChecksum}, atual ${drift.actualChecksum ?? 'ausente'}`,
    ),
    ...missingChunks.map(documentId => `documento sem chunks persistidos: ${documentId}`),
    ...staleDocuments.map(documentId => `documento ativo no storage não existe mais no manifesto: ${documentId}`),
  ];

  return {
    blockers,
    checksumDrift,
    documentsByKind: manifest.documentsByKind,
    manifest,
    missingChunks,
    missingDocuments,
    persistedActiveDocuments: persistedDocumentsResult.rows.length,
    rag: {
      chunkCount: [...chunkCountByDocumentId.values()].reduce(
        (total, count) => total + count,
        0,
      ),
      embeddingsConfigured: false,
      indexName: 'marcos_knowledge_chunks',
      namespaces: [...namespaces].sort(),
      retrievalMode: 'metadata-selective',
      vectorStore: 'pgvector-ready',
    },
    ready: blockers.length === 0,
    staleDocuments,
    syncedAt,
    totalExpectedDocuments: entries.length,
  };
}

export function readMarcosKnowledgeSnapshot(
  entry: MarcosKnowledgeManifestEntry,
): MarcosKnowledgeDocumentSnapshot {
  const absolutePath = resolveMarcosKnowledgePath(entry.path);
  const content = readFileSync(absolutePath, 'utf8').trim();
  const title = inferMarcosDocumentTitle(entry.path, content);
  const version = inferMarcosDocumentVersion(content);
  const updatedAt = statSync(absolutePath).mtime.toISOString();
  const checksum = computeMarcosDocumentChecksum(content);
  const namespace = inferMarcosKnowledgeNamespace(entry, title);

  return {
    checksum,
    chunks: buildMarcosKnowledgeChunks(entry, {
      content,
      title,
      updatedAt,
      version,
    }),
    kind: entry.kind,
    namespace,
    path: entry.path,
    tags: [...entry.tags],
    title,
    updatedAt,
    version,
  };
}

export function computeMarcosDocumentChecksum(content: string): string {
  return createHash('sha256').update(content.trim()).digest('hex');
}

export function inferMarcosKnowledgeNamespace(
  entry: Pick<MarcosKnowledgeManifestEntry, 'id' | 'kind' | 'path' | 'tags'>,
  title?: string,
): MarcosKnowledgeNamespace {
  if (
    entry.kind === 'constitution' ||
    entry.kind === 'system-prompt' ||
    entry.kind === 'standard' ||
    entry.kind === 'architecture'
  ) {
    return 'governance';
  }

  const surface = `${entry.id} ${entry.path} ${title ?? ''} ${entry.tags.join(' ')}`.toLowerCase();
  if (surface.includes('growth')) {
    return 'growth';
  }
  if (
    surface.includes('product') ||
    surface.includes('ux') ||
    surface.includes('discovery')
  ) {
    return 'product';
  }
  if (
    surface.includes('marketing') ||
    surface.includes('content') ||
    surface.includes('copywriting') ||
    surface.includes('storytelling') ||
    surface.includes('branding') ||
    surface.includes('creative') ||
    surface.includes('instagram') ||
    surface.includes('facebook') ||
    surface.includes('whatsapp') ||
    surface.includes('meta_ads')
  ) {
    return 'marketing';
  }
  if (
    surface.includes('corporate') ||
    surface.includes('business') ||
    surface.includes('approval') ||
    surface.includes('planning') ||
    surface.includes('report') ||
    surface.includes('marcos')
  ) {
    return 'corporate';
  }
  return 'shared';
}

export function buildMarcosKnowledgeChunks(
  entry: MarcosKnowledgeManifestEntry,
  input: {
    content: string;
    title: string;
    updatedAt: string;
    version: string | null;
  },
): MarcosKnowledgeChunk[] {
  const namespace = inferMarcosKnowledgeNamespace(entry, input.title);
  const sections = splitMarkdownSections(input.content, input.title);
  const chunks: MarcosKnowledgeChunk[] = [];

  for (const section of sections) {
    const headingPrefix =
      section.headingPath.length > 0 ? `${section.headingPath.join('\n')}\n\n` : '';
    const paragraphs = section.body
      .split(/\n{2,}/)
      .map(paragraph => paragraph.trim())
      .filter(Boolean);

    if (paragraphs.length === 0) {
      continue;
    }

    let currentParagraphs: string[] = [];
    let currentTokens = estimateTokenCount(headingPrefix);

    const flushChunk = () => {
      if (currentParagraphs.length === 0) {
        return;
      }

      const content = `${headingPrefix}${currentParagraphs.join('\n\n')}`.trim();
      const chunkOrder = chunks.length;
      const tokenCount = estimateTokenCount(content);
      const chunkId = `${entry.id}-${chunkOrder}-${computeMarcosDocumentChecksum(content).slice(0, 12)}`;

      chunks.push({
        chunkId,
        chunkOrder,
        content,
        metadata: {
          capability: entry.kind === 'capability' ? entry.id : null,
          category: entry.kind,
          date: input.updatedAt,
          diretor: 'marcos',
          documento: entry.path,
          headingPath: section.headingPath.map(heading => heading.replace(/^#+\s*/, '')),
          id: entry.id,
          namespace,
          tags: [...entry.tags],
          version: input.version,
          workflow: entry.kind === 'workflow' ? entry.id : null,
        },
        tokenCount,
      });
      currentParagraphs = [];
      currentTokens = estimateTokenCount(headingPrefix);
    };

    for (const paragraph of paragraphs) {
      const tokens = estimateTokenCount(paragraph);
      if (tokens > MAX_CHUNK_TOKENS) {
        for (const slice of splitOversizedParagraph(paragraph, MAX_CHUNK_TOKENS)) {
          if (currentParagraphs.length > 0) {
            flushChunk();
          }
          currentParagraphs.push(slice);
          flushChunk();
        }
        continue;
      }

      const projectedTokens =
        currentTokens + tokens + (currentParagraphs.length > 0 ? 2 : 0);

      if (
        currentParagraphs.length > 0 &&
        projectedTokens > MAX_CHUNK_TOKENS &&
        currentTokens >= MIN_CHUNK_TOKENS
      ) {
        flushChunk();
      }

      currentParagraphs.push(paragraph);
      currentTokens += tokens + (currentParagraphs.length > 1 ? 2 : 0);
    }

    flushChunk();
  }

  return chunks;
}

export function inferMarcosDocumentTitle(path: string, content: string): string {
  const headingMatch = content.match(/^#\s+(.+)$/m);
  if (headingMatch?.[1]) {
    return headingMatch[1].trim();
  }

  return basename(path, '.md').replaceAll('_', ' ');
}

export function inferMarcosDocumentVersion(content: string): string | null {
  const versionMatch = content.match(/^Vers[aã]o:\s*(.+)$/im);
  return versionMatch?.[1]?.trim() ?? null;
}

function splitMarkdownSections(
  content: string,
  title: string,
): Array<{ body: string; headingPath: string[] }> {
  const lines = content.split('\n');
  const sections: Array<{ body: string; headingPath: string[] }> = [];
  let headingPath = [`# ${title}`];
  let body: string[] = [];

  const pushSection = () => {
    const text = body.join('\n').trim();
    if (!text) {
      body = [];
      return;
    }

    sections.push({
      body: text,
      headingPath: [...headingPath],
    });
    body = [];
  };

  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (!match) {
      body.push(line);
      continue;
    }

    pushSection();
    const depth = match[1].length;
    headingPath = [...headingPath.slice(0, depth - 1), `${match[1]} ${match[2].trim()}`];
  }

  pushSection();

  return sections;
}

function splitOversizedParagraph(paragraph: string, maxTokens: number): string[] {
  const sentences = paragraph
    .split(/(?<=[.!?])\s+/)
    .map(sentence => sentence.trim())
    .filter(Boolean);
  const slices: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    const candidate = current ? `${current} ${sentence}` : sentence;
    if (estimateTokenCount(candidate) <= maxTokens) {
      current = candidate;
      continue;
    }

    if (current) {
      slices.push(current);
    }

    if (estimateTokenCount(sentence) <= maxTokens) {
      current = sentence;
      continue;
    }

    const words = sentence.split(/\s+/);
    let buffer: string[] = [];

    for (const word of words) {
      const candidateWords = [...buffer, word].join(' ');
      if (estimateTokenCount(candidateWords) <= maxTokens) {
        buffer.push(word);
        continue;
      }

      if (buffer.length > 0) {
        slices.push(buffer.join(' '));
      }
      buffer = [word];
    }

    current = buffer.join(' ');
  }

  if (current) {
    slices.push(current);
  }

  return slices;
}

function estimateTokenCount(content: string): number {
  return content
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

async function upsertDocument(
  client: PoolClient,
  entry: MarcosKnowledgeManifestEntry,
  snapshot: MarcosKnowledgeDocumentSnapshot,
): Promise<void> {
  await client.query(
    `
      INSERT INTO agents.marcos_knowledge_documents (
        document_id,
        path,
        kind,
        title,
        version,
        checksum,
        active,
        tags_json
      ) VALUES ($1, $2, $3, $4, $5, $6, TRUE, $7::jsonb)
      ON CONFLICT (document_id) DO UPDATE
      SET path = EXCLUDED.path,
          kind = EXCLUDED.kind,
          title = EXCLUDED.title,
          version = EXCLUDED.version,
          checksum = EXCLUDED.checksum,
          active = TRUE,
          tags_json = EXCLUDED.tags_json,
          updated_at = CURRENT_TIMESTAMP
    `,
    [
      entry.id,
      entry.path,
      entry.kind,
      snapshot.title,
      snapshot.version,
      snapshot.checksum,
      JSON.stringify(snapshot.tags),
    ],
  );
}

export { MARCOS_KNOWLEDGE_STATUS_PATH };
