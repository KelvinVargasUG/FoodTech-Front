import { apiClient } from './apiClient';
import type { CatalogProduct, CreateProductRequest, CreateProductResponse, UpdateProductRequest, UpdateProductResponse } from '../models/Product';

class ProductService {
  async createProduct(request: CreateProductRequest): Promise<CreateProductResponse> {
    return apiClient.post<CreateProductRequest, CreateProductResponse>(
      '/api/products',
      request
    );
  }

  async getActiveProducts(): Promise<CatalogProduct[]> {
    return apiClient.get<CatalogProduct[]>('/api/products');
  }

  async updateProduct(id: string, request: UpdateProductRequest): Promise<UpdateProductResponse> {
    return apiClient.put<UpdateProductRequest, UpdateProductResponse>(
      `/api/products/${id}`,
      request
    );
  }

  async deactivateProduct(id: string): Promise<CatalogProduct> {
    return apiClient.patch<CatalogProduct>(`/api/products/${id}/deactivate`);
  }

  async activateProduct(id: string): Promise<CatalogProduct> {
    return apiClient.patch<CatalogProduct>(`/api/products/${id}/activate`);
  }
}

export const productService = new ProductService();
