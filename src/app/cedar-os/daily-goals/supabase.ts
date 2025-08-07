import { createClient } from '@supabase/supabase-js';
import { DailyGoalTodo, DailyGoalNodeData } from '@/components/daily-goals/DailyGoalNode';
import { isEqual } from 'lodash';

/* -------------------------------------------------------------------------- */
/*  Supabase Client                                                           */
/* -------------------------------------------------------------------------- */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export interface DailyGoalRow {
  id: string; // primary key (yyyy-mm-dd)
  date: string; // ISO date string, duplicated for easy querying
  goal: string;
  completed: boolean;
  summary?: string | null;
  todos: DailyGoalTodo[];
  created_at?: string;
}

/* -------------------------------------------------------------------------- */
/*  CRUD Helpers                                                              */
/* -------------------------------------------------------------------------- */

export async function upsertDailyGoal(goal: DailyGoalNodeData): Promise<DailyGoalRow | null> {
  const row: DailyGoalRow = {
    id: goal.date.toISOString().slice(0, 10),
    date: goal.date.toISOString().slice(0, 10),
    goal: goal.goal,
    completed: goal.completed,
    summary: goal.summary ?? null,
    todos: goal.todos,
  };

  // only upsert if the goal has changed
  const existing = await fetchDailyGoal(goal.date);
  if (existing && isEqual(existing, row)) {
    return existing;
  }

  const { data, error } = await supabase.from('daily_goals').upsert(row).single();
  if (error) {
    console.error('Failed to upsert daily goal', error);
    return null;
  }
  return data as DailyGoalRow;
}

export async function fetchDailyGoal(date: Date): Promise<DailyGoalRow | null> {
  const iso = date.toISOString().slice(0, 10);
  const { data, error } = await supabase.from('daily_goals').select('*').eq('id', iso).single();
  if (error) return null;
  return data as DailyGoalRow;
}

export async function listDailyGoals(): Promise<DailyGoalRow[]> {
  const { data, error } = await supabase.from('daily_goals').select('*').order('date');
  if (error) return [];
  return data as DailyGoalRow[];
}

export async function deleteDailyGoal(date: Date): Promise<boolean> {
  const iso = date.toISOString().slice(0, 10);
  const { error } = await supabase.from('daily_goals').delete().eq('id', iso);
  return !error;
}
