import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCompletedOrders } from './useCompletedOrders';

vi.mock('../services/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    postNoContent: vi.fn(),
  },
}));

import { apiClient } from '../services/apiClient';
const mockApi = vi.mocked(apiClient);

describe('useCompletedOrders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const mockOrdersResponse = [
    { orderId: 1, tableNumber: 'A1', totalItems: 3, totalPreparationTime: 120, completedAt: '2025-01-01T12:00:00Z' },
    { orderId: 2, tableNumber: 'B2', totalItems: 5, totalPreparationTime: 180, completedAt: '2025-01-01T13:00:00Z' },
  ];

  it('fetches completed orders on mount', async () => {
    mockApi.get.mockResolvedValue(mockOrdersResponse);

    const { result } = renderHook(() => useCompletedOrders());

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(result.current.completedOrders).toHaveLength(2);
    expect(result.current.count).toBe(2);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles fetch error', async () => {
    mockApi.get.mockRejectedValue(new Error('Connection failed'));

    const { result } = renderHook(() => useCompletedOrders());

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(result.current.error).toBe('Connection failed');
    expect(result.current.completedOrders).toHaveLength(0);
  });

  it('handles non-Error fetch failure', async () => {
    mockApi.get.mockRejectedValue('unknown');

    const { result } = renderHook(() => useCompletedOrders());

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(result.current.error).toBe('Error al cargar pedidos');
  });

  it('does not update orders if signature is the same', async () => {
    mockApi.get.mockResolvedValue(mockOrdersResponse);

    const { result } = renderHook(() => useCompletedOrders());

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    const firstOrders = result.current.completedOrders;

    // Trigger another refresh (same data, same signature)
    await act(async () => {
      await result.current.refresh();
    });

    // Should be the same reference since signature didn't change
    expect(result.current.completedOrders).toBe(firstOrders);
  });

  it('markAsInvoiced removes order from list', async () => {
    mockApi.get.mockResolvedValue(mockOrdersResponse);

    const { result } = renderHook(() => useCompletedOrders());

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(result.current.completedOrders).toHaveLength(2);

    act(() => {
      result.current.markAsInvoiced('1');
    });

    expect(result.current.completedOrders).toHaveLength(1);
    expect(result.current.completedOrders[0].id).toBe('2');
  });

  it('requestInvoice posts and refreshes', async () => {
    mockApi.get.mockResolvedValue(mockOrdersResponse);
    mockApi.postNoContent.mockResolvedValue(undefined);

    const { result } = renderHook(() => useCompletedOrders());

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    // After invoice, get returns remaining orders
    mockApi.get.mockResolvedValue([mockOrdersResponse[1]]);

    let remainingCount: number | undefined;
    await act(async () => {
      remainingCount = await result.current.requestInvoice(1);
    });

    expect(mockApi.postNoContent).toHaveBeenCalledWith('/api/orders/1/invoice', {});
    expect(remainingCount).toBe(1);
  });

  it('requestInvoice handles error', async () => {
    mockApi.get.mockResolvedValue(mockOrdersResponse);
    mockApi.postNoContent.mockRejectedValue(new Error('Invoice failed'));

    const { result } = renderHook(() => useCompletedOrders());

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    let thrownError: unknown;
    await act(async () => {
      try {
        await result.current.requestInvoice(1);
      } catch (err) {
        thrownError = err;
      }
    });

    expect(thrownError).toBeInstanceOf(Error);
    expect((thrownError as Error).message).toBe('Invoice failed');
    expect(result.current.invoiceErrorById['1']).toBe('Invoice failed');
  });

  it('requestInvoice handles non-Error throw', async () => {
    mockApi.get.mockResolvedValue(mockOrdersResponse);
    mockApi.postNoContent.mockRejectedValue('unknown');

    const { result } = renderHook(() => useCompletedOrders());

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    let thrownError: unknown;
    await act(async () => {
      try {
        await result.current.requestInvoice(1);
      } catch (err) {
        thrownError = err;
      }
    });

    expect(thrownError).toBe('unknown');
    expect(result.current.invoiceErrorById['1']).toBe('Error al solicitar la factura');
  });
});
