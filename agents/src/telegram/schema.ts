import { z } from 'zod';
import type { TelegramInboundMessage, TelegramUpdateEnvelope } from './types';

const telegramTextMessageSchema = z.object({
  message_id: z.number().int().nonnegative(),
  from: z.object({
    id: z.number().int().nonnegative(),
    username: z.string().trim().min(1).optional(),
  }),
  chat: z.object({
    id: z.number().int(),
    type: z.string().trim().min(1),
  }),
  text: z.string(),
});

const telegramUpdateSchema = z.object({
  update_id: z.number().int().nonnegative(),
  message: telegramTextMessageSchema.optional(),
});

function numberToBigInt(value: number): bigint {
  return BigInt(value);
}

export function parseTelegramUpdate(
  payload: unknown,
): TelegramUpdateEnvelope {
  const parsed = telegramUpdateSchema.parse(payload);
  const message = parsed.message;

  if (!message) {
    return {
      updateId: numberToBigInt(parsed.update_id),
      telegramUserId: 0n,
      telegramChatId: 0n,
      telegramUsername: null,
      text: '',
      updateType: 'unsupported',
      payloadJson: payload as Record<string, unknown>,
    };
  }

  return {
    updateId: numberToBigInt(parsed.update_id),
    telegramUserId: numberToBigInt(message.from.id),
    telegramChatId: numberToBigInt(message.chat.id),
    telegramUsername: message.from.username ?? null,
    text: message.text,
    updateType:
      message.chat.type === 'private' && message.text.trim().length > 0
        ? 'message'
        : 'unsupported',
    payloadJson: payload as Record<string, unknown>,
  };
}

export function toInboundMessage(
  envelope: TelegramUpdateEnvelope,
): TelegramInboundMessage {
  const { payloadJson: _payloadJson, ...message } = envelope;
  return message;
}
