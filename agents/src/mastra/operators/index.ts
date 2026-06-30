import { marcosKnowledgeManifest } from '../knowledge/marcos';
import { marcosToolRegistry } from '../tools/marcos-tool-contract';

export type MarcosOperator = {
  execute(input: {
    approvalRequired?: boolean;
    correlationId: string;
    operation: string;
    payload: Record<string, unknown>;
    toolId: string;
    workflowId?: string;
  }): Promise<unknown>;
  id: string;
  sourceDoc: string;
  supportedToolIds: string[];
  title: string;
};

const operatorEntries = marcosKnowledgeManifest.filter(
  entry => entry.kind === 'operator',
);

export const marcosOperatorRegistry: Record<string, MarcosOperator> =
  Object.fromEntries(
    operatorEntries.map(entry => [
      entry.id,
      {
        execute: async input => {
          const tool = marcosToolRegistry[input.toolId];
          if (!tool) {
            throw new Error(`tool não registrada para operator ${entry.id}: ${input.toolId}`);
          }

          return tool.execute({
            context: {
              approvalRequired: input.approvalRequired,
              workflowId: input.workflowId,
            },
            correlationId: input.correlationId,
            metadata: {
              operatorId: entry.id,
            },
            operation: input.operation,
            payload: input.payload,
          });
        },
        id: entry.id,
        sourceDoc: entry.path,
        supportedToolIds: Object.keys(marcosToolRegistry),
        title: toTitle(entry.id),
      },
    ]),
  ) as Record<string, MarcosOperator>;

function toTitle(id: string): string {
  return id
    .replace(/^\d+-/, '')
    .replace(/-operator$/, '')
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
