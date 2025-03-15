"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Task, TaskStatus } from "@/lib/types";
import TaskCard from "./TaskCard";

interface TaskColumnProps {
  title: string;
  tasks: Task[];
  status: TaskStatus;
  onDeleteTask: (taskId: string) => void;
}

export default function TaskColumn({ title, tasks, status, onDeleteTask }: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  const taskIds = tasks.map((task) => task.$id!);

  return (
    <div
      ref={setNodeRef}
      className={`bg-card rounded-lg p-4 h-[calc(100vh-200px)] overflow-y-auto ${
        isOver ? "ring-2 ring-primary bg-primary/5" : ""
      }`}
    >
      <h3 className="font-semibold text-lg mb-4 sticky top-0 bg-card py-2 z-10 border-b border-border/50 pb-2">
        {title} ({tasks.length})
      </h3>
      
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground italic">
              No tasks in this column
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard key={task.$id} task={task} onDelete={onDeleteTask} />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
} 