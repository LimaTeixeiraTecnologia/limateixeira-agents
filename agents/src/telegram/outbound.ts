import { TELEGRAM_SECRET_HEADER } from './constants';
import { mastraLogger } from '../logger';
import type {
  AdapterError,
  TelegramConfig,
  TelegramOutboundClient,
  TelegramOutboundMessage,
  TelegramSendResult,
} from './types';
import { AdapterError as TelegramAdapterError } from './types';

type TelegramSendResponse = {
  ok: boolean;
  result?: {
    message_id: number;
  };
  description?: string;
};

function isTransientStatus(status: number): boolean {
  return status === 408 || status === 429 || status >= 500;
}

export class HttpTelegramOutboundClient implements TelegramOutboundClient {
  constructor(private readonly config: TelegramConfig) {}

  private ensureReady(): void {
    if (!this.config.botToken) {
      throw new TelegramAdapterError(
        'telegram_outbound_not_configured',
        'configuração do bot do telegram ausente',
        { statusCode: 503, expose: false },
      );
    }
  }

  async sendText(input: TelegramOutboundMessage): Promise<TelegramSendResult> {
    this.ensureReady();

    let lastError: AdapterError | null = null;
    const endpoint = `https://api.telegram.org/bot${this.config.botToken}/sendMessage`;

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            [TELEGRAM_SECRET_HEADER]: this.config.webhookSecretToken ?? '',
          },
          body: JSON.stringify({
            chat_id: input.telegramChatId.toString(),
            text: input.responseText,
          }),
          signal: AbortSignal.timeout(5_000),
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as
            | TelegramSendResponse
            | null;
          const error = new TelegramAdapterError(
            'telegram_outbound_failed',
            payload?.description ?? 'falha ao enviar resposta ao telegram',
            {
              statusCode: response.status,
              expose: false,
            },
          );

          if (isTransientStatus(response.status) && attempt < 3) {
            lastError = error;
            continue;
          }

          throw error;
        }

        const payload = (await response.json()) as TelegramSendResponse;
        const messageId = payload.result?.message_id;
        if (!payload.ok || typeof messageId !== 'number') {
          throw new TelegramAdapterError(
            'telegram_outbound_invalid_response',
            'telegram retornou resposta inválida para sendMessage',
            { statusCode: 502, expose: false },
          );
        }

        return { telegramMessageId: BigInt(messageId) };
      } catch (error) {
        if (error instanceof TelegramAdapterError) {
          lastError = error;
          if (attempt < 3 && error.code === 'telegram_outbound_failed') {
            continue;
          }
        } else {
          lastError = new TelegramAdapterError(
            'telegram_outbound_unreachable',
            'telegram indisponível para envio outbound',
            { cause: error, statusCode: 502, expose: false },
          );
        }

        mastraLogger.warn('falha de outbound do telegram', {
          attempt,
          error: lastError.message,
          code: lastError.code,
        });

        if (attempt >= 3) {
          throw lastError;
        }
      }
    }

    throw lastError ?? new TelegramAdapterError(
      'telegram_outbound_failed',
      'falha ao enviar resposta ao telegram',
      { statusCode: 502, expose: false },
    );
  }
}
