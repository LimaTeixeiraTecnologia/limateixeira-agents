import { randomUUID } from 'node:crypto';
import {
  TELEGRAM_OFFICIAL_AGENT_ID,
} from './constants';
import type { TelegramAgentExecutionInput, TelegramAgentExecutionResult } from './types';
import { mastraLogger } from '../logger';
import type { MarcosPersistedExecutionAudit } from '../mastra/audit/marcos-execution-audit';
import type { MarcosExecutionContext } from '../mastra/context/marcos-context';

type MarcosContextBuilder = {
  build(input: {
    queryText: string;
    requestContext: TelegramAgentExecutionInput['requestContext'];
  }): Promise<MarcosExecutionContext>;
};

type MarcosAgentExecutor = {
  generate(input: {
    prompt: string;
    requestContext: TelegramAgentExecutionInput['requestContext'];
    resourceId: string;
    runtimeContext: MarcosExecutionContext;
    threadId: string;
  }): Promise<{
    error?: Error;
    finishReason?: string;
    runId?: string;
    suspendPayload?: unknown;
    text: string;
    toolCalls?: Array<Record<string, unknown>>;
    totalUsage?: {
      totalTokens?: number;
    };
    usage?: {
      totalTokens?: number;
    };
  }>;
};

type MarcosExecutionAuditor = {
  record(input: {
    approvalStatus: 'approved' | 'not_required' | 'pending' | 'rejected';
    capabilityIds: string[];
    correlationId: string;
    decisionSummary: string;
    failureCode?: string | null;
    knowledgeDocumentIds: string[];
    latencyMs?: number | null;
    resourceId: string;
    threadId: string;
    tokenUsage?: number | null;
    toolIds?: string[];
    workflowId: string;
  }): Promise<MarcosPersistedExecutionAudit | void>;
};

type MarcosConflictDetector = {
  detect(context: MarcosExecutionContext): string[];
};

const defaultContextBuilder: MarcosContextBuilder = {
  async build(input) {
    const { postgresPool } = await import('../mastra/storage');
    const { buildMarcosExecutionContext } = await import(
      '../mastra/context/marcos-context'
    );

    return buildMarcosExecutionContext(postgresPool, {
      queryText: input.queryText,
      requestContext: input.requestContext,
    });
  },
};

const defaultAgentExecutor: MarcosAgentExecutor = {
  async generate(input) {
    const { marcosAgent } = await import('../mastra/agents/marcos-agent');
    const output = await marcosAgent.generate(input.prompt, {
      maxSteps: 2,
      memory: {
        resource: input.resourceId,
        thread: input.threadId,
      },
      requestContext: input.requestContext,
      system: renderRuntimeContext(input.runtimeContext),
    });

    return {
      error: output.error,
      finishReason: output.finishReason,
      runId: output.runId,
      suspendPayload: output.suspendPayload,
      text: output.text,
      toolCalls: output.toolCalls as unknown as Array<Record<string, unknown>>,
      totalUsage: output.totalUsage,
      usage: output.usage,
    };
  },
};

const defaultMarcosExecutionAuditor: MarcosExecutionAuditor = {
  async record(input) {
    const { postgresPool } = await import('../mastra/storage');
    const { recordMarcosExecutionAudit } = await import(
      '../mastra/audit/marcos-execution-audit'
    );
    return recordMarcosExecutionAudit(postgresPool, input);
  },
};

const defaultConflictDetector: MarcosConflictDetector = {
  detect(context) {
    const valuesByKey = new Map<string, Set<string>>();

    for (const fact of context.relevantMemoryFacts) {
      const normalizedValue = normalizeConflictValue(fact.value);
      if (!normalizedValue) {
        continue;
      }

      const current = valuesByKey.get(fact.key) ?? new Set<string>();
      current.add(normalizedValue);
      valuesByKey.set(fact.key, current);
    }

    return [...valuesByKey.entries()]
      .filter(([, values]) => values.size > 1)
      .map(([key]) => `fato de memória '${key}' possui versões incompatíveis`)
      .sort();
  },
};

export interface TelegramAgentRuntime {
  generateResponse(
    input: TelegramAgentExecutionInput,
  ): Promise<TelegramAgentExecutionResult>;
}

export class MastraTelegramAgentRuntime implements TelegramAgentRuntime {
  constructor(
    private readonly deps: {
      agentExecutor?: MarcosAgentExecutor;
      conflictDetector?: MarcosConflictDetector;
      contextBuilder?: MarcosContextBuilder;
      executionAuditor?: MarcosExecutionAuditor;
    } = {},
  ) {}

  async generateResponse(
    input: TelegramAgentExecutionInput,
  ): Promise<TelegramAgentExecutionResult> {
    const startedAt = Date.now();
    const correlationId =
      (input.requestContext.get('correlationId') as string | undefined) ??
      randomUUID();

    if (input.agentId !== TELEGRAM_OFFICIAL_AGENT_ID) {
      return {
        approvalStatus: 'not_required',
        capabilityIds: [],
        correlationId,
        knowledgeDocumentIds: [],
        text: 'Rota do agente não suportada nesta versão.',
        toolIds: [],
        workflowId: 'telegram-unsupported-route',
      };
    }

    const contextBuilder =
      this.deps.contextBuilder ?? defaultContextBuilder;
    const agentExecutor =
      this.deps.agentExecutor ?? defaultAgentExecutor;
    const executionAuditor =
      this.deps.executionAuditor ?? defaultMarcosExecutionAuditor;
    const conflictDetector =
      this.deps.conflictDetector ?? defaultConflictDetector;

    let runtimeContext: MarcosExecutionContext | null = null;

    try {
      runtimeContext = await contextBuilder.build({
        queryText: input.normalizedPrompt,
        requestContext: input.requestContext,
      });
      const knowledgeDocumentIds = collectKnowledgeDocumentIds(runtimeContext);
      const conflicts = conflictDetector.detect(runtimeContext);

      if (conflicts.length > 0) {
        const text = buildConflictResponse(conflicts);
        await executionAuditor.record({
          approvalStatus: 'not_required',
          capabilityIds: runtimeContext.applicableCapabilities,
          correlationId,
          decisionSummary: 'Execução interrompida por conflito explícito de contexto.',
          failureCode: 'document_conflict',
          knowledgeDocumentIds,
          latencyMs: Date.now() - startedAt,
          resourceId: input.resourceId,
          threadId: input.threadId,
          toolIds: [],
          workflowId: 'telegram-marcos-conflict',
        });

        return {
          approvalStatus: 'not_required',
          capabilityIds: runtimeContext.applicableCapabilities,
          correlationId,
          knowledgeDocumentIds,
          text,
          toolIds: [],
          workflowId: 'telegram-marcos-conflict',
        };
      }

      const output = await agentExecutor.generate({
        prompt: input.normalizedPrompt,
        requestContext: input.requestContext,
        resourceId: input.resourceId,
        runtimeContext,
        threadId: input.threadId,
      });
      const toolIds = collectToolIds(output.toolCalls);
      const approvalStatus =
        output.finishReason === 'suspended' ? 'pending' : 'not_required';
      const workflowId =
        approvalStatus === 'pending'
          ? 'telegram-marcos-awaiting-approval'
          : 'telegram-marcos-runtime';
      const text =
        approvalStatus === 'pending'
          ? buildPendingApprovalResponse(correlationId)
          : coerceResponseText(output.text);
      const tokenUsage =
        output.totalUsage?.totalTokens ?? output.usage?.totalTokens ?? null;

      await executionAuditor.record({
        approvalStatus,
        capabilityIds: runtimeContext.applicableCapabilities,
        correlationId,
        decisionSummary:
          approvalStatus === 'pending'
            ? 'Execução do Marcos suspensa aguardando aprovação humana.'
            : summarizeDecision(text),
        knowledgeDocumentIds,
        latencyMs: Date.now() - startedAt,
        resourceId: input.resourceId,
        threadId: input.threadId,
        tokenUsage,
        toolIds,
        workflowId,
      });

      mastraLogger.info('runtime final do marcos-agent executado via telegram', {
        agentId: input.agentId,
        approvalStatus,
        capabilityIds: runtimeContext.applicableCapabilities,
        correlationId,
        knowledgeDocumentIds,
        latencyMs: Date.now() - startedAt,
        resourceId: input.resourceId,
        threadId: input.threadId,
        tokenUsage,
        toolIds,
        workflowId,
      });

      return {
        approvalStatus,
        capabilityIds: runtimeContext.applicableCapabilities,
        correlationId,
        finishReason: output.finishReason,
        knowledgeDocumentIds,
        text,
        tokenUsage,
        toolIds,
        workflowId,
      };
    } catch (error) {
      await persistAuditFailure({
        correlationId,
        error,
        executionAuditor,
        latencyMs: Date.now() - startedAt,
        resourceId: input.resourceId,
        runtimeContext,
        threadId: input.threadId,
      });

      throw error;
    }
  }
}

function renderRuntimeContext(context: MarcosExecutionContext): string {
  const relevantKnowledge = context.retrievedKnowledge
    .slice(0, 4)
    .map(
      chunk =>
        `- ${chunk.metadata.id} [${chunk.metadata.category}/${chunk.metadata.namespace}]: ${truncate(chunk.content, 280)}`,
    );
  const relevantMemory = context.relevantMemoryFacts
    .slice(0, 4)
    .map(fact => `- ${fact.key}: ${truncate(fact.value, 180)}`);

  return [
    '## runtime-context',
    `capabilities: ${context.applicableCapabilities.join(', ') || 'nenhuma'}`,
    `workflows: ${context.applicableWorkflows.join(', ') || 'nenhum'}`,
    'use knowledge oficial como fonte primária e explicite conflitos se surgirem.',
    '## retrieved-knowledge',
    ...(relevantKnowledge.length > 0 ? relevantKnowledge : ['- nenhum chunk relevante recuperado']),
    '## relevant-memory',
    ...(relevantMemory.length > 0 ? relevantMemory : ['- nenhuma memória relevante selecionada']),
  ].join('\n');
}

function collectKnowledgeDocumentIds(context: MarcosExecutionContext): string[] {
  return [...new Set(context.sourceTrace.map(entry => entry.id))];
}

function collectToolIds(
  toolCalls: Array<Record<string, unknown>> | undefined,
): string[] {
  return (toolCalls ?? [])
    .map(call => {
      const value = call.toolName ?? call.tool ?? call.name;
      return typeof value === 'string' ? value : null;
    })
    .filter((value): value is string => Boolean(value));
}

function buildPendingApprovalResponse(correlationId: string): string {
  return [
    'A execução do Marcos foi suspensa aguardando aprovação humana.',
    `Correlation ID: ${correlationId}.`,
    'Assim que a aprovação for resolvida no runtime, a operação poderá ser retomada com segurança.',
  ].join('\n');
}

function buildConflictResponse(conflicts: string[]): string {
  return [
    'Conflito de contexto identificado antes da execução do Marcos.',
    ...conflicts.map(conflict => `- ${conflict}`),
    'A orientação segura é revisar a documentação oficial e aprovar uma versão única antes de prosseguir.',
  ].join('\n');
}

function summarizeDecision(text: string): string {
  return truncate(text.replace(/\s+/g, ' ').trim(), 220);
}

function coerceResponseText(text: string): string {
  const normalized = text.trim();
  if (normalized.length > 0) {
    return normalized;
  }

  return 'O marcos-agent concluiu a execução, mas não retornou texto final utilizável.';
}

function normalizeConflictValue(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function truncate(value: string, maxChars: number): string {
  return value.length <= maxChars ? value : `${value.slice(0, maxChars - 1)}...`;
}

async function persistAuditFailure(input: {
  correlationId: string;
  error: unknown;
  executionAuditor: MarcosExecutionAuditor;
  latencyMs: number;
  resourceId: string;
  runtimeContext: MarcosExecutionContext | null;
  threadId: string;
}): Promise<void> {
  try {
    await input.executionAuditor.record({
      approvalStatus: 'not_required',
      capabilityIds: input.runtimeContext?.applicableCapabilities ?? [],
      correlationId: input.correlationId,
      decisionSummary: 'Falha operacional durante execução do marcos-agent via Telegram.',
      failureCode:
        input.error instanceof Error ? input.error.name : 'telegram_runtime_failure',
      knowledgeDocumentIds: input.runtimeContext
        ? collectKnowledgeDocumentIds(input.runtimeContext)
        : ['00-system-prompt', '01-constituicao-do-marcos'],
      latencyMs: input.latencyMs,
      resourceId: input.resourceId,
      threadId: input.threadId,
      toolIds: [],
      workflowId: 'telegram-marcos-runtime',
    });
  } catch (auditError) {
    mastraLogger.warn('falha ao persistir auditoria executiva do marcos-agent', {
      correlationId: input.correlationId,
      error: auditError instanceof Error ? auditError.message : String(auditError),
    });
  }
}
