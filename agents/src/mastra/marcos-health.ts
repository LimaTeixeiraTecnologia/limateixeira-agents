import { registerApiRoute } from '@mastra/core/server';
import { TELEGRAM_OFFICIAL_AGENT_ID } from '../telegram/constants';
import type { TelegramHealthReport } from '../telegram/types';
import { MARCOS_AGENT_REGISTRY_KEY } from './agents/constants';
import {
  type MarcosDocumentKind,
  MARCOS_KNOWLEDGE_STATUS_PATH,
  type MarcosKnowledgeStatusReport,
  type MarcosKnowledgeValidationReport,
  getMarcosKnowledgeStatus,
  validateMarcosKnowledgeManifest,
} from './knowledge/marcos';
import { marcosToolRegistry } from './tools/marcos-tool-contract';

export const MARCOS_HEALTH_PATH = '/marcos/health';

export type MarcosToolRegistryHealth = {
  expectedTotal: number;
  readOnly: number;
  real: number;
  registeredTotal: number;
  schemaReady: boolean;
  stub: number;
  synced: boolean;
};

export type MarcosApprovalQueueHealth = {
  approved: number;
  pending: number;
  rejected: number;
  schemaReady: boolean;
};

export type MarcosHealthReport = {
  ready: boolean;
  officialAgentId: string;
  registeredAgentKeys: string[];
  legacyWeatherActive: boolean;
  knowledge?: MarcosKnowledgeStatusReport;
  manifest: MarcosKnowledgeValidationReport;
  blockers: string[];
  telegram?: TelegramHealthReport;
  approvals?: MarcosApprovalQueueHealth;
  tools?: MarcosToolRegistryHealth;
};

type AgentRegistry = {
  listAgents(): Record<string, { id: string }>;
};

export function createMarcosHealthReport(
  agentRegistry: AgentRegistry,
  knowledge?: MarcosKnowledgeStatusReport,
  runtimeGates?: {
    approvals?: MarcosApprovalQueueHealth;
    telegram?: TelegramHealthReport;
    tools?: MarcosToolRegistryHealth;
  },
): MarcosHealthReport {
  const registeredAgents = agentRegistry.listAgents();
  const registeredAgentKeys = Object.keys(registeredAgents).sort();
  const registeredOfficialAgent =
    registeredAgents[MARCOS_AGENT_REGISTRY_KEY]?.id === TELEGRAM_OFFICIAL_AGENT_ID;
  const legacyWeatherActive = Object.values(registeredAgents).some(
    agent => agent.id === 'weather-agent',
  );
  const hasUnexpectedAgents = registeredAgentKeys.some(
    key => key !== MARCOS_AGENT_REGISTRY_KEY,
  );
  const manifest = knowledge?.manifest ?? validateMarcosKnowledgeManifest();

  const blockers = [
    ...(knowledge?.blockers ?? manifest.blockers),
    ...(registeredOfficialAgent
      ? []
      : [
          `agente oficial não registrado em Mastra com a chave ${MARCOS_AGENT_REGISTRY_KEY} e id ${TELEGRAM_OFFICIAL_AGENT_ID}`,
        ]),
    ...(hasUnexpectedAgents
      ? [
          `registro Mastra contém agentes extras fora da fundação inicial: ${registeredAgentKeys.join(', ')}`,
        ]
      : []),
    ...(legacyWeatherActive
      ? ['runtime ainda expõe referência ativa ao legado weather-agent']
      : []),
    ...(runtimeGates?.telegram?.ready
      ? []
      : (runtimeGates?.telegram?.blockers ?? []).map(
          blocker => `telegram: ${blocker}`,
        )),
    ...(runtimeGates?.approvals?.schemaReady ?? true
      ? []
      : ['schema de aprovações humanas indisponível']),
    ...(runtimeGates?.tools?.schemaReady ?? true
      ? []
      : ['schema do tool registry indisponível']),
    ...(runtimeGates?.tools && !runtimeGates.tools.synced
      ? [
          `tool registry incompleto: ${runtimeGates.tools.registeredTotal}/${runtimeGates.tools.expectedTotal} tools sincronizadas`,
        ]
      : []),
  ];

  return {
    ready: blockers.length === 0,
    officialAgentId: TELEGRAM_OFFICIAL_AGENT_ID,
    registeredAgentKeys,
    legacyWeatherActive,
    knowledge,
    manifest,
    blockers,
    telegram: runtimeGates?.telegram,
    approvals: runtimeGates?.approvals,
    tools: runtimeGates?.tools,
  };
}

export function getMarcosHealthReport(agentRegistry: AgentRegistry): MarcosHealthReport {
  return createMarcosHealthReport(agentRegistry);
}

export async function getMarcosRuntimeHealthReport(
  agentRegistry: AgentRegistry,
): Promise<MarcosHealthReport> {
  const { telegramConfig } = await import('./config');
  const { createTelegramAdapter } = await import('../telegram');
  const { postgresPool } = await import('./storage');
  const knowledge = await getMarcosKnowledgeStatus(postgresPool);
  const telegramAdapter = createTelegramAdapter({
    config: telegramConfig,
    pool: postgresPool,
  });
  const [telegram, approvals, tools] = await Promise.all([
    telegramAdapter.service.getHealthReport(),
    getMarcosApprovalQueueHealth(postgresPool),
    getMarcosToolRegistryHealth(postgresPool),
  ]);

  return createMarcosHealthReport(agentRegistry, knowledge, {
    approvals,
    telegram,
    tools,
  });
}

export const marcosHealthRoute = registerApiRoute(MARCOS_HEALTH_PATH, {
  method: 'GET',
  handler: async c => {
    const report = await getMarcosRuntimeHealthReport(c.get('mastra') as AgentRegistry);
    return c.json(report, { status: (report.ready ? 200 : 503) as 200 });
  },
});

export const marcosKnowledgeStatusRoute = registerApiRoute(MARCOS_KNOWLEDGE_STATUS_PATH, {
  method: 'GET',
  handler: async c => {
    const { postgresPool } = await import('./storage');
    const report = await getMarcosKnowledgeStatus(postgresPool);
    return c.json(report, { status: (report.ready ? 200 : 503) as 200 });
  },
});

export function createEmptyDocumentsByKind(): Record<MarcosDocumentKind, number> {
  return {
    constitution: 0,
    'system-prompt': 0,
    capability: 0,
    workflow: 0,
    operator: 0,
    tool: 0,
    handbook: 0,
    standard: 0,
    architecture: 0,
  };
}

async function getMarcosApprovalQueueHealth(
  pool: { query: (...args: never[]) => Promise<{ rows: Array<Record<string, unknown>> }> },
): Promise<MarcosApprovalQueueHealth> {
  try {
    const result = await pool.query(
      `
        SELECT status, COUNT(*)::int AS total
        FROM agents.marcos_human_approvals
        GROUP BY status
      ` as never,
    );
    const counts = new Map(
      result.rows.map(row => [String(row.status), Number(row.total ?? 0)]),
    );

    return {
      approved: counts.get('approved') ?? 0,
      pending: counts.get('pending') ?? 0,
      rejected: counts.get('rejected') ?? 0,
      schemaReady: true,
    };
  } catch {
    return {
      approved: 0,
      pending: 0,
      rejected: 0,
      schemaReady: false,
    };
  }
}

async function getMarcosToolRegistryHealth(
  pool: { query: (...args: never[]) => Promise<{ rows: Array<Record<string, unknown>> }> },
): Promise<MarcosToolRegistryHealth> {
  try {
    const result = await pool.query(
      `
        SELECT implementation_status, COUNT(*)::int AS total
        FROM agents.marcos_tool_registry
        GROUP BY implementation_status
      ` as never,
    );
    const counts = new Map(
      result.rows.map(row => [
        String(row.implementation_status),
        Number(row.total ?? 0),
      ]),
    );
    const registeredTotal = [...counts.values()].reduce(
      (sum, value) => sum + value,
      0,
    );
    const expectedTotal = Object.keys(marcosToolRegistry).length;

    return {
      expectedTotal,
      readOnly: counts.get('read-only') ?? 0,
      real: counts.get('real') ?? 0,
      registeredTotal,
      schemaReady: true,
      stub: counts.get('stub') ?? 0,
      synced: registeredTotal === expectedTotal,
    };
  } catch {
    return {
      expectedTotal: Object.keys(marcosToolRegistry).length,
      readOnly: 0,
      real: 0,
      registeredTotal: 0,
      schemaReady: false,
      stub: 0,
      synced: false,
    };
  }
}
