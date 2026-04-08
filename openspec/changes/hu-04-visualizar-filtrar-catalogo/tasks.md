# Tasks: HU-04 — Visualizar y filtrar catálogo para registrar pedidos

## Phase 1: Foundation

- [ ] 1.1 Confirmar el contrato en `src/services/productService.ts`: definir `getActiveProducts()` con `GET /api/products?status=ACTIVE` o fallback a `GET /api/products`.
- [ ] 1.2 Crear `src/hooks/useCatalog.ts` con estado base: `products`, `isLoading`, `error`, `selectedCategory` y `setSelectedCategory`.
- [ ] 1.3 Implementar en `src/hooks/useCatalog.ts` el mapeo de `CatalogProduct` a `Product` para mantener compatibilidad con `ProductCard`.

## Phase 2: Core Implementation

- [ ] 2.1 Modificar `src/services/productService.ts` para consultar productos activos y retornar `CatalogProduct[]`.
- [ ] 2.2 Implementar en `src/hooks/useCatalog.ts` la carga inicial del catálogo y el filtrado client-side por `ProductType | 'ALL'`.
- [ ] 2.3 Modificar `src/components/waiter/ProductGrid.tsx` para mostrar el mensaje vacío cuando el arreglo filtrado no tenga resultados.
- [ ] 2.4 Ajustar `src/components/waiter/CategoryFilter.tsx` solo si se requiere alinear labels/categorías con los valores reales del backend.

## Phase 3: Integration / Wiring

- [ ] 3.1 Modificar `src/views/WaiterView.tsx` para reemplazar `MENU_PRODUCTS` por `useCatalog()`.
- [ ] 3.2 Conectar `selectedCategory` y `setSelectedCategory` de `useCatalog()` con `CategoryFilter` en `src/views/WaiterView.tsx`.
- [ ] 3.3 Conectar `products`, `isLoading` y `isEmpty` del hook con `ProductGrid` en `src/views/WaiterView.tsx`.
- [ ] 3.4 Mantener intacta la integración entre `ProductGrid`, `useOrder` y `OrderSummary` para no romper el registro de pedidos.

## Phase 4: Testing

- [ ] 4.1 Escribir RED test en `src/hooks/useCatalog.test.ts` para CA1: solo productos `ACTIVE` al cargar el catálogo.
- [ ] 4.2 Escribir RED test en `src/hooks/useCatalog.test.ts` para CA2: filtrar por categoría y devolver solo productos de la categoría seleccionada.
- [ ] 4.3 Escribir RED test en `src/components/waiter/ProductGrid.test.tsx` para CA3: mostrar “No hay productos disponibles en esta categoría”.
- [ ] 4.4 Hacer GREEN los tests implementando la lógica mínima en `useCatalog.ts`, `productService.ts`, `ProductGrid.tsx` y `WaiterView.tsx`.
- [ ] 4.5 Refactorizar nombres, tipos y duplicación sin cambiar comportamiento, manteniendo cobertura > 80%.

## Phase 5: Verification

- [ ] 5.1 Ejecutar `npm test -- --run` y verificar que los escenarios de catálogo activo, filtrado y estado vacío pasan.
- [ ] 5.2 Ejecutar `npm run lint` para validar que los cambios en `src/hooks`, `src/services`, `src/components/waiter` y `src/views` no introducen errores.
- [ ] 5.3 Validar manualmente en la vista de mesero que agregar productos al pedido sigue funcionando tras cambiar la fuente del catálogo.
