import type { RequestContext } from '@mastra/core/request-context';

export type TelegramIdentityStatus = 'pending_link' | 'active' | 'disabled';
export type TelegramEventStatus = 'received' | 'ignored' | 'processed' | 'failed';
export type TelegramUpdateType = 'message' | 'unsupported';
export type TelegramDuplicateStatus = 'new' | 'duplicate';

export type TelegramConfig = {
  enabled: boolean;
  botToken?: string;
  webhookPathKey?: string;
  webhookSecretToken?: string;
  allowedUpdates: ['message'];
  publicBaseUrl?: string;
};

export type AllowedTelegramUser = {
  personKey: string;
  displayName: string;
  referenceEmail: string;
  referencePhone: string;
  telegramUserId: bigint | null;
  telegramUsername: string | null;
  status: TelegramIdentityStatus;
};

export type TelegramInboundMessage = {
  updateId: bigint;
  telegramUserId: bigint;
  telegramChatId: bigint;
  telegramUsername: string | null;
  text: string;
  updateType: TelegramUpdateType;
};

export type TelegramUpdateEnvelope = TelegramInboundMessage & {
  payloadJson: Record<string, unknown>;
};

export type TelegramProcessResult = {
  agentId: string | null;
  mastraThreadId: string | null;
  responseText: string | null;
};

export type TelegramOutboundMessage = {
  updateId: bigint;
  telegramChatId: bigint;
  mastraThreadId: string;
  responseText: string;
};

export type TelegramSendResult = {
  telegramMessageId: bigint;
};

export type TelegramRouteResult =
  | { kind: 'agent'; agentId: string; normalizedPrompt: string }
  | { kind: 'legacy_weather'; message: string }
  | { kind: 'help'; message: string };

export type TelegramConversationInput = {
  telegramChatId: bigint;
  telegramUserId: bigint;
  currentAgentId: string;
};

export type TelegramAgentExecutionInput = {
  agentId: string;
  normalizedPrompt: string;
  threadId: string;
  resourceId: string;
  requestContext: RequestContext;
};

export type TelegramAgentExecutionResult = {
  approvalStatus: 'approved' | 'not_required' | 'pending' | 'rejected';
  capabilityIds: string[];
  correlationId: string;
  finishReason?: string;
  knowledgeDocumentIds: string[];
  text: string;
  tokenUsage?: number | null;
  toolIds: string[];
  workflowId: string;
};

export type TelegramHealthReport = {
  enabled: boolean;
  configValid: boolean;
  schemaReady: boolean;
  ready: boolean;
  allowlist: {
    total: number;
    active: number;
    pendingLink: number;
    disabled: number;
  };
  blockers: string[];
};

export interface TelegramAllowlistService {
  resolveActiveUser(telegramUserId: bigint): Promise<AllowedTelegramUser | null>;
}

export interface TelegramEventStore {
  registerIncoming(update: TelegramUpdateEnvelope): Promise<TelegramDuplicateStatus>;
  markIgnored(updateId: bigint, reason: string): Promise<void>;
  markProcessed(updateId: bigint, result: TelegramProcessResult): Promise<void>;
  markFailed(updateId: bigint, error: AdapterError): Promise<void>;
}

export interface TelegramConversationStore {
  getOrCreateThread(
    input: TelegramConversationInput,
  ): Promise<{ mastraThreadId: string }>;
}

export interface TelegramRouter {
  route(
    message: TelegramInboundMessage,
    currentAgentId: string | null,
  ): Promise<TelegramRouteResult>;
}

export interface TelegramOutboundClient {
  sendText(input: TelegramOutboundMessage): Promise<TelegramSendResult>;
}

export class AdapterError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly expose: boolean;

  constructor(
    code: string,
    message: string,
    options?: {
      cause?: unknown;
      statusCode?: number;
      expose?: boolean;
    },
  ) {
    super(message, { cause: options?.cause });
    this.name = 'AdapterError';
    this.code = code;
    this.statusCode = options?.statusCode ?? 500;
    this.expose = options?.expose ?? false;
  }
}

export type TelegramStoreDependencies = TelegramAllowlistService &
  TelegramEventStore &
  TelegramConversationStore & {
    getCurrentAgentId(telegramChatId: bigint): Promise<string | null>;
    recordOutboundSent(
      input: TelegramOutboundMessage & { telegramMessageId: bigint },
    ): Promise<void>;
    recordOutboundFailed(
      input: TelegramOutboundMessage & { errorCode: string },
    ): Promise<void>;
    getHealthReport(): Promise<TelegramHealthReport['allowlist']>;
  };
