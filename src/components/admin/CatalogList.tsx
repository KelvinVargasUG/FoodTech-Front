import { useState, useEffect, useCallback } from 'react';
import type { CatalogProduct } from '../../models/Product';
import { ProductStatus } from '../../models/Product';
import { productService } from '../../services/productService';

const TYPE_LABELS: Record<string, string> = {
  DRINK: 'Bebida',
  HOT_DISH: 'Plato Caliente',
  COLD_DISH: 'Plato Frío',
};

export function CatalogList() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await productService.getActiveProducts();
      setProducts(data);
    } catch {
      setError('No se pudo cargar el catálogo. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggle = async (product: CatalogProduct) => {
    try {
      const updated =
        product.status === ProductStatus.ACTIVE
          ? await productService.deactivateProduct(product.id)
          : await productService.activateProduct(product.id);
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setFeedback(
        product.status === ProductStatus.ACTIVE
          ? 'Producto desactivado correctamente.'
          : 'Producto activado correctamente.'
      );
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      setFeedback('Error al cambiar el estado del producto.');
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <span className="material-symbols-outlined text-primary animate-spin text-4xl">
          progress_activity
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 text-sm bg-red-900/20 border border-red-500/30 rounded-lg p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white-text">Productos en catálogo</h2>
        <button
          onClick={load}
          className="text-xs text-silver-text hover:text-white-text flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-sm">refresh</span>
          Actualizar
        </button>
      </div>

      {feedback && (
        <div className="text-sm bg-primary/20 border border-primary/40 text-white-text rounded-lg px-4 py-2">
          {feedback}
        </div>
      )}

      {products.length === 0 ? (
        <p className="text-silver-text text-sm">No hay productos registrados.</p>
      ) : (
        <ul className="divide-y divide-white/5">
          {products.map((product) => (
            <li
              key={product.id}
              data-testid={`catalog-item-${product.id}`}
              className="flex items-center justify-between py-3"
            >
              <div className="space-y-0.5">
                <p className="text-white-text font-medium">{product.name}</p>
                <p className="text-xs text-silver-text">
                  {TYPE_LABELS[product.type] ?? product.type} · {product.category} ·{' '}
                  {(product.price / 100).toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    product.status === ProductStatus.ACTIVE
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {product.status === ProductStatus.ACTIVE ? 'Activo' : 'Inactivo'}
                </span>
                <button
                  data-testid={`toggle-status-${product.id}`}
                  onClick={() => handleToggle(product)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    product.status === ProductStatus.ACTIVE
                      ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30'
                      : 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/30'
                  }`}
                >
                  {product.status === ProductStatus.ACTIVE ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
