import { RequestContext } from '@mastra/core/request-context';
import { describe, expect, it } from 'vitest';
import {
  TELEGRAM_OFFICIAL_AGENT_ID,
} from './constants';
import { MastraTelegramAgentRuntime } from './agent-runtime';
import type { MarcosExecutionContext } from '../mastra/context/marcos-context';

describe('mastra telegram agent runtime', () => {
  it('executa o runtime final do marcos-agent com memória, contexto e auditoria', async () => {
    const seen = {
      audited: [] as Array<Record<string, unknown>>,
      generated: [] as Array<Record<string, unknown>>,
    };
    const runtime = new MastraTelegramAgentRuntime({
      contextBuilder: {
        build: async ({ requestContext }) =>
          ({
          applicableCapabilities: ['09-product-discovery-capability'],
          applicableWorkflows: ['01-daily-planning-workflow'],
          identityPrompt: 'Marcos',
          memoryPolicy: {
            knowledgePrecedence: 'knowledge',
            readOnly: true,
            requiresApproval: false,
          },
          relevantMemoryFacts: [],
          requestContextSnapshot: requestContext.all,
          retrievedKnowledge: [
            {
              chunkId: 'chunk-1',
              chunkOrder: 0,
              content: 'Planeje o dia com base nas prioridades oficiais.',
              metadata: {
                category: 'workflow',
                capability: '09-product-discovery-capability',
                date: '2026-06-29',
                diretor: 'marcos',
                documento: '01_daily_planning_workflow.md',
                headingPath: ['daily planning'],
                id: '01-daily-planning-workflow',
                namespace: 'shared',
                tags: ['planning'],
                version: null,
                workflow: '01-daily-planning-workflow',
              },
              tokenCount: 12,
            },
          ],
          sourceTrace: [
            {
              id: '00-system-prompt',
              kind: 'system-prompt',
              reason: 'always',
            },
            {
              id: '01-constituicao-do-marcos',
              kind: 'constitution',
              reason: 'always',
            },
            {
              id: '01-daily-planning-workflow',
              kind: 'workflow',
              reason: 'selected',
            },
          ],
          tokenEstimate: 42,
        }) satisfies MarcosExecutionContext,
      },
      agentExecutor: {
        generate: async input => {
          seen.generated.push(input as unknown as Record<string, unknown>);
          return {
            finishReason: 'stop',
            text: 'Priorize a revisão do roadmap e o alinhamento com vendas.',
            toolCalls: [{ toolName: '10-search-tool' }],
            totalUsage: { totalTokens: 321 },
          };
        },
      },
      executionAuditor: {
        record: async input => {
          seen.audited.push(input as unknown as Record<string, unknown>);
        },
      },
    });

    const requestContext = new RequestContext();
    requestContext.set('correlationId', 'telegram:1');

    await expect(
      runtime.generateResponse({
        agentId: TELEGRAM_OFFICIAL_AGENT_ID,
        normalizedPrompt: 'Quero ajuda para priorizar o dia',
        threadId: 'thread-1',
        resourceId: 'telegram:1',
        requestContext,
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        approvalStatus: 'not_required',
        capabilityIds: ['09-product-discovery-capability'],
        correlationId: 'telegram:1',
        knowledgeDocumentIds: [
          '00-system-prompt',
          '01-constituicao-do-marcos',
          '01-daily-planning-workflow',
        ],
        text: 'Priorize a revisão do roadmap e o alinhamento com vendas.',
        tokenUsage: 321,
        toolIds: ['10-search-tool'],
        workflowId: 'telegram-marcos-runtime',
      }),
    );

    expect(seen.generated).toEqual([
      expect.objectContaining({
        prompt: 'Quero ajuda para priorizar o dia',
        resourceId: 'telegram:1',
        threadId: 'thread-1',
      }),
    ]);
    expect(seen.audited).toEqual([
      expect.objectContaining({
        approvalStatus: 'not_required',
        correlationId: 'telegram:1',
        toolIds: ['10-search-tool'],
        workflowId: 'telegram-marcos-runtime',
      }),
    ]);
  });

  it('responde com suspensão operacional quando o runtime exige aprovação humana', async () => {
    const runtime = new MastraTelegramAgentRuntime({
      contextBuilder: {
        build: async () =>
          ({
          applicableCapabilities: [],
          applicableWorkflows: ['04-human-approval-workflow'],
          identityPrompt: 'Marcos',
          memoryPolicy: {
            knowledgePrecedence: 'knowledge',
            readOnly: true,
            requiresApproval: true,
          },
          relevantMemoryFacts: [],
          requestContextSnapshot: {},
          retrievedKnowledge: [],
          sourceTrace: [
            {
              id: '04-human-approval-workflow',
              kind: 'workflow',
              reason: 'selected',
            },
          ],
          tokenEstimate: 10,
        }) satisfies MarcosExecutionContext,
      },
      agentExecutor: {
        generate: async () => ({
          finishReason: 'suspended',
          runId: 'run-1',
          suspendPayload: { toolCallId: 'tool-1' },
          text: '',
        }),
      },
      executionAuditor: {
        record: async () => undefined,
      },
    });

    await expect(
      runtime.generateResponse({
        agentId: TELEGRAM_OFFICIAL_AGENT_ID,
        normalizedPrompt: 'Publique a campanha agora',
        threadId: 'thread-1',
        resourceId: 'telegram:1',
        requestContext: new RequestContext(),
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        approvalStatus: 'pending',
        workflowId: 'telegram-marcos-awaiting-approval',
      }),
    );
  });

  it('produz resposta estruturada quando encontra conflito explícito de contexto', async () => {
    const runtime = new MastraTelegramAgentRuntime({
      contextBuilder: {
        build: async () =>
          ({
          applicableCapabilities: [],
          applicableWorkflows: [],
          identityPrompt: 'Marcos',
          memoryPolicy: {
            knowledgePrecedence: 'knowledge',
            readOnly: true,
            requiresApproval: false,
          },
          relevantMemoryFacts: [],
          requestContextSnapshot: {},
          retrievedKnowledge: [],
          sourceTrace: [
            {
              id: '01-constituicao-do-marcos',
              kind: 'constitution',
              reason: 'always',
            },
          ],
          tokenEstimate: 10,
        }) satisfies MarcosExecutionContext,
      },
      conflictDetector: {
        detect: () => ['documentos operacionais divergem sobre a mesma decisão'],
      },
      agentExecutor: {
        generate: async () => {
          throw new Error('não deveria executar');
        },
      },
      executionAuditor: {
        record: async () => undefined,
      },
    });

    await expect(
      runtime.generateResponse({
        agentId: TELEGRAM_OFFICIAL_AGENT_ID,
        normalizedPrompt: 'Qual é a decisão correta?',
        threadId: 'thread-1',
        resourceId: 'telegram:1',
        requestContext: new RequestContext(),
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        approvalStatus: 'not_required',
        text: expect.stringContaining('Conflito de contexto identificado'),
        workflowId: 'telegram-marcos-conflict',
      }),
    );
  });

  it('recusa rotas não suportadas', async () => {
    const runtime = new MastraTelegramAgentRuntime();

    await expect(
      runtime.generateResponse({
        agentId: 'weather-agent',
        normalizedPrompt: 'Quero ajuda para priorizar o dia',
        threadId: 'thread-1',
        resourceId: 'telegram:1',
        requestContext: new RequestContext(),
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        text: 'Rota do agente não suportada nesta versão.',
        workflowId: 'telegram-unsupported-route',
      }),
    );
  });
});
