# Design: HU-04 — Visualizar y filtrar catálogo para registrar pedidos

## Technical Approach

Reutilizar los componentes existentes (`CategoryFilter`, `ProductGrid`, `ProductCard`) que ya implementan filtrado por `ProductType`, y extenderlos para soportar productos del backend (`CatalogProduct`) filtrados por estado `ACTIVE`. Se creará un hook `useCatalog` que encapsula la llamada al servicio y la lógica de filtrado, reemplazando el hardcoded `MENU_PRODUCTS` en `WaiterView`.

## Architecture Decisions

| Decision | Alternatives | Rationale |
|----------|-------------|-----------|
| Reutilizar `CategoryFilter` + `ProductGrid` existentes | Crear componentes nuevos desde cero | Ya implementan filtrado por `ProductType` y grid responsivo. Solo necesitan adaptarse para recibir `CatalogProduct[]`. |
| Hook `useCatalog` con filtrado client-side | Filtrado server-side por query params | El catálogo de un restaurante es pequeño (~50 items). Filtrar en cliente evita latencia en cada cambio de categoría. |
| Extender `productService` con `getActiveProducts()` | Crear un `catalogService` separado | `productService` ya existe con el dominio de productos. Un nuevo método mantiene cohesión. |
| Adaptar `ProductGrid` para aceptar `CatalogProduct[]` o `Product[]` | Crear un mapper de `CatalogProduct → Product` | Mapear a `Product` para mantener compatibilidad con `ProductCard`, que espera `Product`. El mapeo se hace dentro del hook. |

## Data Flow

```
WaiterView
  │
  ├── useCatalog()
  │     ├── productService.getActiveProducts()  ──→  GET /api/products?status=ACTIVE
  │     ├── filtra por selectedCategory (client-side)
  │     └── retorna { products, isLoading, error, isEmpty }
  │
  ├── CategoryFilter  ← selectedCategory state
  │
  └── ProductGrid     ← products filtrados + empty state message
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/services/productService.ts` | Modify | Agregar método `getActiveProducts(): Promise<CatalogProduct[]>` usando `apiClient.get` |
| `src/hooks/useCatalog.ts` | Create | Hook que usa `productService`, filtra por categoría, mapea `CatalogProduct → Product`, expone estado de carga/error/vacío |
| `src/components/waiter/ProductGrid.tsx` | Modify | Agregar renderizado condicional: mensaje "No hay productos disponibles en esta categoría" cuando `products.length === 0` |
| `src/views/WaiterView.tsx` | Modify | Reemplazar `MENU_PRODUCTS` por `useCatalog()`. Pasar productos del hook a `ProductGrid` |
| `src/hooks/useCatalog.test.ts` | Create | Tests unitarios del hook (carga, filtrado, empty state, error) |
| `src/components/waiter/ProductGrid.test.tsx` | Create | Tests del empty state message en `ProductGrid` |

## Interfaces / Contracts

```typescript
// En productService.ts
async getActiveProducts(): Promise<CatalogProduct[]>
// GET /api/products?status=ACTIVE → CatalogProduct[]

// En useCatalog.ts
interface UseCatalogReturn {
  products: Product[];           // CatalogProduct mapeados a Product
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;              // true cuando filteredProducts.length === 0
  selectedCategory: ProductType | 'ALL';
  setSelectedCategory: (cat: ProductType | 'ALL') => void;
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit (hook) | `useCatalog`: carga, filtrado por categoría, empty state, error handling | Vitest + mock de `productService` |
| Unit (component) | `ProductGrid`: empty message cuando `products=[]` | Vitest + React Testing Library |
| Component | `WaiterView` con catálogo integrado | Mock de `useCatalog`, verificar que renderiza productos y filtra |

## Migration / Rollout

No migration required. Se transiciona de datos estáticos (`MENU_PRODUCTS`) a datos dinámicos del backend. Si el endpoint no está disponible, el hook mostrará estado de error con opción de reintentar.

## Open Questions

- [ ] ¿El backend expone un endpoint `GET /api/products?status=ACTIVE` o se debe usar `GET /api/products` y filtrar por status en el front?
