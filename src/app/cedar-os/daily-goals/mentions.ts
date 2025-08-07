import React from 'react';
import { Node, Edge } from 'reactflow';
import { useStateBasedMentionProvider } from 'cedar-os';
import { ArrowRight, Calendar } from 'lucide-react';
import { DailyGoalNodeData } from '@/components/daily-goals/DailyGoalNode';

/**
 * Registers @ mention providers for daily goals and their edges.
 * Allows chat users to reference a specific day goal like @2025-08-06
 */
export function useDailyGoalsMentions(nodes: Node<DailyGoalNodeData>[]) {
  // Mention provider for nodes (goals)
  useStateBasedMentionProvider({
    stateKey: 'nodes',
    trigger: '@',
    labelField: (node: any) =>
      (node as Node<DailyGoalNodeData>).data.date.toISOString().slice(0, 10),
    searchFields: ['data.goal', 'data.summary'],
    description: 'Daily goals (one per day)',
    icon: React.createElement(Calendar, { size: 16 }),
    color: '#3B82F6', // Blue
  });

  // Mention provider for edges (relationships between days)
  useStateBasedMentionProvider({
    stateKey: 'edges',
    trigger: '@',
    labelField: (edge: any) => {
      const e = edge as Edge;
      const sourceNode = nodes.find((n) => n.id === e.source);
      const targetNode = nodes.find((n) => n.id === e.target);
      const srcLabel = sourceNode?.data.date.toISOString().slice(0, 10) || edge.source;
      const tgtLabel = targetNode?.data.date.toISOString().slice(0, 10) || edge.target;
      return `${srcLabel} → ${tgtLabel}`;
    },
    description: 'Goal relationships / ordering',
    icon: React.createElement(ArrowRight, { size: 16 }),
    color: '#10B981', // Green
  });
}
