export const ProductType = {
  DRINK: 'DRINK',
  HOT_DISH: 'HOT_DISH',
  COLD_DISH: 'COLD_DISH',
} as const;

export type ProductType = (typeof ProductType)[keyof typeof ProductType];

export interface Product {
  id: string;
  name: string;
  type: ProductType;
  description?: string;
  image?: string;
  price: number;
}

export interface OrderProduct {
  name: string;
  type: ProductType;
  quantity: number;
  price: number;
}

export const ProductStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;

export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus];

export interface CatalogProduct {
  id: string;
  name: string;
  description?: string;
  type: ProductType;
  category: string;
  price: number;
  status: ProductStatus;
}

export interface CreateProductRequest {
  name: string;
  type: ProductType;
  category: string;
  price: number;
}

export type CreateProductResponse = CatalogProduct;

export interface UpdateProductRequest {
  name: string;
  description?: string;
  type: ProductType;
  category: string;
  price: number;
  status: ProductStatus;
}

export interface UpdateProductResponse {
  id: string;
  name: string;
  description?: string;
  type: ProductType;
  category: string;
  price: number;
  status: ProductStatus;
}
