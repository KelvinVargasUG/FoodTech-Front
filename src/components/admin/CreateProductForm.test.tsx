import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateProductForm } from './CreateProductForm';
import type { CatalogProduct } from '../../models/Product';

vi.mock('../../hooks/useCreateProduct', () => ({
  useCreateProduct: vi.fn(),
}));

import { useCreateProduct } from '../../hooks/useCreateProduct';
const mockUseCreateProduct = vi.mocked(useCreateProduct);

describe('CreateProductForm', () => {
  const defaultHookReturn = {
    createProduct: vi.fn(),
    isSubmitting: false,
    error: null as string | null,
    success: null as CatalogProduct | null,
    reset: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCreateProduct.mockReturnValue({ ...defaultHookReturn });
  });

  it('renders form with all fields', () => {
    render(<CreateProductForm />);
    expect(screen.getByLabelText('Nombre')).toBeInTheDocument();
    expect(screen.getByLabelText('Tipo')).toBeInTheDocument();
    expect(screen.getByLabelText('Categoría')).toBeInTheDocument();
    expect(screen.getByLabelText('Precio (centavos)')).toBeInTheDocument();
    expect(screen.getByTestId('create-product-button')).toHaveTextContent('Crear Producto');
  });

  it('shows validation errors for empty fields', async () => {
    render(<CreateProductForm />);

    const form = screen.getByTestId('create-product-button').closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      const errors = screen.getAllByTestId('form-validation-error');
      expect(errors.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('submits form with valid data', async () => {
    const mockCreate = vi.fn().mockResolvedValue({ id: '1', name: 'Pizza' });
    mockUseCreateProduct.mockReturnValue({ ...defaultHookReturn, createProduct: mockCreate });
    const onSuccess = vi.fn();

    render(<CreateProductForm onSuccess={onSuccess} />);

    await userEvent.type(screen.getByLabelText('Nombre'), 'Pizza');
    await userEvent.type(screen.getByLabelText('Categoría'), 'Italian');
    await userEvent.clear(screen.getByLabelText('Precio (centavos)'));
    await userEvent.type(screen.getByLabelText('Precio (centavos)'), '1500');

    await userEvent.click(screen.getByTestId('create-product-button'));

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Pizza',
        category: 'Italian',
        price: 1500,
      })
    );
  });

  it('shows Creando... when submitting', () => {
    mockUseCreateProduct.mockReturnValue({ ...defaultHookReturn, isSubmitting: true });
    render(<CreateProductForm />);
    expect(screen.getByTestId('create-product-button')).toHaveTextContent('Creando...');
  });

  it('shows error message', () => {
    mockUseCreateProduct.mockReturnValue({ ...defaultHookReturn, error: 'Ya existe un producto con ese nombre' });
    render(<CreateProductForm />);
    expect(screen.getByText('Ya existe un producto con ese nombre')).toBeInTheDocument();
  });

  it('shows success message', () => {
    mockUseCreateProduct.mockReturnValue({ ...defaultHookReturn, success: { name: 'Pizza' } });
    render(<CreateProductForm />);
    expect(screen.getByText(/Pizza/)).toBeInTheDocument();
    expect(screen.getByText(/creado exitosamente/)).toBeInTheDocument();
  });

  it('calls reset when field changes while error exists', async () => {
    const resetFn = vi.fn();
    mockUseCreateProduct.mockReturnValue({ ...defaultHookReturn, error: 'Some error', reset: resetFn });
    render(<CreateProductForm />);

    await userEvent.type(screen.getByLabelText('Nombre'), 'x');
    expect(resetFn).toHaveBeenCalled();
  });

  it('clears field-specific validation error on change', async () => {
    render(<CreateProductForm />);

    // Submit empty to trigger validation
    const form = screen.getByTestId('create-product-button').closest('form')!;
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getAllByTestId('form-validation-error').length).toBeGreaterThan(0);
    });

    // Type in name field to clear its error
    await userEvent.type(screen.getByLabelText('Nombre'), 'Pizza');

    // The name error should be cleared, but other errors remain
    const remaining = screen.getAllByTestId('form-validation-error');
    expect(remaining.length).toBeGreaterThanOrEqual(1);
  });
});
