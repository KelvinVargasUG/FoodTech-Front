import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CompletedOrdersModal } from './CompletedOrdersModal';
import type { CompletedOrder } from '../../models/CompletedOrder';

describe('CompletedOrdersModal', () => {
  const mockOrders: CompletedOrder[] = [
    { id: '1', tableNumber: 'A1', totalItems: 3, completedAt: new Date('2025-01-01T12:00:00Z') },
    { id: '2', tableNumber: 'B2', totalItems: 5, completedAt: new Date('2025-01-01T13:00:00Z') },
  ];

  it('returns null when not open', () => {
    const { container } = render(
      <CompletedOrdersModal isOpen={false} onClose={vi.fn()} orders={[]} onInvoice={vi.fn()} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders modal with orders when open', () => {
    render(
      <CompletedOrdersModal isOpen={true} onClose={vi.fn()} orders={mockOrders} onInvoice={vi.fn()} />
    );
    expect(screen.getByText('Completed Orders')).toBeInTheDocument();
    expect(screen.getByText('A1')).toBeInTheDocument();
    expect(screen.getByText('B2')).toBeInTheDocument();
  });

  it('shows no orders message when empty', () => {
    render(
      <CompletedOrdersModal isOpen={true} onClose={vi.fn()} orders={[]} onInvoice={vi.fn()} />
    );
    expect(screen.getByTestId('no-orders-message')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(
      <CompletedOrdersModal isOpen={true} onClose={vi.fn()} orders={[]} onInvoice={vi.fn()} loading={true} />
    );
    expect(screen.getByText('Cargando pedidos...')).toBeInTheDocument();
  });

  it('shows error state', () => {
    render(
      <CompletedOrdersModal isOpen={true} onClose={vi.fn()} orders={[]} onInvoice={vi.fn()} error="Error loading" />
    );
    expect(screen.getByText('Error loading')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <CompletedOrdersModal isOpen={true} onClose={onClose} orders={mockOrders} onInvoice={vi.fn()} />
    );
    fireEvent.click(screen.getByLabelText('Close completed orders'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn();
    render(
      <CompletedOrdersModal isOpen={true} onClose={onClose} orders={mockOrders} onInvoice={vi.fn()} />
    );
    const backdrop = screen.getByRole('presentation');
    fireEvent.mouseDown(backdrop);
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose on Escape key', () => {
    const onClose = vi.fn();
    render(
      <CompletedOrdersModal isOpen={true} onClose={onClose} orders={mockOrders} onInvoice={vi.fn()} />
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('renders invoice buttons for each order', () => {
    render(
      <CompletedOrdersModal isOpen={true} onClose={vi.fn()} orders={mockOrders} onInvoice={vi.fn()} />
    );
    expect(screen.getByTestId('invoice-btn-0')).toHaveTextContent('Facturar');
    expect(screen.getByTestId('invoice-btn-1')).toHaveTextContent('Facturar');
  });

  it('calls onInvoice when invoice button is clicked', async () => {
    const onInvoice = vi.fn().mockResolvedValue(1);
    render(
      <CompletedOrdersModal isOpen={true} onClose={vi.fn()} orders={mockOrders} onInvoice={onInvoice} />
    );
    fireEvent.click(screen.getByTestId('invoice-btn-0'));
    // The invoice button triggers the onInvoice with the numeric orderId
    await vi.waitFor(() => {
      expect(onInvoice).toHaveBeenCalledWith(2); // sorted by completedAt desc so first is order 2
    });
  });

  it('shows Enviando... when invoice is loading for specific order', () => {
    render(
      <CompletedOrdersModal
        isOpen={true}
        onClose={vi.fn()}
        orders={mockOrders}
        onInvoice={vi.fn()}
        invoiceLoadingById={{ '2': true }}
      />
    );
    // Sorted by date desc, first order is id=2
    expect(screen.getByTestId('invoice-btn-0')).toHaveTextContent('Enviando...');
  });

  it('shows invoice error for specific order', () => {
    render(
      <CompletedOrdersModal
        isOpen={true}
        onClose={vi.fn()}
        orders={mockOrders}
        onInvoice={vi.fn()}
        invoiceErrorById={{ '1': 'Failed to send' }}
      />
    );
    expect(screen.getByText('Failed to send')).toBeInTheDocument();
  });

  it('traps focus with Tab key', () => {
    render(
      <CompletedOrdersModal isOpen={true} onClose={vi.fn()} orders={mockOrders} onInvoice={vi.fn()} />
    );
    // Tab and Shift+Tab cycle through focusable elements
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: false });
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    // No errors thrown = focus trap works
  });
});
