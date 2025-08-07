import { z } from 'zod';

// -----------------------------------------------------------------------------
// Unified action schema – supports daily-goal setter keys.
// We keep validation permissive on args (array<any>) so we don’t have to
// enumerate every variant in Zod. Frontend setters will check the shape.
// -----------------------------------------------------------------------------

const SetterKeyEnum = z.enum([
  // Daily goals
  'createDayNode',
  'setGoalSummary',
  'addTodo',
  'markTodoComplete',
  'markGoalComplete',
  'updateGoal',
]);

export const ActionResponseSchema = z.object({
  type: z.literal('action'),
  stateKey: z.literal('nodes'),
  setterKey: SetterKeyEnum,
  args: z.array(z.unknown()),
});

// Final agent response shape – either a plain chat message (content only)
// or a chat message accompanied by an action.
export const ExecuteFunctionResponseSchema = z.object({
  content: z.string(),
  action: ActionResponseSchema,
});
