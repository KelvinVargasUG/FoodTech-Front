import { ProductType } from '../../models/Product';

interface CategoryFilterProps {
  selectedCategory: ProductType | 'ALL';
  onSelectCategory: (category: ProductType | 'ALL') => void;
}

export const CategoryFilter = ({
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) => {
  const categories: { key: ProductType | 'ALL'; label: string }[] = [
    { key: 'ALL', label: 'Todo el Menú' },
    { key: ProductType.DRINK, label: 'Bebidas' },
    { key: ProductType.HOT_DISH, label: 'Platos Principales' },
    { key: ProductType.COLD_DISH, label: 'Ensaladas' },
  ];

  return (
    <div className="flex gap-3 mb-10 overflow-x-auto pb-2">
      {categories.map((category) => (
        <button
          key={category.key}
          onClick={() => onSelectCategory(category.key)}
          className={`
            px-8 py-3 rounded-xl text-sm font-bold shrink-0 transition-colors
            ${
              selectedCategory === category.key
                ? 'gold-gradient text-midnight shadow-lg shadow-primary/20'
                : 'bg-white/5 text-silver-text hover:bg-white/10 hover:text-white-text border border-white/5'
            }
          `}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
};
