import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCard } from './TaskCard';
import { TaskStatus, Station } from '../../models/Task';
import { ProductType } from '../../models/Product';
import type { Task } from '../../models/Task';

describe('TaskCard', () => {
  const baseTask: Task = {
    id: 1,
    orderId: 100,
    tableNumber: 'A1',
    station: Station.BAR,
    status: TaskStatus.PENDING,
    products: [
      { name: 'Mojito', type: ProductType.DRINK, quantity: 2 },
      { name: 'Beer', type: 'OTHER', quantity: 1 },
    ],
    createdAt: '2025-01-01T12:00:00Z',
  };

  it('renders task info with table number, order id, and products', () => {
    render(<TaskCard task={baseTask} onStartPreparation={vi.fn()} />);

    expect(screen.getByTestId('task-table-number')).toHaveTextContent('Mesa A1');
    expect(screen.getByTestId('task-order-id')).toHaveTextContent('Pedido #100');
    expect(screen.getByTestId('task-status-badge')).toHaveTextContent('Pendiente');
    expect(screen.getByTestId('task-product-0')).toBeInTheDocument();
    expect(screen.getByTestId('task-product-1')).toBeInTheDocument();
  });

  it('shows start button for pending tasks', () => {
    render(<TaskCard task={baseTask} onStartPreparation={vi.fn()} />);
    expect(screen.getByTestId('start-task-btn-1')).toHaveTextContent('Iniciar Preparación');
  });

  it('calls onStartPreparation when start button is clicked', () => {
    const onStart = vi.fn();
    render(<TaskCard task={baseTask} onStartPreparation={onStart} />);
    fireEvent.click(screen.getByTestId('start-task-btn-1'));
    expect(onStart).toHaveBeenCalledWith(1);
  });

  it('shows Iniciando... when isStarting is true', () => {
    render(<TaskCard task={baseTask} onStartPreparation={vi.fn()} isStarting={true} />);
    expect(screen.getByTestId('start-task-btn-1')).toHaveTextContent('Iniciando...');
    expect(screen.getByTestId('start-task-btn-1')).toBeDisabled();
  });

  it('shows in-preparation status and info message', () => {
    const task = { ...baseTask, status: TaskStatus.IN_PREPARATION };
    render(<TaskCard task={task} onStartPreparation={vi.fn()} />);
    expect(screen.getByTestId('task-status-badge')).toHaveTextContent('En Preparación');
    expect(screen.getByText('Se completará automáticamente')).toBeInTheDocument();
    expect(screen.queryByTestId('start-task-btn-1')).not.toBeInTheDocument();
  });

  it('shows completed status without start button', () => {
    const task = { ...baseTask, status: TaskStatus.COMPLETED };
    render(<TaskCard task={task} onStartPreparation={vi.fn()} />);
    expect(screen.getByTestId('task-status-badge')).toHaveTextContent('Completada');
    expect(screen.queryByTestId('start-task-btn-1')).not.toBeInTheDocument();
  });

  it('renders product icons based on type', () => {
    const task: Task = {
      ...baseTask,
      products: [
        { name: 'Mojito', type: ProductType.DRINK, quantity: 1 },
        { name: 'Steak', type: ProductType.HOT_DISH, quantity: 1 },
        { name: 'Salad', type: ProductType.COLD_DISH, quantity: 1 },
      ],
    };
    render(<TaskCard task={task} onStartPreparation={vi.fn()} />);
    expect(screen.getByText('local_bar')).toBeInTheDocument();
    expect(screen.getByText('local_fire_department')).toBeInTheDocument();
    expect(screen.getByText('ac_unit')).toBeInTheDocument();
  });

  it('handles unknown status gracefully', () => {
    const task = { ...baseTask, status: 'UNKNOWN' as TaskStatus };
    render(<TaskCard task={task} onStartPreparation={vi.fn()} />);
    expect(screen.getByTestId('task-status-badge')).toHaveTextContent('UNKNOWN');
  });
});
