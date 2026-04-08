import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OrderSummary } from './OrderSummary';
import { ProductType } from '../../models/Product';
import type { OrderProduct } from '../../models/Product';

describe('OrderSummary', () => {
  const baseProps = {
    products: [] as OrderProduct[],
    totalItems: 0,
    totalPrice: 0,
    isSubmitting: false,
    customerName: '',
    customerEmail: '',
    onCustomerNameChange: vi.fn(),
    onCustomerEmailChange: vi.fn(),
    onRemoveProduct: vi.fn(),
    onSubmit: vi.fn(),
  };

  it('renders empty state when no products', () => {
    render(<OrderSummary {...baseProps} />);
    expect(screen.getByText('Selecciona productos para crear un pedido')).toBeInTheDocument();
  });

  it('renders customer input fields', () => {
    render(<OrderSummary {...baseProps} />);
    expect(screen.getByTestId('customer-name-input')).toBeInTheDocument();
    expect(screen.getByTestId('customer-email-input')).toBeInTheDocument();
  });

  it('renders products with quantities and prices', () => {
    const products: OrderProduct[] = [
      { name: 'Pizza', type: ProductType.HOT_DISH, quantity: 2, price: 1500 },
      { name: 'Beer', type: ProductType.DRINK, quantity: 1, price: 500 },
    ];

    render(<OrderSummary {...baseProps} products={products} totalItems={3} totalPrice={35.00} />);

    expect(screen.getByTestId('order-products-list')).toBeInTheDocument();
    expect(screen.getByTestId('order-active-badge')).toBeInTheDocument();
    expect(screen.getByTestId('total-items-count')).toHaveTextContent('3');
    expect(screen.getByTestId('total-price-count')).toHaveTextContent('$35.00');
    expect(screen.getByTestId('send-to-kitchen-btn')).toBeInTheDocument();
  });

  it('calls onRemoveProduct when remove button is clicked', () => {
    const onRemove = vi.fn();
    const products: OrderProduct[] = [
      { name: 'Pizza', type: ProductType.HOT_DISH, quantity: 1, price: 1500 },
    ];

    render(<OrderSummary {...baseProps} products={products} onRemoveProduct={onRemove} />);

    fireEvent.click(screen.getByTestId('remove-product-btn-pizza'));
    expect(onRemove).toHaveBeenCalledWith('Pizza');
  });

  it('calls onSubmit when send to kitchen button is clicked', () => {
    const onSubmit = vi.fn();
    const products: OrderProduct[] = [
      { name: 'Pizza', type: ProductType.HOT_DISH, quantity: 1, price: 1500 },
    ];

    render(<OrderSummary {...baseProps} products={products} onSubmit={onSubmit} />);

    fireEvent.click(screen.getByTestId('send-to-kitchen-btn'));
    expect(onSubmit).toHaveBeenCalled();
  });

  it('shows Enviando... when submitting', () => {
    const products: OrderProduct[] = [
      { name: 'Pizza', type: ProductType.HOT_DISH, quantity: 1, price: 1500 },
    ];

    render(<OrderSummary {...baseProps} products={products} isSubmitting={true} />);

    expect(screen.getByTestId('send-to-kitchen-btn')).toHaveTextContent('Enviando...');
    expect(screen.getByTestId('send-to-kitchen-btn')).toBeDisabled();
  });

  it('calls onCustomerNameChange on input', () => {
    const onChange = vi.fn();
    render(<OrderSummary {...baseProps} onCustomerNameChange={onChange} />);
    fireEvent.change(screen.getByTestId('customer-name-input'), { target: { value: 'John' } });
    expect(onChange).toHaveBeenCalledWith('John');
  });

  it('calls onCustomerEmailChange on input', () => {
    const onChange = vi.fn();
    render(<OrderSummary {...baseProps} onCustomerEmailChange={onChange} />);
    fireEvent.change(screen.getByTestId('customer-email-input'), { target: { value: 'john@test.com' } });
    expect(onChange).toHaveBeenCalledWith('john@test.com');
  });
});
