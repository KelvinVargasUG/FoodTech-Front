import { useState, useEffect, useCallback } from 'react';
import type { Task } from '../models/Task';
import { TaskStatus } from '../models/Task';
import type { Station } from '../models/Task';
import { taskService } from '../services/taskService';

export function useStationTasks(station: Station, pollingInterval = 5000) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingTaskId, setStartingTaskId] = useState<number | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setError(null);
      const data = await taskService.getTasksByStation(station);
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar tareas');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [station]);

  useEffect(() => {
    if (selectedStatus === 'ALL') {
      setFilteredTasks(tasks);
    } else {
      setFilteredTasks(tasks.filter(task => task.status === selectedStatus));
    }
  }, [tasks, selectedStatus]);

  useEffect(() => {
    fetchTasks();
    const intervalId = setInterval(fetchTasks, pollingInterval);
    return () => clearInterval(intervalId);
  }, [fetchTasks, pollingInterval]);

  const startTaskPreparation = async (taskId: number) => {
    try {
      setStartingTaskId(taskId);
      setError(null);
      await taskService.startTask(taskId);
      await fetchTasks(); 
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar preparación');
      console.error('Error starting task:', err);
    } finally {
      setStartingTaskId(null);
    }
  };

  const taskCounts = {
    all: tasks.length,
    pending: tasks.filter(t => t.status === TaskStatus.PENDING).length,
    inPreparation: tasks.filter(t => t.status === TaskStatus.IN_PREPARATION).length,
    completed: tasks.filter(t => t.status === TaskStatus.COMPLETED).length
  };

  return {
    tasks: filteredTasks,
    selectedStatus,
    setSelectedStatus,
    loading,
    error,
    startingTaskId,
    startTaskPreparation,
    taskCounts,
    refreshTasks: fetchTasks
  };
}
