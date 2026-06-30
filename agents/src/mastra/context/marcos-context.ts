import type { RequestContext } from '@mastra/core/request-context';
import {
  composeMarcosFoundationalInstructions,
  marcosKnowledgeManifest,
  readMarcosDocument,
  type MarcosKnowledgeChunk,
} from '../knowledge/marcos';
import {
  retrieveMarcosKnowledgeChunks,
  type MarcosRagQuery,
  type MarcosRagResult,
} from '../rag/marcos-rag';
import {
  marcosMemoryPolicy,
  sanitizeMarcosMemoryFacts,
  selectRelevantMarcosMemoryFacts,
  type MarcosMemoryFact,
} from '../memory/marcos-memory';

export type MarcosContextSourceKind =
  | 'capability'
  | 'constitution'
  | 'memory'
  | 'rag'
  | 'system-prompt'
  | 'workflow';

export type MarcosExecutionContext = {
  applicableCapabilities: string[];
  applicableWorkflows: string[];
  identityPrompt: string;
  memoryPolicy: {
    knowledgePrecedence: 'knowledge';
    readOnly: boolean;
    requiresApproval: boolean;
  };
  relevantMemoryFacts: MarcosMemoryFact[];
  requestContextSnapshot: Record<string, unknown>;
  retrievedKnowledge: MarcosKnowledgeChunk[];
  sourceTrace: Array<{
    id: string;
    kind: MarcosContextSourceKind;
    reason: string;
  }>;
  tokenEstimate: number;
};

export type MarcosContextBuildInput = {
  capabilityIds?: string[];
  memoryFacts?: MarcosMemoryFact[];
  queryText: string;
  ragLimit?: number;
  requestContext?: RequestContext;
  workflowIds?: string[];
};

type MarcosContextDependencies = {
  retrieveKnowledge: (query: MarcosRagQuery) => Promise<MarcosRagResult[]>;
};

const CONSTITUTION_ENTRY = marcosKnowledgeManifest.find(
  entry => entry.kind === 'constitution',
);
const SYSTEM_PROMPT_ENTRY = marcosKnowledgeManifest.find(
  entry => entry.kind === 'system-prompt',
);

if (!CONSTITUTION_ENTRY || !SYSTEM_PROMPT_ENTRY) {
  throw new Error('manifesto Marcos inválido: documentos fundacionais ausentes');
}

const REQUIRED_CONSTITUTION_ENTRY = CONSTITUTION_ENTRY;
const REQUIRED_SYSTEM_PROMPT_ENTRY = SYSTEM_PROMPT_ENTRY;

export async function buildMarcosExecutionContext(
  pool: { query: (...args: never[]) => Promise<unknown> },
  input: MarcosContextBuildInput,
  deps: Partial<MarcosContextDependencies> = {},
): Promise<MarcosExecutionContext> {
  const memoryFacts = sanitizeMarcosMemoryFacts(input.memoryFacts ?? []).accepted;
  const relevantMemoryFacts = selectRelevantMarcosMemoryFacts(
    memoryFacts,
    input.queryText,
  );
  const retrieveKnowledge =
    deps.retrieveKnowledge ??
    ((query: MarcosRagQuery) =>
      retrieveMarcosKnowledgeChunks(pool as never, query));

  const retrievedKnowledge = await retrieveKnowledge({
    limit: input.ragLimit ?? 4,
    queryText: input.queryText,
  });
  const applicableCapabilities = [
    ...(input.capabilityIds ?? []),
    ...new Set(
      retrievedKnowledge
        .map(chunk => chunk.metadata.capability)
        .filter((value): value is string => Boolean(value)),
    ),
  ];
  const applicableWorkflows = [
    ...(input.workflowIds ?? []),
    ...new Set(
      retrievedKnowledge
        .map(chunk => chunk.metadata.workflow)
        .filter((value): value is string => Boolean(value)),
    ),
  ];

  const sourceTrace: MarcosExecutionContext['sourceTrace'] = [
    {
      id: REQUIRED_CONSTITUTION_ENTRY.id,
      kind: 'constitution',
      reason: 'identidade permanente sempre carregada',
    },
    {
      id: REQUIRED_SYSTEM_PROMPT_ENTRY.id,
      kind: 'system-prompt',
      reason: 'instruções permanentes sempre carregadas',
    },
    ...relevantMemoryFacts.map(fact => ({
      id: fact.key,
      kind: 'memory' as const,
      reason: `memória ${fact.scope} relevante para a consulta atual`,
    })),
    ...applicableCapabilities.map(id => ({
      id,
      kind: 'capability' as const,
      reason: 'capability aplicável detectada por seleção explícita ou RAG',
    })),
    ...applicableWorkflows.map(id => ({
      id,
      kind: 'workflow' as const,
      reason: 'workflow aplicável detectado por seleção explícita ou RAG',
    })),
    ...retrievedKnowledge.map(chunk => ({
      id: chunk.metadata.id,
      kind: 'rag' as const,
      reason: 'chunk recuperado seletivamente para complementar a resposta',
    })),
  ];

  const tokenEstimate = estimateMarcosContextTokens({
    capabilityIds: applicableCapabilities,
    memoryFacts: relevantMemoryFacts,
    queryText: input.queryText,
    ragChunks: retrievedKnowledge,
    workflowIds: applicableWorkflows,
  });

  return {
    applicableCapabilities,
    applicableWorkflows,
    identityPrompt: composeMarcosFoundationalInstructions(),
    memoryPolicy: {
      knowledgePrecedence: marcosMemoryPolicy.knowledgePrecedence,
      readOnly: marcosMemoryPolicy.readOnlyPreview,
      requiresApproval: false,
    },
    relevantMemoryFacts,
    requestContextSnapshot: input.requestContext?.all ?? {},
    retrievedKnowledge,
    sourceTrace,
    tokenEstimate,
  };
}

export function describeMarcosContextHierarchy(): string[] {
  return [
    'constitution',
    'system-prompt',
    'memory',
    'capability',
    'workflow',
    'rag',
  ];
}

export function readMarcosFoundationalContext(): {
  constitution: string;
  systemPrompt: string;
} {
  return {
    constitution: readMarcosDocument(REQUIRED_CONSTITUTION_ENTRY.path),
    systemPrompt: readMarcosDocument(REQUIRED_SYSTEM_PROMPT_ENTRY.path),
  };
}

function estimateMarcosContextTokens(input: {
  capabilityIds: string[];
  memoryFacts: MarcosMemoryFact[];
  queryText: string;
  ragChunks: MarcosKnowledgeChunk[];
  workflowIds: string[];
}): number {
  const serialized = [
    input.queryText,
    ...input.capabilityIds,
    ...input.workflowIds,
    ...input.memoryFacts.map(fact => `${fact.key} ${fact.value}`),
    ...input.ragChunks.map(chunk => chunk.content),
  ].join(' ');

  return Math.ceil(serialized.split(/\s+/).filter(Boolean).length * 1.3);
}
