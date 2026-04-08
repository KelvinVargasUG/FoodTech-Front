import { ProductType } from './Product';

export const OrderStatus = {
  PENDING: 'PENDING',
  IN_PREPARATION: 'IN_PREPARATION',
  COMPLETED: 'COMPLETED',
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export interface CreateOrderProduct {
  name: string;
  type: ProductType;
  price: number;
}

export interface CreateOrderRequest {
  tableNumber: string;
  customerName: string;
  customerEmail: string;
  products: CreateOrderProduct[];
}

export interface CreateOrderResponse {
  orderId: number;
  tableNumber: string;
  tasksCreated: number;
  message: string;
}

export interface OrderStatusResponse {
  orderId: number;
  tableNumber: string;
  status: OrderStatus;
  createdAt: string;
  completedAt?: string;
  totalTasks: number;
  completedTasks: number;
}
