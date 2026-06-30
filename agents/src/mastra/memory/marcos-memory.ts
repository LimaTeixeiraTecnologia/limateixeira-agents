import { Memory } from '@mastra/memory';
import type { WorkingMemoryTemplate } from '@mastra/core/memory';
import {
  marcosKnowledgeManifest,
  readMarcosDocument,
} from '../knowledge/marcos';

export type MarcosMemoryScope =
  | 'session'
  | 'working'
  | 'long_term'
  | 'episodic'
  | 'semantic';

export type MarcosMemoryFact = {
  key: string;
  scope: MarcosMemoryScope;
  source: 'audit' | 'system' | 'user';
  updatedAt?: string;
  value: string;
};

export type MarcosBlockedMemoryFact = {
  fact: MarcosMemoryFact;
  reason: string;
};

export type MarcosMemorySanitizationResult = {
  accepted: MarcosMemoryFact[];
  blocked: MarcosBlockedMemoryFact[];
};

export type MarcosMemoryPolicy = {
  forbiddenFieldPatterns: readonly RegExp[];
  forbiddenValuePatterns: readonly RegExp[];
  knowledgePrecedence: 'knowledge';
  longTermMaxFacts: number;
  maxFactValueChars: number;
  readOnlyPreview: boolean;
  workingMemoryScope: 'resource';
};

const OFFICIAL_DOCUMENT_SNAPSHOTS = marcosKnowledgeManifest.map(entry =>
  normalizeMemoryText(readMarcosDocument(entry.path)),
);

const FORBIDDEN_FIELD_PATTERNS = [
  /token/i,
  /secret/i,
  /password/i,
  /senha/i,
  /credential/i,
  /api[-_ ]?key/i,
] as const;

const FORBIDDEN_VALUE_PATTERNS = [
  /bearer\s+[a-z0-9._-]+/i,
  /sk-[a-z0-9]+/i,
  /ghp_[a-z0-9]+/i,
] as const;

const MAX_FACT_VALUE_CHARS = 600;
const DEFAULT_LONG_TERM_FACT_LIMIT = 4;
const MARCOS_WORKING_MEMORY_TEMPLATE_CONTENT = [
  '# Marcos Working Memory',
  '- User Preferences:',
  '- Current Goals:',
  '- Current Constraints:',
  '- Pending Approvals:',
  '- Recent Decisions:',
  '- Persistent Facts:',
].join('\n');

export const MARCOS_WORKING_MEMORY_TEMPLATE: WorkingMemoryTemplate = {
  format: 'markdown',
  content: MARCOS_WORKING_MEMORY_TEMPLATE_CONTENT,
};

export const marcosMemoryPolicy: MarcosMemoryPolicy = {
  forbiddenFieldPatterns: FORBIDDEN_FIELD_PATTERNS,
  forbiddenValuePatterns: FORBIDDEN_VALUE_PATTERNS,
  knowledgePrecedence: 'knowledge',
  longTermMaxFacts: DEFAULT_LONG_TERM_FACT_LIMIT,
  maxFactValueChars: MAX_FACT_VALUE_CHARS,
  readOnlyPreview: true,
  workingMemoryScope: 'resource',
};

export function createMarcosMemory(storage?: object): Memory {
  return new Memory({
    ...(storage ? { storage: storage as never } : {}),
    options: {
      generateTitle: false,
      lastMessages: 12,
      readOnly: false,
      semanticRecall: false,
      workingMemory: {
        enabled: true,
        scope: marcosMemoryPolicy.workingMemoryScope,
        template: MARCOS_WORKING_MEMORY_TEMPLATE_CONTENT,
      },
    },
  });
}

export function sanitizeMarcosMemoryFacts(
  facts: readonly MarcosMemoryFact[],
): MarcosMemorySanitizationResult {
  const accepted: MarcosMemoryFact[] = [];
  const blocked: MarcosBlockedMemoryFact[] = [];

  for (const fact of facts) {
    const normalizedKey = fact.key.trim();
    const normalizedValue = fact.value.trim();
    const normalizedFact: MarcosMemoryFact = {
      ...fact,
      key: normalizedKey,
      value: normalizedValue,
    };

    if (!normalizedKey || !normalizedValue) {
      blocked.push({
        fact: normalizedFact,
        reason: 'fato vazio não deve ser persistido',
      });
      continue;
    }

    if (
      FORBIDDEN_FIELD_PATTERNS.some(pattern => pattern.test(normalizedKey))
    ) {
      blocked.push({
        fact: normalizedFact,
        reason: 'campo proibido pela política de memória',
      });
      continue;
    }

    if (
      FORBIDDEN_VALUE_PATTERNS.some(pattern => pattern.test(normalizedValue))
    ) {
      blocked.push({
        fact: normalizedFact,
        reason: 'valor contém segredo ou credencial',
      });
      continue;
    }

    if (normalizedValue.length > MAX_FACT_VALUE_CHARS) {
      blocked.push({
        fact: normalizedFact,
        reason: 'valor excede o limite de memória persistente',
      });
      continue;
    }

    if (isOfficialDocumentReplay(normalizedValue)) {
      blocked.push({
        fact: normalizedFact,
        reason: 'documento oficial completo não pode ser gravado em memória',
      });
      continue;
    }

    accepted.push(normalizedFact);
  }

  return { accepted, blocked };
}

export function selectRelevantMarcosMemoryFacts(
  facts: readonly MarcosMemoryFact[],
  queryText: string,
  limit = DEFAULT_LONG_TERM_FACT_LIMIT,
): MarcosMemoryFact[] {
  const lexicon = tokenizeMemoryText(queryText);
  if (facts.length <= limit || lexicon.length === 0) {
    return [...facts].slice(0, limit);
  }

  return [...facts]
    .map(fact => ({
      fact,
      score: scoreMarcosMemoryFact(fact, lexicon),
    }))
    .filter(entry => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
    .map(entry => entry.fact);
}

function scoreMarcosMemoryFact(
  fact: MarcosMemoryFact,
  lexicon: readonly string[],
): number {
  const haystack = normalizeMemoryText(`${fact.key} ${fact.value}`);
  return lexicon.reduce((score, token) => {
    if (!haystack.includes(token)) {
      return score;
    }

    switch (fact.scope) {
      case 'working':
        return score + 4;
      case 'long_term':
        return score + 3;
      case 'episodic':
        return score + 2;
      case 'semantic':
        return score + 2;
      default:
        return score + 1;
    }
  }, 0);
}

function isOfficialDocumentReplay(value: string): boolean {
  const normalizedValue = normalizeMemoryText(value);
  return OFFICIAL_DOCUMENT_SNAPSHOTS.some(snapshot => snapshot === normalizedValue);
}

function tokenizeMemoryText(value: string): string[] {
  return [...new Set(normalizeMemoryText(value).split(' ').filter(Boolean))];
}

function normalizeMemoryText(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, ' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}
