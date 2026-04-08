import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CategoryFilter } from './CategoryFilter';
import { ProductType } from '../../models/Product';

describe('CategoryFilter', () => {
  it('renders all category buttons', () => {
    render(<CategoryFilter selectedCategory="ALL" onSelectCategory={vi.fn()} />);
    expect(screen.getByText('Todo el Menú')).toBeInTheDocument();
    expect(screen.getByText('Bebidas')).toBeInTheDocument();
    expect(screen.getByText('Platos Principales')).toBeInTheDocument();
    expect(screen.getByText('Ensaladas')).toBeInTheDocument();
  });

  it('calls onSelectCategory with correct value', () => {
    const onSelect = vi.fn();
    render(<CategoryFilter selectedCategory="ALL" onSelectCategory={onSelect} />);

    fireEvent.click(screen.getByText('Bebidas'));
    expect(onSelect).toHaveBeenCalledWith(ProductType.DRINK);

    fireEvent.click(screen.getByText('Platos Principales'));
    expect(onSelect).toHaveBeenCalledWith(ProductType.HOT_DISH);

    fireEvent.click(screen.getByText('Ensaladas'));
    expect(onSelect).toHaveBeenCalledWith(ProductType.COLD_DISH);

    fireEvent.click(screen.getByText('Todo el Menú'));
    expect(onSelect).toHaveBeenCalledWith('ALL');
  });

  it('highlights selected category', () => {
    render(<CategoryFilter selectedCategory={ProductType.DRINK} onSelectCategory={vi.fn()} />);
    const drinkButton = screen.getByText('Bebidas');
    expect(drinkButton.className).toContain('gold-gradient');
  });
});
