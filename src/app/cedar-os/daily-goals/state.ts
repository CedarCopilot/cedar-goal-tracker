import { Node, Edge } from 'reactflow';
import { useRegisterState } from 'cedar-os';
import { v4 as uuidv4 } from 'uuid';
import { DailyGoalNodeData, DailyGoalTodo } from '@/components/daily-goals/DailyGoalNode';
import { upsertDailyGoal, listDailyGoals } from './supabase';

export function useDailyGoalsState(
  nodes: Node<DailyGoalNodeData>[],
  setNodes: React.Dispatch<React.SetStateAction<Node<DailyGoalNodeData>[]>>,
  edges: Edge[],
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,
) {
  // Register nodes with custom setters representing cedar command capabilities
  useRegisterState({
    key: 'nodes',
    value: nodes,
    setValue: setNodes,
    description: 'Daily goal nodes (one per day)',
    customSetters: {
      createDayNode: {
        name: 'createDayNode',
        description: 'Create a new day node with a goal for that date',
        parameters: [
          {
            name: 'date',
            type: 'string',
            description: 'ISO date string (YYYY-MM-DD) for the new day',
          },
          { name: 'goal', type: 'string', description: 'Goal text for that day' },
        ],
        execute: (currentNodes, dateRaw, goalRaw) => {
          const dateIso = dateRaw as string;
          const goal = goalRaw as string;
          const dateObj = new Date(dateIso);

          const newNode: Node<DailyGoalNodeData> = {
            id: dateIso,
            type: 'dailyGoalNode',
            position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
            data: {
              date: dateObj,
              goal,
              completed: false,
              todos: [],
            },
          };

          const next = [...(currentNodes as Node<DailyGoalNodeData>[]), newNode];
          setNodes(next);

          // Connect to previous latest node chronologically
          const prev = (currentNodes as Node<DailyGoalNodeData>[])
            .filter((n) => n.data.date < dateObj)
            .sort((a, b) => (a.id > b.id ? -1 : 1))[0];
          if (prev) {
            setEdges((eds: Edge[]) => [
              ...eds,
              {
                id: `e${prev.id}-${dateIso}`,
                source: prev.id,
                target: dateIso,
                type: 'simplebezier',
                animated: true,
              },
            ]);
          }
        },
      },
      setGoalSummary: {
        name: 'setGoalSummary',
        description: 'Set the summary of what was accomplished that day',
        parameters: [
          { name: 'id', type: 'string', description: 'Node id (date)' },
          { name: 'summary', type: 'string', description: 'Summary text' },
        ],
        execute: (currentNodes, idRaw, summaryRaw) => {
          const id = idRaw as string;
          const summary = summaryRaw as string;
          const updated = (currentNodes as Node<DailyGoalNodeData>[]).map((n) =>
            n.id === id ? { ...n, data: { ...n.data, summary } } : n,
          );
          setNodes(updated);
        },
      },
      addTodo: {
        name: 'addTodo',
        description: 'Add a todo line item to the specified day',
        parameters: [
          { name: 'id', type: 'string', description: 'Node id (date)' },
          { name: 'text', type: 'string', description: 'Todo text' },
        ],
        execute: (currentNodes, idRaw, textRaw) => {
          const id = idRaw as string;
          const text = textRaw as string;
          const updated = (currentNodes as Node<DailyGoalNodeData>[]).map((n) => {
            if (n.id !== id) return n;
            const todo: DailyGoalTodo = { id: uuidv4(), text: text as string, completed: false };
            return { ...n, data: { ...n.data, todos: [...n.data.todos, todo] } };
          });
          setNodes(updated);
        },
      },
      markTodoComplete: {
        name: 'markTodoComplete',
        description: 'Mark a todo as complete by todo id',
        parameters: [
          { name: 'id', type: 'string', description: 'Node id (date)' },
          { name: 'todoId', type: 'string', description: 'Todo item id' },
        ],
        execute: (currentNodes, idRaw, todoIdRaw) => {
          const id = idRaw as string;
          const todoId = todoIdRaw as string;
          const updated = (currentNodes as Node<DailyGoalNodeData>[]).map((n) => {
            if (n.id !== id) return n;
            return {
              ...n,
              data: {
                ...n.data,
                todos: n.data.todos.map((t) => (t.id === todoId ? { ...t, completed: true } : t)),
              },
            };
          });
          setNodes(updated);
        },
      },
      markGoalComplete: {
        name: 'markGoalComplete',
        description: 'Mark the daily goal as complete',
        parameters: [{ name: 'id', type: 'string', description: 'Node id (date)' }],
        execute: (currentNodes, idRaw) => {
          const id = idRaw as string;
          const updated = (currentNodes as Node<DailyGoalNodeData>[]).map((n) =>
            n.id === id ? { ...n, data: { ...n.data, completed: true } } : n,
          );
          setNodes(updated);
        },
      },

      updateGoal: {
        name: 'updateGoal',
        description: 'Update any fields of a goal node. Accepts an object with partial data fields',
        parameters: [
          { name: 'id', type: 'string', description: 'Node id (date)' },
          {
            name: 'data',
            type: 'Partial<DailyGoalNodeData>',
            description: 'Subset of fields to update (goal, completed, summary, todos, etc.)',
          },
        ],
        execute: (currentNodes, idRaw, dataRaw) => {
          const id = idRaw as string;
          const partial = dataRaw as Partial<DailyGoalNodeData>;

          const nodesArr = currentNodes as Node<DailyGoalNodeData>[];
          const existing = nodesArr.find((n) => n.id === id);

          if (existing) {
            const updated = nodesArr.map((n) =>
              n.id === id ? { ...n, data: { ...n.data, ...partial } } : n,
            );
            setNodes(updated);
            void upsertDailyGoal({ ...existing.data, ...partial });
          } else {
            // create new node
            const dateObj = partial.date
              ? typeof partial.date === 'string'
                ? new Date(partial.date)
                : partial.date
              : new Date(id);

            const newNode: Node<DailyGoalNodeData> = {
              id,
              type: 'dailyGoalNode',
              position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
              data: {
                date: dateObj,
                goal: partial.goal || '',
                completed: partial.completed ?? false,
                summary: partial.summary,
                todos: partial.todos || [],
              },
            };

            setNodes([...nodesArr, newNode]);

            // link to previous node chronologically
            const prev = [...nodesArr]
              .filter((n) => n.data.date < dateObj)
              .sort((a, b) => (a.data.date > b.data.date ? -1 : 1))[0];
            if (prev) {
              setEdges((eds) => [
                ...eds,
                {
                  id: `e${prev.id}-${id}`,
                  source: prev.id,
                  target: id,
                  type: 'simplebezier',
                  animated: true,
                },
              ]);
            }

            void upsertDailyGoal(newNode.data);
          }
        },
      },
    },
  });

  // Register edges (read-only for now)
  useRegisterState({
    key: 'edges',
    value: edges,
    setValue: setEdges,
    description: 'Edges connecting consecutive days',
  });
}
