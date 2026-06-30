import { randomUUID } from 'node:crypto';
import type { Pool, PoolClient } from 'pg';

export type MarcosApprovalDecision = 'adjustments' | 'approved' | 'rejected';
export type MarcosApprovalStatus = 'adjustments_requested' | 'approved' | 'pending' | 'rejected';

type TransactionPool = Pick<Pool, 'connect'>;
type Queryable = Pick<Pool, 'query'>;

type PersistedApprovalRow = {
  approval_type: string;
  created_at: Date | string;
  id: string;
  requested_at: Date | string;
  requested_payload_json: unknown;
  resolved_at: Date | string | null;
  resolved_by: string | null;
  resolved_payload_json: unknown;
  status: MarcosApprovalStatus;
  step_id: string;
  workflow_id: string;
  workflow_run_id: string;
};

export type MarcosHumanApprovalRecord = {
  approvalType: string;
  createdAt: string;
  id: string;
  requestedAt: string;
  requestedPayload: Record<string, unknown>;
  resolvedAt: string | null;
  resolvedBy: string | null;
  resolvedPayload: Record<string, unknown> | null;
  status: MarcosApprovalStatus;
  stepId: string;
  workflowId: string;
  workflowRunId: string;
};

export type CreateMarcosHumanApprovalInput = {
  approvalType: string;
  id?: string;
  requestedPayload: Record<string, unknown>;
  stepId: string;
  workflowId: string;
  workflowRunId: string;
};

export type ResolveMarcosHumanApprovalInput = {
  decision: MarcosApprovalDecision;
  resolvedBy: string;
  resolvedPayload?: Record<string, unknown>;
};

export async function bootstrapMarcosHumanApprovalsSchema(
  pool: TransactionPool,
): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query('CREATE SCHEMA IF NOT EXISTS agents');
    await client.query(`
      CREATE TABLE IF NOT EXISTS agents.marcos_human_approvals (
        id TEXT PRIMARY KEY,
        workflow_run_id TEXT NOT NULL,
        workflow_id TEXT NOT NULL,
        step_id TEXT NOT NULL,
        approval_type TEXT NOT NULL,
        status TEXT NOT NULL,
        requested_payload_json JSONB NOT NULL,
        resolved_payload_json JSONB NULL,
        requested_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMPTZ NULL,
        resolved_by TEXT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (workflow_run_id, step_id)
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS marcos_human_approvals_status_idx
      ON agents.marcos_human_approvals (status, requested_at DESC)
    `);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function createMarcosHumanApproval(
  pool: Queryable,
  input: CreateMarcosHumanApprovalInput,
): Promise<MarcosHumanApprovalRecord> {
  const approvalId = input.id ?? randomUUID();
  const result = await pool.query<PersistedApprovalRow>(
    `
      INSERT INTO agents.marcos_human_approvals (
        id,
        workflow_run_id,
        workflow_id,
        step_id,
        approval_type,
        status,
        requested_payload_json
      ) VALUES ($1, $2, $3, $4, $5, 'pending', $6::jsonb)
      ON CONFLICT (workflow_run_id, step_id)
      DO UPDATE SET
        approval_type = EXCLUDED.approval_type,
        requested_payload_json = EXCLUDED.requested_payload_json
      RETURNING
        id,
        workflow_run_id,
        workflow_id,
        step_id,
        approval_type,
        status,
        requested_payload_json,
        resolved_payload_json,
        requested_at,
        resolved_at,
        resolved_by,
        created_at
    `,
    [
      approvalId,
      input.workflowRunId,
      input.workflowId,
      input.stepId,
      input.approvalType,
      JSON.stringify(input.requestedPayload),
    ],
  );

  return mapApprovalRow(result.rows[0]);
}

export async function resolveMarcosHumanApproval(
  pool: Queryable,
  approvalId: string,
  input: ResolveMarcosHumanApprovalInput,
): Promise<MarcosHumanApprovalRecord | null> {
  const status = toApprovalStatus(input.decision);
  const result = await pool.query<PersistedApprovalRow>(
    `
      UPDATE agents.marcos_human_approvals
      SET
        status = $2,
        resolved_payload_json = $3::jsonb,
        resolved_at = CURRENT_TIMESTAMP,
        resolved_by = $4
      WHERE id = $1
      RETURNING
        id,
        workflow_run_id,
        workflow_id,
        step_id,
        approval_type,
        status,
        requested_payload_json,
        resolved_payload_json,
        requested_at,
        resolved_at,
        resolved_by,
        created_at
    `,
    [
      approvalId,
      status,
      JSON.stringify({
        decision: input.decision,
        ...(input.resolvedPayload ?? {}),
      }),
      input.resolvedBy,
    ],
  );

  return result.rows[0] ? mapApprovalRow(result.rows[0]) : null;
}

export async function getMarcosHumanApprovalById(
  pool: Queryable,
  approvalId: string,
): Promise<MarcosHumanApprovalRecord | null> {
  const result = await pool.query<PersistedApprovalRow>(
    `
      SELECT
        id,
        workflow_run_id,
        workflow_id,
        step_id,
        approval_type,
        status,
        requested_payload_json,
        resolved_payload_json,
        requested_at,
        resolved_at,
        resolved_by,
        created_at
      FROM agents.marcos_human_approvals
      WHERE id = $1
    `,
    [approvalId],
  );

  return result.rows[0] ? mapApprovalRow(result.rows[0]) : null;
}

function mapApprovalRow(row: PersistedApprovalRow): MarcosHumanApprovalRecord {
  return {
    approvalType: row.approval_type,
    createdAt: new Date(row.created_at).toISOString(),
    id: row.id,
    requestedAt: new Date(row.requested_at).toISOString(),
    requestedPayload: parseJson<Record<string, unknown>>(row.requested_payload_json, {}),
    resolvedAt: row.resolved_at ? new Date(row.resolved_at).toISOString() : null,
    resolvedBy: row.resolved_by,
    resolvedPayload: row.resolved_payload_json
      ? parseJson<Record<string, unknown>>(row.resolved_payload_json, {})
      : null,
    status: row.status,
    stepId: row.step_id,
    workflowId: row.workflow_id,
    workflowRunId: row.workflow_run_id,
  };
}

function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value === 'string') {
    return JSON.parse(value) as T;
  }

  return (value as T | undefined) ?? fallback;
}

function toApprovalStatus(decision: MarcosApprovalDecision): MarcosApprovalStatus {
  switch (decision) {
    case 'approved':
      return 'approved';
    case 'rejected':
      return 'rejected';
    case 'adjustments':
      return 'adjustments_requested';
  }
}
