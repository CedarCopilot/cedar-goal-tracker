import { createWorkflow, createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import { streamJSONEvent } from '../../utils/streamUtils';
import { dailyGoalAgent } from '../agents/dailyGoalAgent';
import { ExecuteFunctionResponseSchema, ActionResponseSchema } from './chatWorkflowTypes';

export const ChatInputSchema = z.object({
  prompt: z.string(),
  temperature: z.number().optional(),
  maxTokens: z.number().optional(),
  systemPrompt: z.string().optional(),
  streamController: z.any().optional(),
});

export const ChatOutputSchema = z.object({
  content: z.string(),
  object: ActionResponseSchema.optional(),
  usage: z.any().optional(),
});

// Build messages step
const buildMessages = createStep({
  id: 'buildMessages',
  description: 'Wrap user prompt into LLM messages array',
  inputSchema: ChatInputSchema,
  outputSchema: ChatInputSchema.extend({
    messages: z.array(
      z.object({ role: z.enum(['user', 'assistant', 'system']), content: z.string() }),
    ),
  }),
  execute: async ({ inputData }) => {
    return { ...inputData, messages: [{ role: 'user' as const, content: inputData.prompt }] };
  },
});

const callAgent = createStep({
  id: 'callDailyGoalAgent',
  description: 'Invoke daily goal agent',
  inputSchema: buildMessages.outputSchema,
  outputSchema: ChatOutputSchema,
  execute: async ({ inputData }) => {
    const { messages, temperature, maxTokens, systemPrompt, streamController } = inputData;

    if (streamController) {
      streamJSONEvent(streamController, { type: 'stage_update', status: 'update_begin' });
    }

    const response = await dailyGoalAgent.generate(messages, {
      //   ...(systemPrompt ? ({ instructions: systemPrompt } as const) : {}),
      temperature,
      maxTokens,
      output: ExecuteFunctionResponseSchema,
    });

    const { content, action } = response.object;
    console.log('response object', response.object);

    const out = { content, object: action, usage: response.usage } as z.infer<
      typeof ChatOutputSchema
    >;

    if (streamController) streamJSONEvent(streamController, out);

    if (streamController)
      streamJSONEvent(streamController, { type: 'stage_update', status: 'update_complete' });

    return out;
  },
});

export const dailyGoalChatWorkflow = createWorkflow({
  id: 'dailyGoalChatWorkflow',
  description: 'Chat workflow for daily goals app',
  inputSchema: ChatInputSchema,
  outputSchema: ChatOutputSchema,
})
  .then(buildMessages)
  .then(callAgent)
  .commit();
