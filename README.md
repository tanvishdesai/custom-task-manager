# Task Manager

A modern task management application built with Next.js, Tailwind CSS, Shadcn UI components, and Appwrite backend.

## Features

- User authentication (sign up, sign in, sign out)
- Project management (create, view, delete projects)
- Task management within projects
- Drag and drop tasks between status columns (Not Started, Ongoing, Completed)
- Task priority levels and assignees
- Responsive design

## Tech Stack

- **Frontend**: Next.js 14, React 19, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI
- **Backend**: Appwrite (Authentication, Database, Storage)
- **Drag and Drop**: DND Kit

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Appwrite account and project setup

### Appwrite Setup

1. Create an account on [Appwrite](https://appwrite.io/)
2. Create a new project
3. Set up a database with the following collections:

#### Projects Collection
- `name` (string)
- `description` (string)
- `createdAt` (datetime)
- `updatedAt` (datetime)
- `userId` (string) - Add this field for user authentication

#### Tasks Collection
- `title` (string)
- `description` (string)
- `dueDate` (datetime)
- `priority` (enum: 'low', 'medium', 'high')
- `assignees` (string[])
- `status` (enum: 'not_started', 'ongoing', 'completed')
- `projectId` (string)
- `createdAt` (datetime)
- `updatedAt` (datetime)

4. Create appropriate indexes and permissions for your collections

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd task-manager
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env.local` file in the root directory with your Appwrite credentials:
```
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your-database-id
NEXT_PUBLIC_APPWRITE_PROJECTS_COLLECTION_ID=your-projects-collection-id
NEXT_PUBLIC_APPWRITE_TASKS_COLLECTION_ID=your-tasks-collection-id
NEXT_PUBLIC_APPWRITE_STORAGE_ID=your-storage-id
```

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Sign up for a new account or sign in with existing credentials
2. Create a new project from the home page
3. Click on a project to view and manage its tasks
4. Add new tasks to the "Not Started" column
5. Drag and drop tasks between columns to update their status
6. Delete tasks or projects as needed

## License

This project is licensed under the MIT License.
#   c u s t o m - t a s k - m a n a g e r  
 