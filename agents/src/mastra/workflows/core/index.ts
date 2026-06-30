import { createWorkflow, createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import { postgresPool } from '../../storage';
import { recordMarcosExecutionAudit } from '../../audit/marcos-execution-audit';
import {
  bootstrapMarcosHumanApprovalsSchema,
  createMarcosHumanApproval,
  getMarcosHumanApprovalById,
  resolveMarcosHumanApproval,
  type MarcosApprovalDecision,
} from './marcos-human-approvals';

const marcosCoreWorkflowInputSchema = z.object({
  approvalType: z.string().min(1).optional(),
  correlationId: z.string().min(1),
  evidence: z.array(z.string()).default([]),
  objective: z.string().min(1),
  requestedBy: z.string().min(1),
  requiresApproval: z.boolean().default(false),
  summary: z.string().min(1),
});

const marcosCoreApprovalResumeSchema = z.object({
  decision: z.enum(['approved', 'rejected', 'adjustments']),
  notes: z.string().min(1).optional(),
  resolvedBy: z.string().min(1),
});

const marcosCoreApprovalSuspendSchema = z.object({
  approvalId: z.string(),
  reason: z.string(),
  summary: z.string(),
});

const marcosCoreWorkflowOutputSchema = z.object({
  approvalId: z.string().nullable(),
  approvalStatus: z.enum([
    'adjustments_requested',
    'approved',
    'not_required',
    'pending',
    'rejected',
  ]),
  correlationId: z.string(),
  nextAction: z.string(),
  workflowId: z.string(),
});

type MarcosCoreWorkflowDefinition = {
  approvalType: string;
  capabilityIds: string[];
  id: string;
  knowledgeDocumentIds: string[];
  title: string;
};

const dailyPlanningDefinition: MarcosCoreWorkflowDefinition = {
  approvalType: 'daily_planning',
  capabilityIds: ['08-analytics-insights-capability', '12-market-research-capability'],
  id: 'marcos-daily-planning',
  knowledgeDocumentIds: ['01-daily-planning-workflow'],
  title: 'Daily Planning',
};

const humanApprovalDefinition: MarcosCoreWorkflowDefinition = {
  approvalType: 'human_approval',
  capabilityIds: ['08-analytics-insights-capability'],
  id: 'marcos-human-approval',
  knowledgeDocumentIds: ['04-human-approval-workflow'],
  title: 'Human Approval',
};

const knowledgeUpdateDefinition: MarcosCoreWorkflowDefinition = {
  approvalType: 'knowledge_update',
  capabilityIds: ['08-analytics-insights-capability'],
  id: 'marcos-knowledge-update',
  knowledgeDocumentIds: ['06-knowledge-update-workflow'],
  title: 'Knowledge Update',
};

const notificationDefinition: MarcosCoreWorkflowDefinition = {
  approvalType: 'notification',
  capabilityIds: ['03-copywriting-capability'],
  id: 'marcos-notification',
  knowledgeDocumentIds: ['07-notification-workflow'],
  title: 'Notification',
};

const reportGenerationDefinition: MarcosCoreWorkflowDefinition = {
  approvalType: 'report_generation',
  capabilityIds: ['08-analytics-insights-capability', '04-storytelling-capability'],
  id: 'marcos-report-generation',
  knowledgeDocumentIds: ['05-report-generation-workflow'],
  title: 'Report Generation',
};

function createMarcosCoreWorkflow(definition: MarcosCoreWorkflowDefinition) {
  const prepareStep = createStep({
    id: `${definition.id}-prepare`,
    inputSchema: marcosCoreWorkflowInputSchema,
    outputSchema: z.object({
      approvalType: z.string(),
      correlationId: z.string(),
      evidence: z.array(z.string()),
      requestedBy: z.string(),
      requiresApproval: z.boolean(),
      summary: z.string(),
    }),
    execute: async ({ inputData }) => ({
      approvalType: inputData.approvalType ?? definition.approvalType,
      correlationId: inputData.correlationId,
      evidence: inputData.evidence,
      requestedBy: inputData.requestedBy,
      requiresApproval: inputData.requiresApproval,
      summary: inputData.summary,
    }),
  });

  const approvalStep = createStep({
    id: `${definition.id}-approval`,
    inputSchema: z.object({
      approvalType: z.string(),
      correlationId: z.string(),
      evidence: z.array(z.string()),
      requestedBy: z.string(),
      requiresApproval: z.boolean(),
      summary: z.string(),
    }),
    outputSchema: z.object({
      approvalId: z.string().nullable(),
      approvalStatus: z.enum([
        'adjustments_requested',
        'approved',
        'not_required',
        'rejected',
      ]),
      resolvedBy: z.string().nullable(),
    }),
    resumeSchema: marcosCoreApprovalResumeSchema,
    suspendSchema: marcosCoreApprovalSuspendSchema,
    execute: async ({
      inputData,
      resumeData,
      runId,
      suspend,
      suspendData,
    }) => {
      if (!inputData.requiresApproval) {
        return {
          approvalId: null,
          approvalStatus: 'not_required' as const,
          resolvedBy: null,
        };
      }

      if (!resumeData) {
        const approval = await createMarcosHumanApproval(postgresPool, {
          approvalType: inputData.approvalType,
          requestedPayload: {
            correlationId: inputData.correlationId,
            evidence: inputData.evidence,
            requestedBy: inputData.requestedBy,
            summary: inputData.summary,
          },
          stepId: `${definition.id}-approval`,
          workflowId: definition.id,
          workflowRunId: runId,
        });

        return suspend({
          approvalId: approval.id,
          reason: 'Human approval required.',
          summary: inputData.summary,
        });
      }

      const approvalId = suspendData?.approvalId;
      if (typeof approvalId !== 'string') {
        throw new Error('approvalId ausente na retomada do workflow');
      }

      await resolveMarcosHumanApproval(postgresPool, approvalId, {
        decision: resumeData.decision,
        resolvedBy: resumeData.resolvedBy,
        resolvedPayload: {
          notes: resumeData.notes,
        },
      });

      return {
        approvalId,
        approvalStatus: mapDecisionToStatus(resumeData.decision),
        resolvedBy: resumeData.resolvedBy,
      };
    },
  });

  const finalizeStep = createStep({
    id: `${definition.id}-finalize`,
    inputSchema: z.object({
      approvalId: z.string().nullable(),
      approvalStatus: z.enum([
        'adjustments_requested',
        'approved',
        'not_required',
        'rejected',
      ]),
      resolvedBy: z.string().nullable(),
    }),
    outputSchema: marcosCoreWorkflowOutputSchema,
    execute: async ({ inputData, getInitData }) => {
      const initData = getInitData() as z.infer<typeof marcosCoreWorkflowInputSchema>;

      return {
        approvalId: inputData.approvalId,
        approvalStatus: inputData.approvalStatus,
        correlationId: initData.correlationId,
        nextAction: buildNextAction(definition.title, inputData.approvalStatus),
        workflowId: definition.id,
      };
    },
  });

  return createWorkflow({
    id: definition.id,
    inputSchema: marcosCoreWorkflowInputSchema,
    outputSchema: marcosCoreWorkflowOutputSchema,
    options: {
      validateInputs: true,
      onFinish: async result => {
        const initData = result.getInitData() as z.infer<typeof marcosCoreWorkflowInputSchema>;
        await recordMarcosExecutionAudit(postgresPool, {
          approvalStatus:
            result.status === 'suspended'
              ? 'pending'
              : result.result?.approvalStatus === 'approved'
                ? 'approved'
                : result.result?.approvalStatus === 'rejected'
                  ? 'rejected'
                  : 'not_required',
          capabilityIds: definition.capabilityIds,
          correlationId: initData.correlationId,
          decisionSummary:
            result.status === 'suspended'
              ? `${definition.title} aguardando aprovação humana.`
              : `${definition.title} finalizado com status ${result.result?.approvalStatus ?? 'desconhecido'}.`,
          knowledgeDocumentIds: definition.knowledgeDocumentIds,
          resourceId: result.resourceId ?? 'marcos:workflow',
          threadId: result.runId,
          workflowId: definition.id,
        });
      },
    },
  })
    .then(prepareStep)
    .then(approvalStep)
    .then(finalizeStep)
    .commit();
}

function buildNextAction(
  workflowTitle: string,
  approvalStatus: z.infer<typeof marcosCoreWorkflowOutputSchema>['approvalStatus'],
): string {
  switch (approvalStatus) {
    case 'approved':
      return `${workflowTitle} aprovado para continuidade operacional.`;
    case 'rejected':
      return `${workflowTitle} encerrado por rejeição humana.`;
    case 'adjustments_requested':
      return `${workflowTitle} requer ajustes antes de nova submissão.`;
    case 'pending':
      return `${workflowTitle} aguardando decisão humana.`;
    default:
      return `${workflowTitle} pode seguir sem aprovação adicional.`;
  }
}

function mapDecisionToStatus(decision: MarcosApprovalDecision) {
  switch (decision) {
    case 'approved':
      return 'approved' as const;
    case 'rejected':
      return 'rejected' as const;
    case 'adjustments':
      return 'adjustments_requested' as const;
  }
}

export const marcosDailyPlanningWorkflow =
  createMarcosCoreWorkflow(dailyPlanningDefinition);
export const marcosHumanApprovalWorkflow =
  createMarcosCoreWorkflow(humanApprovalDefinition);
export const marcosKnowledgeUpdateWorkflow =
  createMarcosCoreWorkflow(knowledgeUpdateDefinition);
export const marcosNotificationWorkflow =
  createMarcosCoreWorkflow(notificationDefinition);
export const marcosReportGenerationWorkflow =
  createMarcosCoreWorkflow(reportGenerationDefinition);

export const marcosCoreWorkflows = {
  marcosDailyPlanningWorkflow,
  marcosHumanApprovalWorkflow,
  marcosKnowledgeUpdateWorkflow,
  marcosNotificationWorkflow,
  marcosReportGenerationWorkflow,
} as const;

export { bootstrapMarcosHumanApprovalsSchema };

export async function resolveMarcosApprovalAndResume(
  mastra: {
    getWorkflowById(id: string): {
      createRun(args: { runId: string }): Promise<{
        resume(args: { resumeData: z.infer<typeof marcosCoreApprovalResumeSchema> }): Promise<unknown>;
      }>;
    };
  },
  approvalId: string,
  resolution: z.infer<typeof marcosCoreApprovalResumeSchema>,
) {
  const approval = await getMarcosHumanApprovalById(postgresPool, approvalId);
  if (!approval) {
    throw new Error(`aprovação não encontrada: ${approvalId}`);
  }
  if (approval.status !== 'pending') {
    throw new Error(`aprovação ${approvalId} já foi resolvida`);
  }

  const workflow = mastra.getWorkflowById(approval.workflowId);
  const run = await workflow.createRun({ runId: approval.workflowRunId });
  return run.resume({
    resumeData: resolution,
  });
}
