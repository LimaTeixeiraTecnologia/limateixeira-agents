import { Agent } from '@mastra/core/agent';
import { TELEGRAM_OFFICIAL_AGENT_ID } from '../../telegram/constants';
import { composeMarcosFoundationalInstructions } from '../knowledge/marcos';
import { createMarcosMemory } from '../memory/marcos-memory';
import { mastraStorage } from '../storage';
import { MARCOS_AGENT_REGISTRY_KEY } from './constants';

export const marcosAgent = new Agent({
  id: TELEGRAM_OFFICIAL_AGENT_ID,
  name: 'Marcos Agent',
  instructions: composeMarcosFoundationalInstructions(),
  model: 'openrouter/openai/gpt-5-mini',
  memory: createMarcosMemory(mastraStorage),
});
