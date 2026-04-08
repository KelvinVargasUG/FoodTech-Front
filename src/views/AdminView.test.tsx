import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminView } from './AdminView';
import { ProductStatus, ProductType } from '../models/Product';
import type { CatalogProduct } from '../models/Product';

vi.mock('../services/productService', () => ({
  productService: {
    getActiveProducts: vi.fn(),
    deactivateProduct: vi.fn(),
    activateProduct: vi.fn(),
  },
}));

vi.mock('../components/admin/CreateProductForm', () => ({
  CreateProductForm: ({ onSuccess }: { onSuccess?: () => void }) => (
    <div data-testid="create-product-form">
      <button data-testid="mock-create-success" onClick={onSuccess}>Mock Create</button>
    </div>
  ),
}));

vi.mock('../components/admin/EditProductForm', () => ({
  EditProductForm: ({ product, onCancel, onSuccess }: { product: CatalogProduct; onCancel?: () => void; onSuccess?: () => void }) => (
    <div data-testid="edit-product-form">
      <span>Editing {product.name}</span>
      <button data-testid="mock-cancel-edit" onClick={onCancel}>Cancel</button>
      <button data-testid="mock-save-edit" onClick={onSuccess}>Save</button>
    </div>
  ),
}));

import { productService } from '../services/productService';
const mockProductService = vi.mocked(productService);

const mockProducts: CatalogProduct[] = [
  { id: '1', name: 'Pizza', type: ProductType.HOT_DISH, category: 'Italian', price: 1500, status: ProductStatus.ACTIVE },
  { id: '2', name: 'Salad', type: ProductType.COLD_DISH, category: 'Healthy', price: 800, status: ProductStatus.INACTIVE },
];

describe('AdminView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockProductService.getActiveProducts.mockResolvedValue(mockProducts);
  });

  it('renders header and loads products', async () => {
    render(<AdminView />);
    expect(screen.getByText('Catálogo de Productos')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Pizza')).toBeInTheDocument();
      expect(screen.getByText('Salad')).toBeInTheDocument();
    });
  });

  it('shows loading spinner initially', () => {
    mockProductService.getActiveProducts.mockReturnValue(new Promise(() => {}));
    render(<AdminView />);
    expect(screen.getByText('progress_activity')).toBeInTheDocument();
  });

  it('shows error feedback when loading fails', async () => {
    mockProductService.getActiveProducts.mockRejectedValue(new Error('fail'));
    render(<AdminView />);

    await waitFor(() => {
      expect(screen.getByText('Error al cargar los productos.')).toBeInTheDocument();
    });
  });

  it('shows empty state when no products', async () => {
    mockProductService.getActiveProducts.mockResolvedValue([]);
    render(<AdminView />);

    await waitFor(() => {
      expect(screen.getByText('No hay productos en el catálogo.')).toBeInTheDocument();
    });
  });

  it('filters products by search term', async () => {
    render(<AdminView />);

    await waitFor(() => {
      expect(screen.getByText('Pizza')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId('search-product-input'), { target: { value: 'Pizza' } });
    expect(screen.getByText('Pizza')).toBeInTheDocument();
    expect(screen.queryByText('Salad')).not.toBeInTheDocument();
  });

  it('shows no results message for search with no match', async () => {
    render(<AdminView />);

    await waitFor(() => {
      expect(screen.getByText('Pizza')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId('search-product-input'), { target: { value: 'xyz' } });
    expect(screen.getByText('No se encontraron productos con ese nombre.')).toBeInTheDocument();
  });

  it('opens edit form when edit button is clicked', async () => {
    render(<AdminView />);

    await waitFor(() => {
      expect(screen.getByText('Pizza')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('edit-product-1'));
    expect(screen.getByTestId('edit-product-form')).toBeInTheDocument();
    expect(screen.getByText('Editing Pizza')).toBeInTheDocument();
  });

  it('closes edit form and reloads on edit success', async () => {
    render(<AdminView />);

    await waitFor(() => {
      expect(screen.getByText('Pizza')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('edit-product-1'));
    fireEvent.click(screen.getByTestId('mock-save-edit'));

    await waitFor(() => {
      expect(screen.queryByTestId('edit-product-form')).not.toBeInTheDocument();
    });
  });

  it('closes edit form on cancel', async () => {
    render(<AdminView />);

    await waitFor(() => {
      expect(screen.getByText('Pizza')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('edit-product-1'));
    fireEvent.click(screen.getByTestId('mock-cancel-edit'));
    expect(screen.queryByTestId('edit-product-form')).not.toBeInTheDocument();
  });

  it('toggles product status (deactivate active product)', async () => {
    const deactivated = { ...mockProducts[0], status: ProductStatus.INACTIVE };
    mockProductService.deactivateProduct.mockResolvedValue(deactivated);

    render(<AdminView />);

    await waitFor(() => {
      expect(screen.getByText('Pizza')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('toggle-status-1'));

    await waitFor(() => {
      expect(screen.getByTestId('toggle-success-message')).toBeInTheDocument();
    });
  });

  it('toggles product status (activate inactive product)', async () => {
    const activated = { ...mockProducts[1], status: ProductStatus.ACTIVE };
    mockProductService.activateProduct.mockResolvedValue(activated);

    render(<AdminView />);

    await waitFor(() => {
      expect(screen.getByText('Salad')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('toggle-status-2'));

    await waitFor(() => {
      expect(screen.getByTestId('toggle-success-message')).toBeInTheDocument();
    });
  });

  it('shows error when toggle status fails', async () => {
    mockProductService.deactivateProduct.mockRejectedValue(new Error('fail'));

    render(<AdminView />);

    await waitFor(() => {
      expect(screen.getByText('Pizza')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('toggle-status-1'));

    await waitFor(() => {
      expect(screen.getByTestId('toggle-error-message')).toBeInTheDocument();
    });
  });
});
