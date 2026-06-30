import { describe, expect, it } from 'vitest';
import {
  TELEGRAM_HELP_TEXT,
  TELEGRAM_LEGACY_WEATHER_TEXT,
  TELEGRAM_OFFICIAL_AGENT_ID,
} from './constants';
import { DeterministicTelegramRouter } from './router';
import type { TelegramInboundMessage, TelegramRouteResult } from './types';

function createMessage(text: string): TelegramInboundMessage {
  return {
    updateId: 1n,
    telegramUserId: 2n,
    telegramChatId: 3n,
    telegramUsername: 'tester',
    text,
    updateType: 'message',
  };
}

describe('deterministic telegram router', () => {
  const router = new DeterministicTelegramRouter();
  const cases: Array<{
    name: string;
    text: string;
    currentAgentId: string | null;
    expected: TelegramRouteResult;
  }> = [
    {
      name: 'retorna help para /help',
      text: '/help',
      currentAgentId: null,
      expected: { kind: 'help', message: TELEGRAM_HELP_TEXT },
    },
    {
      name: 'retorna help para /start',
      text: '/start',
      currentAgentId: null,
      expected: { kind: 'help', message: TELEGRAM_HELP_TEXT },
    },
    {
      name: 'desativa o comando legado /weather',
      text: '/weather recife',
      currentAgentId: null,
      expected: { kind: 'legacy_weather', message: TELEGRAM_LEGACY_WEATHER_TEXT },
    },
    {
      name: 'roteia texto livre para marcos-agent',
      text: 'Quero ajuda para priorizar o dia',
      currentAgentId: null,
      expected: {
        kind: 'agent',
        agentId: TELEGRAM_OFFICIAL_AGENT_ID,
        normalizedPrompt: 'Quero ajuda para priorizar o dia',
      },
    },
    {
      name: 'mantém marcos-agent como destino oficial em continuidade sem comando',
      text: 'Continue de onde paramos',
      currentAgentId: TELEGRAM_OFFICIAL_AGENT_ID,
      expected: {
        kind: 'agent',
        agentId: TELEGRAM_OFFICIAL_AGENT_ID,
        normalizedPrompt: 'Continue de onde paramos',
      },
    },
    {
      name: 'comando desconhecido cai para help',
      text: '/status',
      currentAgentId: TELEGRAM_OFFICIAL_AGENT_ID,
      expected: { kind: 'help', message: TELEGRAM_HELP_TEXT },
    },
  ];

  it.each(cases)('$name', async ({ text, currentAgentId, expected }) => {
    await expect(router.route(createMessage(text), currentAgentId)).resolves.toEqual(expected);
  });
});
