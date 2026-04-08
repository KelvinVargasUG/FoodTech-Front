# Proposal: HU-04: Visualizar y filtrar catálogo para registrar pedidos

## Intent

Permitir al mesero visualizar el catálogo de productos activos y filtrarlos por categoría. Esto agiliza el proceso de encontrar y seleccionar ítems al registrar un nuevo pedido, mejorando el tiempo de atención al cliente.

## Scope

### In Scope
- Creación de vista o componente para navegación del catálogo de productos.
- Lógica para filtrar y mostrar exclusivamente productos en estado "Activo".
- Filtros por categoría (ej. "Bebidas", "Platos Calientes").
- Visualización de un mensaje informativo cuando el catálogo está vacío o el filtro no produce resultados.
- Pruebas de componentes (Component Tests) y de integración para la navegación y el filtrado del catálogo.

### Out of Scope
- Gestión o edición del catálogo de productos (CRUD).
- Persistencia de estados de filtro entre sesiones o dispositivos.
- Modificación del estado de los productos a inactivos.

## Approach

- Crear un componente funcional en React (`ProductCatalogRenderer.tsx` ó similar) dentro de `src/components/waiter/`.
- Utilizar un hook personalizado (ej. `useCatalog`) para manejar el estado del catálogo, la selección de categoría actual, y la lógica de filtrado (estado por defecto mostrando todos los productos activos y por categoría si aplica).
- Renderizado condicional para mostrar el mensaje: "No hay productos disponibles en esta categoría" cuando la colección resultante es vacía.
- Seguir la metodología TDD con pruebas a nivel componente usando Vitest y Mockup de datos.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/components/waiter/ProductCatalog.tsx` | New | Componente de visualización del catálogo y filtros |
| `src/hooks/useCatalog.ts` | New | Hook para manejar la lectura y el filtrado de productos |
| `src/services/catalogService.ts` | Modified/New | Métodos para consultar el backend por productos activos y categorías |
| `src/test/components/waiter/` | New | Pruebas unitarias para el catálogo y el hook |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Demora en carga de catálogo si este es muy grande | Low | Implementar paginación o lazy loading si el backend lo soporta; mantener estado en memoria local. |
| Fallos en la comunicación con el servicio de catálogo | Med | Mostrar un mensaje amigable de error y opción de recargar. Manejo de excepciones adecuado. |

## Rollback Plan

- Revertir el commit que introduce los componentes de catálogo en desarrollo (`git revert`).
- Eliminar la ruta `/catalog` (o la vista del catálogo) del archivo de rutas (App.tsx o similar).

## Dependencies

- API del Backend que provea los endpoints de catálogo (`GET /api/products`).
- Data mock de productos y categorías para los tests iniciales.

## Success Criteria

- [ ] Un usuario puede ver únicamente productos activos al entrar a la vista del catálogo.
- [ ] Un usuario puede seleccionar una categoría (ej. "Bebidas") y la lista se actualiza mostrando solo productos de esa categoría.
- [ ] Se muestra un mensaje visualmente claro cuando no hay productos disponibles en la selección.
- [ ] La cobertura de pruebas (Coverage) del nuevo código es > 80%.
