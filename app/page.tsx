"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createProject, deleteProject, getUserProjects, getProjectTasks } from "@/lib/api";
import { Project, TaskStatus, Task } from "@/lib/types";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectTaskCounts, setProjectTaskCounts] = useState<Record<string, { notStarted: number, total: number }>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Memoized function to fetch project tasks in batch
  const fetchProjectsData = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoading(true);
      
      // Get all user projects in a single API call
      const userProjects = await getUserProjects();
      const projectsList = userProjects as unknown as Project[];
      
      // Set projects immediately for better UX
      setProjects(projectsList);
      
      // Use Promise.all to fetch task data in parallel rather than sequentially
      const projectIds = projectsList.filter(p => p.$id).map(p => p.$id!);
      
      const taskCountsPromises = projectIds.map(async (projectId) => {
        try {
          const tasks = await getProjectTasks(projectId);
          const notStartedCount = tasks.filter((task) => 
            (task as unknown as Task).status === TaskStatus.NOT_STARTED
          ).length;
          
          return {
            projectId,
            counts: {
              notStarted: notStartedCount,
              total: tasks.length
            }
          };
        } catch (error) {
          console.error(`Error fetching tasks for project ${projectId}:`, error);
          return {
            projectId,
            counts: { notStarted: 0, total: 0 }
          };
        }
      });
      
      // Resolve all promises in parallel
      const taskCountsResults = await Promise.all(taskCountsPromises);
      
      // Convert array of results to record object
      const taskCounts = taskCountsResults.reduce((acc, { projectId, counts }) => {
        acc[projectId] = counts;
        return acc;
      }, {} as Record<string, { notStarted: number, total: number }>);
      
      setProjectTaskCounts(taskCounts);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchProjectsData();
  }, [fetchProjectsData]);

  const handleCreateProject = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProject.name.trim()) {
      toast.error("Project name is required");
      return;
    }
    
    try {
      setIsCreating(true);
      const createdProject = await createProject({
        name: newProject.name,
        description: newProject.description,
      });
      
      setProjects((prev) => [...prev, createdProject as unknown as Project]);
      setNewProject({ name: "", description: "" });
      setIsDialogOpen(false);
      toast.success("Project created successfully");
      
      // Fetch task counts for the new project
      const projectId = (createdProject as unknown as Project).$id;
      if (projectId) {
        setProjectTaskCounts(prev => ({
          ...prev,
          [projectId]: { notStarted: 0, total: 0 }
        }));
      }
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project");
    } finally {
      setIsCreating(false);
    }
  }, [newProject]);

  const handleDeleteProject = useCallback(async (projectId: string) => {
    try {
      await deleteProject(projectId);
      setProjects((prev) => prev.filter((project) => project.$id !== projectId));
      
      // Update task counts
      setProjectTaskCounts(prev => {
        const newCounts = { ...prev };
        delete newCounts[projectId];
        return newCounts;
      });
      
      toast.success("Project deleted successfully");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    }
  }, []);

  const handleProjectClick = useCallback((projectId: string) => {
    router.push(`/project/${projectId}`);
  }, [router]);

  // Memoize the project list to prevent unnecessary re-renders
  const projectList = useMemo(() => {
    return projects.map((project) => (
      <Card 
        key={project.$id} 
        className="overflow-hidden border border-border/60 shadow-md transition-all duration-200 hover:shadow-lg hover:border-primary/30 relative"
      >
        {/* Not started tasks badge */}
        {project.$id && projectTaskCounts[project.$id]?.notStarted > 0 && (
          <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full w-10 h-8 flex items-center justify-center text-xs font-bold shadow-lg z-20 border border-background/80">
            {projectTaskCounts[project.$id]?.notStarted}
          </div>
        )}
        
        <CardHeader className="pb-3 border-b border-border/30">
          <CardTitle className="text-lg font-bold">{project.name}</CardTitle>
          {project.description && (
            <CardDescription>{project.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="pt-4 pb-3">
          <div className="flex justify-between text-sm">
            <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
            {project.$id && (
              <span>Tasks: {projectTaskCounts[project.$id]?.total || 0}</span>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pt-2 border-t border-border/30">
          <Button variant="outline" onClick={() => handleProjectClick(project.$id!)}>
            Open
          </Button>
          <Button variant="destructive" onClick={() => handleDeleteProject(project.$id!)}>
            Delete
          </Button>
        </CardFooter>
      </Card>
    ));
  }, [projects, projectTaskCounts, handleProjectClick, handleDeleteProject]);

  return (
    <ProtectedRoute>
      {/* Hero section with quote */}
      <section className="w-full py-12 md:py-24 lg:py-32 flex items-center justify-center">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="quote-text px-4 md:px-6 mb-16">
                Two qualities are indispensable. First, is an intellect that even in the darkest hour retains some glimmering of inner light, which leads to truth. And second, the courage to follow that faint light wherever it may lead.
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">My Projects</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default">Create Project</Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreateProject}>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>
                    Add a name and optional description for your new project.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="name" className="text-right col-span-1">
                      Name
                    </label>
                    <Input
                      id="name"
                      value={newProject.name}
                      onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="description" className="text-right col-span-1">
                      Description
                    </label>
                    <Input
                      id="description"
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? "Creating..." : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center p-10 border rounded-lg bg-card">
            <h2 className="text-xl font-semibold mb-2">No projects yet</h2>
            <p className="mb-4">Create your first project to get started</p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              variant="default"
            >
              Create Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projectList}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
