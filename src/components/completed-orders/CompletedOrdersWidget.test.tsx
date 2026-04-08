import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { CompletedOrdersWidget } from './CompletedOrdersWidget';
import type { CompletedOrder } from '../../models/CompletedOrder';

const mockOrders: CompletedOrder[] = [
  { id: '1', tableNumber: 'A1', totalItems: 3, completedAt: new Date('2025-01-01T12:00:00Z') },
];

const mockUseCompletedOrders = {
  completedOrders: mockOrders,
  count: 1,
  loading: false,
  error: null as string | null,
  refresh: vi.fn(),
  requestInvoice: vi.fn(),
  invoiceLoadingById: {} as Record<string, boolean>,
  invoiceErrorById: {} as Record<string, string>,
  markAsInvoiced: vi.fn(),
};

vi.mock('../../hooks/useCompletedOrders', () => ({
  useCompletedOrders: () => mockUseCompletedOrders,
}));

vi.mock('./CompletedOrdersButton', () => ({
  CompletedOrdersButton: ({ count, onToggle }: { count: number; onToggle: () => void }) => (
    <button data-testid="toggle-btn" onClick={onToggle}>{count}</button>
  ),
}));

vi.mock('./CompletedOrdersModal', () => ({
  CompletedOrdersModal: ({ isOpen, onClose, orders, onInvoice }: { isOpen: boolean; onClose: () => void; orders: CompletedOrder[]; onInvoice: (id: number) => void }) =>
    isOpen ? (
      <div data-testid="modal">
        <button data-testid="close-modal" onClick={onClose}>Close</button>
        {orders.map((o: CompletedOrder, i: number) => (
          <button key={o.id} data-testid={`invoice-btn-${i}`} onClick={() => onInvoice(Number(o.id))}>
            Invoice {o.id}
          </button>
        ))}
      </div>
    ) : null,
}));

vi.mock('./CompletedOrdersToast', () => ({
  CompletedOrdersToast: ({ message, isVisible }: { message: string; isVisible: boolean }) =>
    isVisible ? <div data-testid="toast">{message}</div> : null,
}));

describe('CompletedOrdersWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCompletedOrders.requestInvoice.mockResolvedValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the button with count', () => {
    render(<CompletedOrdersWidget />);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('opens modal when button is clicked', () => {
    render(<CompletedOrdersWidget />);
    fireEvent.click(screen.getByTestId('toggle-btn'));
    expect(screen.getByTestId('modal')).toBeInTheDocument();
  });

  it('closes modal when close is triggered', () => {
    render(<CompletedOrdersWidget />);
    fireEvent.click(screen.getByTestId('toggle-btn'));
    expect(screen.getByTestId('modal')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('close-modal'));
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('handles invoice and shows toast', async () => {
    mockUseCompletedOrders.requestInvoice.mockResolvedValue(1);
    render(<CompletedOrdersWidget />);

    fireEvent.click(screen.getByTestId('toggle-btn'));
    fireEvent.click(screen.getByTestId('invoice-btn-0'));

    await waitFor(() => {
      expect(screen.getByTestId('toast')).toBeInTheDocument();
      expect(screen.getByText(/Factura enviada correctamente/)).toBeInTheDocument();
    });
  });

  it('closes modal when invoice returns remainingCount=0', async () => {
    mockUseCompletedOrders.requestInvoice.mockResolvedValue(0);
    render(<CompletedOrdersWidget />);

    fireEvent.click(screen.getByTestId('toggle-btn'));
    expect(screen.getByTestId('modal')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('invoice-btn-0'));

    await waitFor(() => {
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });
  });

  it('toast disappears after timeout', async () => {
    vi.useFakeTimers();
    mockUseCompletedOrders.requestInvoice.mockResolvedValue(1);
    render(<CompletedOrdersWidget />);

    fireEvent.click(screen.getByTestId('toggle-btn'));

    await act(async () => {
      fireEvent.click(screen.getByTestId('invoice-btn-0'));
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(screen.getByTestId('toast')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(4001);
    });

    expect(screen.queryByTestId('toast')).not.toBeInTheDocument();
    vi.useRealTimers();
  });
});
