export type Priority = 'low' | 'medium' | 'high';

export type FilterStatus = 'all' | 'active' | 'completed' | 'high';

export type SortOption = 'newest' | 'oldest' | 'priority' | 'dueDate';

export interface Todo {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string; // ISO 8601 string: e.g. "2026-10-08T00:00:00.000Z"
  createdAt: string; // ISO 8601 string
  completed: boolean;
  completedAt?: string;
}

export interface TodoStats {
  total: number;
  completed: number;
  remaining: number;
  completionRate: number; // 0.0 to 1.0
}

export interface CreateTodoInput {
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string;
}

export interface UpdateTodoInput {
  title?: string;
  description?: string;
  priority?: Priority;
  dueDate?: string;
  completed?: boolean;
}
