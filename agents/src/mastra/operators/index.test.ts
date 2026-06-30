import { describe, expect, it } from 'vitest';
import { marcosKnowledgeManifest } from '../knowledge/marcos';
import { marcosOperatorRegistry } from './index';

describe('marcos operator registry', () => {
  it('cobre todos os documentos de operator do manifesto', () => {
    const expected = marcosKnowledgeManifest.filter(
      entry => entry.kind === 'operator',
    );

    expect(Object.keys(marcosOperatorRegistry).sort()).toEqual(
      expected.map(entry => entry.id).sort(),
    );
  });

  it('orquestra tools registradas com o contrato padrão', async () => {
    const result = await marcosOperatorRegistry['01-instagram-operator'].execute({
      approvalRequired: false,
      correlationId: 'corr-operator',
      operation: 'publish-post',
      payload: {},
      toolId: '01-instagram-tool',
      workflowId: 'wf-1',
    });

    expect(result).toEqual(
      expect.objectContaining({
        correlationId: 'corr-operator',
        success: true,
      }),
    );
  });
});
