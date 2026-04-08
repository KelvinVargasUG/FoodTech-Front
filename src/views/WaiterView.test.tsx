import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WaiterView } from './WaiterView';
import { TableStatus } from '../models/Table';
import type { Table } from '../models/Table';
import type { CatalogProduct } from '../models/Product';
import type { KitchenTask } from '../models/Task';
import { Station, TaskStatus } from '../models/Task';

const mockSelectTable = vi.fn();
const mockMarkTableAsOccupied = vi.fn();
const mockSyncTablesWithTasks = vi.fn();
const mockAddProduct = vi.fn();
const mockRemoveProduct = vi.fn();
const mockSubmitOrder = vi.fn();
const mockRefreshTasks = vi.fn();
const mockSetSelectedCategory = vi.fn();
const mockSetSearchTerm = vi.fn();

vi.mock('../hooks/useTables', () => ({
  useTables: vi.fn(),
}));
vi.mock('../hooks/useOrder', () => ({
  useOrder: vi.fn(),
}));
vi.mock('../hooks/useKitchenTasks', () => ({
  useKitchenTasks: vi.fn(),
}));
vi.mock('../hooks/useCatalog', () => ({
  useCatalog: vi.fn(),
}));

vi.mock('../components/waiter/TableSelector', () => ({
  TableSelector: ({ tables, selectedTableId, onSelectTable }: { tables: Table[]; selectedTableId: string | null; onSelectTable: (id: string) => void }) => (
    <div data-testid="table-selector">
      {tables.map((t: Table) => (
        <button key={t.id} data-testid={`table-${t.id}`} onClick={() => onSelectTable(t.id)}>
          Mesa {t.number}
        </button>
      ))}
      {selectedTableId && <span data-testid="selected-table">{selectedTableId}</span>}
    </div>
  ),
}));

vi.mock('../components/waiter/CategoryFilter', () => ({
  CategoryFilter: ({ selectedCategory, onSelectCategory }: { selectedCategory: string; onSelectCategory: (cat: string) => void }) => (
    <div data-testid="category-filter">
      <span>{selectedCategory}</span>
      <button data-testid="select-cat-drinks" onClick={() => onSelectCategory('DRINKS')}>Drinks</button>
    </div>
  ),
}));

vi.mock('../components/waiter/ProductGrid', () => ({
  ProductGrid: ({ products, onAddProduct }: { products: CatalogProduct[]; onAddProduct: (p: CatalogProduct) => void }) => (
    <div data-testid="product-grid">
      {products.map((p: CatalogProduct) => (
        <button key={p.id} data-testid={`add-product-${p.id}`} onClick={() => onAddProduct(p)}>
          {p.name}
        </button>
      ))}
    </div>
  ),
}));

vi.mock('../components/waiter/OrderSummary', () => ({
  OrderSummary: ({ products, totalItems, isSubmitting, onSubmit, customerName, onCustomerNameChange, customerEmail, onCustomerEmailChange }: { products: { id?: string; name: string }[]; totalItems: number; isSubmitting: boolean; onSubmit: () => void; customerName: string; onCustomerNameChange: (v: string) => void; customerEmail: string; onCustomerEmailChange: (v: string) => void }) => (
    <div data-testid="order-summary">
      <span data-testid="total-items">{totalItems}</span>
      <span data-testid="submitting">{isSubmitting.toString()}</span>
      <input data-testid="customer-name" value={customerName} onChange={(e: { target: { value: string } }) => onCustomerNameChange(e.target.value)} />
      <input data-testid="customer-email" value={customerEmail} onChange={(e: { target: { value: string } }) => onCustomerEmailChange(e.target.value)} />
      <button data-testid="submit-order" onClick={onSubmit}>Submit</button>
      {products.map((p: { id?: string; name: string }) => <span key={p.name}>{p.name}</span>)}
    </div>
  ),
}));

vi.mock('../components/waiter/KitchenStatus', () => ({
  KitchenStatus: ({ tasks, isLoading, onRefresh }: { tasks: KitchenTask[]; isLoading: boolean; onRefresh: () => void }) => (
    <div data-testid="kitchen-status">
      <span data-testid="task-count">{tasks.length}</span>
      <span data-testid="ks-loading">{isLoading.toString()}</span>
      <button data-testid="refresh-tasks" onClick={onRefresh}>Refresh</button>
    </div>
  ),
}));

import { useTables } from '../hooks/useTables';
import { useOrder } from '../hooks/useOrder';
import { useKitchenTasks } from '../hooks/useKitchenTasks';
import { useCatalog } from '../hooks/useCatalog';

const mockUseTables = vi.mocked(useTables);
const mockUseOrder = vi.mocked(useOrder);
const mockUseKitchenTasks = vi.mocked(useKitchenTasks);
const mockUseCatalog = vi.mocked(useCatalog);

const mockTasks: KitchenTask[] = [
  {
    id: 'task-1',
    orderId: 'order-1',
    tableNumber: 1,
    productName: 'Pasta',
    productType: 'HOT_DISH',
    station: Station.HOT_KITCHEN,
    status: TaskStatus.IN_PREPARATION,
    createdAt: new Date().toISOString(),
  },
];

function setupMocks(overrides: {
  tables?: Partial<ReturnType<typeof useTables>>;
  order?: Partial<ReturnType<typeof useOrder>>;
  kitchen?: Partial<ReturnType<typeof useKitchenTasks>>;
  catalog?: Partial<ReturnType<typeof useCatalog>>;
} = {}) {
  mockUseTables.mockReturnValue({
    tables: [
      { id: '1', number: 1, status: TableStatus.DISPONIBLE },
      { id: '2', number: 2, status: TableStatus.OCUPADA },
    ],
    selectedTable: null,
    selectedTableId: null,
    selectTable: mockSelectTable,
    markTableAsOccupied: mockMarkTableAsOccupied,
    markTableAsAvailable: vi.fn(),
    syncTablesWithTasks: mockSyncTablesWithTasks,
    ...overrides.tables,
  } as unknown as ReturnType<typeof useTables>);

  mockUseOrder.mockReturnValue({
    orderProducts: [],
    totalItems: 0,
    isSubmitting: false,
    error: null,
    addProduct: mockAddProduct,
    removeProduct: mockRemoveProduct,
    submitOrder: mockSubmitOrder,
    ...overrides.order,
  } as unknown as ReturnType<typeof useOrder>);

  mockUseKitchenTasks.mockReturnValue({
    tasks: mockTasks,
    isLoading: false,
    refreshTasks: mockRefreshTasks,
    ...overrides.kitchen,
  } as unknown as ReturnType<typeof useKitchenTasks>);

  mockUseCatalog.mockReturnValue({
    products: [{ id: 'p1', name: 'Pizza', price: 1200, category: 'Italian', type: 'HOT_DISH' }],
    selectedCategory: 'ALL',
    setSelectedCategory: mockSetSelectedCategory,
    searchTerm: '',
    setSearchTerm: mockSetSearchTerm,
    isLoading: false,
    ...overrides.catalog,
  } as unknown as ReturnType<typeof useCatalog>);
}

describe('WaiterView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('renders all sections', () => {
    setupMocks();
    render(<WaiterView />);
    expect(screen.getByTestId('table-selector')).toBeInTheDocument();
    expect(screen.getByTestId('product-grid')).toBeInTheDocument();
    expect(screen.getByTestId('order-summary')).toBeInTheDocument();
    expect(screen.getByTestId('kitchen-status')).toBeInTheDocument();
  });

  it('shows "Selecciona una Mesa" when no table selected', () => {
    setupMocks();
    render(<WaiterView />);
    expect(screen.getByText('Selecciona una Mesa')).toBeInTheDocument();
  });

  it('shows selected table header text', () => {
    setupMocks({
      tables: {
        selectedTable: { id: '1', number: 1, status: TableStatus.DISPONIBLE },
        selectedTableId: '1',
      },
    });
    render(<WaiterView />);
    
    
    expect(screen.getByText('Agrega productos al pedido')).toBeInTheDocument();
  });

  it('shows catalog loading spinner', () => {
    setupMocks({ catalog: { isLoading: true } });
    render(<WaiterView />);
    expect(screen.getByText('progress_activity')).toBeInTheDocument();
  });

  it('syncs tables with tasks on mount', () => {
    setupMocks();
    render(<WaiterView />);
    expect(mockSyncTablesWithTasks).toHaveBeenCalledWith(mockTasks);
  });

  it('alerts when submitting without a table', () => {
    setupMocks();
    render(<WaiterView />);

    fireEvent.change(screen.getByTestId('customer-name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByTestId('customer-email'), { target: { value: 'john@test.com' } });
    fireEvent.click(screen.getByTestId('submit-order'));

    expect(window.alert).toHaveBeenCalledWith('Por favor selecciona una mesa');
  });

  it('alerts when submitting without customer name', () => {
    setupMocks({
      tables: {
        selectedTable: { id: '1', number: 1, status: TableStatus.DISPONIBLE },
      },
    });
    render(<WaiterView />);

    fireEvent.click(screen.getByTestId('submit-order'));
    expect(window.alert).toHaveBeenCalledWith('Por favor ingresa el nombre del cliente');
  });

  it('alerts when submitting without customer email', () => {
    setupMocks({
      tables: {
        selectedTable: { id: '1', number: 1, status: TableStatus.DISPONIBLE },
      },
    });
    render(<WaiterView />);

    fireEvent.change(screen.getByTestId('customer-name'), { target: { value: 'John' } });
    fireEvent.click(screen.getByTestId('submit-order'));
    expect(window.alert).toHaveBeenCalledWith('Por favor ingresa el correo del cliente');
  });

  it('handles successful order submission', async () => {
    mockSubmitOrder.mockResolvedValue({
      message: 'Order created',
      orderId: 'o1',
      tableNumber: 1,
      tasksCreated: 3,
    });
    mockRefreshTasks.mockResolvedValue(undefined);

    setupMocks({
      tables: {
        selectedTable: { id: '1', number: 1, status: TableStatus.DISPONIBLE },
      },
    });
    render(<WaiterView />);

    fireEvent.change(screen.getByTestId('customer-name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByTestId('customer-email'), { target: { value: 'john@test.com' } });
    fireEvent.click(screen.getByTestId('submit-order'));

    await waitFor(() => {
      expect(mockSubmitOrder).toHaveBeenCalledWith(1, 'John', 'john@test.com');
    });

    await waitFor(() => {
      expect(mockMarkTableAsOccupied).toHaveBeenCalledWith('1', 'o1');
    });
  });

  it('shows error alert when order submission fails', async () => {
    mockSubmitOrder.mockResolvedValue(null);

    setupMocks({
      tables: {
        selectedTable: { id: '1', number: 1, status: TableStatus.DISPONIBLE },
      },
      order: { error: 'Server error' },
    });
    render(<WaiterView />);

    fireEvent.change(screen.getByTestId('customer-name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByTestId('customer-email'), { target: { value: 'john@test.com' } });
    fireEvent.click(screen.getByTestId('submit-order'));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('❌ Error: Server error');
    });
  });

  it('search input updates search term', () => {
    setupMocks();
    render(<WaiterView />);

    const searchInput = screen.getByPlaceholderText('Buscar producto por nombre...');
    fireEvent.change(searchInput, { target: { value: 'Pizza' } });
    expect(mockSetSearchTerm).toHaveBeenCalledWith('Pizza');
  });
});
