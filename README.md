# FoodTech Frontend

## Descripción

Aplicación web de tipo SPA (Single Page Application) que sirve como interfaz gráfica del sistema de gestión de restaurantes **FoodTech**. Permite a los distintos roles del restaurante (mesero, administrador, cocinero) interactuar con el sistema de pedidos, catálogo de productos y monitoreo de cocina en tiempo real.

## Funcionalidades principales

| Funcionalidad | Rol | Descripción |
|---|---|---|
| **Gestión de mesas** | Mesero | Visualización de mesas con estado disponible/ocupada, selección de mesa para tomar pedido |
| **Toma de pedidos** | Mesero | Agregar productos al pedido, ajustar cantidades, enviar orden a cocina |
| **Menú de productos** | Mesero | Catálogo visual con filtrado por categoría (Bebidas, Platos Fuertes, Ensaladas) y búsqueda por nombre |
| **Estado de cocina** | Mesero | Monitoreo en tiempo real del progreso de las tareas por estación (Bar, Cocina Caliente, Cocina Fría) |
| **Catálogo de productos (Admin)** | Administrador | Crear, editar, desactivar y listar productos del menú, con búsqueda por nombre |
| **Carga masiva CSV** | Administrador | Importar productos en lote desde archivo CSV con validación y reporte de errores |
| **Facturación** | Cajero | Generación de facturas para pedidos completados |
| **Registro y autenticación** | Todos | Registro de nuevos usuarios e inicio de sesión |

## Historias de usuario cubiertas

- **HU-FRONT-001** — Visualizar disponibilidad de mesas en tiempo real
- **HU-FRONT-002** — Tomar pedido y enviarlo a cocina
- **HU-FRONT-003** — Consultar estado de preparación en cocina
- **HU-01 a HU-05** — Gestión de catálogo de productos y carga masiva (Admin)

## Stack tecnológico

| Tecnología | Propósito |
|---|---|
| React 19 | Librería de interfaz de usuario |
| TypeScript | Tipado estático |
| Vite | Herramienta de bundling y desarrollo |
| TailwindCSS | Sistema de estilos utility-first |
| Vitest | Framework de testing unitario y de componentes |
| Cypress | Testing end-to-end |
| React Router | Navegación entre vistas |

## Requisitos previos

- Node.js 18 o superior
- Backend FoodTech-Kitchen-Services corriendo en `http://localhost:8080`

## Comandos disponibles

```bash
npm install                # Instalar dependencias
npm run dev                # Iniciar servidor de desarrollo (http://localhost:5173)
npm run build              # Compilar para producción
npm run preview            # Previsualizar build de producción
npm run lint               # Ejecutar linter
npm test -- --run          # Ejecutar tests una vez
npm run test:coverage      # Tests con reporte de cobertura
npm run test:ci            # Tests en formato CI (JUnit XML)
npm run test:ui            # Tests con interfaz visual
npm run cypress:open       # Abrir Cypress (modo interactivo)
npm run cypress:run        # Ejecutar Cypress (modo headless)
docker build -t foodtech . # Construir imagen Docker
```

## Conexión con el backend

La URL del backend se configura mediante la variable de entorno `VITE_API_BASE_URL` en el archivo `.env`. Por defecto apunta a `http://localhost:8080`.

---

Proyecto académico — Sofka Technologies — 2026
