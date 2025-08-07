import { Mastra } from '@mastra/core/mastra';
import { LibSQLStore } from '@mastra/libsql';
import { dailyGoalChatWorkflow } from './workflows/dailyGoalChatWorkflow';
import { dailyGoalAgent } from './agents/dailyGoalAgent';
import { apiRoutes } from './apiRegistry';
import { storage } from './storage';

// Create Mastra instance
export const mastra = new Mastra({
  agents: { dailyGoalAgent },
  workflows: { dailyGoalChatWorkflow },
  storage,
  telemetry: {
    enabled: true,
  },
  server: {
    apiRoutes,
  },
});
