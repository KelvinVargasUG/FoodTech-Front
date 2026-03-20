import { useEffect, useRef, useState } from 'react';
import { useCompletedOrders } from '../../hooks/useCompletedOrders';
import { CompletedOrdersButton } from './CompletedOrdersButton';
import { CompletedOrdersModal } from './CompletedOrdersModal';
import { CompletedOrdersToast } from './CompletedOrdersToast';

export const CompletedOrdersWidget = () => {
  const {
    completedOrders,
    count,
    loading,
    error,
    requestInvoice,
    invoiceLoadingById,
    invoiceErrorById,
  } = useCompletedOrders();
  const [isOpen, setIsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const toastTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current !== null) {
        window.clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = null;
      }
    };
  }, []);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleInvoice = async (orderId: number) => {
    const remainingCount = await requestInvoice(orderId);
    setToastMessage(
      'Factura enviada correctamente. En unos minutos llegara al correo del cliente.'
    );
    if (remainingCount === 0) {
      setIsOpen(false);
    }

    if (toastTimeoutRef.current !== null) {
      window.clearTimeout(toastTimeoutRef.current);
    }

    toastTimeoutRef.current = window.setTimeout(() => {
      setToastMessage('');
      toastTimeoutRef.current = null;
    }, 4000);

    return remainingCount;
  };

  return (
    <>
      <CompletedOrdersButton
        count={count}
        onToggle={handleToggle}
        isLoading={loading}
      />
      {isOpen && (
        <CompletedOrdersModal
          isOpen={isOpen}
          onClose={handleClose}
          orders={completedOrders}
          onInvoice={handleInvoice}
          loading={loading}
          error={error}
          invoiceLoadingById={invoiceLoadingById}
          invoiceErrorById={invoiceErrorById}
        />
      )}
      <CompletedOrdersToast
        message={toastMessage}
        isVisible={toastMessage.length > 0}
      />
    </>
  );
};
