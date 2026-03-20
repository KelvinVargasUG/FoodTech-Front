import { useEffect, useMemo, useRef, useState } from 'react';
import type { CompletedOrder } from '../../models/CompletedOrder';

interface CompletedOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: CompletedOrder[];
  onInvoice: (orderId: number) => Promise<number> | number;
  loading?: boolean;
  error?: string | null;
  invoiceLoadingById?: Record<string, boolean>;
  invoiceErrorById?: Record<string, string>;
}

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export const CompletedOrdersModal = ({
  isOpen,
  onClose,
  orders,
  onInvoice,
  loading = false,
  error = null,
  invoiceLoadingById = {},
  invoiceErrorById = {},
}: CompletedOrdersModalProps) => {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [nameErrors, setNameErrors] = useState<Record<string, string>>({});

  const sortedOrders = useMemo(() => {
    return [...orders].sort(
      (a, b) => b.completedAt.getTime() - a.completedAt.getTime()
    );
  }, [orders]);

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;

    const focusFirstElement = () => {
      const focusables = contentRef.current?.querySelectorAll<HTMLElement>(
        FOCUSABLE_SELECTOR
      );
      focusables?.[0]?.focus();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusables = contentRef.current?.querySelectorAll<HTMLElement>(
        FOCUSABLE_SELECTOR
      );
      if (!focusables || focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const onFocusIn = (event: FocusEvent) => {
      if (!contentRef.current?.contains(event.target as Node)) {
        focusFirstElement();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('focusin', onFocusIn);

    focusFirstElement();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('focusin', onFocusIn);
      previousFocusRef.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
    >
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="completed-orders-title"
        className="w-full max-w-2xl glass-panel-dark rounded-3xl border border-white/10 shadow-2xl"
      >
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/10">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-primary">
              Billing
            </p>
            <h2
              id="completed-orders-title"
              className="text-xl font-bold text-white-text"
            >
              Completed Orders
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-silver-text hover:text-white-text transition-colors"
            aria-label="Close completed orders"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        <div className="px-8 py-6 max-h-[60vh] overflow-y-auto order-scroll">
          {loading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="text-center">
                <span className="material-symbols-outlined text-5xl text-primary animate-pulse mb-3">
                  refresh
                </span>
                <p className="text-silver-text text-sm">Cargando pedidos...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-red-400">error</span>
                <p className="text-sm text-red-400">{error}</p>
              </div>
            </div>
          ) : sortedOrders.length === 0 ? (
            <div data-testid="no-orders-message" className="text-center py-12">
              <span className="material-symbols-outlined text-6xl text-silver-text/30 mb-4 block">
                receipt_long
              </span>
              <p className="text-silver-text text-sm">No completed orders.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedOrders.map((order, index) => (
                <div
                  key={order.id}
                  className="glass-panel-dark border border-white/10 rounded-2xl p-5 flex flex-col gap-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-silver-text">Order</p>
                      <p className="text-lg font-bold text-white-text">
                        {order.id}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-silver-text">Table</p>
                      <p className="text-lg font-bold text-primary">
                        {order.tableNumber}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-silver-text">Items</p>
                      <p className="text-xl font-bold text-white-text">
                        {order.totalItems}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {invoiceErrorById[order.id] && (
                        <p className="text-[10px] text-red-400">
                          {invoiceErrorById[order.id]}
                        </p>
                      )}
                      <button
                        type="button"
                        data-testid={`invoice-btn-${index}`}
                        onClick={async () => {
                          const numericOrderId = Number(order.id);
                          if (Number.isNaN(numericOrderId)) {
                            // Ignorar id invalido internamente o manejar si es necesario
                            return;
                          }

                          try {
                            await onInvoice(numericOrderId);
                          } catch {
                            // Error manejado en componente padre / hook
                          }
                        }}
                        disabled={invoiceLoadingById[order.id]}
                        className="gold-gradient text-midnight font-bold text-xs uppercase tracking-[0.2em] px-6 py-3 rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {invoiceLoadingById[order.id] ? 'Enviando...' : 'Facturar'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
