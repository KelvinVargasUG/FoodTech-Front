import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProductType, ProductStatus } from '../models/Product';
import type { CreateProductRequest, UpdateProductRequest } from '../models/Product';

const mockPost = vi.fn();
const mockGet = vi.fn();
const mockPatch = vi.fn();
const mockPut = vi.fn();

vi.mock('./apiClient', () => ({
  apiClient: {
    post: mockPost,
    get: mockGet,
    patch: mockPatch,
    put: mockPut,
  },
}));

describe('productService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validRequest: CreateProductRequest = {
    name: 'Lomo Saltado',
    type: ProductType.HOT_DISH,
    category: 'Principales',
    price: 1200,
  };

  const createdProduct = {
    id: 'uuid-001',
    name: 'Lomo Saltado',
    type: 'HOT_DISH',
    category: 'Principales',
    price: 1200,
    status: 'ACTIVE',
  };

  it('should call POST /api/products with the request body', async () => {
    mockPost.mockResolvedValueOnce(createdProduct);

    const { productService } = await import('./productService');
    const result = await productService.createProduct(validRequest);

    expect(mockPost).toHaveBeenCalledWith('/api/products', validRequest);
    expect(result).toEqual(createdProduct);
  });

  it('should return the created product on success', async () => {
    mockPost.mockResolvedValueOnce(createdProduct);

    const { productService } = await import('./productService');
    const result = await productService.createProduct(validRequest);

    expect(result.id).toBe('uuid-001');
    expect(result.status).toBe('ACTIVE');
  });

  it('should propagate error when product already exists (409)', async () => {
    mockPost.mockRejectedValueOnce(new Error('409 Conflict'));

    const { productService } = await import('./productService');

    await expect(productService.createProduct(validRequest)).rejects.toThrow('409');
  });

  it('should propagate error on validation failure (400)', async () => {
    mockPost.mockRejectedValueOnce(new Error('400 Bad Request'));

    const { productService } = await import('./productService');

    await expect(productService.createProduct({ ...validRequest, name: '' })).rejects.toThrow('400');
  });

  it('should propagate error on network failure', async () => {
    mockPost.mockRejectedValueOnce(new Error('Network Error'));

    const { productService } = await import('./productService');

    await expect(productService.createProduct(validRequest)).rejects.toThrow('Network Error');
  });
});

describe('productService — deactivateProduct / activateProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const inactiveProduct = {
    id: 'uuid-001',
    name: 'Lomo Saltado',
    type: 'HOT_DISH',
    category: 'Principales',
    price: 1200,
    status: 'INACTIVE',
  };

  const activeProduct = { ...inactiveProduct, status: 'ACTIVE' };

  it('deactivateProduct() should call PATCH /api/products/{id}/deactivate', async () => {
    mockPatch.mockResolvedValueOnce(inactiveProduct);
    const { productService: svc } = await import('./productService');

    const result = await svc.deactivateProduct('uuid-001');

    expect(mockPatch).toHaveBeenCalledWith('/api/products/uuid-001/deactivate');
    expect(result.status).toBe('INACTIVE');
  });

  it('activateProduct() should call PATCH /api/products/{id}/activate', async () => {
    mockPatch.mockResolvedValueOnce(activeProduct);
    const { productService: svc } = await import('./productService');

    const result = await svc.activateProduct('uuid-001');

    expect(mockPatch).toHaveBeenCalledWith('/api/products/uuid-001/activate');
    expect(result.status).toBe('ACTIVE');
  });

  it('deactivateProduct() should propagate error on 404', async () => {
    mockPatch.mockRejectedValueOnce(new Error('HTTP error! status: 404'));
    const { productService: svc } = await import('./productService');

    await expect(svc.deactivateProduct('nonexistent')).rejects.toThrow('404');
  });
});

describe('productService — updateProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const updateRequest: UpdateProductRequest = {
    name: 'Lomo Saltado Especial',
    description: 'Con arroz chaufa',
    type: ProductType.HOT_DISH,
    category: 'Principales',
    price: 1500,
    status: ProductStatus.ACTIVE,
  };

  const updatedProduct = {
    id: 'uuid-001',
    name: 'Lomo Saltado Especial',
    description: 'Con arroz chaufa',
    type: 'HOT_DISH',
    category: 'Principales',
    price: 1500,
    status: 'ACTIVE',
  };

  it('updateProduct() should call PUT /api/products/{id} with request body', async () => {
    mockPut.mockResolvedValueOnce(updatedProduct);
    const { productService: svc } = await import('./productService');

    const result = await svc.updateProduct('uuid-001', updateRequest);

    expect(mockPut).toHaveBeenCalledWith('/api/products/uuid-001', updateRequest);
    expect(result).toEqual(updatedProduct);
  });

  it('updateProduct() should return updated product with new name and description', async () => {
    mockPut.mockResolvedValueOnce(updatedProduct);
    const { productService: svc } = await import('./productService');

    const result = await svc.updateProduct('uuid-001', updateRequest);

    expect(result.name).toBe('Lomo Saltado Especial');
    expect(result.description).toBe('Con arroz chaufa');
    expect(result.price).toBe(1500);
  });

  it('updateProduct() should propagate error on 404', async () => {
    mockPut.mockRejectedValueOnce(new Error('HTTP error! status: 404'));
    const { productService: svc } = await import('./productService');

    await expect(svc.updateProduct('nonexistent', updateRequest)).rejects.toThrow('404');
  });

  it('updateProduct() should propagate error on 400', async () => {
    mockPut.mockRejectedValueOnce(new Error('HTTP error! status: 400'));
    const { productService: svc } = await import('./productService');

    await expect(svc.updateProduct('uuid-001', { ...updateRequest, name: '' })).rejects.toThrow('400');
  });
});

