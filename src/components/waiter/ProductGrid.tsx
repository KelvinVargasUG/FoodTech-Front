import type { Product } from '../../models/Product';
import { ProductType } from '../../models/Product';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  selectedCategory: ProductType | 'ALL';
  orderProductNames: string[];
  onAddProduct: (product: Product) => void;
}

export const ProductGrid = ({
  products,
  selectedCategory,
  orderProductNames,
  onAddProduct,
}: ProductGridProps) => {
  const filteredProducts =
    selectedCategory === 'ALL'
      ? products
      : products.filter((p) => p.type === selectedCategory);

  if (filteredProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <span className="material-symbols-outlined text-silver-text text-5xl">
          menu_book
        </span>
        <p className="text-silver-text text-center">
          No hay productos disponibles en esta categoría
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
      {filteredProducts.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isInOrder={orderProductNames.includes(product.name)}
          onAdd={onAddProduct}
        />
      ))}
    </div>
  );
};
