import React, { useEffect } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Connection,
  ConnectionLineType,
  Controls,
  MarkerType,
  NodeChange,
  applyNodeChanges,
  useEdgesState,
  useNodesState,
  useOnSelectionChange,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { dailyGoalNodeTypes } from './DailyGoalNode';
import { useDailyGoalsData } from './useDailyGoalsData';
import { useCedarDailyGoals } from '@/app/cedar-os/daily-goals/hooks';
import { upsertDailyGoal, deleteDailyGoal } from '@/app/cedar-os/daily-goals/supabase';

export function DailyGoalCanvas() {
  const { nodes: initialNodes, edges: initialEdges } = useDailyGoalsData();

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const { selectedNodes, setSelectedNodes } = useCedarDailyGoals(nodes, setNodes, edges, setEdges);

  // Removed useOnSelectionChange hook – using onSelectionChange prop for reliability

  const handleNodesChange = React.useCallback(
    (changes: NodeChange[]) => {
      const deletions = changes.filter((c) => c.type === 'remove');
      if (deletions.length > 0) {
        setEdges((eds) => {
          const deletedIds = deletions.map((d) => d.id);
          return eds.filter(
            (e) => !deletedIds.includes(e.source) && !deletedIds.includes(e.target),
          );
        });
        // Persist deletions
        deletions.forEach((d) => void deleteDailyGoal(new Date(d.id)));
      }

      // Apply changes & persist
      setNodes((prev) => {
        const next = applyNodeChanges(changes, prev);

        changes.forEach((c) => {
          if (c.type === 'remove') return; // deletions handled earlier
          const n = next.find((node) => node.id === (c as any).id);
          if (n) void upsertDailyGoal(n.data);
        });

        return next;
      });
    },
    [setEdges, setNodes],
  );

  const onConnect = React.useCallback(
    (params: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'simplebezier',
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed },
          },
          eds,
        ),
      );
    },
    [setEdges],
  );

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={dailyGoalNodeTypes}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onSelectionChange={({ nodes: sel }) => setSelectedNodes(sel)}
        onConnect={onConnect}
        connectionLineType={ConnectionLineType.SmoothStep}
        defaultEdgeOptions={{
          type: 'simplebezier',
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed },
        }}
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <Background gap={16} size={1} />
        <Controls />
      </ReactFlow>

      {/* Selected goals overlay */}
      {selectedNodes.length > 0 && (
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-lg p-3 shadow-lg border z-10">
          <h4 className="text-sm font-semibold mb-2">Selected Goals</h4>
          <div className="space-y-1">
            {selectedNodes.map((node) => (
              <div key={node.id} className="text-xs">
                <span className="font-medium">{node.data.date.toISOString().slice(0, 10)}</span>
                <span className="ml-1">— {node.data.goal}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">💡 Ask Cedar about these selected goals!</p>
        </div>
      )}
    </div>
  );
}
