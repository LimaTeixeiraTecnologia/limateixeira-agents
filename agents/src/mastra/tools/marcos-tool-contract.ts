import type { Pool, PoolClient } from 'pg';
import { marcosKnowledgeManifest } from '../knowledge/marcos';

type Queryable = Pick<Pool, 'query'>;
type TransactionPool = Pick<Pool, 'connect'>;

export type MarcosToolImplementationStatus = 'read-only' | 'real' | 'stub';

export type MarcosToolDefinition = {
  id: string;
  implementationStatus: MarcosToolImplementationStatus;
  mode: 'execute' | 'observe';
  provider: string;
  sourceDoc: string;
  title: string;
  version: '1.0';
};

export type MarcosToolExecutionInput<I = Record<string, unknown>> = {
  context: {
    approvalRequired?: boolean;
    workflowId?: string;
  };
  correlationId: string;
  metadata: Record<string, unknown>;
  operation: string;
  payload: I;
  timeoutMs?: number;
};

export type MarcosToolExecutionOutput<O = Record<string, unknown>> = {
  correlationId: string;
  data?: O;
  error?: {
    errorCode: string;
    errorType: string;
    message: string;
    providerDetails?: unknown;
    retryable: boolean;
  };
  executionTimeMs: number;
  metadata: Record<string, unknown>;
  provider: string;
  success: boolean;
  version: '1.0';
};

export type MarcosTool = MarcosToolDefinition & {
  execute(input: MarcosToolExecutionInput): Promise<MarcosToolExecutionOutput>;
};

const toolEntries = marcosKnowledgeManifest.filter(entry => entry.kind === 'tool');

export const marcosToolRegistry: Record<string, MarcosTool> = Object.fromEntries(
  toolEntries.map(entry => {
    const definition = createMarcosToolDefinition(entry.id, entry.path);
    return [definition.id, createMarcosTool(definition)];
  }),
) as Record<string, MarcosTool>;

export async function bootstrapMarcosToolRegistrySchema(
  pool: TransactionPool,
): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query('CREATE SCHEMA IF NOT EXISTS agents');
    await client.query(`
      CREATE TABLE IF NOT EXISTS agents.marcos_tool_registry (
        tool_id TEXT PRIMARY KEY,
        source_doc TEXT NOT NULL,
        implementation_status TEXT NOT NULL,
        mode TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function syncMarcosToolRegistry(pool: Queryable): Promise<void> {
  for (const tool of Object.values(marcosToolRegistry)) {
    await pool.query(
      `
        INSERT INTO agents.marcos_tool_registry (
          tool_id,
          source_doc,
          implementation_status,
          mode
        ) VALUES ($1, $2, $3, $4)
        ON CONFLICT (tool_id)
        DO UPDATE SET
          source_doc = EXCLUDED.source_doc,
          implementation_status = EXCLUDED.implementation_status,
          mode = EXCLUDED.mode,
          updated_at = CURRENT_TIMESTAMP
      `,
      [tool.id, tool.sourceDoc, tool.implementationStatus, tool.mode],
    );
  }
}

function createMarcosTool(definition: MarcosToolDefinition): MarcosTool {
  return {
    ...definition,
    async execute(input) {
      const startedAt = Date.now();

      if (input.context.approvalRequired && definition.mode === 'execute') {
        return {
          correlationId: input.correlationId,
          error: {
            errorCode: 'approval_required',
            errorType: 'policy',
            message: 'tool bloqueada até aprovação humana explícita',
            retryable: false,
          },
          executionTimeMs: Date.now() - startedAt,
          metadata: {
            operation: input.operation,
            status: definition.implementationStatus,
          },
          provider: definition.provider,
          success: false,
          version: definition.version,
        };
      }

      return {
        correlationId: input.correlationId,
        data: {
          mode: definition.mode,
          operation: input.operation,
          status: definition.implementationStatus,
          toolId: definition.id,
        },
        executionTimeMs: Date.now() - startedAt,
        metadata: {
          operation: input.operation,
          sourceDoc: definition.sourceDoc,
          workflowId: input.context.workflowId,
        },
        provider: definition.provider,
        success: true,
        version: definition.version,
      };
    },
  };
}

function createMarcosToolDefinition(id: string, sourceDoc: string): MarcosToolDefinition {
  const readOnlyTools = new Set(['05-postgresql-tool', '08-llm-tool', '10-search-tool']);

  return {
    id,
    implementationStatus: readOnlyTools.has(id) ? 'read-only' : 'stub',
    mode: readOnlyTools.has(id) ? 'observe' : 'execute',
    provider: inferProviderFromToolId(id),
    sourceDoc,
    title: toTitle(id),
    version: '1.0',
  };
}

function inferProviderFromToolId(id: string): string {
  if (id.includes('postgresql')) {
    return 'postgresql';
  }
  if (id.includes('llm')) {
    return 'openrouter';
  }
  if (id.includes('search')) {
    return 'search';
  }
  return id.replace(/-\d+$/, '').replace(/-tool$/, '');
}

function toTitle(id: string): string {
  return id
    .replace(/^\d+-/, '')
    .replace(/-tool$/, '')
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
