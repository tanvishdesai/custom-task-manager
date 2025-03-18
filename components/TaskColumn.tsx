"use client";

import React, { useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Task, TaskStatus } from "@/lib/types";
import TaskCard from "./TaskCard";

interface TaskColumnProps {
  title: string;
  tasks: Task[];
  status: TaskStatus;
  onDeleteTask: (taskId: string) => void;
  onEditTask?: (taskId: string, updatedTask: Partial<Task>) => void;
  isOwner?: boolean;
}

function TaskColumn({
  title,
  tasks,
  status,
  onDeleteTask,
  onEditTask,
  isOwner = true
}: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  // Memoize taskIds to prevent unnecessary re-renders
  const taskIds = useMemo(() => tasks.map((task) => task.$id!), [tasks]);

  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl p-4 h-[calc(100vh-200px)] overflow-y-auto 
        bg-background/25 shadow-lg backdrop-blur-md border border-white/10
        ${isOver ? "ring-2 ring-primary bg-primary/10" : ""}`}
    >
      <h3 className="font-semibold text-lg mb-4 sticky top-0 py-2 z-10 
        bg-background/30 backdrop-blur-lg border-b border-white/10 pb-2 
        text-white flex items-center justify-between">
        <span>{title}</span>
        <span className="text-sm px-2 py-0.5 bg-white/10 rounded-full">
          {tasks.length}
        </span>
      </h3>
      
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-400 italic bg-white/5 
              rounded-lg border border-white/5 backdrop-blur-sm p-4">
              No tasks in this column
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.$id}
                task={task}
                onDelete={onDeleteTask}
                onEdit={onEditTask}
                isOwner={isOwner}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export default React.memo(TaskColumn);