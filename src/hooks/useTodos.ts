import { useState, useEffect, useMemo, useCallback } from 'react';
import { todoStore } from '@/store/todoStore';
import { FilterStatus, SortOption, CreateTodoInput, UpdateTodoInput, TodoStats } from '@/types/todo';

const PRIORITY_WEIGHT = {
  high: 3,
  medium: 2,
  low: 1,
};

export function useTodos() {
  const [snapshot, setSnapshot] = useState(() => todoStore.getSnapshot());
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    // Initial sync
    todoStore.ensureLoaded();

    const unsubscribe = todoStore.subscribe(() => {
      setSnapshot(todoStore.getSnapshot());
    });

    return unsubscribe;
  }, []);

  const todos = snapshot.todos;
  const isLoaded = snapshot.isLoaded;

  // Compute tab counts
  const filterCounts = useMemo(() => {
    let all = todos.length;
    let active = 0;
    let completed = 0;
    let high = 0;

    for (const t of todos) {
      if (t.completed) {
        completed++;
      } else {
        active++;
      }
      if (t.priority === 'high') {
        high++;
      }
    }

    return { all, active, completed, high };
  }, [todos]);

  // Compute stats for progress dashboard
  const stats: TodoStats = useMemo(() => {
    const total = todos.length;
    const completed = filterCounts.completed;
    const remaining = total - completed;
    const completionRate = total > 0 ? completed / total : 0;
    return { total, completed, remaining, completionRate };
  }, [todos.length, filterCounts.completed]);

  // Filter & Search & Sort
  const filteredTodos = useMemo(() => {
    let result = [...todos];

    // 1. Status Filter
    if (filter === 'active') {
      result = result.filter((t) => !t.completed);
    } else if (filter === 'completed') {
      result = result.filter((t) => t.completed);
    } else if (filter === 'high') {
      result = result.filter((t) => t.priority === 'high');
    }

    // 2. Search Query
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((t) => {
        const titleMatch = t.title.toLowerCase().includes(q);
        const descMatch = t.description?.toLowerCase().includes(q) ?? false;
        return titleMatch || descMatch;
      });
    }

    // 3. Sorting
    result.sort((a, b) => {
      // Completed items always sort gently below active items in standard views unless explicitly sorting
      if (filter === 'all' && a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      switch (sortOption) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

        case 'priority': {
          const weightDiff = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
          if (weightDiff !== 0) return weightDiff;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }

        case 'dueDate': {
          if (a.dueDate && b.dueDate) {
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          }
          if (a.dueDate && !b.dueDate) return -1;
          if (!a.dueDate && b.dueDate) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }

        default:
          return 0;
      }
    });

    return result;
  }, [todos, filter, searchQuery, sortOption]);

  const addTodo = useCallback(async (input: CreateTodoInput) => {
    return await todoStore.addTodo(input);
  }, []);

  const updateTodo = useCallback(async (id: string, updates: UpdateTodoInput) => {
    return await todoStore.updateTodo(id, updates);
  }, []);

  const toggleTodo = useCallback(async (id: string) => {
    return await todoStore.toggleTodo(id);
  }, []);

  const deleteTodo = useCallback(async (id: string) => {
    return await todoStore.deleteTodo(id);
  }, []);

  const getTodo = useCallback((id: string) => {
    return todoStore.getTodoById(id);
  }, []);

  return {
    todos,
    filteredTodos,
    stats,
    filter,
    setFilter,
    sortOption,
    setSortOption,
    searchQuery,
    setSearchQuery,
    filterCounts,
    isLoading: !isLoaded,
    addTodo,
    updateTodo,
    toggleTodo,
    deleteTodo,
    getTodo,
  };
}
