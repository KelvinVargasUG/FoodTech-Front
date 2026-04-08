import { useState, useEffect, useCallback, useMemo } from 'react';
import { CreateProductForm } from '../components/admin/CreateProductForm';
import { EditProductForm } from '../components/admin/EditProductForm';
import { productService } from '../services/productService';
import { ProductStatus } from '../models/Product';
import type { CatalogProduct } from '../models/Product';

const STATUS_BADGE: Record<string, { label: string; classes: string }> = {
  [ProductStatus.ACTIVE]: { label: 'Activo', classes: 'bg-green-900/30 text-green-400 border-green-500/40' },
  [ProductStatus.INACTIVE]: { label: 'Inactivo', classes: 'bg-red-900/30 text-red-400 border-red-500/40' },
};

export function AdminView() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<CatalogProduct | null>(null);
  const [statusFeedback, setStatusFeedback] = useState<{ message: string; isError: boolean } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    const lower = searchTerm.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(lower));
  }, [products, searchTerm]);

  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await productService.getActiveProducts();
      setProducts(data);
    } catch {
      setStatusFeedback({ message: 'Error al cargar los productos.', isError: true });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleEditSuccess = () => {
    setEditingProduct(null);
    loadProducts();
  };

  const handleToggleStatus = async (product: CatalogProduct) => {
    try {
      const updated =
        product.status === ProductStatus.ACTIVE
          ? await productService.deactivateProduct(product.id)
          : await productService.activateProduct(product.id);
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setStatusFeedback({
        message: updated.status === ProductStatus.INACTIVE
          ? `"${updated.name}" desactivado correctamente.`
          : `"${updated.name}" activado correctamente.`,
        isError: false,
      });
    } catch {
      setStatusFeedback({ message: 'Error al cambiar el estado del producto.', isError: true });
    } finally {
      setTimeout(() => setStatusFeedback(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-midnight p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {}
        <div className="flex items-center gap-3">
          <div className="size-10 gold-gradient rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-midnight text-2xl">admin_panel_settings</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white-text">Catálogo de Productos</h1>
            <p className="text-sm text-silver-text">Gestión del menú del restaurante</p>
          </div>
        </div>

        {}
        {editingProduct && (
          <EditProductForm
            product={editingProduct}
            onCancel={() => setEditingProduct(null)}
            onSuccess={handleEditSuccess}
          />
        )}

        {}
        {!editingProduct && <CreateProductForm onSuccess={loadProducts} />}

        {}
        <div className="bg-charcoal border border-white/10 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-white-text">Productos del Catálogo</h2>
            <div className="relative w-72">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-silver-text text-lg">search</span>
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="search-product-input"
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-midnight/50 border border-white/10 text-white-text placeholder-silver-text text-sm focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          </div>

          {statusFeedback && (
            <div
              data-testid={statusFeedback.isError ? 'toggle-error-message' : 'toggle-success-message'}
              className={`text-sm border rounded-lg px-4 py-2 ${
                statusFeedback.isError
                  ? 'bg-red-900/20 border-red-500/40 text-red-400'
                  : 'bg-primary/20 border-primary/40 text-white-text'
              }`}
            >
              {statusFeedback.message}
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <span className="material-symbols-outlined text-primary animate-spin text-3xl">progress_activity</span>
            </div>
          )}

          {!isLoading && filteredProducts.length === 0 && (
            <p className="text-silver-text text-sm text-center py-8">
              {searchTerm.trim() ? 'No se encontraron productos con ese nombre.' : 'No hay productos en el catálogo.'}
            </p>
          )}

          {!isLoading && filteredProducts.length > 0 && (
            <div className="space-y-3" data-testid="product-list">
              {filteredProducts.map((product) => {
                const badge = STATUS_BADGE[product.status] ?? STATUS_BADGE[ProductStatus.ACTIVE];
                return (
                  <div
                    key={product.id}
                    className="flex items-center justify-between bg-midnight/50 border border-white/5 rounded-lg px-4 py-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white-text font-medium truncate">{product.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${badge.classes}`}>
                          {badge.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-silver-text text-xs">{product.category}</span>
                        <span className="text-silver-text text-xs">•</span>
                        <span className="text-primary text-xs font-medium">
                          ${(product.price / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        type="button"
                        data-testid={`toggle-status-${product.id}`}
                        onClick={() => handleToggleStatus(product)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors border ${
                          product.status === ProductStatus.ACTIVE
                            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/30'
                            : 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/30'
                        }`}
                      >
                        {product.status === ProductStatus.ACTIVE ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        type="button"
                        data-testid={`edit-product-${product.id}`}
                        onClick={() => setEditingProduct(product)}
                        className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">edit</span>
                        Editar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
