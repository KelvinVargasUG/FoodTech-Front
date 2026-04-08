# Waiter Catalog Specification

## Purpose

Permitir a los meseros visualizar y filtrar los productos disponibles en el restaurante para agilizar la toma de pedidos.

## Requirements

### Requirement: Visualización de productos activos

El sistema MUST mostrar por defecto únicamente los productos que se encuentren en estado "Activo" cuando el mesero ingresa a la vista del catálogo.

#### Scenario: Acceso inicial al catálogo

- GIVEN que existen productos activos e inactivos en el sistema
- WHEN el mesero accede a la vista del catálogo de productos
- THEN el sistema muestra una lista con todos los productos activos
- AND el sistema NO muestra ningún producto inactivo

### Requirement: Filtrado por categoría

El sistema MUST permitir al mesero seleccionar una categoría específica para filtrar la lista de productos mostrados.

#### Scenario: Selección de una categoría con productos

- GIVEN que el mesero está visualizando el catálogo completo de productos activos
- WHEN el mesero selecciona la categoría "Bebidas"
- THEN la lista de productos se actualiza para mostrar únicamente los productos activos que pertenecen a la categoría "Bebidas"

### Requirement: Información de catálogo vacío o sin resultados

El sistema MUST proveer retroalimentación visual clara cuando no existen productos que coincidan con la vista actual o el filtro seleccionado.

#### Scenario: Selección de categoría sin productos activos

- GIVEN que el mesero está en la vista del catálogo
- WHEN el mesero selecciona una categoría que no tiene productos activos (ej. "Postres" sin stock)
- THEN el sistema muestra el mensaje "No hay productos disponibles en esta categoría"
- AND la lista de productos se muestra vacía

#### Scenario: Catálogo general completamente vacío

- GIVEN que el sistema no tiene ningún producto registrado en estado "Activo"
- WHEN el mesero accede a la vista del catálogo de productos
- THEN el sistema muestra un mensaje indicando que no hay productos disponibles
