import { useState, useEffect } from 'react';
import { Node, Edge } from 'reactflow';
import { DailyGoalNodeData } from './DailyGoalNode';
import { listDailyGoals } from '@/app/cedar-os/daily-goals/supabase';

export const useDailyGoalsData = () => {
  const [nodes, setNodes] = useState<Node<DailyGoalNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    (async () => {
      const rows = await listDailyGoals();
      if (!rows.length) return;

      rows.sort((a, b) => (a.date > b.date ? 1 : -1));

      const monthOrder: Record<string, number> = {};
      let monthCount = 0;

      const builtNodes: Node<DailyGoalNodeData>[] = rows.map((row) => {
        const dateObj = new Date(row.date);
        const monthKey = row.date.slice(0, 7);

        if (!(monthKey in monthOrder)) monthOrder[monthKey] = monthCount++;

        const monthIdx = monthOrder[monthKey];
        const dayIdx = rows
          .filter((r) => r.date.slice(0, 7) === monthKey)
          .findIndex((r) => r.id === row.id);

        return {
          id: row.id,
          type: 'dailyGoalNode',
          position: { x: 150 + dayIdx * 300, y: 100 + monthIdx * 250 },
          data: {
            date: dateObj,
            goal: row.goal,
            completed: row.completed,
            summary: row.summary || undefined,
            todos: row.todos,
          },
        } as Node<DailyGoalNodeData>;
      });

      const builtEdges: Edge[] = builtNodes
        .map((n, idx) =>
          idx === 0
            ? null
            : {
                id: `e${builtNodes[idx - 1].id}-${n.id}`,
                source: builtNodes[idx - 1].id,
                target: n.id,
                type: 'simplebezier',
                animated: true,
              },
        )
        .filter(Boolean) as Edge[];

      setNodes(builtNodes);
      setEdges(builtEdges);
    })();
  }, []);

  return { nodes, edges };
};
