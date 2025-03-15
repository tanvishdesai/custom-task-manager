"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createTask, deleteTask, getProject, getProjectTasks, updateTaskStatus } from "@/lib/api";
import { Project, Task, TaskPriority, TaskStatus } from "@/lib/types";
import { toast } from "sonner";
import ProtectedRoute from "@/components/ProtectedRoute";
import TaskColumn from "@/components/TaskColumn";
import TaskCard from "@/components/TaskCard";


export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: new Date().toISOString().split("T")[0],
    priority: TaskPriority.MEDIUM,
    assignees: [""],
  });
  
  const router = useRouter();
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  

  useEffect(() => {
    const fetchProjectAndTasks = async () => {
      try {
        setIsLoading(true);
        const projectData = await getProject(unwrappedParams.id);
        const tasksData = await getProjectTasks(unwrappedParams.id);
        
        setProject(projectData as unknown as Project);
        setTasks(tasksData as unknown as Task[]);
      } catch (error) {
        console.error("Error fetching project data:", error);
        toast.error("Failed to load project data");
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectAndTasks();
  }, [unwrappedParams.id, router]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTask.title.trim()) {
      toast.error("Task title is required");
      return;
    }
    
    try {
      setIsCreating(true);
      const createdTask = await createTask({
        title: newTask.title,
        description: newTask.description,
        dueDate: newTask.dueDate,
        priority: newTask.priority,
        assignees: newTask.assignees.filter(a => a.trim() !== ""),
        status: TaskStatus.NOT_STARTED,
        projectId: unwrappedParams.id,
      });
      
      setTasks((prev) => [...prev, createdTask as unknown as Task]);
      setNewTask({
        title: "",
        description: "",
        dueDate: new Date().toISOString().split("T")[0],
        priority: TaskPriority.MEDIUM,
        assignees: [""],
      });
      setIsDialogOpen(false);
      toast.success("Task created successfully");
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Failed to create task");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((task) => task.$id !== taskId));
      toast.success("Task deleted successfully");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const draggedTask = tasks.find((task) => task.$id === active.id);
    
    if (draggedTask) {
      setActiveTask(draggedTask);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeTaskId = active.id as string;
    const overContainerId = over.id as TaskStatus;
    
    // Check if we're dropping over a container
    if (Object.values(TaskStatus).includes(overContainerId as TaskStatus)) {
      const taskToUpdate = tasks.find((task) => task.$id === activeTaskId);
      
      if (taskToUpdate && taskToUpdate.status !== overContainerId) {
        try {
          const _updatedTask = await updateTaskStatus(activeTaskId, overContainerId);
          
          setTasks((prev) =>
            prev.map((task) =>
              task.$id === activeTaskId
                ? { ...task, status: overContainerId }
                : task
            )
          );
          
          toast.success(`Task moved to ${overContainerId.replace('_', ' ')}`);
        } catch (err) {
          console.error("Error updating task status:", err);
          toast.error("Failed to update task status");
        }
      }
    }
    
    setActiveTask(null);
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="h-16 w-16 animate-spin rounded-full border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Background blobs for visual effect */}
        <div className="bg-blob bg-blob-1"></div>
        <div className="bg-blob bg-blob-2" style={{ left: '30%', animationDelay: '-5s' }}></div>
        
        <div className="container mx-auto py-8 relative z-10">
          <div className="flex justify-between items-center mb-8">
            <div>
              <Button variant="outline" onClick={() => router.push("/")} className="mb-4">
                ← Back to Projects
              </Button>
              <h1 className="text-3xl font-bold">{project?.name}</h1>
              <p className="text-gray-600 mt-1">{project?.description}</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>Add New Task</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                  <DialogDescription>
                    Add a new task to your project
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateTask}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label htmlFor="title" className="text-sm font-medium">
                        Task Title
                      </label>
                      <Input
                        id="title"
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        placeholder="Enter task title"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="description" className="text-sm font-medium">
                        Description
                      </label>
                      <Input
                        id="description"
                        value={newTask.description}
                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                        placeholder="Enter task description"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="dueDate" className="text-sm font-medium">
                        Due Date
                      </label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={newTask.dueDate}
                        onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="priority" className="text-sm font-medium">
                        Priority
                      </label>
                      <select
                        id="priority"
                        value={newTask.priority}
                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as TaskPriority })}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value={TaskPriority.LOW}>Low</option>
                        <option value={TaskPriority.MEDIUM}>Medium</option>
                        <option value={TaskPriority.HIGH}>High</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Assignees
                      </label>
                      {newTask.assignees.map((assignee, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={assignee}
                            onChange={(e) => {
                              const newAssignees = [...newTask.assignees];
                              newAssignees[index] = e.target.value;
                              setNewTask({ ...newTask, assignees: newAssignees });
                            }}
                            placeholder="Enter assignee name"
                          />
                          {index === newTask.assignees.length - 1 ? (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setNewTask({ ...newTask, assignees: [...newTask.assignees, ""] })}
                            >
                              +
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                const newAssignees = [...newTask.assignees];
                                newAssignees.splice(index, 1);
                                setNewTask({ ...newTask, assignees: newAssignees });
                              }}
                            >
                              -
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isCreating}>
                      {isCreating ? "Creating..." : "Create Task"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <TaskColumn 
                title="Not Started" 
                tasks={getTasksByStatus(TaskStatus.NOT_STARTED)} 
                status={TaskStatus.NOT_STARTED}
                onDeleteTask={handleDeleteTask}
              />
              <TaskColumn 
                title="Ongoing" 
                tasks={getTasksByStatus(TaskStatus.ONGOING)} 
                status={TaskStatus.ONGOING}
                onDeleteTask={handleDeleteTask}
              />
              <TaskColumn 
                title="Completed" 
                tasks={getTasksByStatus(TaskStatus.COMPLETED)} 
                status={TaskStatus.COMPLETED}
                onDeleteTask={handleDeleteTask}
              />
            </div>
            
            <DragOverlay>
              {activeTask ? (
                <div className="rotate-3 scale-105">
                  <TaskCard task={activeTask} onDelete={() => {}} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </ProtectedRoute>
  );
} 