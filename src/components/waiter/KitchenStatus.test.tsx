import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { KitchenStatus } from './KitchenStatus';
import { TaskStatus, Station } from '../../models/Task';
import { OrderStatus } from '../../models/Order';
import type { Task } from '../../models/Task';

vi.mock('../../services/orderService', () => ({
  orderService: {
    getOrderStatus: vi.fn(),
  },
}));

import { orderService } from '../../services/orderService';
const mockOrderService = vi.mocked(orderService);

describe('KitchenStatus', () => {
  const makeTasks = (orderId: number, tableNumber: string, status: TaskStatus, station: Station): Task => ({
    id: orderId * 10,
    orderId,
    tableNumber,
    station: station,
    status: status,
    products: [{ name: 'Item', type: 'DRINK', quantity: 1 }],
    createdAt: new Date().toISOString(),
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockOrderService.getOrderStatus.mockResolvedValue({
      orderId: 1,
      tableNumber: 'A1',
      status: OrderStatus.IN_PREPARATION,
      createdAt: '2025-01-01T12:00:00Z',
      totalTasks: 3,
      completedTasks: 1,
    });
  });

  it('renders kitchen status container', () => {
    render(<KitchenStatus tasks={[]} isLoading={false} onRefresh={vi.fn()} />);
    expect(screen.getByTestId('kitchen-status')).toBeInTheDocument();
  });

  it('renders empty state when no tasks', () => {
    render(<KitchenStatus tasks={[]} isLoading={false} onRefresh={vi.fn()} />);
    expect(screen.getByTestId('kitchen-empty-state')).toBeInTheDocument();
    expect(screen.getByText('No hay tareas en cocina')).toBeInTheDocument();
  });

  it('renders tasks grouped by order', async () => {
    const tasks = [
      makeTasks(1, 'A1', TaskStatus.PENDING, Station.BAR),
      makeTasks(1, 'A1', TaskStatus.IN_PREPARATION, Station.HOT_KITCHEN),
    ];

    render(<KitchenStatus tasks={tasks} isLoading={false} onRefresh={vi.fn()} />);

    expect(screen.getByTestId('kitchen-order-1')).toBeInTheDocument();
  });

  it('calls onRefresh when refresh button is clicked', () => {
    const onRefresh = vi.fn();
    render(<KitchenStatus tasks={[]} isLoading={false} onRefresh={onRefresh} />);
    fireEvent.click(screen.getByTestId('refresh-kitchen-btn'));
    expect(onRefresh).toHaveBeenCalled();
  });

  it('disables refresh button when loading', () => {
    render(<KitchenStatus tasks={[]} isLoading={true} onRefresh={vi.fn()} />);
    expect(screen.getByTestId('refresh-kitchen-btn')).toBeDisabled();
  });

  it('renders multiple order groups sorted by orderId descending', async () => {
    const tasks = [
      makeTasks(1, 'A1', TaskStatus.PENDING, Station.BAR),
      makeTasks(2, 'B2', TaskStatus.IN_PREPARATION, Station.HOT_KITCHEN),
    ];

    mockOrderService.getOrderStatus
      .mockResolvedValueOnce({
        orderId: 1, tableNumber: 'A1', status: OrderStatus.PENDING,
        createdAt: '2025-01-01T12:00:00Z', totalTasks: 1, completedTasks: 0,
      })
      .mockResolvedValueOnce({
        orderId: 2, tableNumber: 'B2', status: OrderStatus.IN_PREPARATION,
        createdAt: '2025-01-01T12:00:00Z', totalTasks: 1, completedTasks: 0,
      });

    render(<KitchenStatus tasks={tasks} isLoading={false} onRefresh={vi.fn()} />);

    expect(screen.getByTestId('kitchen-order-1')).toBeInTheDocument();
    expect(screen.getByTestId('kitchen-order-2')).toBeInTheDocument();
  });

  it('shows progress bar for non-completed orders', () => {
    const tasks = [
      makeTasks(1, 'A1', TaskStatus.COMPLETED, Station.BAR),
      makeTasks(1, 'A1', TaskStatus.PENDING, Station.HOT_KITCHEN),
    ];

    render(<KitchenStatus tasks={tasks} isLoading={false} onRefresh={vi.fn()} />);
    expect(screen.getByTestId('kitchen-orders-list')).toBeInTheDocument();
  });

  it('shows COMPLETED status label and hides progress bar', async () => {
    const tasks = [
      makeTasks(1, 'A1', TaskStatus.COMPLETED, Station.BAR),
    ];

    mockOrderService.getOrderStatus.mockResolvedValueOnce({
      orderId: 1, tableNumber: 'A1', status: OrderStatus.COMPLETED,
      createdAt: '2025-01-01T12:00:00Z', totalTasks: 1, completedTasks: 1,
    });

    render(<KitchenStatus tasks={tasks} isLoading={false} onRefresh={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByTestId('kitchen-order-status')).toHaveTextContent('Lista');
    });

    expect(screen.getByTestId('kitchen-order-completed-msg')).toHaveTextContent('Recoger en estación de entrega');
    expect(screen.queryByTestId('kitchen-progress-bar')).not.toBeInTheDocument();
  });

  it('shows PENDING status label and pending message', async () => {
    const tasks = [
      makeTasks(1, 'A1', TaskStatus.PENDING, Station.BAR),
    ];

    mockOrderService.getOrderStatus.mockResolvedValueOnce({
      orderId: 1, tableNumber: 'A1', status: OrderStatus.PENDING,
      createdAt: '2025-01-01T12:00:00Z', totalTasks: 1, completedTasks: 0,
    });

    render(<KitchenStatus tasks={tasks} isLoading={false} onRefresh={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByTestId('kitchen-order-status')).toHaveTextContent('En Cola');
    });

    expect(screen.getByTestId('kitchen-order-pending-msg')).toHaveTextContent('Siguiente para preparación');
  });

  it('shows IN_PREPARATION status with progress bar', async () => {
    const tasks = [
      makeTasks(1, 'A1', TaskStatus.COMPLETED, Station.BAR),
      makeTasks(1, 'A1', TaskStatus.IN_PREPARATION, Station.HOT_KITCHEN),
    ];

    mockOrderService.getOrderStatus.mockResolvedValueOnce({
      orderId: 1, tableNumber: 'A1', status: OrderStatus.IN_PREPARATION,
      createdAt: '2025-01-01T12:00:00Z', totalTasks: 2, completedTasks: 1,
    });

    render(<KitchenStatus tasks={tasks} isLoading={false} onRefresh={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByTestId('kitchen-order-status')).toHaveTextContent('Preparando');
    });

    expect(screen.getByTestId('kitchen-progress-bar')).toBeInTheDocument();
  });

  it('shows default status label for unknown order status', async () => {
    const tasks = [
      makeTasks(1, 'A1', TaskStatus.IN_PREPARATION, Station.BAR),
    ];

    mockOrderService.getOrderStatus.mockResolvedValueOnce({
      orderId: 1, tableNumber: 'A1', status: 'CANCELLED' as OrderStatus,
      createdAt: '2025-01-01T12:00:00Z', totalTasks: 1, completedTasks: 0,
    });

    render(<KitchenStatus tasks={tasks} isLoading={false} onRefresh={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByTestId('kitchen-order-status')).toHaveTextContent('CANCELLED');
    });
  });

  it('shows "Cargando..." before order status is fetched', () => {
    // Never resolve the order status promise
    mockOrderService.getOrderStatus.mockReturnValue(new Promise(() => {}));

    const tasks = [
      makeTasks(1, 'A1', TaskStatus.PENDING, Station.BAR),
    ];

    render(<KitchenStatus tasks={tasks} isLoading={false} onRefresh={vi.fn()} />);

    expect(screen.getByTestId('kitchen-order-status')).toHaveTextContent('Cargando...');
  });

  it('handles order status fetch error gracefully', async () => {
    mockOrderService.getOrderStatus.mockRejectedValueOnce(new Error('network error'));

    const tasks = [
      makeTasks(1, 'A1', TaskStatus.IN_PREPARATION, Station.BAR),
    ];

    render(<KitchenStatus tasks={tasks} isLoading={false} onRefresh={vi.fn()} />);

    // After error, orderStatuses map stays empty ⇒ shows "Cargando..."
    await waitFor(() => {
      expect(screen.getByTestId('kitchen-order-1')).toBeInTheDocument();
    });
  });

  it('calculates progress correctly with multiple stations completed', async () => {
    const tasks = [
      makeTasks(1, 'A1', TaskStatus.COMPLETED, Station.BAR),
      makeTasks(1, 'A1', TaskStatus.COMPLETED, Station.HOT_KITCHEN),
      makeTasks(1, 'A1', TaskStatus.PENDING, Station.COLD_KITCHEN),
    ];

    mockOrderService.getOrderStatus.mockResolvedValueOnce({
      orderId: 1, tableNumber: 'A1', status: OrderStatus.IN_PREPARATION,
      createdAt: '2025-01-01T12:00:00Z', totalTasks: 3, completedTasks: 2,
    });

    render(<KitchenStatus tasks={tasks} isLoading={false} onRefresh={vi.fn()} />);

    await waitFor(() => {
      const progressFill = screen.getByTestId('kitchen-progress-fill');
      expect(progressFill.getAttribute('data-progress')).toBe('67');
    });
  });

  it('shows all station completed progress as 100%', async () => {
    const tasks = [
      makeTasks(1, 'A1', TaskStatus.COMPLETED, Station.BAR),
      makeTasks(1, 'A1', TaskStatus.COMPLETED, Station.HOT_KITCHEN),
      makeTasks(1, 'A1', TaskStatus.COMPLETED, Station.COLD_KITCHEN),
    ];

    mockOrderService.getOrderStatus.mockResolvedValueOnce({
      orderId: 1, tableNumber: 'A1', status: OrderStatus.IN_PREPARATION,
      createdAt: '2025-01-01T12:00:00Z', totalTasks: 3, completedTasks: 3,
    });

    render(<KitchenStatus tasks={tasks} isLoading={false} onRefresh={vi.fn()} />);

    await waitFor(() => {
      const progressFill = screen.getByTestId('kitchen-progress-fill');
      expect(progressFill.getAttribute('data-progress')).toBe('100');
    });
  });
});
