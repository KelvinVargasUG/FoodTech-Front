import { useState, useCallback } from 'react';
import type { OrderProduct, Product } from '../models/Product';
import { orderService } from '../services/orderService';
import type { CreateOrderRequest, CreateOrderResponse } from '../models/Order';

/**
 * Hook para gestionar el pedido actual
 */
export const useOrder = () => {
  const [orderProducts, setOrderProducts] = useState<OrderProduct[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Agrega un producto al pedido
   */
  const addProduct = useCallback((product: Product) => {
    setOrderProducts((prev) => {
      const existingIndex = prev.findIndex(
        (p) => p.name === product.name && p.type === product.type
      );

      if (existingIndex >= 0) {
        // Si ya existe, incrementar cantidad
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      }

      // Si no existe, agregar nuevo
      return [
        ...prev,
        {
          name: product.name,
          type: product.type,
          quantity: 1,
          price: product.price || 0,
        },
      ];
    });
  }, []);

  /**
   * Elimina un producto del pedido
   */
  const removeProduct = useCallback((productName: string) => {
    setOrderProducts((prev) => {
      const existingIndex = prev.findIndex((p) => p.name === productName);

      if (existingIndex < 0) return prev;

      const updated = [...prev];
      if (updated[existingIndex].quantity > 1) {
        // Decrementar cantidad
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity - 1,
        };
        return updated;
      }

      // Eliminar si cantidad es 1
      return prev.filter((p) => p.name !== productName);
    });
  }, []);

  /**
   * Limpia el pedido
   */
  const clearOrder = useCallback(() => {
    setOrderProducts([]);
    setError(null);
  }, []);

  /**
   * Envía el pedido al backend
   */
  const submitOrder = useCallback(
    async (tableNumber: string, customerName: string, customerEmail: string): Promise<CreateOrderResponse | null> => {
      if (orderProducts.length === 0) {
        setError('El pedido debe contener al menos un producto');
        return null;
      }

      setIsSubmitting(true);
      setError(null);

      try {
        // Convertir a formato del backend
        const request: CreateOrderRequest = {
          tableNumber,
          customerName,
          customerEmail,
          products: orderProducts.flatMap((op) =>
            Array(op.quantity).fill({ name: op.name, type: op.type, price: op.price })
          ),
        };

        const response = await orderService.createOrder(request);
        clearOrder();
        return response;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Error al enviar el pedido';
        setError(errorMessage);
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [orderProducts, clearOrder]
  );

  const totalItems = orderProducts.reduce(
    (sum, product) => sum + product.quantity,
    0
  );

  return {
    orderProducts,
    totalItems,
    isSubmitting,
    error,
    addProduct,
    removeProduct,
    clearOrder,
    submitOrder,
  };
};
