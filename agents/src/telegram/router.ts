import { TELEGRAM_HELP_TEXT } from './constants';
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
    const { command, remainder } = normalizeCommand(message.text);

    if (command === '/help' || command === '/start') {
      return { kind: 'help', message: TELEGRAM_HELP_TEXT };
    }

    if (command === '/weather') {
      return {
        kind: 'agent',
        agentId: 'weather-agent',
        normalizedPrompt: remainder || 'Quero saber o clima.',
      };
    }

    if (!command && currentAgentId === 'weather-agent') {
      return {
        kind: 'agent',
        agentId: 'weather-agent',
        normalizedPrompt: message.text.trim(),
      };
    }

    return { kind: 'help', message: TELEGRAM_HELP_TEXT };
  }
}
