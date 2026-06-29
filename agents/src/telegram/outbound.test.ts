import { afterEach, describe, expect, it, vi } from 'vitest';
import { HttpTelegramOutboundClient } from './outbound';

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe('telegram outbound client', () => {
  it('reenvia em falha transitória e conclui no segundo envio', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ ok: false, description: 'rate limited' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ ok: true, result: { message_id: 81 } }),
      });
    global.fetch = fetchMock as typeof fetch;

    const client = new HttpTelegramOutboundClient({
      enabled: true,
      botToken: 'bot-token',
      webhookPathKey: 'path-key',
      webhookSecretToken: 'secret-token',
      allowedUpdates: ['message'],
      publicBaseUrl: 'https://telegram.example.com',
    });

    const result = await client.sendText({
      updateId: 1n,
      telegramChatId: 2n,
      mastraThreadId: 'thread-1',
      responseText: 'ok',
    });

    expect(result).toEqual({ telegramMessageId: 81n });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('falha cedo quando outbound não está configurado', async () => {
    const client = new HttpTelegramOutboundClient({
      enabled: true,
      botToken: undefined,
      webhookPathKey: 'path-key',
      webhookSecretToken: 'secret-token',
      allowedUpdates: ['message'],
      publicBaseUrl: 'https://telegram.example.com',
    });

    await expect(
      client.sendText({
        updateId: 1n,
        telegramChatId: 2n,
        mastraThreadId: 'thread-1',
        responseText: 'ok',
      }),
    ).rejects.toMatchObject({ code: 'telegram_outbound_not_configured' });
  });
});
