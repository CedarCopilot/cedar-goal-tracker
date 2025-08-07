# Cedar Daily Goal Tracker

This repo is a **Next .js + Cedar-OS** demo that lets you set and track daily goals on an interactive React-Flow canvas.

## Features

1. **One node per day**  
   • Displays goal, completion status (green/red), summary, todos.  
   • Nodes are laid out chronologically and grouped by month; consecutive days are linked with animated edges.

2. **AI Assistant (Cedar)**  
   • Chat with the assistant to create or update goals using natural language.  
   • Only one setter is needed: `updateGoal` – pass an `id` plus a partial object to create or modify a node.  
   • Uses context and `@`-mentions (`@2025-08-07`) so the agent knows current nodes and selections.

3. **Voice Input / Output**  
   • Upload or record audio → Whisper transcription → agent → TTS reply.  
   • Endpoints: `/voice` (JSON) and `/voice/stream` (SSE).

4. **Persistence (Supabase)**  
   • Goals are saved in the `daily_goals` table (see SQL below).  
   • CRUD functions live in `daily-goals/supabase.ts`; all node changes are persisted automatically.

5. **Backend (Mastra)**  
   • `dailyGoalAgent` handles all requests, instructed to always emit an `updateGoal` action.  
   • Workflows validate actions with a Zod schema that accepts arbitrary args.

## SQL

```sql
create table public.daily_goals (
  id text primary key,        -- yyyy-mm-dd
  date date not null,
  goal text not null,
  completed boolean not null default false,
  summary text,
  todos jsonb not null default '[]',
  created_at timestamptz default now()
);
```

## Running Locally

```bash
pnpm install
# env vars: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, OPENAI_API_KEY
pnpm dev
```

Navigate to `http://localhost:3000` — drag nodes, chat with Cedar, or record a voice command!
