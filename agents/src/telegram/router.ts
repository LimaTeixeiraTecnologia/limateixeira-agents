import {
  TELEGRAM_HELP_TEXT,
  TELEGRAM_LEGACY_WEATHER_TEXT,
  TELEGRAM_OFFICIAL_AGENT_ID,
} from './constants';
import type {
  TelegramInboundMessage,
  TelegramRouteResult,
  TelegramRouter,
} from './types';

function normalizeCommand(text: string): { command: string | null; remainder: string } {
  const trimmed = text.trim();
  if (!trimmed.startsWith('/')) {
    return { command: null, remainder: trimmed };
  }

  const [commandToken, ...rest] = trimmed.split(/\s+/);
  const command = commandToken.split('@')[0]?.toLowerCase() ?? null;
  return {
    command,
    remainder: rest.join(' ').trim(),
  };
}

export class DeterministicTelegramRouter implements TelegramRouter {
  async route(
    message: TelegramInboundMessage,
    currentAgentId: string | null,
  ): Promise<TelegramRouteResult> {
    const { command } = normalizeCommand(message.text);

    if (command === '/help' || command === '/start') {
      return { kind: 'help', message: TELEGRAM_HELP_TEXT };
    }

    if (command === '/weather') {
      return { kind: 'legacy_weather', message: TELEGRAM_LEGACY_WEATHER_TEXT };
    }

    if (!command && message.text.trim().length > 0) {
      return {
        kind: 'agent',
        agentId: TELEGRAM_OFFICIAL_AGENT_ID,
        normalizedPrompt: message.text.trim(),
      };
    }

    return { kind: 'help', message: TELEGRAM_HELP_TEXT };
  }
}
