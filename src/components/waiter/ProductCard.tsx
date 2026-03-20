import type { Product } from '../../models/Product';

interface ProductCardProps {
  product: Product;
  isInOrder: boolean;
  onAdd: (product: Product) => void;
}

/**
 * Tarjeta de producto individual del menú
 */
export const ProductCard = ({ product, isInOrder, onAdd }: ProductCardProps) => {
  return (
    <div
      data-testid={`product-item-${product.name.replace(/\s+/g, '-').toLowerCase()}`}
      data-product-name={product.name}
      data-product-type={product.type}
      data-is-in-order={isInOrder}
      onClick={() => onAdd(product)}
      className={`
        group p-4 rounded-2xl cursor-pointer transition-all flex flex-col gap-4
        ${
          isInOrder
            ? 'glass-panel-dark border-primary/40 bg-white/10 ring-1 ring-primary/20'
            : 'glass-panel-dark hover:border-primary/60'
        }
      `}
    >
      {/* Image */}
      <div className="h-48 rounded-xl overflow-hidden relative">
        <img 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
          src={product.image}
        />
        {isInOrder && (
          <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-4xl">check_circle</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex justify-between items-start px-1">
        <div>
          <h3 data-testid="product-name" className={`font-bold text-lg transition-colors ${isInOrder ? 'text-primary' : 'text-white-text group-hover:text-primary'}`}>
            {product.name}
          </h3>
          {product.description && (
            <p className="text-silver-text text-xs mt-1">{product.description}</p>
          )}
        </div>
      </div>

      {/* Add Button */}
      <button 
        data-testid="add-order-btn"
        className={`w-full py-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
          isInOrder 
            ? 'gold-gradient text-midnight shadow-lg shadow-primary/10'
            : 'bg-white/5 group-hover:gold-gradient text-silver-text group-hover:text-midnight border border-white/5 group-hover:border-transparent'
        }`}
      >
        <span className="material-symbols-outlined text-sm">{isInOrder ? 'check' : 'add'}</span>
        {isInOrder ? 'Agregado' : 'Agregar a Orden'}
      </button>
    </div>
  );
};
