import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from './ProductCard';
import { ProductType } from '../../models/Product';
import type { Product } from '../../models/Product';

describe('ProductCard', () => {
  const product: Product = {
    id: '1',
    name: 'Mojito',
    type: ProductType.DRINK,
    price: 800,
    description: 'Refreshing cocktail',
    image: '/mojito.jpg',
  };

  it('renders product info', () => {
    render(<ProductCard product={product} isInOrder={false} onAdd={vi.fn()} />);
    expect(screen.getByTestId('product-name')).toHaveTextContent('Mojito');
    expect(screen.getByText('Refreshing cocktail')).toBeInTheDocument();
    expect(screen.getByTestId('add-order-btn')).toHaveTextContent('Agregar a Orden');
  });

  it('calls onAdd when clicked', () => {
    const onAdd = vi.fn();
    render(<ProductCard product={product} isInOrder={false} onAdd={onAdd} />);
    fireEvent.click(screen.getByTestId('product-item-mojito'));
    expect(onAdd).toHaveBeenCalledWith(product);
  });

  it('shows Agregado when isInOrder is true', () => {
    render(<ProductCard product={product} isInOrder={true} onAdd={vi.fn()} />);
    expect(screen.getByTestId('add-order-btn')).toHaveTextContent('Agregado');
  });

  it('shows check_circle overlay when in order', () => {
    render(<ProductCard product={product} isInOrder={true} onAdd={vi.fn()} />);
    expect(screen.getByText('check_circle')).toBeInTheDocument();
  });

  it('renders product without description', () => {
    const productNoDesc = { ...product, description: undefined };
    render(<ProductCard product={productNoDesc} isInOrder={false} onAdd={vi.fn()} />);
    expect(screen.getByTestId('product-name')).toHaveTextContent('Mojito');
  });
});
