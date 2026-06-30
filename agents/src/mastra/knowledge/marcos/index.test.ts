import { describe, expect, it } from 'vitest';
import {
  type MarcosKnowledgeManifestEntry,
  marcosKnowledgeManifest,
  validateMarcosKnowledgeManifest,
} from './index';

describe('marcos knowledge manifest', () => {
  it('mantém o inventário documental explícito e pronto para a fundação inicial', () => {
    const report = validateMarcosKnowledgeManifest();

    expect(marcosKnowledgeManifest.length).toBeGreaterThan(10);
    expect(report.ready).toBe(true);
    expect(report.missingFiles).toEqual([]);
    expect(report.missingRequiredKinds).toEqual([]);
    expect(report.duplicateIds).toEqual([]);
    expect(report.duplicatePaths).toEqual([]);
  });

  it('falha quando o manifesto perde tipos obrigatórios ou referencia arquivo inexistente', () => {
    const incompleteManifest: readonly MarcosKnowledgeManifestEntry[] = [
      {
        id: 'system',
        path: 'docs/agents/marcos/00_system_prompt.md',
        kind: 'system-prompt',
        tags: [],
      },
      {
        id: 'duplicated',
        path: 'docs/agents/marcos/inexistente.md',
        kind: 'handbook',
        tags: [],
      },
      {
        id: 'duplicated',
        path: 'docs/agents/marcos/inexistente.md',
        kind: 'handbook',
        tags: [],
      },
    ];

    const report = validateMarcosKnowledgeManifest(
      incompleteManifest,
      relativePath => relativePath === 'docs/agents/marcos/00_system_prompt.md',
    );

    expect(report.ready).toBe(false);
    expect(report.missingRequiredKinds).toEqual(
      expect.arrayContaining(['constitution', 'architecture', 'standard']),
    );
    expect(report.duplicateIds).toEqual(['duplicated']);
    expect(report.duplicatePaths).toEqual(['docs/agents/marcos/inexistente.md']);
    expect(report.missingFiles).toEqual(['docs/agents/marcos/inexistente.md', 'docs/agents/marcos/inexistente.md']);
  });
});
