"use client";

import { useState } from "react";
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task, TaskPriority } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useForm } from "react-hook-form";

interface TaskCardProps {
  task: Task;
  onDelete: (taskId: string) => void;
  onEdit?: (taskId: string, updatedTask: Partial<Task>) => void;
  isOwner?: boolean;
}

function TaskCard({ task, onDelete, onEdit, isOwner = true }: TaskCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const form = useForm({
    defaultValues: {
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "",
      assignees: task.assignees ? task.assignees.join(", ") : ""
    }
  });
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.$id!,
    disabled: !isOwner,
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
        return "bg-red-500/20 text-red-200";
      case TaskPriority.MEDIUM:
        return "bg-yellow-500/20 text-yellow-200";
      case TaskPriority.LOW:
        return "bg-green-500/20 text-green-200";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatDate = (date: string | Date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (_error) {
      return "Invalid date";
    }
  };
  
  const handleSubmit = (data: {
    title: string;
    description: string;
    priority: TaskPriority;
    dueDate: string;
    assignees: string;
  }) => {
    if (onEdit) {
      const updatedTask: Partial<Task> = {
        title: data.title,
        description: data.description,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
        assignees: data.assignees ? data.assignees.split(",").map((a: string) => a.trim()) : []
      };
      
      onEdit(task.$id!, updatedTask);
    }
    
    setIsEditing(false);
  };

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`${isOwner ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'} border border-border/40 bg-black/35 shadow-md transition-all duration-200 hover:shadow-lg hover:border-primary/30 backdrop-blur-sm`}
      >
        <CardContent className="p-2 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm text-white truncate">{task.title}</h4>
            {task.assignees && task.assignees.length > 0 && (
              <p className="text-xs text-gray-400 truncate">{task.assignees[0]}</p>
            )}
          </div>
          <div className="flex items-center ml-2 space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                setShowDetails(true);
              }}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            {isOwner && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-500/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task.$id!);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDetails} onOpenChange={(open) => {
        setShowDetails(open);
        if (!open) setIsEditing(false);
      }}>
        <DialogContent className="bg-black/90 backdrop-blur-md border border-border/40 max-w-md w-full">
          <DialogHeader>
            <DialogTitle className="text-xl">{task.title}</DialogTitle>
          </DialogHeader>
          
          {isEditing && isOwner ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Task title" 
                          className="bg-black/50 border-border/40"
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Task description" 
                          className="bg-black/50 border-border/40"
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-black/50 border-border/40">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-black/90 border-border/40">
                          <SelectItem value={TaskPriority.HIGH}>High</SelectItem>
                          <SelectItem value={TaskPriority.MEDIUM}>Medium</SelectItem>
                          <SelectItem value={TaskPriority.LOW}>Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          className="bg-black/50 border-border/40"
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="assignees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assignees (comma separated)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="email1@example.com, email2@example.com" 
                          className="bg-black/50 border-border/40"
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                    className="border-border/40"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-primary/80 hover:bg-primary"
                  >
                    Save Changes
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          ) : (
            <>
              <div className="space-y-4 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Priority:</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
                
                <div>
                  <span className="text-sm text-gray-400">Description:</span>
                  <p className="mt-1 text-sm">{task.description || "No description"}</p>
                </div>
                
                {task.dueDate && (
                  <div>
                    <span className="text-sm text-gray-400">Due Date:</span>
                    <p className="mt-1 text-sm">{new Date(task.dueDate).toLocaleDateString()}</p>
                  </div>
                )}
                
                <div>
                  <span className="text-sm text-gray-400">Created:</span>
                  <p className="mt-1 text-sm">{formatDate(task.createdAt)}</p>
                </div>
                
                {task.assignees && task.assignees.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-400">Assignees:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {task.assignees.map((assignee, index) => (
                        <span
                          key={index}
                          className="bg-primary/10 text-primary-foreground text-xs px-2 py-1 rounded-full"
                        >
                          {assignee}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end space-x-2 pt-2">
                  {isOwner && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-primary/30 hover:bg-primary/20"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit
                    </Button>
                  )}
                  {isOwner && (
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="bg-red-900/60 hover:bg-red-800"
                      onClick={() => onDelete(task.$id!)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default React.memo(TaskCard); 