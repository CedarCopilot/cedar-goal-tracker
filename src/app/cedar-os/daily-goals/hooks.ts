import React from 'react';
import { Node, Edge } from 'reactflow';
import { useDailyGoalsState } from './state';
import { DailyGoalNodeData } from '@/components/daily-goals/DailyGoalNode';
import { useDailyGoalsContext } from './context';
import { useDailyGoalsMentions } from './mentions';

export function useCedarDailyGoals(
  nodes: Node<DailyGoalNodeData>[],
  setNodes: React.Dispatch<React.SetStateAction<Node<DailyGoalNodeData>[]>>,
  edges: Edge[],
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,
) {
  useDailyGoalsState(nodes, setNodes, edges, setEdges);

  const { selectedNodes, setSelectedNodes } = useDailyGoalsContext(nodes);

  // Register mentions so chat can resolve @dates
  useDailyGoalsMentions(nodes);

  return { selectedNodes, setSelectedNodes };
}
