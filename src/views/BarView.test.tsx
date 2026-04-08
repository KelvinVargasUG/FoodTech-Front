import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { BarView } from './BarView';
import { Station, TaskStatus } from '../models/Task';
import type { Task } from '../models/Task';

const mockSetSelectedStatus = vi.fn();
const mockStartTaskPreparation = vi.fn();

vi.mock('../hooks/useStationTasks', () => ({
  useStationTasks: vi.fn(),
}));

vi.mock('../components/kitchen/StationLayout', () => ({
  StationLayout: ({ stationName, stationCode, children }: { stationName: string; stationCode: string; children?: ReactNode }) => (
    <div data-testid="station-layout">
      <span>{stationName}</span>
      <span>{stationCode}</span>
      {children}
    </div>
  ),
}));

vi.mock('../components/kitchen/TaskStatusFilter', () => ({
  TaskStatusFilter: () => <div data-testid="task-status-filter" />,
}));

vi.mock('../components/kitchen/TaskList', () => ({
  TaskList: ({ tasks, emptyMessage }: { tasks: Task[]; emptyMessage: string }) => (
    <div data-testid="task-list">
      {tasks.length === 0 ? <span>{emptyMessage}</span> : tasks.map((t: Task) => <span key={t.id}>{t.products[0]?.name}</span>)}
    </div>
  ),
}));

import { useStationTasks } from '../hooks/useStationTasks';
const mockUseStationTasks = vi.mocked(useStationTasks);

const baseTasks: Task[] = [
  {
    id: 1,
    orderId: 100,
    tableNumber: 'A1',
    station: Station.BAR,
    status: TaskStatus.PENDING,
    products: [{ name: 'Mojito', type: 'DRINK', quantity: 1 }],
    createdAt: new Date().toISOString(),
  },
];

function setupHook(overrides: Partial<ReturnType<typeof useStationTasks>> = {}) {
  mockUseStationTasks.mockReturnValue({
    tasks: baseTasks,
    selectedStatus: 'ALL',
    setSelectedStatus: mockSetSelectedStatus,
    loading: false,
    error: null,
    startingTaskId: null,
    startTaskPreparation: mockStartTaskPreparation,
    taskCounts: { all: 1, pending: 1, inPreparation: 0, completed: 0 },
    refreshTasks: vi.fn(),
    ...overrides,
  } as unknown as ReturnType<typeof useStationTasks>);
}

describe('BarView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders station name and code', () => {
    setupHook();
    render(<BarView />);
    expect(screen.getByText('Estación Barra')).toBeInTheDocument();
    expect(screen.getByText('BAR • Bebidas y Cócteles')).toBeInTheDocument();
  });

  it('calls useStationTasks with Station.BAR', () => {
    setupHook();
    render(<BarView />);
    expect(mockUseStationTasks).toHaveBeenCalledWith(Station.BAR);
  });

  it('shows loading state when loading with no tasks', () => {
    setupHook({ loading: true, tasks: [] });
    render(<BarView />);
    expect(screen.getByText('Cargando tareas...')).toBeInTheDocument();
  });

  it('shows error message', () => {
    setupHook({ error: 'Network error' });
    render(<BarView />);
    expect(screen.getByText('Network error')).toBeInTheDocument();
  });

  it('renders task list when loaded', () => {
    setupHook();
    render(<BarView />);
    expect(screen.getByTestId('task-list')).toBeInTheDocument();
    expect(screen.getByText('Mojito')).toBeInTheDocument();
  });

  it('shows empty message when no tasks and status is ALL', () => {
    setupHook({ tasks: [] });
    render(<BarView />);
    expect(screen.getByText('Sin Tareas Pendientes')).toBeInTheDocument();
  });

  it('shows filtered empty message', () => {
    setupHook({ tasks: [], selectedStatus: 'PENDING' });
    render(<BarView />);
    expect(screen.getByText('Sin tareas pending')).toBeInTheDocument();
  });
});
