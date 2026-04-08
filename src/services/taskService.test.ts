import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

import { taskService } from './taskService';
import { apiClient } from './apiClient';
import { Station } from '../models/Task';

const mockApi = vi.mocked(apiClient);

describe('TaskService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTasksByStation', () => {
    it('calls GET with station parameter', async () => {
      const tasks = [{ id: 1, station: 'BAR', status: 'PENDING' }];
      mockApi.get.mockResolvedValue(tasks);

      const result = await taskService.getTasksByStation(Station.BAR);
      expect(mockApi.get).toHaveBeenCalledWith('/api/tasks/station/BAR');
      expect(result).toEqual(tasks);
    });
  });

  describe('getAllTasks', () => {
    it('fetches tasks from all three stations and merges them', async () => {
      const barTasks = [{ id: 1, station: 'BAR' }];
      const hotTasks = [{ id: 2, station: 'HOT_KITCHEN' }];
      const coldTasks = [{ id: 3, station: 'COLD_KITCHEN' }];

      mockApi.get
        .mockResolvedValueOnce(barTasks)
        .mockResolvedValueOnce(hotTasks)
        .mockResolvedValueOnce(coldTasks);

      const result = await taskService.getAllTasks();
      expect(result).toEqual([...barTasks, ...hotTasks, ...coldTasks]);
      expect(mockApi.get).toHaveBeenCalledTimes(3);
    });
  });

  describe('startTask', () => {
    it('calls PATCH to start a task', async () => {
      const task = { id: 1, status: 'IN_PREPARATION' };
      mockApi.patch.mockResolvedValue(task);

      const result = await taskService.startTask(1);
      expect(mockApi.patch).toHaveBeenCalledWith('/api/tasks/1/start');
      expect(result).toEqual(task);
    });
  });
});
