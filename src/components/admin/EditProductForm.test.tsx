import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditProductForm } from './EditProductForm';
import { ProductType, ProductStatus } from '../../models/Product';
import type { CatalogProduct, UpdateProductResponse } from '../../models/Product';

vi.mock('../../hooks/useUpdateProduct', () => ({
  useUpdateProduct: vi.fn(),
}));

import { useUpdateProduct } from '../../hooks/useUpdateProduct';
const mockUseUpdateProduct = vi.mocked(useUpdateProduct);

describe('EditProductForm', () => {
  const mockProduct: CatalogProduct = {
    id: '1',
    name: 'Pizza',
    description: 'Delicious pizza',
    type: ProductType.HOT_DISH,
    category: 'Italian',
    price: 1500,
    status: ProductStatus.ACTIVE,
  };

  const defaultHookReturn = {
    updateProduct: vi.fn(),
    isSubmitting: false,
    error: null as string | null,
    success: null as UpdateProductResponse | null,
    reset: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUpdateProduct.mockReturnValue({ ...defaultHookReturn });
  });

  it('renders form pre-filled with product data', () => {
    render(<EditProductForm product={mockProduct} onCancel={vi.fn()} onSuccess={vi.fn()} />);
    expect(screen.getByDisplayValue('Pizza')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Delicious pizza')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Italian')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1500')).toBeInTheDocument();
    expect(screen.getByText('Editar Producto')).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const onCancel = vi.fn();
    render(<EditProductForm product={mockProduct} onCancel={onCancel} onSuccess={vi.fn()} />);
    await userEvent.click(screen.getByText('Cancelar'));
    expect(onCancel).toHaveBeenCalled();
  });

  it('calls onCancel when close button is clicked', async () => {
    const onCancel = vi.fn();
    render(<EditProductForm product={mockProduct} onCancel={onCancel} onSuccess={vi.fn()} />);
    await userEvent.click(screen.getByText('close'));
    expect(onCancel).toHaveBeenCalled();
  });

  it('shows validation errors on empty submit', async () => {
    render(<EditProductForm product={mockProduct} onCancel={vi.fn()} onSuccess={vi.fn()} />);

    const nameInput = screen.getByDisplayValue('Pizza');
    await userEvent.clear(nameInput);

    const categoryInput = screen.getByDisplayValue('Italian');
    await userEvent.clear(categoryInput);

    await userEvent.click(screen.getByText('Guardar Cambios'));

    expect(screen.getAllByTestId('form-validation-error').length).toBeGreaterThanOrEqual(1);
  });

  it('submits update and calls onSuccess', async () => {
    const mockUpdate = vi.fn().mockResolvedValue({ id: '1', name: 'Updated Pizza' });
    const onSuccess = vi.fn();
    mockUseUpdateProduct.mockReturnValue({ ...defaultHookReturn, updateProduct: mockUpdate });

    render(<EditProductForm product={mockProduct} onCancel={vi.fn()} onSuccess={onSuccess} />);
    await userEvent.click(screen.getByText('Guardar Cambios'));

    expect(mockUpdate).toHaveBeenCalledWith('1', expect.objectContaining({ name: 'Pizza' }));
  });

  it('shows Guardando... when submitting', () => {
    mockUseUpdateProduct.mockReturnValue({ ...defaultHookReturn, isSubmitting: true });
    render(<EditProductForm product={mockProduct} onCancel={vi.fn()} onSuccess={vi.fn()} />);
    expect(screen.getByText('Guardando...')).toBeInTheDocument();
  });

  it('shows error message', () => {
    mockUseUpdateProduct.mockReturnValue({ ...defaultHookReturn, error: 'Producto no encontrado' });
    render(<EditProductForm product={mockProduct} onCancel={vi.fn()} onSuccess={vi.fn()} />);
    expect(screen.getByText('Producto no encontrado')).toBeInTheDocument();
  });

  it('shows success message', () => {
    mockUseUpdateProduct.mockReturnValue({ ...defaultHookReturn, success: { name: 'Pizza Updated' } });
    render(<EditProductForm product={mockProduct} onCancel={vi.fn()} onSuccess={vi.fn()} />);
    expect(screen.getByText(/Pizza Updated/)).toBeInTheDocument();
    expect(screen.getByText(/actualizado exitosamente/)).toBeInTheDocument();
  });

  it('resets form when product prop changes', () => {
    const { rerender } = render(
      <EditProductForm product={mockProduct} onCancel={vi.fn()} onSuccess={vi.fn()} />
    );

    const newProduct: CatalogProduct = {
      ...mockProduct,
      id: '2',
      name: 'Salad',
    };

    rerender(<EditProductForm product={newProduct} onCancel={vi.fn()} onSuccess={vi.fn()} />);
    expect(screen.getByDisplayValue('Salad')).toBeInTheDocument();
  });

  it('calls reset when field changes while error or success exists', async () => {
    const resetFn = vi.fn();
    mockUseUpdateProduct.mockReturnValue({ ...defaultHookReturn, error: 'Some error', reset: resetFn });
    render(<EditProductForm product={mockProduct} onCancel={vi.fn()} onSuccess={vi.fn()} />);

    await userEvent.type(screen.getByDisplayValue('Pizza'), 'x');
    expect(resetFn).toHaveBeenCalled();
  });

  it('renders empty description when product.description is undefined', () => {
    const productNoDesc: CatalogProduct = { ...mockProduct, description: undefined };
    render(<EditProductForm product={productNoDesc} onCancel={vi.fn()} onSuccess={vi.fn()} />);
    const textarea = screen.getByPlaceholderText(/descripción/i) || screen.getByRole('textbox', { name: /descripción/i });
    expect(textarea).toBeInTheDocument();
  });

  it('converts price input to number on change', async () => {
    const mockUpdate = vi.fn().mockResolvedValue({ id: '1', name: 'Pizza' });
    mockUseUpdateProduct.mockReturnValue({ ...defaultHookReturn, updateProduct: mockUpdate });

    render(<EditProductForm product={mockProduct} onCancel={vi.fn()} onSuccess={vi.fn()} />);

    const priceInput = screen.getByDisplayValue('1500');
    await userEvent.clear(priceInput);
    await userEvent.type(priceInput, '2000');
    await userEvent.click(screen.getByText('Guardar Cambios'));

    expect(mockUpdate).toHaveBeenCalledWith('1', expect.objectContaining({ price: 2000 }));
  });

  it('shows price validation error when price is 0', async () => {
    render(<EditProductForm product={mockProduct} onCancel={vi.fn()} onSuccess={vi.fn()} />);

    const priceInput = screen.getByDisplayValue('1500');
    fireEvent.change(priceInput, { target: { value: '0', name: 'price' } });

    const form = priceInput.closest('form')!;
    fireEvent.submit(form);

    expect(screen.getByText(/El precio debe ser mayor a 0/)).toBeInTheDocument();
  });

  it('clears field-specific validation error when user types in errored field', async () => {
    render(<EditProductForm product={mockProduct} onCancel={vi.fn()} onSuccess={vi.fn()} />);

    const nameInput = screen.getByDisplayValue('Pizza');
    fireEvent.change(nameInput, { target: { value: '', name: 'name' } });

    const form = nameInput.closest('form')!;
    fireEvent.submit(form);

    expect(screen.getByText(/El nombre es requerido/)).toBeInTheDocument();

    fireEvent.change(nameInput, { target: { value: 'New Name', name: 'name' } });
    expect(screen.queryByText(/El nombre es requerido/)).not.toBeInTheDocument();
  });

  it('does not call onSuccess when updateProduct returns falsy', async () => {
    const mockUpdate = vi.fn().mockResolvedValue(null);
    const onSuccess = vi.fn();
    mockUseUpdateProduct.mockReturnValue({ ...defaultHookReturn, updateProduct: mockUpdate });

    render(<EditProductForm product={mockProduct} onCancel={vi.fn()} onSuccess={onSuccess} />);
    await userEvent.click(screen.getByText('Guardar Cambios'));

    expect(mockUpdate).toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
