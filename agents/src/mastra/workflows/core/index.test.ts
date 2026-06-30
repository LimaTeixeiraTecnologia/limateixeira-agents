import { afterEach, describe, expect, it, vi } from 'vitest';
import { Mastra } from '@mastra/core/mastra';
import { createWorkflowStateReader } from '@mastra/core/workflows';

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  vi.restoreAllMocks();
  vi.resetModules();
});

describe('marcos core workflows', () => {
  it('suspende quando aprovação humana é obrigatória e retoma com aprovação', async () => {
    process.env.DATABASE_URL = 'postgres://agents:secret@localhost:5432/agents';

    const approvalStore = new Map<string, Record<string, unknown>>();
    vi.doMock('../../storage', () => ({
      postgresPool: {},
    }));
    vi.doMock('./marcos-human-approvals', async importOriginal => {
      const actual =
        await importOriginal<typeof import('./marcos-human-approvals')>();

      return {
        ...actual,
        createMarcosHumanApproval: vi.fn(async (_pool, input) => {
          const record = {
            approvalType: input.approvalType,
            createdAt: new Date().toISOString(),
            id: 'approval-1',
            requestedAt: new Date().toISOString(),
            requestedPayload: input.requestedPayload,
            resolvedAt: null,
            resolvedBy: null,
            resolvedPayload: null,
            status: 'pending',
            stepId: input.stepId,
            workflowId: input.workflowId,
            workflowRunId: input.workflowRunId,
          };
          approvalStore.set('approval-1', record);
          return record;
        }),
        getMarcosHumanApprovalById: vi.fn(async (_pool, approvalId) => {
          return (approvalStore.get(approvalId) as never) ?? null;
        }),
        resolveMarcosHumanApproval: vi.fn(async (_pool, approvalId, input) => {
          const current = approvalStore.get(approvalId) as Record<string, unknown>;
          const next = {
            ...current,
            resolvedAt: new Date().toISOString(),
            resolvedBy: input.resolvedBy,
            resolvedPayload: input.resolvedPayload ?? null,
            status: input.decision === 'approved' ? 'approved' : 'rejected',
          };
          approvalStore.set(approvalId, next);
          return next as never;
        }),
      };
    });
    vi.doMock('../../audit/marcos-execution-audit', () => ({
      recordMarcosExecutionAudit: vi.fn(async () => undefined),
    }));

    const workflows = await import('./index');
    const mastra = new Mastra({
      workflows: {
        marcosDailyPlanningWorkflow: workflows.marcosDailyPlanningWorkflow,
      },
    });
    const workflow = mastra.getWorkflowById('marcos-daily-planning');
    const run = await workflow.createRun({ resourceId: 'telegram:1' });

    const suspended = await run.start({
      inputData: {
        correlationId: 'corr-1',
        objective: 'Planejar o dia',
        requestedBy: 'founder-1',
        requiresApproval: true,
        summary: 'Plano diário para revisão',
      },
    });

    expect(suspended.status).toBe('suspended');
    const reader = createWorkflowStateReader(
      (await workflow.getWorkflowRunById(run.runId))!,
    );
    const suspendedStep = reader.getSuspendedStep();

    expect(suspendedStep?.suspendPayload).toEqual(
      expect.objectContaining({ approvalId: 'approval-1' }),
    );

    const { resolveMarcosApprovalAndResume } = workflows;
    const resumed = await resolveMarcosApprovalAndResume(mastra as never, 'approval-1', {
      decision: 'approved',
      resolvedBy: 'founder-1',
    });

    expect((resumed as { status: string }).status).toBe('success');
  });

  it('finaliza como rejeitado quando a decisão humana reprova a ação', async () => {
    process.env.DATABASE_URL = 'postgres://agents:secret@localhost:5432/agents';

    const approvalStore = new Map<string, Record<string, unknown>>();
    vi.doMock('../../storage', () => ({
      postgresPool: {},
    }));
    vi.doMock('./marcos-human-approvals', async importOriginal => {
      const actual =
        await importOriginal<typeof import('./marcos-human-approvals')>();

      return {
        ...actual,
        createMarcosHumanApproval: vi.fn(async (_pool, input) => {
          const record = {
            approvalType: input.approvalType,
            createdAt: new Date().toISOString(),
            id: 'approval-2',
            requestedAt: new Date().toISOString(),
            requestedPayload: input.requestedPayload,
            resolvedAt: null,
            resolvedBy: null,
            resolvedPayload: null,
            status: 'pending',
            stepId: input.stepId,
            workflowId: input.workflowId,
            workflowRunId: input.workflowRunId,
          };
          approvalStore.set('approval-2', record);
          return record;
        }),
        getMarcosHumanApprovalById: vi.fn(async (_pool, approvalId) => {
          return (approvalStore.get(approvalId) as never) ?? null;
        }),
        resolveMarcosHumanApproval: vi.fn(async (_pool, approvalId, input) => {
          const current = approvalStore.get(approvalId) as Record<string, unknown>;
          const next = {
            ...current,
            resolvedAt: new Date().toISOString(),
            resolvedBy: input.resolvedBy,
            resolvedPayload: input.resolvedPayload ?? null,
            status: 'rejected',
          };
          approvalStore.set(approvalId, next);
          return next as never;
        }),
      };
    });
    vi.doMock('../../audit/marcos-execution-audit', () => ({
      recordMarcosExecutionAudit: vi.fn(async () => undefined),
    }));

    const workflows = await import('./index');
    const mastra = new Mastra({
      workflows: {
        marcosDailyPlanningWorkflow: workflows.marcosDailyPlanningWorkflow,
      },
    });
    const workflow = mastra.getWorkflowById('marcos-daily-planning');
    const run = await workflow.createRun({ resourceId: 'telegram:1' });

    await run.start({
      inputData: {
        correlationId: 'corr-2',
        objective: 'Planejar o dia',
        requestedBy: 'founder-1',
        requiresApproval: true,
        summary: 'Plano diário para revisão',
      },
    });

    const { resolveMarcosApprovalAndResume } = workflows;
    const resumed = await resolveMarcosApprovalAndResume(mastra as never, 'approval-2', {
      decision: 'rejected',
      resolvedBy: 'founder-2',
    });

    expect((resumed as { result: { approvalStatus: string } }).result.approvalStatus).toBe(
      'rejected',
    );
  });

  it('expõe o conjunto esperado de workflows core', async () => {
    process.env.DATABASE_URL = 'postgres://agents:secret@localhost:5432/agents';
    vi.doMock('../../storage', () => ({
      postgresPool: {},
    }));
    vi.doMock('../../audit/marcos-execution-audit', () => ({
      recordMarcosExecutionAudit: vi.fn(async () => undefined),
    }));
    const workflows = await import('./index');

    expect(Object.keys(workflows.marcosCoreWorkflows).sort()).toEqual([
      'marcosDailyPlanningWorkflow',
      'marcosHumanApprovalWorkflow',
      'marcosKnowledgeUpdateWorkflow',
      'marcosNotificationWorkflow',
      'marcosReportGenerationWorkflow',
    ]);
    expect(workflows.marcosDailyPlanningWorkflow.id).toBe('marcos-daily-planning');
  });
});
