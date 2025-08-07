import React, { useEffect, useState } from 'react';
import { Node } from 'reactflow';
import { subscribeInputContext, useCedarState, useCedarStore } from 'cedar-os';
import { CalendarDays } from 'lucide-react';
import { DailyGoalNodeData } from '@/components/daily-goals/DailyGoalNode';

/**
 * useDailyGoalsContext – exposes the current day's goal node (if it exists)
 * to Cedar as chat context so the agent knows what you're working on today.
 */
export function useDailyGoalsContext(nodes: Node<DailyGoalNodeData>[]) {
  const [selectedNodes, setSelectedNodes] = useState<Node<DailyGoalNodeData>[]>([]);

  // ─── Today’s node as ARRAY in state ────────────────────────────────────────────
  const [todayNodes, setTodayNodes] = useState<Node<DailyGoalNodeData>[]>([]);

  useEffect(() => {
    const todayIso = new Date().toISOString().slice(0, 10);
    const todayNode = nodes.find((n) => n.data.date.toISOString().slice(0, 10) === todayIso);

    setTodayNodes(todayNode ? [todayNode] : []);
  }, [nodes]);
  // todayGoal context
  subscribeInputContext(
    todayNodes,
    (arr: Node<DailyGoalNodeData>[]) =>
      arr.length === 0
        ? {}
        : {
            todayGoal: arr.map((node) => ({
              id: node.id,
              date: node.data.date.toISOString().slice(0, 10),
              goal: node.data.goal,
              completed: node.data.completed,
              summary: node.data.summary ?? '',
              todos: node.data.todos,
            })),
          },
    {
      icon: React.createElement(CalendarDays, { size: 16 }),
      color: '#F59E0B',
    },
  );

  // Selected nodes context (similar to roadmap)
  //   subscribeInputContext(
  //     selectedNodes,
  //     (sel: Node<DailyGoalNodeData>[]) => ({
  //       selectedGoals: sel.map((node) => ({
  //         id: node.id,
  //         date: node.data.date.toISOString().slice(0, 10),
  //         goal: node.data.goal,
  //         completed: node.data.completed,
  //         summary: node.data.summary || '',
  //         todoCount: node.data.todos.length,
  //       })),
  //     }),
  //     {
  //       icon: React.createElement(CalendarDays, { size: 16 }),
  //       color: '#6366F1', // Indigo for selected
  //     },
  //   );
  // All goals context
  //   subscribeInputContext(nodes, (nds: Node<DailyGoalNodeData>[]) => ({
  //     goals: nds.map((node) => ({
  //       id: node.id,
  //       date: node.data.date.toISOString().slice(0, 10),
  //       goal: node.data.goal,
  //       completed: node.data.completed,
  //       summary: node.data.summary || '',
  //       todoCount: node.data.todos.length,
  //     })),
  //   }));

  return { selectedNodes, setSelectedNodes };
}
