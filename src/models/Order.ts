import { ProductType } from './Product';

/**
 * Estados de una orden según el backend
 */
export const OrderStatus = {
  PENDING: 'PENDING',
  IN_PREPARATION: 'IN_PREPARATION',
  COMPLETED: 'COMPLETED',
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

/**
 * Producto en el pedido para enviar al backend
 */
export interface CreateOrderProduct {
  name: string;
  type: ProductType;
  price: number;
}

/**
 * Request para crear una orden
 */
export interface CreateOrderRequest {
  tableNumber: string;
  customerName: string;
  customerEmail: string;
  products: CreateOrderProduct[];
}

/**
 * Response al crear una orden
 */
export interface CreateOrderResponse {
  orderId: number;
  tableNumber: string;
  tasksCreated: number;
  message: string;
}

/**
 * Response al consultar el estado de una orden
 */
export interface OrderStatusResponse {
  orderId: number;
  tableNumber: string;
  status: OrderStatus;
  createdAt: string;
  completedAt?: string;
  totalTasks: number;
  completedTasks: number;
}
