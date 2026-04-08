import { useState, useEffect, useCallback } from 'react';
import type { Task } from '../models/Task';
import { taskService } from '../services/taskService';

export const useKitchenTasks = (refreshInterval = 5000) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const allTasks = await taskService.getAllTasks();
      setTasks(allTasks);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al cargar tareas';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchTasks, refreshInterval]);

  return {
    tasks,
    isLoading,
    error,
    refreshTasks: fetchTasks,
  };
};
