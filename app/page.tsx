"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createProject, deleteProject, getProjectsWithAssignedTasks, getUserProjects, getProjectTasks } from "@/lib/api";
import { Project, TaskStatus, Task } from "@/lib/types";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [assignedProjects, setAssignedProjects] = useState<Project[]>([]);
  const [projectTaskCounts, setProjectTaskCounts] = useState<Record<string, { notStarted: number, total: number }>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("my-projects");
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  // Fetch task counts for projects
  const fetchTaskCounts = useCallback(async (projectsList: Project[]) => {
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
    
    setProjectTaskCounts(prevCounts => ({
      ...prevCounts,
      ...taskCounts
    }));
  }, []);

  // Memoized function to fetch project data
  const fetchProjectsData = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      setIsLoading(true);
      
      // Get all user projects in a single API call
      const userProjects = await getUserProjects();
      const projectsList = userProjects as unknown as Project[];
      
      // Set projects immediately for better UX
      setProjects(projectsList);
      
      // Fetch task counts for own projects
      await fetchTaskCounts(projectsList);
      
      // Get projects where user is assigned tasks
      if (user.email) {
        const assignedProjectsList = await getProjectsWithAssignedTasks(user.email);
        
        // Filter out projects that the user already owns
        const userProjectIds = new Set(projectsList.map(p => p.$id));
        const filteredAssignedProjects = (assignedProjectsList as unknown as Project[])
          .filter(p => p.$id && !userProjectIds.has(p.$id));
        
        setAssignedProjects(filteredAssignedProjects);
        
        // Fetch task counts for assigned projects
        await fetchTaskCounts(filteredAssignedProjects);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, fetchTaskCounts]);

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

  // Render a project card
  const renderProjectCard = useCallback((project: Project, isAssigned = false) => {
    return (
      <Card 
        key={project.$id} 
        className="overflow-hidden border border-border/40 bg-black/35 shadow-md transition-all duration-200 hover:shadow-lg hover:border-primary/30 relative backdrop-blur-sm"
      >
        {/* Not started tasks badge */}
        {project.$id && projectTaskCounts[project.$id]?.notStarted > 0 && (
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg z-20">
            {projectTaskCounts[project.$id]?.notStarted}
          </div>
        )}
        

        
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold text-white">{project.name}</CardTitle>
          {project.description && (
            <CardDescription className="text-gray-300">{project.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="pt-1 pb-3">
          <div className="flex justify-between text-sm text-gray-400">
            <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
            {project.$id && (
              <span>Tasks: {projectTaskCounts[project.$id]?.total || 0}</span>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center pt-2 pb-4">
          <Button 
            variant="outline" 
            onClick={() => handleProjectClick(project.$id!)}
            className="w-24 border-gray-700 hover:bg-primary/20 text-white"
          >
            Open
          </Button>
          {!isAssigned && (
            <Button 
              variant="destructive" 
              onClick={() => handleDeleteProject(project.$id!)}
              className="w-24 ml-2 bg-red-900/60 hover:bg-red-800"
            >
              Delete
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }, [projectTaskCounts, handleProjectClick, handleDeleteProject]);

  // Memoize the project lists
  const ownProjectsList = useMemo(() => {
    return projects.map(project => renderProjectCard(project));
  }, [projects, renderProjectCard]);

  const assignedProjectsList = useMemo(() => {
    return assignedProjects.map(project => renderProjectCard(project, true));
  }, [assignedProjects, renderProjectCard]);

  return (
    <ProtectedRoute>
      {/* Hero section with quote */}
      <section className="w-full py-12 md:py-24 lg:py-32 flex items-center justify-center">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2 max-w-3xl mx-auto">
              <div className="relative px-8 md:px-12 mb-16">
                <div className="absolute top-0 left-0 text-6xl text-primary/30 font-Inter -translate-y-6">&quot;</div>
                <p className="text-xl md:text-2xl medieval-quote leading-relaxed tracking-wide italic text-white drop-shadow-sm backdrop-blur-sm opacity-90">
                  Two qualities are indispensable. First, is an intellect that even in the darkest hour retains some glimmering of inner light, which leads to truth. And second, the courage to follow that faint light wherever it may lead.
                </p>
                <div className="absolute bottom-0 right-0 text-6xl text-primary/30 font-serif translate-y-2">&quot;</div>
                <div className="mt-6 w-16 h-1 bg-primary/60 mx-auto"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Projects</h1>
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
        ) : (
          <Tabs defaultValue="my-projects" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="my-projects">My Projects</TabsTrigger>
              <TabsTrigger value="assigned-projects" disabled={assignedProjects.length === 0}>
                Assigned Projects 
                {assignedProjects.length > 0 && (
                  <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                    {assignedProjects.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="my-projects">
              {projects.length === 0 ? (
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
                  {ownProjectsList}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="assigned-projects">
              {assignedProjects.length === 0 ? (
                <div className="text-center p-10 border rounded-lg bg-card">
                  <h2 className="text-xl font-semibold mb-2">No assigned projects</h2>
                  <p className="mb-4">You have not been assigned to any projects yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {assignedProjectsList}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </ProtectedRoute>
  );
}
