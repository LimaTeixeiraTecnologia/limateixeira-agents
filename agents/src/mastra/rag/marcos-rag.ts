import type { Pool } from 'pg';
import {
  type MarcosDocumentKind,
  type MarcosKnowledgeChunk,
  type MarcosKnowledgeNamespace,
} from '../knowledge/marcos';

type Queryable = Pick<Pool, 'query'>;

type PersistedChunkRow = {
  chunk_id: string;
  chunk_order: number;
  content: string;
  metadata_json: unknown;
  token_count: number;
};

export type MarcosRagQuery = {
  kinds?: MarcosDocumentKind[];
  limit?: number;
  namespaces?: MarcosKnowledgeNamespace[];
  queryText: string;
  tags?: string[];
};

export type MarcosRagResult = MarcosKnowledgeChunk & {
  score: number;
};

const STOPWORDS = new Set([
  'a',
  'as',
  'com',
  'da',
  'das',
  'de',
  'do',
  'dos',
  'e',
  'em',
  'na',
  'no',
  'o',
  'os',
  'para',
  'por',
  'que',
  'um',
  'uma',
]);

export async function retrieveMarcosKnowledgeChunks(
  pool: Queryable,
  query: MarcosRagQuery,
): Promise<MarcosRagResult[]> {
  const rows = await pool.query<PersistedChunkRow>(`
    SELECT chunks.chunk_id, chunks.chunk_order, chunks.content, chunks.metadata_json, chunks.token_count
    FROM agents.marcos_knowledge_chunks chunks
    INNER JOIN agents.marcos_knowledge_documents docs
      ON docs.document_id = chunks.document_id
    WHERE docs.active = TRUE
    ORDER BY chunk_order ASC
  `);

  const lexicon = buildMarcosRagLexicon(query.queryText);
  const limit = query.limit ?? 5;

  return rows.rows
    .map(row => toMarcosRagResult(row, lexicon))
    .filter(result => result.score > 0)
    .filter(result => matchesRagFilters(result, query))
    .sort((left, right) => right.score - left.score || left.chunkOrder - right.chunkOrder)
    .slice(0, limit);
}

export function buildMarcosRagLexicon(queryText: string): string[] {
  return [...new Set(
    queryText
      .toLowerCase()
      .split(/[^a-z0-9à-ÿ-]+/i)
      .map(token => token.trim())
      .filter(token => token.length >= 3 && !STOPWORDS.has(token)),
  )];
}

export function scoreMarcosRagCandidate(
  chunk: Pick<MarcosKnowledgeChunk, 'content' | 'metadata'>,
  lexicon: readonly string[],
): number {
  const content = chunk.content.toLowerCase();
  let score = 0;

  for (const token of lexicon) {
    if (content.includes(token)) {
      score += 3;
    }
    if (chunk.metadata.tags.some(tag => tag.toLowerCase().includes(token))) {
      score += 2;
    }
    if (chunk.metadata.namespace.includes(token)) {
      score += 2;
    }
    if (chunk.metadata.category.includes(token)) {
      score += 2;
    }
  }

  return score;
}

function matchesRagFilters(result: MarcosRagResult, query: MarcosRagQuery): boolean {
  if (query.kinds && !query.kinds.includes(result.metadata.category)) {
    return false;
  }
  if (query.namespaces && !query.namespaces.includes(result.metadata.namespace)) {
    return false;
  }
  if (
    query.tags &&
    !query.tags.every(tag =>
      result.metadata.tags.some(current => current.toLowerCase() === tag.toLowerCase()),
    )
  ) {
    return false;
  }
  return true;
}

function toMarcosRagResult(
  row: PersistedChunkRow,
  lexicon: readonly string[],
): MarcosRagResult {
  const metadata = parseMetadata(row.metadata_json);

  return {
    chunkId: row.chunk_id,
    chunkOrder: row.chunk_order,
    content: row.content,
    metadata,
    score: scoreMarcosRagCandidate(
      {
        content: row.content,
        metadata,
      },
      lexicon,
    ),
    tokenCount: row.token_count,
  };
}

function parseMetadata(metadata: unknown): MarcosKnowledgeChunk['metadata'] {
  if (typeof metadata === 'string') {
    return JSON.parse(metadata) as MarcosKnowledgeChunk['metadata'];
  }
  return metadata as MarcosKnowledgeChunk['metadata'];
}
