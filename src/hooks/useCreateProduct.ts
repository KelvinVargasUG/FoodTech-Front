import { useState, useCallback } from 'react';
import { productService } from '../services/productService';
import type { CreateProductRequest, CreateProductResponse } from '../models/Product';

export const useCreateProduct = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<CreateProductResponse | null>(null);

  const createProduct = useCallback(async (request: CreateProductRequest): Promise<CreateProductResponse | null> => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await productService.createProduct(request);
      setSuccess(response);
      return response;
    } catch (err) {
      const status = err instanceof Error && err.message.includes('409')
        ? 'Ya existe un producto con ese nombre'
        : err instanceof Error
          ? err.message
          : 'Error al crear el producto';
      setError(status);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  return { createProduct, isSubmitting, error, success, reset };
};
