import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCreateProduct } from './useCreateProduct';
import { ProductType, ProductStatus } from '../models/Product';
import type { CatalogProduct } from '../models/Product';

vi.mock('../services/productService', () => ({
  productService: {
    createProduct: vi.fn(),
  },
}));

import { productService } from '../services/productService';
const mockProductService = vi.mocked(productService);

describe('useCreateProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts with default state', () => {
    const { result } = renderHook(() => useCreateProduct());
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.success).toBeNull();
  });

  it('creates product successfully', async () => {
    const mockResponse: CatalogProduct = { id: '1', name: 'Pasta', type: ProductType.HOT_DISH, category: 'Main', price: 1500, status: ProductStatus.ACTIVE };
    mockProductService.createProduct.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useCreateProduct());

    let response: CatalogProduct | null = null;
    await act(async () => {
      response = await result.current.createProduct({ name: 'Pasta', type: ProductType.HOT_DISH, category: 'Main', price: 1500 });
    });

    expect(response).toEqual(mockResponse);
    expect(result.current.success).toEqual(mockResponse);
    expect(result.current.error).toBeNull();
    expect(result.current.isSubmitting).toBe(false);
  });

  it('handles 409 conflict error', async () => {
    mockProductService.createProduct.mockRejectedValue(new Error('HTTP error! status: 409'));

    const { result } = renderHook(() => useCreateProduct());

    await act(async () => {
      await result.current.createProduct({ name: 'Pasta', type: ProductType.HOT_DISH, category: 'Main', price: 1500 });
    });

    expect(result.current.error).toBe('Ya existe un producto con ese nombre');
    expect(result.current.success).toBeNull();
  });

  it('handles generic error', async () => {
    mockProductService.createProduct.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useCreateProduct());

    await act(async () => {
      await result.current.createProduct({ name: 'Pasta', type: ProductType.HOT_DISH, category: 'Main', price: 1500 });
    });

    expect(result.current.error).toBe('Network error');
  });

  it('handles non-Error throw', async () => {
    mockProductService.createProduct.mockRejectedValue('unexpected');

    const { result } = renderHook(() => useCreateProduct());

    await act(async () => {
      await result.current.createProduct({ name: 'Pasta', type: ProductType.HOT_DISH, category: 'Main', price: 1500 });
    });

    expect(result.current.error).toBe('Error al crear el producto');
  });

  it('reset clears error and success', async () => {
    mockProductService.createProduct.mockRejectedValue(new Error('fail'));

    const { result } = renderHook(() => useCreateProduct());

    await act(async () => {
      await result.current.createProduct({ name: 'Pasta', type: ProductType.HOT_DISH, category: 'Main', price: 1500 });
    });

    expect(result.current.error).not.toBeNull();

    act(() => {
      result.current.reset();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.success).toBeNull();
  });
});
