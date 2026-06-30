import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const marcosDocumentKindSchema = z.enum([
  'constitution',
  'system-prompt',
  'capability',
  'workflow',
  'operator',
  'tool',
  'handbook',
  'standard',
  'architecture',
]);

export type MarcosDocumentKind = z.infer<typeof marcosDocumentKindSchema>;

export type MarcosKnowledgeManifestEntry = {
  id: string;
  path: string;
  kind: MarcosDocumentKind;
  tags: readonly string[];
};

export type MarcosKnowledgeValidationReport = {
  ready: boolean;
  totalDocuments: number;
  missingFiles: string[];
  missingRequiredKinds: MarcosDocumentKind[];
  duplicateIds: string[];
  duplicatePaths: string[];
  blockers: string[];
  documentsByKind: Record<MarcosDocumentKind, number>;
};

const repositoryRoot = findRepositoryRoot();

export const marcosKnowledgeManifest = [
  { id: '00-system-prompt', path: 'docs/agents/marcos/00_system_prompt.md', kind: 'system-prompt', tags: [] },
  { id: '01-constituicao-do-marcos', path: 'docs/agents/marcos/01_constituicao_do_marcos.md', kind: 'constitution', tags: [] },
  { id: '01-content-planning-workflow', path: 'docs/agents/marcos/01_content_planning_workflow.md', kind: 'workflow', tags: [] },
  { id: '01-daily-planning-workflow', path: 'docs/agents/marcos/01_daily_planning_workflow.md', kind: 'workflow', tags: [] },
  { id: '01-instagram-operator', path: 'docs/agents/marcos/01_instagram_operator.md', kind: 'operator', tags: [] },
  { id: '01-instagram-tool', path: 'docs/agents/marcos/01_instagram_tool.md', kind: 'tool', tags: [] },
  { id: '01-social-media-operations-skill', path: 'docs/agents/marcos/01_social_media_operations_skill.md', kind: 'capability', tags: ['skill'] },
  { id: '02-content-production-workflow', path: 'docs/agents/marcos/02_content_production_workflow.md', kind: 'workflow', tags: [] },
  { id: '02-content-strategy-capability', path: 'docs/agents/marcos/02_content_strategy_capability.md', kind: 'capability', tags: [] },
  { id: '02-corporate-intelligence-base-me-controla', path: 'docs/agents/marcos/02_corporate_intelligence_base_me_controla.md', kind: 'handbook', tags: ['base'] },
  { id: '02-facebook-operator', path: 'docs/agents/marcos/02_facebook_operator.md', kind: 'operator', tags: [] },
  { id: '02-facebook-tool', path: 'docs/agents/marcos/02_facebook_tool.md', kind: 'tool', tags: [] },
  { id: '02-weekly-planning-workflow', path: 'docs/agents/marcos/02_weekly_planning_workflow.md', kind: 'workflow', tags: [] },
  { id: '03-content-approval-workflow', path: 'docs/agents/marcos/03_content_approval_workflow.md', kind: 'workflow', tags: [] },
  { id: '03-copywriting-capability', path: 'docs/agents/marcos/03_copywriting_capability.md', kind: 'capability', tags: [] },
  { id: '03-growth-masterbook', path: 'docs/agents/marcos/03_growth_masterbook.md', kind: 'handbook', tags: ['masterbook'] },
  { id: '03-meta-ads-operator', path: 'docs/agents/marcos/03_meta_ads_operator.md', kind: 'operator', tags: [] },
  { id: '03-meta-ads-tool', path: 'docs/agents/marcos/03_meta_ads_tool.md', kind: 'tool', tags: [] },
  { id: '03-task-execution-workflow', path: 'docs/agents/marcos/03_task_execution_workflow.md', kind: 'workflow', tags: [] },
  { id: '04-human-approval-workflow', path: 'docs/agents/marcos/04_human_approval_workflow.md', kind: 'workflow', tags: [] },
  { id: '04-marketing-operating-system', path: 'docs/agents/marcos/04_marketing_operating_system.md', kind: 'handbook', tags: ['operating-system'] },
  { id: '04-multi-channel-publishing-workflow', path: 'docs/agents/marcos/04_multi_channel_publishing_workflow.md', kind: 'workflow', tags: [] },
  { id: '04-storytelling-capability', path: 'docs/agents/marcos/04_storytelling_capability.md', kind: 'capability', tags: [] },
  { id: '04-whatsapp-operator', path: 'docs/agents/marcos/04_whatsapp_operator.md', kind: 'operator', tags: [] },
  { id: '04-whatsapp-tool', path: 'docs/agents/marcos/04_whatsapp_tool.md', kind: 'tool', tags: [] },
  { id: '05-branding-capability', path: 'docs/agents/marcos/05_branding_capability.md', kind: 'capability', tags: [] },
  { id: '05-content-performance-analysis-workflow', path: 'docs/agents/marcos/05_content_performance_analysis_workflow.md', kind: 'workflow', tags: [] },
  { id: '05-creative-performance-handbook', path: 'docs/agents/marcos/05_creative_performance_handbook.md', kind: 'handbook', tags: ['handbook'] },
  { id: '05-postgresql-operator', path: 'docs/agents/marcos/05_postgresql_operator.md', kind: 'operator', tags: [] },
  { id: '05-postgresql-tool', path: 'docs/agents/marcos/05_postgresql_tool.md', kind: 'tool', tags: [] },
  { id: '05-report-generation-workflow', path: 'docs/agents/marcos/05_report_generation_workflow.md', kind: 'workflow', tags: [] },
  { id: '06-creative-production-capability', path: 'docs/agents/marcos/06_creative_production_capability.md', kind: 'capability', tags: [] },
  { id: '06-kiwify-operator', path: 'docs/agents/marcos/06_kiwify_operator.md', kind: 'operator', tags: [] },
  { id: '06-kiwify-tool', path: 'docs/agents/marcos/06_kiwify_tool.md', kind: 'tool', tags: [] },
  { id: '06-knowledge-update-workflow', path: 'docs/agents/marcos/06_knowledge_update_workflow.md', kind: 'workflow', tags: [] },
  { id: '06-product-strategy-handbook', path: 'docs/agents/marcos/06_product_strategy_handbook.md', kind: 'handbook', tags: ['handbook'] },
  { id: '07-business-operating-system', path: 'docs/agents/marcos/07_business_operating_system.md', kind: 'handbook', tags: ['operating-system'] },
  { id: '07-creative-performance-capability', path: 'docs/agents/marcos/07_creative_performance_capability.md', kind: 'capability', tags: [] },
  { id: '07-creative-performance-capability-1', path: 'docs/agents/marcos/07_creative_performance_capability_1.md', kind: 'capability', tags: [] },
  { id: '07-google-drive-operator', path: 'docs/agents/marcos/07_google_drive_operator.md', kind: 'operator', tags: [] },
  { id: '07-google-drive-tool', path: 'docs/agents/marcos/07_google_drive_tool.md', kind: 'tool', tags: [] },
  { id: '07-notification-workflow', path: 'docs/agents/marcos/07_notification_workflow.md', kind: 'workflow', tags: [] },
  { id: '08-ai-governance-handbook', path: 'docs/agents/marcos/08_ai_governance_handbook.md', kind: 'handbook', tags: ['handbook'] },
  { id: '08-analytics-insights-capability', path: 'docs/agents/marcos/08_analytics_insights_capability.md', kind: 'capability', tags: [] },
  { id: '08-llm-operator', path: 'docs/agents/marcos/08_llm_operator.md', kind: 'operator', tags: [] },
  { id: '08-llm-tool', path: 'docs/agents/marcos/08_llm_tool.md', kind: 'tool', tags: [] },
  { id: '09-image-ai-operator', path: 'docs/agents/marcos/09_image_ai_operator.md', kind: 'operator', tags: [] },
  { id: '09-image-ai-tool', path: 'docs/agents/marcos/09_image_ai_tool.md', kind: 'tool', tags: [] },
  { id: '09-product-discovery-capability', path: 'docs/agents/marcos/09_product_discovery_capability.md', kind: 'capability', tags: [] },
  { id: '10-notification-operator', path: 'docs/agents/marcos/10_notification_operator.md', kind: 'operator', tags: [] },
  { id: '10-search-tool', path: 'docs/agents/marcos/10_search_tool.md', kind: 'tool', tags: [] },
  { id: '10-ux-conversation-capability', path: 'docs/agents/marcos/10_ux_conversation_capability.md', kind: 'capability', tags: [] },
  { id: '11-growth-experimentation-capability', path: 'docs/agents/marcos/11_growth_experimentation_capability.md', kind: 'capability', tags: [] },
  { id: '12-market-research-capability', path: 'docs/agents/marcos/12_market_research_capability.md', kind: 'capability', tags: [] },
  { id: 'agent-lifecycle-v1', path: 'docs/agents/marcos/agent_lifecycle_v1.md', kind: 'architecture', tags: [] },
  { id: 'ai-architecture-standard', path: 'docs/agents/marcos/ai_architecture_standard.md', kind: 'architecture', tags: [] },
  { id: 'context-loading-strategy-v1', path: 'docs/agents/marcos/context_loading_strategy_v1.md', kind: 'architecture', tags: [] },
  { id: 'development-standards', path: 'docs/agents/marcos/development_standards.md', kind: 'standard', tags: [] },
  { id: 'evaluation-standard', path: 'docs/agents/marcos/evaluation_standard.md', kind: 'standard', tags: [] },
  { id: 'implementation-guide-v1', path: 'docs/agents/marcos/implementation_guide_v1.md', kind: 'handbook', tags: ['guide'] },
  { id: 'marcos-agent', path: 'docs/agents/marcos/marcos_agent.md', kind: 'handbook', tags: [] },
  { id: 'memory-architecture-v1', path: 'docs/agents/marcos/memory_architecture_v1.md', kind: 'architecture', tags: [] },
  { id: 'prompt-engineering-standard', path: 'docs/agents/marcos/prompt_engineering_standard.md', kind: 'standard', tags: [] },
  { id: 'rag-architecture-v1', path: 'docs/agents/marcos/rag_architecture_v1.md', kind: 'architecture', tags: [] },
  { id: 'tool-contract-standard', path: 'docs/agents/marcos/tool_contract_standard.md', kind: 'standard', tags: [] },
] as const satisfies readonly MarcosKnowledgeManifestEntry[];

export const marcosRequiredDocumentKinds = [
  'constitution',
  'system-prompt',
  'handbook',
  'standard',
  'architecture',
] as const satisfies readonly MarcosDocumentKind[];

export function resolveMarcosKnowledgePath(relativePath: string): string {
  return resolve(repositoryRoot, relativePath);
}

export function readMarcosDocument(relativePath: string): string {
  return readFileSync(resolveMarcosKnowledgePath(relativePath), 'utf8').trim();
}

export function composeMarcosFoundationalInstructions(): string {
  const selectedDocuments = marcosKnowledgeManifest.filter(entry =>
    ['constitution', 'system-prompt'].includes(entry.kind) || entry.id === 'marcos-agent',
  );

  return selectedDocuments
    .map(entry => {
      const content = readMarcosDocument(entry.path);
      return `## ${entry.id}\n${content}`;
    })
    .join('\n\n');
}

export function validateMarcosKnowledgeManifest(
  entries: readonly MarcosKnowledgeManifestEntry[] = marcosKnowledgeManifest,
  fileExists: (relativePath: string) => boolean = relativePath =>
    existsSync(resolveMarcosKnowledgePath(relativePath)),
): MarcosKnowledgeValidationReport {
  const duplicateIds = collectDuplicates(entries.map(entry => entry.id));
  const duplicatePaths = collectDuplicates(entries.map(entry => entry.path));
  const missingFiles = entries
    .filter(entry => !fileExists(entry.path))
    .map(entry => entry.path);

  const documentsByKind = marcosDocumentKindSchema.options.reduce(
    (acc, kind) => ({
      ...acc,
      [kind]: entries.filter(entry => entry.kind === kind).length,
    }),
    {} as Record<MarcosDocumentKind, number>,
  );

  const missingRequiredKinds = marcosRequiredDocumentKinds.filter(
    kind => documentsByKind[kind] === 0,
  );

  const blockers = [
    ...missingFiles.map(path => `documento obrigatório ausente no filesystem: ${path}`),
    ...missingRequiredKinds.map(kind => `manifesto sem cobertura do tipo obrigatório: ${kind}`),
    ...duplicateIds.map(id => `manifesto com id duplicado: ${id}`),
    ...duplicatePaths.map(path => `manifesto com path duplicado: ${path}`),
  ];

  return {
    ready: blockers.length === 0,
    totalDocuments: entries.length,
    missingFiles,
    missingRequiredKinds: [...missingRequiredKinds],
    duplicateIds,
    duplicatePaths,
    blockers,
    documentsByKind,
  };
}

function collectDuplicates(values: readonly string[]): string[] {
  const counts = new Map<string, number>();

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([value]) => value)
    .sort();
}

function findRepositoryRoot(): string {
  const startPoints = [process.cwd(), dirname(fileURLToPath(import.meta.url))];

  for (const startPoint of startPoints) {
    let current = startPoint;

    for (let depth = 0; depth < 8; depth += 1) {
      if (existsSync(resolve(current, 'docs/agents/marcos/00_system_prompt.md'))) {
        return current;
      }

      const parent = resolve(current, '..');
      if (parent === current) {
        break;
      }
      current = parent;
    }
  }

  return resolve(process.cwd(), '..');
}
