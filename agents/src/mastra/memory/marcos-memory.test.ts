import { Memory } from '@mastra/memory';
import { describe, expect, it } from 'vitest';
import { readMarcosDocument } from '../knowledge/marcos';
import {
  createMarcosMemory,
  MARCOS_WORKING_MEMORY_TEMPLATE,
  sanitizeMarcosMemoryFacts,
  selectRelevantMarcosMemoryFacts,
} from './marcos-memory';

describe('marcos memory policy', () => {
  it('configura memória persistente com working memory habilitada', async () => {
    const memory = createMarcosMemory();

    expect(memory).toBeInstanceOf(Memory);
    expect(MARCOS_WORKING_MEMORY_TEMPLATE.content).toContain(
      '# Marcos Working Memory',
    );
  });

  it('bloqueia segredos e documentos oficiais completos na memória persistente', () => {
    const result = sanitizeMarcosMemoryFacts([
      {
        key: 'apiToken',
        scope: 'long_term',
        source: 'user',
        value: 'sk-secret-123',
      },
      {
        key: 'constitutionCopy',
        scope: 'semantic',
        source: 'system',
        value: readMarcosDocument('docs/agents/marcos/01_constituicao_do_marcos.md'),
      },
      {
        key: 'preferred_channel',
        scope: 'long_term',
        source: 'user',
        value: 'telegram',
      },
    ]);

    expect(result.accepted).toEqual([
      expect.objectContaining({ key: 'preferred_channel' }),
    ]);
    expect(result.blocked).toHaveLength(2);
  });

  it('seleciona apenas fatos relevantes para a tarefa atual', () => {
    const selected = selectRelevantMarcosMemoryFacts(
      [
        {
          key: 'current_goal',
          scope: 'working',
          source: 'audit',
          value: 'priorizar backlog de produto',
        },
        {
          key: 'brand_voice',
          scope: 'long_term',
          source: 'user',
          value: 'tom executivo e claro',
        },
        {
          key: 'sales_playbook',
          scope: 'episodic',
          source: 'audit',
          value: 'follow-up comercial de Q1',
        },
      ],
      'preciso priorizar o produto desta semana',
      2,
    );

    expect(selected).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: 'current_goal' }),
      ]),
    );
    expect(selected.length).toBeLessThanOrEqual(2);
  });
});
