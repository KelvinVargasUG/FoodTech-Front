import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTables } from './useTables';
import { TableStatus } from '../models/Table';
import { Station, TaskStatus } from '../models/Task';
import type { Task } from '../models/Task';

describe('useTables', () => {
  it('initializes with 8 tables all available', () => {
    const { result } = renderHook(() => useTables());
    expect(result.current.tables).toHaveLength(8);
    result.current.tables.forEach((t) => {
      expect(t.status).toBe(TableStatus.DISPONIBLE);
    });
    expect(result.current.selectedTable).toBeUndefined();
    expect(result.current.selectedTableId).toBeNull();
  });

  it('selectTable sets selected table', () => {
    const { result } = renderHook(() => useTables());

    act(() => {
      result.current.selectTable('1');
    });

    expect(result.current.selectedTableId).toBe('1');
    expect(result.current.selectedTable?.number).toBe('A1');
  });

  it('markTableAsOccupied changes status and sets orderId', () => {
    const { result } = renderHook(() => useTables());

    act(() => {
      result.current.markTableAsOccupied('1', 100);
    });

    const table = result.current.tables.find((t) => t.id === '1');
    expect(table?.status).toBe(TableStatus.OCUPADA);
    expect(table?.activeOrderId).toBe(100);
  });

  it('markTableAsAvailable resets table', () => {
    const { result } = renderHook(() => useTables());

    act(() => {
      result.current.markTableAsOccupied('1', 100);
    });

    act(() => {
      result.current.markTableAsAvailable('1');
    });

    const table = result.current.tables.find((t) => t.id === '1');
    expect(table?.status).toBe(TableStatus.DISPONIBLE);
    expect(table?.activeOrderId).toBeUndefined();
  });

  it('syncTablesWithTasks marks tables as occupied based on active tasks', () => {
    const { result } = renderHook(() => useTables());

    const tasks: Task[] = [
      {
        id: 1,
        orderId: 100,
        tableNumber: 'A1',
        station: Station.BAR,
        status: TaskStatus.PENDING,
        products: [],
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        orderId: 101,
        tableNumber: 'B2',
        station: Station.HOT_KITCHEN,
        status: TaskStatus.IN_PREPARATION,
        products: [],
        createdAt: new Date().toISOString(),
      },
      {
        id: 3,
        orderId: 102,
        tableNumber: 'A3',
        station: Station.COLD_KITCHEN,
        status: TaskStatus.COMPLETED,
        products: [],
        createdAt: new Date().toISOString(),
      },
    ];

    act(() => {
      result.current.syncTablesWithTasks(tasks);
    });

    // A1 should be occupied (PENDING task)
    const a1 = result.current.tables.find((t) => t.number === 'A1');
    expect(a1?.status).toBe(TableStatus.OCUPADA);
    expect(a1?.activeOrderId).toBe(100);

    // B2 should be occupied (IN_PREPARATION task)
    const b2 = result.current.tables.find((t) => t.number === 'B2');
    expect(b2?.status).toBe(TableStatus.OCUPADA);
    expect(b2?.activeOrderId).toBe(101);

    // A3 should be available (COMPLETED task)
    const a3 = result.current.tables.find((t) => t.number === 'A3');
    expect(a3?.status).toBe(TableStatus.DISPONIBLE);
    expect(a3?.activeOrderId).toBeUndefined();
  });

  it('syncTablesWithTasks marks previously occupied tables as available when no active tasks', () => {
    const { result } = renderHook(() => useTables());

    act(() => {
      result.current.markTableAsOccupied('1', 100);
    });

    act(() => {
      result.current.syncTablesWithTasks([]);
    });

    const a1 = result.current.tables.find((t) => t.id === '1');
    expect(a1?.status).toBe(TableStatus.DISPONIBLE);
  });
});
