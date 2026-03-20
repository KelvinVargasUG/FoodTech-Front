import type { OrderProduct } from '../../models/Product';

interface OrderSummaryProps {
  products: OrderProduct[];
  totalItems: number;
  totalPrice: number;
  isSubmitting: boolean;
  customerName: string;
  customerEmail: string;
  onCustomerNameChange: (value: string) => void;
  onCustomerEmailChange: (value: string) => void;
  onRemoveProduct: (productName: string) => void;
  onSubmit: () => void;
}

/**
 * Panel lateral con resumen del pedido
 */
export const OrderSummary = ({
  products,
  totalItems,
  totalPrice,
  isSubmitting,
  customerName,
  customerEmail,
  onCustomerNameChange,
  onCustomerEmailChange,
  onRemoveProduct,
  onSubmit,
}: OrderSummaryProps) => {
  const hasProducts = products.length > 0;

  return (
    <div data-testid="order-summary" className="p-4 sm:p-6 lg:p-8 border-b border-white/5 overflow-y-auto">
      <div className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-4 sm:mb-6 lg:mb-8">
        <h3 className="text-lg sm:text-xl font-bold text-white-text">Resumen de Orden</h3>
        {hasProducts && (
          <span data-testid="order-active-badge" className="bg-primary/10 text-primary text-[9px] sm:text-[10px] px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-primary/20 font-bold uppercase tracking-wider sm:tracking-widest">
            <span className="hidden sm:inline">Orden </span>Activa
          </span>
        )}
      </div>

      {/* Datos del Cliente */}
      <div className="mb-4 sm:mb-6 space-y-3">
        <input
          data-testid="customer-name-input"
          type="text"
          placeholder="Nombre del cliente"
          value={customerName}
          onChange={(e) => onCustomerNameChange(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white-text placeholder-silver-text/50 focus:outline-none focus:border-primary/50"
        />
        <input
          data-testid="customer-email-input"
          type="email"
          placeholder="Correo del cliente"
          value={customerEmail}
          onChange={(e) => onCustomerEmailChange(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white-text placeholder-silver-text/50 focus:outline-none focus:border-primary/50"
        />
      </div>

      {/* Lista de Productos */}
      {hasProducts ? (
        <>
          <div data-testid="order-products-list" className="space-y-4 sm:space-y-6 max-h-[200px] sm:max-h-[250px] lg:max-h-[300px] overflow-y-auto order-scroll pr-2 sm:pr-4">
            {products.map((product) => (
              <div 
                key={product.name}
                data-testid={`order-item-${product.name.toLowerCase().replace(/\s+/g, '-')}`}
                data-product-name={product.name}
                className="flex justify-between items-start group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <span 
                      data-testid="order-item-name"
                      className="text-white-text text-sm sm:text-base font-bold"
                    >
                      {product.name}
                    </span>
                    <span 
                      data-testid="order-item-quantity"
                      className="text-primary text-xs sm:text-sm font-bold"
                    >
                      x{product.quantity}
                    </span>
                  </div>
                </div>
                <button
                  data-testid={`remove-product-btn-${product.name.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => onRemoveProduct(product.name)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-silver-text hover:text-primary"
                >
                  <span className="material-symbols-outlined text-lg">
                    remove_circle
                  </span>
                </button>
              </div>
            ))}
          </div>

          {/* Total Items */}
          <div data-testid="order-total" className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white-text text-sm sm:text-base font-bold">Total de Items:</span>
              <span data-testid="total-items-count" className="text-primary font-bold text-xl sm:text-2xl">{totalItems}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white-text text-sm sm:text-base font-bold">Total a Pagar:</span>
              <span data-testid="total-price-count" className="text-gold font-bold text-xl sm:text-2xl">${totalPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Botón Enviar */}
          <button
            data-testid="send-to-kitchen-btn"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="w-full mt-4 sm:mt-6 lg:mt-8 py-3 sm:py-4 lg:py-5 gold-gradient hover:brightness-110 active:scale-[0.98] transition-all rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black tracking-[0.15em] sm:tracking-[0.2em] uppercase shadow-2xl shadow-primary/20 flex items-center justify-center gap-2 sm:gap-3 text-midnight disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined font-bold animate-spin">
                  refresh
                </span>
                Enviando...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined font-bold">
                  send
                </span>
                Enviar a Cocina
              </>
            )}
          </button>
        </>
      ) : (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-6xl text-silver-text/30 mb-4 block">
            shopping_cart
          </span>
          <p className="text-silver-text text-sm">
            Selecciona productos para crear un pedido
          </p>
        </div>
      )}
    </div>
  );
};
