'use client';

import React from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle } from 'lucide-react';

export interface DailyGoalTodo {
  id: string;
  text: string;
  completed: boolean;
}

export interface DailyGoalNodeData {
  date: Date; // JS Date object representing the day
  goal: string;
  completed: boolean;
  summary?: string;
  todos: DailyGoalTodo[];
}

export function DailyGoalNode({ data, selected }: NodeProps<DailyGoalNodeData>) {
  return (
    <div
      className={`min-w-[220px] rounded-lg border-2 p-4 shadow-md bg-white ${
        data.completed ? 'border-green-400' : 'border-red-400'
      } ${selected ? 'ring-2 ring-blue-500' : ''}`}
    >
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm">
          {data.date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </h3>
        {data.completed ? (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Done
          </Badge>
        ) : (
          <Badge className="bg-red-500 hover:bg-red-600">
            <XCircle className="w-3 h-3 mr-1" /> Pending
          </Badge>
        )}
      </div>

      {/* Goal */}
      <p className="text-xs mb-2">
        <span className="font-medium">Goal: </span>
        {data.goal}
      </p>

      {/* Summary */}
      {data.summary && (
        <p className="text-xs mb-2">
          <span className="font-medium">Summary: </span>
          {data.summary}
        </p>
      )}

      {/* Todos */}
      <div>
        <p className="text-xs font-medium mb-1">Todos</p>
        <ul className="text-xs list-disc pl-4 space-y-0.5">
          {data.todos.map((todo) => (
            <li key={todo.id} className={todo.completed ? 'line-through text-gray-400' : ''}>
              {todo.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export const dailyGoalNodeTypes = {
  dailyGoalNode: DailyGoalNode,
};
