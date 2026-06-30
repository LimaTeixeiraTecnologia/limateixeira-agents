import { randomUUID } from 'node:crypto';
import type { Pool, PoolClient } from 'pg';
import {
  sanitizeMarcosMemoryFacts,
  type MarcosMemoryFact,
} from '../memory/marcos-memory';

type TransactionPool = Pick<Pool, 'connect'>;
type Queryable = Pick<Pool, 'query'>;

export type MarcosApprovalStatus =
  | 'approved'
  | 'not_required'
  | 'pending'
  | 'rejected';

export type MarcosExecutionAuditRecord = {
  approvalStatus: MarcosApprovalStatus;
  capabilityIds: string[];
  correlationId: string;
  decisionSummary: string;
  failureCode?: string | null;
  id?: string;
  knowledgeDocumentIds: string[];
  latencyMs?: number | null;
  memoryFacts?: MarcosMemoryFact[];
  resourceId: string;
  threadId: string;
  tokenUsage?: number | null;
  toolIds?: string[];
  workflowId: string;
};

export type MarcosPersistedExecutionAudit = MarcosExecutionAuditRecord & {
  blockedMemoryFacts: Array<{
    key: string;
    reason: string;
  }>;
  createdAt: string;
  id: string;
};

type PersistedAuditRow = {
  approval_status: MarcosApprovalStatus;
  blocked_memory_facts_json: unknown;
  capability_ids_json: unknown;
  correlation_id: string;
  created_at: Date | string;
  decision_summary: string;
  failure_code: string | null;
  id: string;
  knowledge_document_ids_json: unknown;
  latency_ms: number | null;
  memory_facts_json: unknown;
  resource_id: string;
  thread_id: string;
  token_usage: number | null;
  tool_ids_json: unknown;
  workflow_id: string;
};

export async function bootstrapMarcosExecutionAuditSchema(
  pool: TransactionPool,
): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query('CREATE SCHEMA IF NOT EXISTS agents');
    await client.query(`
      CREATE TABLE IF NOT EXISTS agents.marcos_execution_audit (
        id TEXT PRIMARY KEY,
        thread_id TEXT NOT NULL,
        resource_id TEXT NOT NULL,
        workflow_id TEXT NOT NULL,
        capability_ids_json JSONB NOT NULL DEFAULT '[]'::jsonb,
        approval_status TEXT NOT NULL,
        decision_summary TEXT NOT NULL,
        correlation_id TEXT NOT NULL,
        knowledge_document_ids_json JSONB NOT NULL DEFAULT '[]'::jsonb,
        memory_facts_json JSONB NOT NULL DEFAULT '[]'::jsonb,
        blocked_memory_facts_json JSONB NOT NULL DEFAULT '[]'::jsonb,
        tool_ids_json JSONB NOT NULL DEFAULT '[]'::jsonb,
        token_usage INTEGER NULL,
        latency_ms INTEGER NULL,
        failure_code TEXT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS marcos_execution_audit_thread_idx
      ON agents.marcos_execution_audit (thread_id, created_at DESC)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS marcos_execution_audit_correlation_idx
      ON agents.marcos_execution_audit (correlation_id)
    `);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function recordMarcosExecutionAudit(
  pool: Queryable,
  record: MarcosExecutionAuditRecord,
): Promise<MarcosPersistedExecutionAudit> {
  const sanitization = sanitizeMarcosMemoryFacts(record.memoryFacts ?? []);
  const id = record.id ?? randomUUID();

  await pool.query(
    `
      INSERT INTO agents.marcos_execution_audit (
        id,
        thread_id,
        resource_id,
        workflow_id,
        capability_ids_json,
        approval_status,
        decision_summary,
        correlation_id,
        knowledge_document_ids_json,
        memory_facts_json,
        blocked_memory_facts_json,
        tool_ids_json,
        token_usage,
        latency_ms,
        failure_code
      ) VALUES (
        $1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9::jsonb, $10::jsonb, $11::jsonb, $12::jsonb, $13, $14, $15
      )
    `,
    [
      id,
      record.threadId,
      record.resourceId,
      record.workflowId,
      JSON.stringify(record.capabilityIds),
      record.approvalStatus,
      record.decisionSummary,
      record.correlationId,
      JSON.stringify(record.knowledgeDocumentIds),
      JSON.stringify(sanitization.accepted),
      JSON.stringify(
        sanitization.blocked.map(entry => ({
          key: entry.fact.key,
          reason: entry.reason,
        })),
      ),
      JSON.stringify(record.toolIds ?? []),
      record.tokenUsage ?? null,
      record.latencyMs ?? null,
      record.failureCode ?? null,
    ],
  );

  return {
    ...record,
    blockedMemoryFacts: sanitization.blocked.map(entry => ({
      key: entry.fact.key,
      reason: entry.reason,
    })),
    createdAt: new Date().toISOString(),
    id,
    memoryFacts: sanitization.accepted,
    toolIds: record.toolIds ?? [],
  };
}

export async function listMarcosExecutionAuditByThread(
  pool: Queryable,
  threadId: string,
): Promise<MarcosPersistedExecutionAudit[]> {
  const result = await pool.query<PersistedAuditRow>(
    `
      SELECT
        id,
        thread_id,
        resource_id,
        workflow_id,
        capability_ids_json,
        approval_status,
        decision_summary,
        correlation_id,
        knowledge_document_ids_json,
        memory_facts_json,
        blocked_memory_facts_json,
        tool_ids_json,
        token_usage,
        latency_ms,
        failure_code,
        created_at
      FROM agents.marcos_execution_audit
      WHERE thread_id = $1
      ORDER BY created_at DESC
    `,
    [threadId],
  );

  return result.rows.map(row => ({
    approvalStatus: row.approval_status,
    blockedMemoryFacts: parseJson<Array<{ key: string; reason: string }>>(
      row.blocked_memory_facts_json,
      [],
    ),
    capabilityIds: parseJson<string[]>(row.capability_ids_json, []),
    correlationId: row.correlation_id,
    createdAt: new Date(row.created_at).toISOString(),
    decisionSummary: row.decision_summary,
    failureCode: row.failure_code,
    id: row.id,
    knowledgeDocumentIds: parseJson<string[]>(
      row.knowledge_document_ids_json,
      [],
    ),
    latencyMs: row.latency_ms,
    memoryFacts: parseJson<MarcosMemoryFact[]>(row.memory_facts_json, []),
    resourceId: row.resource_id,
    threadId: row.thread_id,
    tokenUsage: row.token_usage,
    toolIds: parseJson<string[]>(row.tool_ids_json, []),
    workflowId: row.workflow_id,
  }));
}

function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value === 'string') {
    return JSON.parse(value) as T;
  }
  return (value as T | undefined) ?? fallback;
}
