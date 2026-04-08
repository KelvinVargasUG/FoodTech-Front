import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useKitchenTasks } from './useKitchenTasks';
import { Station, TaskStatus } from '../models/Task';
import type { Task } from '../models/Task';

vi.mock('../services/taskService', () => ({
  taskService: {
    getAllTasks: vi.fn(),
    getTasksByStation: vi.fn(),
    startTask: vi.fn(),
  },
}));

import { taskService } from '../services/taskService';
const mockTaskService = vi.mocked(taskService);

describe('useKitchenTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const mockTasks: Task[] = [
    {
      id: 1,
      orderId: 100,
      tableNumber: 'A1',
      station: Station.BAR,
      status: TaskStatus.PENDING,
      products: [{ name: 'Mojito', type: 'DRINK', quantity: 1 }],
      createdAt: new Date().toISOString(),
    },
  ];

  it('fetches tasks on mount and returns them', async () => {
    mockTaskService.getAllTasks.mockResolvedValue(mockTasks);

    const { result } = renderHook(() => useKitchenTasks(999999));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(result.current.tasks).toEqual(mockTasks);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles Error object in fetch failure', async () => {
    mockTaskService.getAllTasks.mockRejectedValue(new Error('Network failed'));

    const { result } = renderHook(() => useKitchenTasks(999999));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(result.current.error).toBe('Network failed');
    expect(result.current.isLoading).toBe(false);
  });

  it('handles non-Error in fetch failure', async () => {
    mockTaskService.getAllTasks.mockRejectedValue('some string');

    const { result } = renderHook(() => useKitchenTasks(999999));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(result.current.error).toBe('Error al cargar tareas');
  });

  it('provides refreshTasks function', async () => {
    mockTaskService.getAllTasks.mockResolvedValue(mockTasks);

    const { result } = renderHook(() => useKitchenTasks(999999));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    mockTaskService.getAllTasks.mockResolvedValue([]);

    await act(async () => {
      await result.current.refreshTasks();
    });

    expect(result.current.tasks).toEqual([]);
  });
});
