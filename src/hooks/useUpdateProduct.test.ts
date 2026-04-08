import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUpdateProduct } from './useUpdateProduct';
import { ProductType, ProductStatus } from '../models/Product';
import type { UpdateProductResponse } from '../models/Product';

vi.mock('../services/productService', () => ({
  productService: {
    updateProduct: vi.fn(),
  },
}));

import { productService } from '../services/productService';
const mockProductService = vi.mocked(productService);

describe('useUpdateProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts with default state', () => {
    const { result } = renderHook(() => useUpdateProduct());
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.success).toBeNull();
  });

  it('updates product successfully', async () => {
    const mockResponse: UpdateProductResponse = { id: '1', name: 'Pasta Updated', type: ProductType.HOT_DISH, category: 'Main', price: 2000, status: ProductStatus.ACTIVE };
    mockProductService.updateProduct.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useUpdateProduct());

    let response: UpdateProductResponse | null = null;
    await act(async () => {
      response = await result.current.updateProduct('1', { name: 'Pasta Updated', type: ProductType.HOT_DISH, category: 'Main', price: 2000, status: ProductStatus.ACTIVE });
    });

    expect(response).toEqual(mockResponse);
    expect(result.current.success).toEqual(mockResponse);
    expect(result.current.error).toBeNull();
  });

  it('handles 404 not found error', async () => {
    mockProductService.updateProduct.mockRejectedValue(new Error('HTTP error! status: 404'));

    const { result } = renderHook(() => useUpdateProduct());

    await act(async () => {
      await result.current.updateProduct('1', { name: 'X', type: ProductType.HOT_DISH, category: 'Main', price: 10, status: ProductStatus.ACTIVE });
    });

    expect(result.current.error).toBe('Producto no encontrado');
  });

  it('handles 400 bad request error', async () => {
    mockProductService.updateProduct.mockRejectedValue(new Error('HTTP error! status: 400'));

    const { result } = renderHook(() => useUpdateProduct());

    await act(async () => {
      await result.current.updateProduct('1', { name: 'X', type: ProductType.HOT_DISH, category: 'Main', price: 10, status: ProductStatus.ACTIVE });
    });

    expect(result.current.error).toBe('Datos inválidos. Revisa los campos.');
  });

  it('handles generic error', async () => {
    mockProductService.updateProduct.mockRejectedValue(new Error('Server error'));

    const { result } = renderHook(() => useUpdateProduct());

    await act(async () => {
      await result.current.updateProduct('1', { name: 'X', type: ProductType.HOT_DISH, category: 'Main', price: 10, status: ProductStatus.ACTIVE });
    });

    expect(result.current.error).toBe('Server error');
  });

  it('handles non-Error throw', async () => {
    mockProductService.updateProduct.mockRejectedValue(42);

    const { result } = renderHook(() => useUpdateProduct());

    await act(async () => {
      await result.current.updateProduct('1', { name: 'X', type: ProductType.HOT_DISH, category: 'Main', price: 10, status: ProductStatus.ACTIVE });
    });

    expect(result.current.error).toBe('Error al actualizar el producto');
  });

  it('reset clears error and success', async () => {
    mockProductService.updateProduct.mockRejectedValue(new Error('fail'));

    const { result } = renderHook(() => useUpdateProduct());

    await act(async () => {
      await result.current.updateProduct('1', { name: 'X', type: ProductType.HOT_DISH, category: 'Main', price: 10, status: ProductStatus.ACTIVE });
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.success).toBeNull();
  });
});
