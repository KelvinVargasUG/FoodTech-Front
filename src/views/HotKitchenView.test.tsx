import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { HotKitchenView } from './HotKitchenView';
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
    tableNumber: 'T2',
    station: Station.HOT_KITCHEN,
    status: TaskStatus.PENDING,
    products: [{ name: 'Steak', type: 'HOT_DISH', quantity: 1 }],
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

describe('HotKitchenView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders station name and code', () => {
    setupHook();
    render(<HotKitchenView />);
    expect(screen.getByText('Estación Cocina Caliente')).toBeInTheDocument();
    expect(screen.getByText('HOT_KITCHEN • Platos Principales')).toBeInTheDocument();
  });

  it('calls useStationTasks with Station.HOT_KITCHEN', () => {
    setupHook();
    render(<HotKitchenView />);
    expect(mockUseStationTasks).toHaveBeenCalledWith(Station.HOT_KITCHEN);
  });

  it('shows loading state', () => {
    setupHook({ loading: true, tasks: [] });
    render(<HotKitchenView />);
    expect(screen.getByText('Cargando tareas...')).toBeInTheDocument();
  });

  it('shows error message', () => {
    setupHook({ error: 'Server down' });
    render(<HotKitchenView />);
    expect(screen.getByText('Server down')).toBeInTheDocument();
  });

  it('renders task list', () => {
    setupHook();
    render(<HotKitchenView />);
    expect(screen.getByText('Steak')).toBeInTheDocument();
  });

  it('shows empty message', () => {
    setupHook({ tasks: [] });
    render(<HotKitchenView />);
    expect(screen.getByText('Sin Tareas Pendientes')).toBeInTheDocument();
  });
});
