import { account, databases, ID, Query } from "./appwrite";
import { Project, Task, TaskStatus } from "./types";

const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
const projectsCollectionId = process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_COLLECTION_ID || '';
const tasksCollectionId = process.env.NEXT_PUBLIC_APPWRITE_TASKS_COLLECTION_ID || '';

// Auth API
export const createUserAccount = async (name: string, email: string, password: string) => {
    try {
        // Generate a valid userId that meets Appwrite's requirements
        const userId = ID.unique();
        
        const newAccount = await account.create(
            userId,
            email,
            password,
            name
        );

        if (!newAccount) throw Error;
        
        // Don't create a session immediately, wait for email verification
        return newAccount;
    } catch (error) {
        console.error("Error creating user account:", error);
        throw error;
    }
};

// Create verification with Appwrite
export const createEmailVerification = async () => {
    try {
        // Use Appwrite's built-in email verification
        const promise = await account.createVerification(
            `${window.location.origin}/verify-email`
        );
        return promise;
    } catch (error) {
        console.error("Error creating email verification:", error);
        throw error;
    }
};

// Create Magic URL token for verification and login
export const createMagicURLToken = async (email: string) => {
    try {
        // Use Appwrite's Magic URL token for both verification and authentication
        const result = await account.createMagicURLToken(
            ID.unique(),
            email,
            `${window.location.origin}/verify-email`
        );
        return result;
    } catch (error) {
        console.error("Error creating Magic URL token:", error);
        throw error;
    }
};

// Store pending user in local storage
export const storePendingUser = (name: string, email: string, password: string) => {
    try {
        // Using local storage to temporarily store user details
        // In production, consider more secure options or encrypt the data
        const pendingUser = { name, email, password };
        localStorage.setItem('pendingUser', JSON.stringify(pendingUser));
        return true;
    } catch (error) {
        console.error("Error storing pending user:", error);
        return false;
    }
};

// Get pending user from local storage
export const getPendingUser = () => {
    try {
        const pendingUser = localStorage.getItem('pendingUser');
        if (!pendingUser) return null;
        return JSON.parse(pendingUser);
    } catch (error) {
        console.error("Error getting pending user:", error);
        return null;
    }
};

// Clear pending user from local storage
export const clearPendingUser = () => {
    try {
        localStorage.removeItem('pendingUser');
        return true;
    } catch (error) {
        console.error("Error clearing pending user:", error);
        return false;
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
        // Don't log any errors for 401 Unauthorized
        if (error instanceof Error && 
            !error.toString().includes('401') && 
            !error.toString().includes('Unauthorized')) {
            console.error("Error getting current user:", error);
        }
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