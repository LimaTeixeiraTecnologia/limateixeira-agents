import { describe, expect, it } from 'vitest';
import {
  buildMarcosKnowledgeChunks,
  computeMarcosDocumentChecksum,
  inferMarcosKnowledgeNamespace,
} from './catalog';
import type { MarcosKnowledgeManifestEntry } from './index';

describe('marcos knowledge catalog helpers', () => {
  it.each([
    {
      entry: {
        id: '00-system-prompt',
        kind: 'system-prompt',
        path: 'docs/agents/marcos/00_system_prompt.md',
        tags: [],
      },
      expected: 'governance',
      title: 'System Prompt',
    },
    {
      entry: {
        id: '11-growth-experimentation-capability',
        kind: 'capability',
        path: 'docs/agents/marcos/11_growth_experimentation_capability.md',
        tags: [],
      },
      expected: 'growth',
      title: 'Growth Experimentation',
    },
    {
      entry: {
        id: '09-product-discovery-capability',
        kind: 'capability',
        path: 'docs/agents/marcos/09_product_discovery_capability.md',
        tags: [],
      },
      expected: 'product',
      title: 'Product Discovery',
    },
    {
      entry: {
        id: '03-copywriting-capability',
        kind: 'capability',
        path: 'docs/agents/marcos/03_copywriting_capability.md',
        tags: [],
      },
      expected: 'marketing',
      title: 'Copywriting Capability',
    },
    {
      entry: {
        id: '02-corporate-intelligence-base-me-controla',
        kind: 'handbook',
        path: 'docs/agents/marcos/02_corporate_intelligence_base_me_controla.md',
        tags: [],
      },
      expected: 'corporate',
      title: 'Corporate Intelligence',
    },
  ] as const)('classifica namespace de $entry.id', ({ entry, expected, title }) => {
    expect(
      inferMarcosKnowledgeNamespace(entry as MarcosKnowledgeManifestEntry, title),
    ).toBe(expected);
  });

  it('gera checksum estável e detecta mudança de conteúdo', () => {
    const original = computeMarcosDocumentChecksum('# Documento\n\nTexto base');
    const same = computeMarcosDocumentChecksum('# Documento\n\nTexto base');
    const changed = computeMarcosDocumentChecksum('# Documento\n\nTexto alterado');

    expect(original).toBe(same);
    expect(changed).not.toBe(original);
  });

  it('faz chunking preservando headings e metadados seletivos', () => {
    const entry: MarcosKnowledgeManifestEntry = {
      id: '03-task-execution-workflow',
      kind: 'workflow',
      path: 'docs/agents/marcos/03_task_execution_workflow.md',
      tags: ['core'],
    };
    const paragraph = Array.from({ length: 420 }, (_, index) => `item-${index}`).join(' ');
    const content = [
      '# Task Execution Workflow',
      '',
      'Versão: 1.0',
      '',
      '## Objetivo',
      '',
      paragraph,
      '',
      paragraph,
      '',
      '## Critérios',
      '',
      paragraph,
    ].join('\n');

    const chunks = buildMarcosKnowledgeChunks(entry, {
      content,
      title: 'Task Execution Workflow',
      updatedAt: '2026-06-29T00:00:00.000Z',
      version: '1.0',
    });

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0]?.content).toContain('# Task Execution Workflow');
    expect(chunks.some(chunk => chunk.content.includes('## Objetivo'))).toBe(true);
    expect(chunks.every(chunk => chunk.tokenCount > 0)).toBe(true);
    expect(
      chunks.every(chunk => chunk.metadata.workflow === '03-task-execution-workflow'),
    ).toBe(true);
    expect(chunks.every(chunk => chunk.metadata.capability === null)).toBe(true);
    expect(chunks.every(chunk => chunk.metadata.namespace === 'corporate')).toBe(true);
  });
});
