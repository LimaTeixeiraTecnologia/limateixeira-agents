import { randomUUID } from 'node:crypto';
import type { Pool, QueryResult, QueryResultRow } from 'pg';
import type {
  AdapterError,
  AllowedTelegramUser,
  TelegramHealthReport,
  TelegramOutboundMessage,
  TelegramProcessResult,
  TelegramStoreDependencies,
  TelegramUpdateEnvelope,
} from './types';

type RowResult<T extends QueryResultRow> = QueryResult<T>;

function toDbBigInt(value: bigint): string {
  return value.toString();
}

function fromNullableStringBigInt(
  value: string | null | undefined,
): bigint | null {
  return value == null ? null : BigInt(value);
}

export class PostgresTelegramStore implements TelegramStoreDependencies {
  constructor(private readonly pool: Pick<Pool, 'query'>) {}

  async resolveActiveUser(
    telegramUserId: bigint,
  ): Promise<AllowedTelegramUser | null> {
    const result = await this.pool.query<{
      person_key: string;
      display_name: string;
      reference_email: string;
      reference_phone: string;
      telegram_user_id: string | null;
      telegram_username: string | null;
      status: AllowedTelegramUser['status'];
    }>(
      `SELECT person_key, display_name, reference_email, reference_phone,
              telegram_user_id, telegram_username, status
         FROM agents.telegram_allowed_users
        WHERE telegram_user_id = $1
          AND status = 'active'`,
      [toDbBigInt(telegramUserId)],
    );

    const row = result.rows[0];
    if (!row) {
      return null;
    }

    return {
      personKey: row.person_key,
      displayName: row.display_name,
      referenceEmail: row.reference_email,
      referencePhone: row.reference_phone,
      telegramUserId: fromNullableStringBigInt(row.telegram_user_id),
      telegramUsername: row.telegram_username,
      status: row.status,
    };
  }

  async registerIncoming(update: TelegramUpdateEnvelope): Promise<'new' | 'duplicate'> {
    const result = await this.pool.query(
      `INSERT INTO agents.telegram_webhook_events (
        update_id,
        telegram_user_id,
        telegram_chat_id,
        update_type,
        status,
        payload_json
      ) VALUES ($1, $2, $3, $4, 'received', $5::jsonb)
      ON CONFLICT (update_id) DO NOTHING`,
      [
        toDbBigInt(update.updateId),
        update.telegramUserId === 0n ? null : toDbBigInt(update.telegramUserId),
        update.telegramChatId === 0n ? null : toDbBigInt(update.telegramChatId),
        update.updateType,
        JSON.stringify(update.payloadJson),
      ],
    );

    return result.rowCount === 0 ? 'duplicate' : 'new';
  }

  async markIgnored(updateId: bigint, reason: string): Promise<void> {
    await this.pool.query(
      `UPDATE agents.telegram_webhook_events
          SET status = 'ignored',
              ignore_reason = $2,
              processed_at = now()
        WHERE update_id = $1`,
      [toDbBigInt(updateId), reason],
    );
  }

  async markProcessed(
    updateId: bigint,
    result: TelegramProcessResult,
  ): Promise<void> {
    await this.pool.query(
      `UPDATE agents.telegram_webhook_events
          SET status = 'processed',
              processed_at = now()
        WHERE update_id = $1`,
      [toDbBigInt(updateId)],
    );

    if (result.agentId && result.mastraThreadId) {
      await this.pool.query(
        `UPDATE agents.telegram_chat_sessions
            SET current_agent_id = $2,
                last_seen_at = now()
          WHERE mastra_thread_id = $1`,
        [result.mastraThreadId, result.agentId],
      );
    }
  }

  async markFailed(updateId: bigint, error: AdapterError): Promise<void> {
    await this.pool.query(
      `UPDATE agents.telegram_webhook_events
          SET status = 'failed',
              error_code = $2,
              processed_at = now()
        WHERE update_id = $1`,
      [toDbBigInt(updateId), error.code],
    );
  }

  async getCurrentAgentId(telegramChatId: bigint): Promise<string | null> {
    const result = await this.pool.query<{ current_agent_id: string }>(
      `SELECT current_agent_id
         FROM agents.telegram_chat_sessions
        WHERE telegram_chat_id = $1`,
      [toDbBigInt(telegramChatId)],
    );
    return result.rows[0]?.current_agent_id ?? null;
  }

  async getOrCreateThread(input: {
    telegramChatId: bigint;
    telegramUserId: bigint;
    currentAgentId: string;
  }): Promise<{ mastraThreadId: string }> {
    const existing = await this.pool.query<{ mastra_thread_id: string }>(
      `SELECT mastra_thread_id
         FROM agents.telegram_chat_sessions
        WHERE telegram_chat_id = $1`,
      [toDbBigInt(input.telegramChatId)],
    );

    const current = existing.rows[0];
    if (current) {
      await this.pool.query(
        `UPDATE agents.telegram_chat_sessions
            SET telegram_user_id = $2,
                current_agent_id = $3,
                last_seen_at = now()
          WHERE telegram_chat_id = $1`,
        [
          toDbBigInt(input.telegramChatId),
          toDbBigInt(input.telegramUserId),
          input.currentAgentId,
        ],
      );
      return { mastraThreadId: current.mastra_thread_id };
    }

    const mastraThreadId = randomUUID();
    await this.pool.query(
      `INSERT INTO agents.telegram_chat_sessions (
        telegram_chat_id,
        telegram_user_id,
        mastra_thread_id,
        current_agent_id
      ) VALUES ($1, $2, $3, $4)`,
      [
        toDbBigInt(input.telegramChatId),
        toDbBigInt(input.telegramUserId),
        mastraThreadId,
        input.currentAgentId,
      ],
    );

    return { mastraThreadId };
  }

  async recordOutboundSent(
    input: TelegramOutboundMessage & { telegramMessageId: bigint },
  ): Promise<void> {
    await this.pool.query(
      `INSERT INTO agents.telegram_outbound_messages (
        id,
        update_id,
        telegram_chat_id,
        mastra_thread_id,
        status,
        telegram_message_id,
        response_text,
        sent_at
      ) VALUES ($1, $2, $3, $4, 'sent', $5, $6, now())`,
      [
        randomUUID(),
        toDbBigInt(input.updateId),
        toDbBigInt(input.telegramChatId),
        input.mastraThreadId,
        toDbBigInt(input.telegramMessageId),
        input.responseText,
      ],
    );
  }

  async recordOutboundFailed(
    input: TelegramOutboundMessage & { errorCode: string },
  ): Promise<void> {
    await this.pool.query(
      `INSERT INTO agents.telegram_outbound_messages (
        id,
        update_id,
        telegram_chat_id,
        mastra_thread_id,
        status,
        response_text,
        error_code
      ) VALUES ($1, $2, $3, $4, 'failed', $5, $6)`,
      [
        randomUUID(),
        toDbBigInt(input.updateId),
        toDbBigInt(input.telegramChatId),
        input.mastraThreadId,
        input.responseText,
        input.errorCode,
      ],
    );
  }

  async getHealthReport(): Promise<TelegramHealthReport['allowlist']> {
    const result: RowResult<{
      total: string;
      active: string;
      pending_link: string;
      disabled: string;
    }> = await this.pool.query(
      `SELECT
         COUNT(*)::text AS total,
         COUNT(*) FILTER (WHERE status = 'active')::text AS active,
         COUNT(*) FILTER (WHERE status = 'pending_link')::text AS pending_link,
         COUNT(*) FILTER (WHERE status = 'disabled')::text AS disabled
       FROM agents.telegram_allowed_users`,
    );

    const row = result.rows[0];
    return {
      total: Number(row?.total ?? '0'),
      active: Number(row?.active ?? '0'),
      pendingLink: Number(row?.pending_link ?? '0'),
      disabled: Number(row?.disabled ?? '0'),
    };
  }
}
