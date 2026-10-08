import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Todo } from '@/types/todo';

const TODOS_STORAGE_KEY = '@todo_app/todos_v1';

function isStorageAvailable(): boolean {
  if (Platform.OS === 'web') {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }
  return true;
}

export const storage = {
  /**
   * Retrieves all saved todos from persistent storage.
   */
  async getTodos(): Promise<Todo[]> {
    if (!isStorageAvailable()) {
      return [];
    }

    try {
      const data = await AsyncStorage.getItem(TODOS_STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return [];
    } catch (error) {
      console.error('[Storage] Error loading todos from AsyncStorage:', error);
      return [];
    }
  },

  /**
   * Persists the given array of todos to AsyncStorage.
   */
  async saveTodos(todos: Todo[]): Promise<boolean> {
    if (!isStorageAvailable()) {
      return false;
    }

    try {
      const data = JSON.stringify(todos);
      await AsyncStorage.setItem(TODOS_STORAGE_KEY, data);
      return true;
    } catch (error) {
      console.error('[Storage] Error saving todos to AsyncStorage:', error);
      return false;
    }
  },

  /**
   * Clears all todos from persistent storage.
   */
  async clearTodos(): Promise<boolean> {
    if (!isStorageAvailable()) {
      return false;
    }

    try {
      await AsyncStorage.removeItem(TODOS_STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('[Storage] Error clearing todos from AsyncStorage:', error);
      return false;
    }
  },
};
