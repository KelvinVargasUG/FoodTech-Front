import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskStatusFilter } from './TaskStatusFilter';
import { TaskStatus } from '../../models/Task';

describe('TaskStatusFilter', () => {
  const taskCounts = { all: 10, pending: 5, inPreparation: 3, completed: 2 };

  it('renders all filter buttons', () => {
    render(
      <TaskStatusFilter
        selectedStatus="ALL"
        onStatusChange={vi.fn()}
        taskCounts={taskCounts}
      />
    );
    expect(screen.getByText('Todas las Tareas')).toBeInTheDocument();
    expect(screen.getByText('Pendientes')).toBeInTheDocument();
    expect(screen.getByText('En Preparación')).toBeInTheDocument();
    expect(screen.getByText('Completadas')).toBeInTheDocument();
  });

  it('calls onStatusChange with correct status on click', () => {
    const onChange = vi.fn();
    render(
      <TaskStatusFilter
        selectedStatus="ALL"
        onStatusChange={onChange}
        taskCounts={taskCounts}
      />
    );

    fireEvent.click(screen.getByText('Pendientes'));
    expect(onChange).toHaveBeenCalledWith(TaskStatus.PENDING);

    fireEvent.click(screen.getByText('En Preparación'));
    expect(onChange).toHaveBeenCalledWith(TaskStatus.IN_PREPARATION);

    fireEvent.click(screen.getByText('Completadas'));
    expect(onChange).toHaveBeenCalledWith(TaskStatus.COMPLETED);

    fireEvent.click(screen.getByText('Todas las Tareas'));
    expect(onChange).toHaveBeenCalledWith('ALL');
  });
});
