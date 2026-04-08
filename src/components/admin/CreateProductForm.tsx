import { useState } from 'react';
import { ProductType } from '../../models/Product';
import { useCreateProduct } from '../../hooks/useCreateProduct';
import type { CreateProductRequest } from '../../models/Product';

const PRODUCT_TYPE_LABELS: Record<string, string> = {
  [ProductType.DRINK]: 'Bebida',
  [ProductType.HOT_DISH]: 'Plato Caliente',
  [ProductType.COLD_DISH]: 'Plato Frío',
};

interface CreateProductFormProps {
  onSuccess?: () => void;
}

export function CreateProductForm({ onSuccess }: CreateProductFormProps) {
  const { createProduct, isSubmitting, error, success, reset } = useCreateProduct();

  const [form, setForm] = useState<CreateProductRequest>({
    name: '',
    type: ProductType.HOT_DISH,
    category: '',
    price: 0,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
    const result = await createProduct(form);
    if (result) {
      setForm({ name: '', type: ProductType.HOT_DISH, category: '', price: 0 });
      onSuccess?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-charcoal border border-white/10 rounded-xl p-6 space-y-5">
      <h2 className="text-lg font-semibold text-white-text">Nuevo Producto</h2>

      {}
      <div className="space-y-1">
        <label className="text-sm text-silver-text" htmlFor="name">
          Nombre
        </label>
        <input
          id="name"
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
        <label className="text-sm text-silver-text" htmlFor="type">
          Tipo
        </label>
        <select
          id="type"
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
        <label className="text-sm text-silver-text" htmlFor="category">
          Categoría
        </label>
        <input
          id="category"
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
        <label className="text-sm text-silver-text" htmlFor="price">
          Precio (centavos)
        </label>
        <input
          id="price"
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
            Producto <strong>{success.name}</strong> creado exitosamente.
          </p>
        </div>
      )}

      {}
      <button
        type="submit"
        data-testid="create-product-button"
        disabled={isSubmitting}
        className="w-full gold-gradient text-midnight font-semibold py-2.5 rounded-lg transition-opacity disabled:opacity-50"
      >
        {isSubmitting ? 'Creando...' : 'Crear Producto'}
      </button>
    </form>
  );
}
