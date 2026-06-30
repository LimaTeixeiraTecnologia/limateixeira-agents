import { describe, expect, it } from 'vitest';
import { marcosKnowledgeManifest } from '../knowledge/marcos';
import { marcosCapabilityRegistry } from './index';

describe('marcos capability registry', () => {
  it('cobre todos os documentos de capability do manifesto', () => {
    const expected = marcosKnowledgeManifest.filter(
      entry => entry.kind === 'capability',
    );

    expect(Object.keys(marcosCapabilityRegistry).sort()).toEqual(
      expected.map(entry => entry.id).sort(),
    );
  });
});
