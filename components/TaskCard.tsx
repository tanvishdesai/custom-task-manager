"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task, TaskPriority } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

interface TaskCardProps {
  task: Task;
  onDelete: (taskId: string) => void;
}

export default function TaskCard({ task, onDelete }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.$id!,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return "bg-red-100 text-red-800";
      case TaskPriority.MEDIUM:
        return "bg-yellow-100 text-yellow-800";
      case TaskPriority.LOW:
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date: string | Date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (_error) {
      return "Invalid date";
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow"
    >
      <CardHeader className="p-3 pb-0 flex flex-row justify-between items-start">
        <div>
          <h4 className="font-medium text-base">{task.title}</h4>
          <p className="text-xs text-gray-500">
            Created {formatDate(task.createdAt)}
          </p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
      </CardHeader>
      <CardContent className="p-3 pt-2">
        <p className="text-sm text-gray-600">{task.description || "No description"}</p>
        
        {task.dueDate && (
          <p className="text-xs mt-2 text-gray-500">
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </p>
        )}
        
        {task.assignees && task.assignees.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-gray-500 mb-1">Assignees:</p>
            <div className="flex flex-wrap gap-1">
              {task.assignees.map((assignee, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full"
                >
                  {assignee}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-3 pt-0">
        <Button
          variant="destructive"
          size="sm"
          className="ml-auto"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.$id!);
          }}
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
} 