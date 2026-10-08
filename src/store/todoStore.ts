import { storage } from '@/utils/storage';
import { Todo, CreateTodoInput, UpdateTodoInput, TodoStats } from '@/types/todo';

const INITIAL_SEED_TODOS: Todo[] = [
  {
    id: 'seed-1',
    title: 'Finalize mobile app presentation',
    description: 'Review key visual slides and export high-resolution assets for team demo.',
    priority: 'high',
    dueDate: new Date(Date.now() + 3600 * 1000 * 4).toISOString(), // Today
    createdAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
    completed: false,
  },
  {
    id: 'seed-2',
    title: 'Morning stretch & mindfulness',
    description: '15 minutes guided breathwork and posture exercises.',
    priority: 'medium',
    dueDate: new Date().toISOString(),
    createdAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
    completed: true,
    completedAt: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
  },
  {
    id: 'seed-3',
    title: 'Buy fresh groceries',
    description: 'Organic berries, oat milk, sourdough bread, and ground coffee.',
    priority: 'low',
    dueDate: new Date(Date.now() + 3600 * 1000 * 24).toISOString(), // Tomorrow
    createdAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
    completed: false,
  },
  {
    id: 'seed-4',
    title: 'Quarterly architecture review',
    description: 'Evaluate cloud service costs, microservice latency, and upcoming upgrades.',
    priority: 'high',
    dueDate: new Date(Date.now() + 3600 * 1000 * 72).toISOString(), // In 3 days
    createdAt: new Date(Date.now() - 3600 * 1000 * 36).toISOString(),
    completed: false,
  },
];

type Listener = () => void;

class TodoStore {
  private todos: Todo[] = INITIAL_SEED_TODOS;
  private isLoaded: boolean = false;
  private listeners: Set<Listener> = new Set();
  private loadPromise: Promise<void> | null = null;

  constructor() {
    this.init();
  }

  private async init() {
    if (!this.loadPromise) {
      this.loadPromise = this.loadFromStorage();
    }
    return this.loadPromise;
  }

  private async loadFromStorage() {
    try {
      const stored = await storage.getTodos();
      if (stored && stored.length > 0) {
        this.todos = stored;
      } else {
        // Initialize with default seed todos on first run
        this.todos = INITIAL_SEED_TODOS;
        await storage.saveTodos(this.todos);
      }
    } catch (error) {
      console.error('[TodoStore] Failed to load todos:', error);
      this.todos = INITIAL_SEED_TODOS;
    } finally {
      this.isLoaded = true;
      this.notify();
    }
  }

  public async ensureLoaded(): Promise<void> {
    if (this.isLoaded) return;
    await this.init();
  }

  public getSnapshot(): { todos: Todo[]; isLoaded: boolean } {
    return {
      todos: this.todos,
      isLoaded: this.isLoaded,
    };
  }

  public getTodos(): Todo[] {
    return [...this.todos];
  }

  public getTodoById(id: string): Todo | undefined {
    return this.todos.find((t) => t.id === id);
  }

  public getStats(): TodoStats {
    const total = this.todos.length;
    const completed = this.todos.filter((t) => t.completed).length;
    const remaining = total - completed;
    const completionRate = total > 0 ? completed / total : 0;
    return { total, completed, remaining, completionRate };
  }

  public async addTodo(input: CreateTodoInput): Promise<Todo> {
    await this.ensureLoaded();

    const newTodo: Todo = {
      id: 'todo-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      title: input.title.trim(),
      description: input.description?.trim() || undefined,
      priority: input.priority,
      dueDate: input.dueDate,
      createdAt: new Date().toISOString(),
      completed: false,
    };

    this.todos = [newTodo, ...this.todos];
    this.notify();
    await storage.saveTodos(this.todos);
    return newTodo;
  }

  public async updateTodo(id: string, updates: UpdateTodoInput): Promise<Todo | null> {
    await this.ensureLoaded();

    const index = this.todos.findIndex((t) => t.id === id);
    if (index === -1) return null;

    const current = this.todos[index];
    const isNowCompleted = updates.completed !== undefined ? updates.completed : current.completed;
    
    let completedAt = current.completedAt;
    if (updates.completed !== undefined) {
      if (updates.completed && !current.completed) {
        completedAt = new Date().toISOString();
      } else if (!updates.completed) {
        completedAt = undefined;
      }
    }

    const updated: Todo = {
      ...current,
      title: updates.title !== undefined ? updates.title.trim() : current.title,
      description: updates.description !== undefined ? (updates.description.trim() || undefined) : current.description,
      priority: updates.priority !== undefined ? updates.priority : current.priority,
      dueDate: updates.dueDate !== undefined ? updates.dueDate : current.dueDate,
      completed: isNowCompleted,
      completedAt,
    };

    this.todos = [
      ...this.todos.slice(0, index),
      updated,
      ...this.todos.slice(index + 1),
    ];

    this.notify();
    await storage.saveTodos(this.todos);
    return updated;
  }

  public async toggleTodo(id: string): Promise<boolean> {
    await this.ensureLoaded();

    const todo = this.todos.find((t) => t.id === id);
    if (!todo) return false;

    await this.updateTodo(id, { completed: !todo.completed });
    return true;
  }

  public async deleteTodo(id: string): Promise<boolean> {
    await this.ensureLoaded();

    const index = this.todos.findIndex((t) => t.id === id);
    if (index === -1) return false;

    this.todos = this.todos.filter((t) => t.id !== id);
    this.notify();
    await storage.saveTodos(this.todos);
    return true;
  }

  public async clearAll(): Promise<void> {
    this.todos = [];
    this.notify();
    await storage.clearTodos();
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error('[TodoStore] Listener notification error:', e);
      }
    });
  }
}

export const todoStore = new TodoStore();
