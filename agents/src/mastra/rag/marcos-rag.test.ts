import { describe, expect, it } from 'vitest';
import { buildMarcosRagLexicon, scoreMarcosRagCandidate } from './marcos-rag';
import type { MarcosKnowledgeChunk } from '../knowledge/marcos';

describe('marcos rag helpers', () => {
  it('normaliza a consulta em léxico útil para retrieval seletivo', () => {
    expect(buildMarcosRagLexicon('Quero um plano de growth para produto e conteúdo')).toEqual([
      'quero',
      'plano',
      'growth',
      'produto',
      'conteúdo',
    ]);
  });

  it.each([
    {
      candidate: {
        content: 'Plano de growth com foco em experimentação e aquisição.',
        metadata: {
          capability: 'growth',
          category: 'capability',
          date: '2026-06-29T00:00:00.000Z',
          diretor: 'marcos' as const,
          documento: 'growth.md',
          headingPath: ['# Growth'],
          id: 'growth-doc',
          namespace: 'growth' as const,
          tags: ['growth'],
          version: '1.0',
          workflow: null,
        },
      },
      expectedMinScore: 5,
      lexicon: ['growth', 'experimentação'],
    },
    {
      candidate: {
        content: 'Norma de governança para aprovações humanas.',
        metadata: {
          capability: null,
          category: 'standard',
          date: '2026-06-29T00:00:00.000Z',
          diretor: 'marcos' as const,
          documento: 'standard.md',
          headingPath: ['# Governance'],
          id: 'governance-doc',
          namespace: 'governance' as const,
          tags: ['approval'],
          version: '1.0',
          workflow: null,
        },
      },
      expectedMinScore: 4,
      lexicon: ['governance', 'approval'],
    },
  ] as const)('pontua chunk relevante por conteúdo e metadados', ({ candidate, expectedMinScore, lexicon }) => {
    expect(
      scoreMarcosRagCandidate(
        candidate as unknown as Pick<MarcosKnowledgeChunk, 'content' | 'metadata'>,
        lexicon,
      ),
    ).toBeGreaterThanOrEqual(expectedMinScore);
  });
});
