import type { Pool, PoolClient } from 'pg';
import { TELEGRAM_ALLOWED_PERSON_SEEDS } from './constants';

const TELEGRAM_SCHEMA_SQL = [
  'CREATE SCHEMA IF NOT EXISTS agents',
  `CREATE TABLE IF NOT EXISTS agents.telegram_allowed_users (
    person_key text PRIMARY KEY,
    display_name text NOT NULL,
    reference_email text NOT NULL,
    reference_phone text NOT NULL,
    telegram_user_id bigint UNIQUE NULL,
    telegram_username text NULL,
    status text NOT NULL CHECK (status IN ('pending_link', 'active', 'disabled')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS agents.telegram_chat_sessions (
    telegram_chat_id bigint PRIMARY KEY,
    telegram_user_id bigint NOT NULL,
    mastra_thread_id text UNIQUE NOT NULL,
    current_agent_id text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    last_seen_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS agents.telegram_webhook_events (
    update_id bigint PRIMARY KEY,
    telegram_user_id bigint NULL,
    telegram_chat_id bigint NULL,
    update_type text NOT NULL,
    status text NOT NULL CHECK (status IN ('received', 'ignored', 'processed', 'failed')),
    ignore_reason text NULL,
    error_code text NULL,
    payload_json jsonb NOT NULL,
    received_at timestamptz NOT NULL DEFAULT now(),
    processed_at timestamptz NULL
  )`,
  `CREATE TABLE IF NOT EXISTS agents.telegram_outbound_messages (
    id uuid PRIMARY KEY,
    update_id bigint NOT NULL REFERENCES agents.telegram_webhook_events(update_id),
    telegram_chat_id bigint NOT NULL,
    mastra_thread_id text NOT NULL,
    status text NOT NULL CHECK (status IN ('sent', 'failed')),
    telegram_message_id bigint NULL,
    response_text text NOT NULL,
    error_code text NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    sent_at timestamptz NULL
  )`,
  `CREATE INDEX IF NOT EXISTS telegram_webhook_events_status_idx
    ON agents.telegram_webhook_events (status, received_at DESC)`,
  `CREATE INDEX IF NOT EXISTS telegram_outbound_messages_update_idx
    ON agents.telegram_outbound_messages (update_id)`,
] as const;

async function runBootstrapStatements(client: PoolClient): Promise<void> {
  for (const statement of TELEGRAM_SCHEMA_SQL) {
    await client.query(statement);
  }

  for (const person of TELEGRAM_ALLOWED_PERSON_SEEDS) {
    await client.query(
      `INSERT INTO agents.telegram_allowed_users (
        person_key,
        display_name,
        reference_email,
        reference_phone,
        status
      ) VALUES ($1, $2, $3, $4, 'pending_link')
      ON CONFLICT (person_key) DO UPDATE
      SET display_name = EXCLUDED.display_name,
          reference_email = EXCLUDED.reference_email,
          reference_phone = EXCLUDED.reference_phone,
          updated_at = now()`,
      [
        person.personKey,
        person.displayName,
        person.referenceEmail,
        person.referencePhone,
      ],
    );
  }
}

export async function bootstrapTelegramSchema(
  pool: Pick<Pool, 'connect'>,
  options?: { useAdvisoryLock?: boolean },
): Promise<void> {
  const useAdvisoryLock = options?.useAdvisoryLock ?? true;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    if (useAdvisoryLock) {
      await client.query('SELECT pg_advisory_xact_lock(814276332155246116)');
    }
    await runBootstrapStatements(client);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
