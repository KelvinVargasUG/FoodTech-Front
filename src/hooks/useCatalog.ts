import { useState, useEffect, useMemo } from 'react';
import type { Product, CatalogProduct } from '../models/Product';
import { ProductType, ProductStatus } from '../models/Product';
import { productService } from '../services/productService';

function mapCatalogToProduct(cp: CatalogProduct): Product {
  return {
    id: cp.id,
    name: cp.name,
    type: cp.type,
    price: cp.price,
  };
}

export interface UseCatalogReturn {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
  selectedCategory: ProductType | 'ALL';
  setSelectedCategory: (cat: ProductType | 'ALL') => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const useCatalog = (): UseCatalogReturn => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ProductType | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const catalogProducts = await productService.getActiveProducts();
        const active = catalogProducts.filter(
          (p) => p.status === ProductStatus.ACTIVE
        );
        if (!cancelled) {
          setAllProducts(active.map(mapCatalogToProduct));
        }
      } catch {
        if (!cancelled) {
          setError('No se pudo cargar el catálogo. Intenta de nuevo.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const products = useMemo(() => {
    let filtered = allProducts;
    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter((p) => p.type === selectedCategory);
    }
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(lower));
    }
    return filtered;
  }, [allProducts, selectedCategory, searchTerm]);

  return {
    products,
    isLoading,
    error,
    isEmpty: products.length === 0 && !isLoading,
    selectedCategory,
    setSelectedCategory,
    searchTerm,
    setSearchTerm,
  };
};
