import { useState } from 'react';
import { ProductType, ProductStatus } from '../../models/Product';
import { useUpdateProduct } from '../../hooks/useUpdateProduct';
import type { CatalogProduct, UpdateProductRequest } from '../../models/Product';

const PRODUCT_TYPE_LABELS: Record<string, string> = {
  [ProductType.DRINK]: 'Bebida',
  [ProductType.HOT_DISH]: 'Plato Caliente',
  [ProductType.COLD_DISH]: 'Plato Frío',
};

const PRODUCT_STATUS_LABELS: Record<string, string> = {
  [ProductStatus.ACTIVE]: 'Activo',
  [ProductStatus.INACTIVE]: 'Inactivo',
};

interface EditProductFormProps {
  product: CatalogProduct;
  onCancel: () => void;
  onSuccess: () => void;
}

export function EditProductForm({ product, onCancel, onSuccess }: EditProductFormProps) {
  const { updateProduct, isSubmitting, error, success, reset } = useUpdateProduct();

  const [form, setForm] = useState<UpdateProductRequest>({
    name: product.name,
    description: product.description ?? '',
    type: product.type,
    category: product.category,
    price: product.price,
    status: product.status,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [syncedProductId, setSyncedProductId] = useState(product.id);

  if (product.id !== syncedProductId) {
    setSyncedProductId(product.id);
    setForm({
      name: product.name,
      description: product.description ?? '',
      type: product.type,
      category: product.category,
      price: product.price,
      status: product.status,
    });
    reset();
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'price' ? Number(value) : value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => { const next = { ...prev }; delete next[name]; return next; });
    }
    if (error || success) reset();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = 'El nombre es requerido';
    if (!form.category.trim()) errors.category = 'La categoría es requerida';
    if (!form.price || form.price < 1) errors.price = 'El precio debe ser mayor a 0';
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    const result = await updateProduct(product.id, form);
    if (result) {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-charcoal border border-white/10 rounded-xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white-text">Editar Producto</h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-silver-text hover:text-white-text transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {}
      <div className="space-y-1">
        <label className="text-sm text-silver-text" htmlFor="edit-name">
          Nombre <span className="text-red-400">*</span>
        </label>
        <input
          id="edit-name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          placeholder="Ej. Lomo Saltado"
          className="w-full bg-midnight border border-white/10 rounded-lg px-4 py-2 text-white-text placeholder:text-silver-text/50 focus:outline-none focus:border-primary/60"
        />
        {formErrors.name && (
          <p data-testid="form-validation-error" className="text-red-400 text-xs mt-1">{formErrors.name}</p>
        )}
      </div>

      {}
      <div className="space-y-1">
        <label className="text-sm text-silver-text" htmlFor="edit-description">
          Descripción
        </label>
        <textarea
          id="edit-description"
          name="description"
          value={form.description ?? ''}
          onChange={handleChange}
          placeholder="Descripción del producto (opcional)"
          rows={3}
          className="w-full bg-midnight border border-white/10 rounded-lg px-4 py-2 text-white-text placeholder:text-silver-text/50 focus:outline-none focus:border-primary/60 resize-none"
        />
      </div>

      {}
      <div className="space-y-1">
        <label className="text-sm text-silver-text" htmlFor="edit-type">
          Tipo <span className="text-red-400">*</span>
        </label>
        <select
          id="edit-type"
          name="type"
          value={form.type}
          onChange={handleChange}
          className="w-full bg-midnight border border-white/10 rounded-lg px-4 py-2 text-white-text focus:outline-none focus:border-primary/60"
        >
          {Object.entries(PRODUCT_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {}
      <div className="space-y-1">
        <label className="text-sm text-silver-text" htmlFor="edit-category">
          Categoría <span className="text-red-400">*</span>
        </label>
        <input
          id="edit-category"
          name="category"
          type="text"
          value={form.category}
          onChange={handleChange}
          placeholder="Ej. Entradas, Postres..."
          className="w-full bg-midnight border border-white/10 rounded-lg px-4 py-2 text-white-text placeholder:text-silver-text/50 focus:outline-none focus:border-primary/60"
        />
        {formErrors.category && (
          <p data-testid="form-validation-error" className="text-red-400 text-xs mt-1">{formErrors.category}</p>
        )}
      </div>

      {}
      <div className="space-y-1">
        <label className="text-sm text-silver-text" htmlFor="edit-price">
          Precio (centavos) <span className="text-red-400">*</span>
        </label>
        <input
          id="edit-price"
          name="price"
          type="number"
          min={1}
          value={form.price}
          onChange={handleChange}
          className="w-full bg-midnight border border-white/10 rounded-lg px-4 py-2 text-white-text focus:outline-none focus:border-primary/60"
        />
        {formErrors.price && (
          <p data-testid="form-validation-error" className="text-red-400 text-xs mt-1">{formErrors.price}</p>
        )}
      </div>

      {}
      <div className="space-y-1">
        <label className="text-sm text-silver-text" htmlFor="edit-status">
          Estado <span className="text-red-400">*</span>
        </label>
        <select
          id="edit-status"
          name="status"
          value={form.status}
          onChange={handleChange}
          className="w-full bg-midnight border border-white/10 rounded-lg px-4 py-2 text-white-text focus:outline-none focus:border-primary/60"
        >
          {Object.entries(PRODUCT_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {}
      {error && (
        <div className="flex items-center gap-2 bg-red-900/30 border border-red-500/40 rounded-lg px-4 py-3">
          <span className="material-symbols-outlined text-red-400 text-lg">error</span>
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {}
      {success && (
        <div className="flex items-center gap-2 bg-green-900/30 border border-green-500/40 rounded-lg px-4 py-3">
          <span className="material-symbols-outlined text-green-400 text-lg">check_circle</span>
          <p className="text-green-400 text-sm">
            Producto <strong>{success.name}</strong> actualizado exitosamente.
          </p>
        </div>
      )}

      {}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border border-white/10 text-silver-text py-2.5 rounded-lg transition-colors hover:bg-white/5"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 gold-gradient text-midnight font-semibold py-2.5 rounded-lg transition-opacity disabled:opacity-50"
        >
          {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  );
}
