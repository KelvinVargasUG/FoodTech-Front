import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStationTasks } from './useStationTasks';
import { Station, TaskStatus } from '../models/Task';
import type { Task } from '../models/Task';

vi.mock('../services/taskService', () => ({
  taskService: {
    getTasksByStation: vi.fn(),
    startTask: vi.fn(),
  },
}));

import { taskService } from '../services/taskService';
const mockTaskService = vi.mocked(taskService);

describe('useStationTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const makeTasks = (statuses: TaskStatus[]): Task[] =>
    statuses.map((status, i) => ({
      id: i + 1,
      orderId: 100 + i,
      tableNumber: `A${i + 1}`,
      station: Station.BAR,
      status: status,
      products: [{ name: `Product ${i}`, type: 'DRINK', quantity: 1 }],
      createdAt: new Date().toISOString(),
    }));

  it('fetches tasks on mount and sets loading to false', async () => {
    const tasks = makeTasks([TaskStatus.PENDING, TaskStatus.IN_PREPARATION, TaskStatus.COMPLETED]);
    mockTaskService.getTasksByStation.mockResolvedValue(tasks);

    const { result } = renderHook(() => useStationTasks(Station.BAR, 999999));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.tasks).toEqual(tasks);
    expect(result.current.taskCounts).toEqual({
      all: 3,
      pending: 1,
      inPreparation: 1,
      completed: 1,
    });
  });

  it('filters tasks by selected status', async () => {
    const tasks = makeTasks([TaskStatus.PENDING, TaskStatus.IN_PREPARATION, TaskStatus.COMPLETED]);
    mockTaskService.getTasksByStation.mockResolvedValue(tasks);

    const { result } = renderHook(() => useStationTasks(Station.BAR, 999999));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    act(() => {
      result.current.setSelectedStatus(TaskStatus.PENDING);
    });

    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].status).toBe(TaskStatus.PENDING);
  });

  it('shows all tasks when status is ALL', async () => {
    const tasks = makeTasks([TaskStatus.PENDING, TaskStatus.COMPLETED]);
    mockTaskService.getTasksByStation.mockResolvedValue(tasks);

    const { result } = renderHook(() => useStationTasks(Station.BAR, 999999));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(result.current.selectedStatus).toBe('ALL');
    expect(result.current.tasks).toHaveLength(2);
  });

  it('handles fetch error', async () => {
    mockTaskService.getTasksByStation.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useStationTasks(Station.BAR, 999999));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.loading).toBe(false);
  });

  it('handles non-Error fetch failure', async () => {
    mockTaskService.getTasksByStation.mockRejectedValue('unknown');

    const { result } = renderHook(() => useStationTasks(Station.BAR, 999999));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(result.current.error).toBe('Error al cargar tareas');
  });

  it('starts task preparation successfully', async () => {
    const tasks = makeTasks([TaskStatus.PENDING]);
    mockTaskService.getTasksByStation.mockResolvedValue(tasks);
    mockTaskService.startTask.mockResolvedValue({ ...tasks[0], status: TaskStatus.IN_PREPARATION });

    const { result } = renderHook(() => useStationTasks(Station.BAR, 999999));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    await act(async () => {
      await result.current.startTaskPreparation(1);
    });

    expect(mockTaskService.startTask).toHaveBeenCalledWith(1);
    expect(result.current.startingTaskId).toBeNull();
  });

  it('handles start task error', async () => {
    mockTaskService.getTasksByStation.mockResolvedValue([]);
    mockTaskService.startTask.mockRejectedValue(new Error('Cannot start'));

    const { result } = renderHook(() => useStationTasks(Station.BAR, 999999));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    await act(async () => {
      await result.current.startTaskPreparation(1);
    });

    expect(result.current.error).toBe('Cannot start');
    expect(result.current.startingTaskId).toBeNull();
  });

  it('handles non-Error start task failure', async () => {
    mockTaskService.getTasksByStation.mockResolvedValue([]);
    mockTaskService.startTask.mockRejectedValue(42);

    const { result } = renderHook(() => useStationTasks(Station.BAR, 999999));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    await act(async () => {
      await result.current.startTaskPreparation(1);
    });

    expect(result.current.error).toBe('Error al iniciar preparación');
  });
});
