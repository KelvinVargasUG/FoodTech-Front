import { apiClient } from './apiClient';
import type { Task } from '../models/Task';
import { Station } from '../models/Task';

class TaskService {

  async getTasksByStation(station: Station): Promise<Task[]> {
    return apiClient.get<Task[]>(`/api/tasks/station/${station}`);
  }

  async getAllTasks(): Promise<Task[]> {
    const [barTasks, hotTasks, coldTasks] = await Promise.all([
      this.getTasksByStation(Station.BAR),
      this.getTasksByStation(Station.HOT_KITCHEN),
      this.getTasksByStation(Station.COLD_KITCHEN),
    ]);

    return [...barTasks, ...hotTasks, ...coldTasks];
  }

  async startTask(taskId: number): Promise<Task> {
    return apiClient.patch<Task>(`/api/tasks/${taskId}/start`);
  }
}

export const taskService = new TaskService();
