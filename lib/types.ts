export interface Project {
    $id?: string;
    name: string;
    description: string;
    createdAt: Date | string;
    updatedAt: Date | string;
    userId?: string; // Adding userId for user authentication
}

export enum TaskPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high'
}

export enum TaskStatus {
    NOT_STARTED = 'not_started',
    ONGOING = 'ongoing',
    COMPLETED = 'completed'
}

export enum NotificationType {
    TASK_ASSIGNED = 'task_assigned',
    TASK_UPDATED = 'task_updated',
    PROJECT_SHARED = 'project_shared'
}

export interface Task {
    $id?: string;
    title: string;
    description: string;
    dueDate: Date | string;
    priority: TaskPriority;
    assignees: string[];
    status: TaskStatus;
    projectId: string;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export interface User {
    $id?: string;
    name: string;
    email: string;
    avatarUrl?: string;
}

export interface Notification {
    $id?: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    taskId?: string;
    projectId?: string;
    isRead: boolean;
    createdAt: Date | string;
} 