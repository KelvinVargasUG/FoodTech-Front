import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TaskList } from './TaskList';
import { TaskStatus, Station } from '../../models/Task';
import type { Task } from '../../models/Task';

describe('TaskList', () => {
  const makeTasks = (count: number): Task[] =>
    Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      orderId: 100 + i,
      tableNumber: `A${i + 1}`,
      station: Station.BAR,
      status: TaskStatus.PENDING,
      products: [{ name: `Product ${i}`, type: 'DRINK', quantity: 1 }],
      createdAt: new Date().toISOString(),
    }));

  it('renders empty message when no tasks', () => {
    render(<TaskList tasks={[]} onStartPreparation={vi.fn()} startingTaskId={null} />);
    expect(screen.getByTestId('empty-tasks-message')).toBeInTheDocument();
    expect(screen.getByText('Sin Tareas Pendientes')).toBeInTheDocument();
  });

  it('renders custom empty message', () => {
    render(<TaskList tasks={[]} onStartPreparation={vi.fn()} startingTaskId={null} emptyMessage="No hay nada" />);
    expect(screen.getByText('No hay nada')).toBeInTheDocument();
  });

  it('renders task cards when tasks exist', () => {
    const tasks = makeTasks(3);
    render(<TaskList tasks={tasks} onStartPreparation={vi.fn()} startingTaskId={null} />);
    expect(screen.getByTestId('task-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('task-card-2')).toBeInTheDocument();
    expect(screen.getByTestId('task-card-3')).toBeInTheDocument();
  });

  it('marks correct task as starting', () => {
    const tasks = makeTasks(2);
    render(<TaskList tasks={tasks} onStartPreparation={vi.fn()} startingTaskId={1} />);
    expect(screen.getByTestId('start-task-btn-1')).toBeDisabled();
    expect(screen.getByTestId('start-task-btn-2')).not.toBeDisabled();
  });
});
