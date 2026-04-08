import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./apiClient', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

import { orderService } from './orderService';
import { apiClient } from './apiClient';

const mockApi = vi.mocked(apiClient);

describe('OrderService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createOrder', () => {
    it('sends POST to /api/orders with request data', async () => {
      const request = {
        tableNumber: 'A1',
        customerName: 'John',
        customerEmail: 'john@test.com',
        products: [{ name: 'Pasta', type: 'HOT_DISH' as const, price: 1500 }],
      };
      const response = { orderId: 1, tableNumber: 'A1', tasksCreated: 1, message: 'Order created' };
      mockApi.post.mockResolvedValue(response);

      const result = await orderService.createOrder(request);
      expect(mockApi.post).toHaveBeenCalledWith('/api/orders', request);
      expect(result).toEqual(response);
    });
  });

  describe('getOrderStatus', () => {
    it('sends GET to /api/orders/:id/status', async () => {
      const status = { orderId: 1, tableNumber: 'A1', status: 'IN_PREPARATION', totalTasks: 3, completedTasks: 1 };
      mockApi.get.mockResolvedValue(status);

      const result = await orderService.getOrderStatus(1);
      expect(mockApi.get).toHaveBeenCalledWith('/api/orders/1/status');
      expect(result).toEqual(status);
    });
  });
});
