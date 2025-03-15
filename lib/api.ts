import { account, databases, ID, Query } from "./appwrite";
import { Project, Task, TaskStatus } from "./types";

const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
const projectsCollectionId = process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_COLLECTION_ID || '';
const tasksCollectionId = process.env.NEXT_PUBLIC_APPWRITE_TASKS_COLLECTION_ID || '';

// Auth API
export const createUserAccount = async (name: string, email: string, password: string) => {
    try {
        const newAccount = await account.create(
            ID.unique(),
            email,
            password,
            name
        );

        if (!newAccount) throw Error;
        
        return newAccount;
    } catch (error) {
        console.error("Error creating user account:", error);
        throw error;
    }
};

export const signIn = async (email: string, password: string) => {
    try {
        const session = await account.createEmailPasswordSession(email, password);
        return session;
    } catch (error) {
        console.error("Error signing in:", error);
        throw error;
    }
};

export const signOut = async () => {
    try {
        const session = await account.deleteSession('current');
        return session;
    } catch (error) {
        console.error("Error signing out:", error);
        throw error;
    }
};

export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get();
        if (!currentAccount) throw Error;
        
        return currentAccount;
    } catch (error) {
        console.error("Error getting current user:", error);
        return null;
    }
};

// Projects API
export const createProject = async (project: Omit<Project, '$id' | 'createdAt' | 'updatedAt'>) => {
    try {
        const user = await getCurrentUser();
        
        if (!user) throw Error;
        
        const now = new Date().toISOString();
        
        const newProject = await databases.createDocument(
            databaseId,
            projectsCollectionId,
            ID.unique(),
            {
                ...project,
                userId: user.$id,
                createdAt: now,
                updatedAt: now
            }
        );
        
        return newProject;
    } catch (error) {
        console.error("Error creating project:", error);
        throw error;
    }
};

export const getUserProjects = async () => {
    try {
        const user = await getCurrentUser();
        
        if (!user) throw Error;
        
        const projects = await databases.listDocuments(
            databaseId,
            projectsCollectionId,
            [Query.equal('userId', user.$id)]
        );
        
        return projects.documents;
    } catch (error) {
        console.error("Error getting user projects:", error);
        return [];
    }
};

export const deleteProject = async (projectId: string) => {
    try {
        // Delete all tasks associated with this project first
        const tasks = await getProjectTasks(projectId);
        
        for(const task of tasks) {
            if (task.$id) {
                await databases.deleteDocument(
                    databaseId,
                    tasksCollectionId,
                    task.$id
                );
            }
        }
        
        // Now delete the project
        const _status = await databases.deleteDocument(
            databaseId,
            projectsCollectionId,
            projectId
        );
        
        return { success: true };
    } catch (error) {
        console.error("Error deleting project:", error);
        throw error;
    }
};

export const getProject = async (projectId: string) => {
    try {
        const project = await databases.getDocument(
            databaseId,
            projectsCollectionId,
            projectId
        );
        
        return project;
    } catch (error) {
        console.error("Error getting project:", error);
        throw error;
    }
};

// Tasks API
export const createTask = async (task: Omit<Task, '$id' | 'createdAt' | 'updatedAt'>) => {
    try {
        const now = new Date().toISOString();
        
        const newTask = await databases.createDocument(
            databaseId,
            tasksCollectionId,
            ID.unique(),
            {
                ...task,
                createdAt: now,
                updatedAt: now
            }
        );
        
        return newTask;
    } catch (error) {
        console.error("Error creating task:", error);
        throw error;
    }
};

export const getProjectTasks = async (projectId: string) => {
    try {
        const tasks = await databases.listDocuments(
            databaseId,
            tasksCollectionId,
            [Query.equal('projectId', projectId)]
        );
        
        return tasks.documents;
    } catch (error) {
        console.error("Error getting project tasks:", error);
        return [];
    }
};

export const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    try {
        const now = new Date().toISOString();
        
        const updatedTask = await databases.updateDocument(
            databaseId,
            tasksCollectionId,
            taskId,
            {
                status,
                updatedAt: now
            }
        );
        
        return updatedTask;
    } catch (error) {
        console.error("Error updating task status:", error);
        throw error;
    }
};

export const deleteTask = async (taskId: string) => {
    try {
        const _status = await databases.deleteDocument(
            databaseId,
            tasksCollectionId,
            taskId
        );
        
        return { success: true };
    } catch (error) {
        console.error("Error deleting task:", error);
        throw error;
    }
}; 