interface CompletedOrdersToastProps {
  message: string;
  isVisible: boolean;
}

export const CompletedOrdersToast = ({
  message,
  isVisible,
}: CompletedOrdersToastProps) => {
  if (!isVisible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="invoice-toast"
      className="fixed bottom-24 right-6 z-50 bg-charcoal/95 border border-primary/30 text-white-text text-xs rounded-xl px-4 py-3 shadow-2xl shadow-primary/10 backdrop-blur"
    >
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-sm">
          check_circle
        </span>
        <span>{message}</span>
      </div>
    </div>
  );
};
