import { apiClient } from './apiClient';
import type {
  CreateOrderRequest,
  CreateOrderResponse,
  OrderStatusResponse,
} from '../models/Order';

class OrderService {

  async createOrder(request: CreateOrderRequest): Promise<CreateOrderResponse> {
    return apiClient.post<CreateOrderRequest, CreateOrderResponse>(
      '/api/orders',
      request
    );
  }

  async getOrderStatus(orderId: number): Promise<OrderStatusResponse> {
    return apiClient.get<OrderStatusResponse>(`/api/orders/${orderId}/status`);
  }
}

export const orderService = new OrderService();
