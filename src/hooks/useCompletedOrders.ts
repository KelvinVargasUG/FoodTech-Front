import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  CompletedOrder,
  CompletedOrderResponse,
} from '../models/CompletedOrder';
import { apiClient } from '../services/apiClient';

export const useCompletedOrders = () => {
  const [completedOrders, setCompletedOrders] = useState<CompletedOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const latestSignatureRef = useRef<string>('');
  const [invoiceLoadingById, setInvoiceLoadingById] = useState<
    Record<string, boolean>
  >({});
  const [invoiceErrorById, setInvoiceErrorById] = useState<
    Record<string, string>
  >({});

  const refresh = useCallback(async (): Promise<CompletedOrder[]> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<CompletedOrderResponse[]>(
        '/api/orders/completed'
      );
      const mappedOrders: CompletedOrder[] = response.map((order) => ({
        id: String(order.orderId),
        tableNumber: order.tableNumber,
        totalItems: order.totalItems,
        totalPreparationTime: order.totalPreparationTime,
        completedAt: new Date(order.completedAt),
      }));
      const signature = mappedOrders
        .map((order) => `${order.id}:${order.completedAt.getTime()}`)
        .join('|');

      if (signature !== latestSignatureRef.current) {
        latestSignatureRef.current = signature;
        setCompletedOrders(mappedOrders);
      }
      return mappedOrders;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al cargar pedidos';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      refresh();
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [refresh]);

  const markAsInvoiced = (orderId: string) => {
    setCompletedOrders((prev) => prev.filter((order) => order.id !== orderId));
  };

  const requestInvoice = useCallback(
    async (orderId: number): Promise<number> => {
      const orderKey = String(orderId);
      setInvoiceLoadingById((prev) => ({ ...prev, [orderKey]: true }));
      setInvoiceErrorById((prev) => ({ ...prev, [orderKey]: '' }));

      try {
        await apiClient.postNoContent(`/api/orders/${orderId}/invoice`, {});
        setCompletedOrders((prev) =>
          prev.filter((order) => order.id !== orderKey)
        );
        const updatedOrders = await refresh();
        return updatedOrders.length;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Error al solicitar la factura';
        setInvoiceErrorById((prev) => ({ ...prev, [orderKey]: message }));
        throw err;
      } finally {
        setInvoiceLoadingById((prev) => ({ ...prev, [orderKey]: false }));
      }
    },
    [refresh]
  );

  const count = useMemo(() => completedOrders.length, [completedOrders]);

  return {
    completedOrders,
    count,
    loading,
    error,
    refresh,
    requestInvoice,
    invoiceLoadingById,
    invoiceErrorById,
    markAsInvoiced,
  };
};
