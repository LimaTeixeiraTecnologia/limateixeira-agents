import { RequestContext } from '@mastra/core/request-context';
import { weatherAgent } from '../mastra/agents/weather-agent';
import type { TelegramAgentExecutionInput, TelegramAgentExecutionResult } from './types';

export interface TelegramAgentRuntime {
  generateResponse(
    input: TelegramAgentExecutionInput,
  ): Promise<TelegramAgentExecutionResult>;
}

export class MastraTelegramAgentRuntime implements TelegramAgentRuntime {
  async generateResponse(
    input: TelegramAgentExecutionInput,
  ): Promise<TelegramAgentExecutionResult> {
    if (input.agentId !== 'weather-agent') {
      return { text: 'Rota do agente não suportada nesta versão.' };
    }

    const requestContext =
      input.requestContext instanceof RequestContext
        ? input.requestContext
        : new RequestContext();

    const result = await weatherAgent.generate(input.normalizedPrompt, {
      memory: {
        thread: input.threadId,
        resource: input.resourceId,
      },
      requestContext,
      tracingOptions: {
        requestContextKeys: [
          'channel',
          'telegramUserId',
          'telegramChatId',
          'allowedPersonKey',
        ],
      },
    });

    return { text: result.text };
  }
}
