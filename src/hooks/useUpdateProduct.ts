import { useState, useCallback } from 'react';
import { productService } from '../services/productService';
import type { UpdateProductRequest, UpdateProductResponse } from '../models/Product';

export const useUpdateProduct = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<UpdateProductResponse | null>(null);

  const updateProduct = useCallback(async (id: string, request: UpdateProductRequest): Promise<UpdateProductResponse | null> => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await productService.updateProduct(id, request);
      setSuccess(response);
      return response;
    } catch (err) {

      const message = err instanceof Error && err.message.includes('404')
        ? 'Producto no encontrado'
        : err instanceof Error && err.message.includes('400')
          ? 'Datos inválidos. Revisa los campos.'
          : err instanceof Error
            ? err.message
            : 'Error al actualizar el producto';
      setError(message);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  return { updateProduct, isSubmitting, error, success, reset };
};
