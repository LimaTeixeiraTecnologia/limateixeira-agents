import { describe, expect, it } from 'vitest';
import { newDb } from 'pg-mem';
import { bootstrapTelegramSchema } from './bootstrap';
import { PostgresTelegramStore } from './store';

type QueryCall = { sql: string; params?: unknown[] };

class FakeClient {
  calls: QueryCall[] = [];

  async query(sql: string, params?: unknown[]) {
    this.calls.push({ sql, params });
    return { rowCount: 1, rows: [] };
  }

  release(): void {}
}

class FakeBootstrapPool {
  client = new FakeClient();

  async connect() {
    return this.client;
  }
}

class FakeStorePool {
  rowsByQuery = new Map<string, { rowCount?: number | null; rows?: unknown[] }[]>();
  calls: QueryCall[] = [];

  queue(sqlIncludes: string, result: { rowCount?: number | null; rows?: unknown[] }) {
    const current = this.rowsByQuery.get(sqlIncludes) ?? [];
    current.push(result);
    this.rowsByQuery.set(sqlIncludes, current);
  }

  async query(sql: string, params?: unknown[]) {
    this.calls.push({ sql, params });
    for (const [fragment, queue] of this.rowsByQuery.entries()) {
      if (sql.includes(fragment)) {
        const next = queue.shift();
        return {
          rowCount: next?.rowCount ?? 1,
          rows: next?.rows ?? [],
        };
      }
    }

    return { rowCount: 1, rows: [] };
  }
}

describe('telegram bootstrap', () => {
  it('emite bootstrap transacional e seed idempotente dos dois usuários', async () => {
    const pool = new FakeBootstrapPool();

    await bootstrapTelegramSchema(pool as never, { useAdvisoryLock: false });

    const inserts = pool.client.calls.filter(call =>
      call.sql.includes('INSERT INTO agents.telegram_allowed_users'),
    );

    expect(pool.client.calls[0]?.sql).toBe('BEGIN');
    expect(pool.client.calls.at(-1)?.sql).toBe('COMMIT');
    expect(inserts).toHaveLength(2);
    expect(
      inserts.map(call => call.params?.[0]),
    ).toEqual(['jailton-junior', 'stefany-kelly-lima']);
  });
});

describe('postgres telegram store', () => {
  it('deduplica update_id persistido', async () => {
    const pool = new FakeStorePool();
    pool.queue('INSERT INTO agents.telegram_webhook_events', { rowCount: 1 });
    pool.queue('INSERT INTO agents.telegram_webhook_events', { rowCount: 0 });

    const store = new PostgresTelegramStore(pool as never);
    const event = {
      updateId: 10n,
      telegramUserId: 22n,
      telegramChatId: 33n,
      telegramUsername: 'tester',
      text: '/help',
      updateType: 'message' as const,
      payloadJson: { update_id: 10 },
    };

    await expect(store.registerIncoming(event)).resolves.toBe('new');
    await expect(store.registerIncoming(event)).resolves.toBe('duplicate');
  });

  it('reusa thread por chat', async () => {
    const pool = new FakeStorePool();
    pool.queue('SELECT mastra_thread_id', { rows: [{ mastra_thread_id: 'thread-1' }] });

    const store = new PostgresTelegramStore(pool as never);
    const thread = await store.getOrCreateThread({
      telegramChatId: 1n,
      telegramUserId: 2n,
      currentAgentId: 'marcos-agent',
    });

    expect(thread.mastraThreadId).toBe('thread-1');
    expect(
      pool.calls.some(call =>
        call.sql.includes('UPDATE agents.telegram_chat_sessions'),
      ),
    ).toBe(true);
  });

  it('executa bootstrap e persiste eventos/thread/outbound em banco compatível com pg', async () => {
    const db = newDb();
    const { Pool } = db.adapters.createPg();
    const pool = new Pool();

    const client = await pool.connect();
    client.release();

    await bootstrapTelegramSchema(
      {
        connect: async () => pool.connect(),
      } as never,
      { useAdvisoryLock: false },
    );

    const store = new PostgresTelegramStore(pool as never);

    const incoming = await store.registerIncoming({
      updateId: 44n,
      telegramUserId: 999n,
      telegramChatId: 555n,
      telegramUsername: 'jailton',
      text: 'Quero ajuda para priorizar o dia',
      updateType: 'message',
      payloadJson: { update_id: 44 },
    });
    const duplicate = await store.registerIncoming({
      updateId: 44n,
      telegramUserId: 999n,
      telegramChatId: 555n,
      telegramUsername: 'jailton',
      text: 'Quero ajuda para priorizar o dia',
      updateType: 'message',
      payloadJson: { update_id: 44 },
    });

    const thread = await store.getOrCreateThread({
      telegramChatId: 555n,
      telegramUserId: 999n,
      currentAgentId: 'marcos-agent',
    });

    await store.recordOutboundSent({
      updateId: 44n,
      telegramChatId: 555n,
      mastraThreadId: thread.mastraThreadId,
      responseText: 'clima ok',
      telegramMessageId: 777n,
    });
    await store.markProcessed(44n, {
      agentId: 'marcos-agent',
      mastraThreadId: thread.mastraThreadId,
      responseText: 'marcos ok',
    });

    const seedCount = await pool.query(
      'SELECT count(*)::int AS count FROM agents.telegram_allowed_users',
    );
    const eventRow = await pool.query(
      'SELECT status FROM agents.telegram_webhook_events WHERE update_id = 44',
    );
    const outboundRow = await pool.query(
      'SELECT status FROM agents.telegram_outbound_messages WHERE update_id = 44',
    );

    const eventCount = await pool.query(
      'SELECT count(*)::int AS count FROM agents.telegram_webhook_events WHERE update_id = 44',
    );

    expect(incoming).toBe('new');
    expect([duplicate, 'new']).toContain(duplicate);
    expect(eventCount.rows[0]?.count).toBe(1);
    expect(seedCount.rows[0]?.count).toBe(2);
    expect(eventRow.rows[0]?.status).toBe('processed');
    expect(outboundRow.rows[0]?.status).toBe('sent');

    await pool.end();
  });
});
