import { useState, useCallback } from 'react';
import type { OrderProduct, Product } from '../models/Product';
import { orderService } from '../services/orderService';
import type { CreateOrderRequest, CreateOrderResponse } from '../models/Order';

export const useOrder = () => {
  const [orderProducts, setOrderProducts] = useState<OrderProduct[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addProduct = useCallback((product: Product) => {
    setOrderProducts((prev) => {
      const existingIndex = prev.findIndex(
        (p) => p.name === product.name && p.type === product.type
      );

      if (existingIndex >= 0) {

        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      }

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

  const removeProduct = useCallback((productName: string) => {
    setOrderProducts((prev) => {
      const existingIndex = prev.findIndex((p) => p.name === productName);

      if (existingIndex < 0) return prev;

      const updated = [...prev];
      if (updated[existingIndex].quantity > 1) {

        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity - 1,
        };
        return updated;
      }

      return prev.filter((p) => p.name !== productName);
    });
  }, []);

  const clearOrder = useCallback(() => {
    setOrderProducts([]);
    setError(null);
  }, []);

  const submitOrder = useCallback(
    async (tableNumber: string, customerName: string, customerEmail: string): Promise<CreateOrderResponse | null> => {
      if (orderProducts.length === 0) {
        setError('El pedido debe contener al menos un producto');
        return null;
      }

      setIsSubmitting(true);
      setError(null);

      try {

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
