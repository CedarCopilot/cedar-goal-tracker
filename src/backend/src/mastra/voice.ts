import { registerApiRoute } from '@mastra/core/server';
import { OpenAIVoice } from '@mastra/voice-openai';
import type { Context } from 'hono';
import { Readable } from 'stream';
import { dailyGoalAgent } from './agents/dailyGoalAgent';
import { createSSEStream, streamJSONEvent } from '../utils/streamUtils';

const voiceProvider = new OpenAIVoice({
  speechModel: { apiKey: process.env.OPENAI_API_KEY!, name: 'tts-1' },
  listeningModel: { apiKey: process.env.OPENAI_API_KEY!, name: 'whisper-1' },
});

async function handleVoice(c: Context) {
  try {
    const form = await c.req.formData();
    const audioFile = form.get('audio') as File;
    if (!audioFile) return c.json({ error: 'audio required' }, 400);

    // buffer
    const buf = Buffer.from(await audioFile.arrayBuffer());
    const transcription = await voiceProvider.listen(Readable.from(buf), { filetype: 'webm' });

    const messages = [{ role: 'user' as const, content: transcription }];
    const res = await dailyGoalAgent.generate(messages, { temperature: 0.7, maxTokens: 500 });

    return c.json({ transcription, text: res.text });
  } catch (e) {
    return c.json({ error: (e as Error).message }, 500);
  }
}

export const voiceRoutes = [
  registerApiRoute('/voice', { method: 'POST', handler: handleVoice }),
  registerApiRoute('/voice/stream', {
    method: 'POST',
    handler: async (c) => {
      return createSSEStream(async (controller) => {
        try {
          const form = await c.req.formData();
          const audioFile = form.get('audio') as File;
          if (!audioFile) throw new Error('audio required');

          const buf = Buffer.from(await audioFile.arrayBuffer());
          const transcription = await voiceProvider.listen(Readable.from(buf), {
            filetype: 'webm',
          });

          streamJSONEvent(controller, { type: 'transcription', text: transcription });

          const res = await dailyGoalAgent.generate([{ role: 'user', content: transcription }], {
            temperature: 0.7,
            maxTokens: 500,
          });

          streamJSONEvent(controller, { type: 'response', text: res.text });
        } catch (err) {
          streamJSONEvent(controller, { type: 'error', message: (err as Error).message });
        }
      });
    },
  }),
];
