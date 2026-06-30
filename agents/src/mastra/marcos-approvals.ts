import { registerApiRoute } from '@mastra/core/server';
import { z } from 'zod';
import { resolveMarcosApprovalAndResume } from './workflows/core';

const marcosApprovalResolutionSchema = z.object({
  decision: z.enum(['approved', 'rejected', 'adjustments']),
  notes: z.string().min(1).optional(),
  resolvedBy: z.string().min(1),
});

export const MARCOS_APPROVAL_RESOLVE_PATH = '/marcos/approvals/:approvalId/resolve';

export const marcosApprovalResolveRoute = registerApiRoute(
  MARCOS_APPROVAL_RESOLVE_PATH,
  {
    method: 'POST',
    handler: async c => {
      const approvalId = c.req.param('approvalId');
      const body = marcosApprovalResolutionSchema.parse(await c.req.json());

      try {
        const result = await resolveMarcosApprovalAndResume(
          c.get('mastra') as never,
          approvalId,
          body,
        );

        return c.json({ status: 'resolved', result }, 200);
      } catch (error) {
        return c.json(
          {
            error: {
              code: 'marcos_approval_resolution_failed',
              message: error instanceof Error ? error.message : 'falha ao resolver aprovação',
            },
          },
          409,
        );
      }
    },
  },
);
