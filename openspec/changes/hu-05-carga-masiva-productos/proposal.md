# Proposal: HU-05 - Carga masiva de productos mediante archivo CSV con validación y reporte de errores

## Intent

Implementar la capacidad para que el administrador pueda cargar un archivo CSV con la información de múltiples productos para poblar o actualizar el catálogo de forma masiva, recibiendo un reporte claro de los resultados (productos creados/actualizados) y errores detectados, con el fin de garantizar la integridad de los datos sin bloquear la interfaz de usuario.

## Scope

### In Scope
- Descarga de plantilla CSV de ejemplo con estructura correcta.
- Carga de archivo CSV (tamaño máximo 10MB) con validación de estructura de cabeceras (nombre, precio, categoria, estacion, descripcion, estado).
- Rechazo inmediato de archivos con estructura inválida.
- Procesamiento asíncrono (en segundo plano) con indicador visual "En progreso" en la interfaz.
- Lógica de actualización para productos existentes (búsqueda por nombre).
- Lógica de creación para productos nuevos.
- Generación y descarga de reporte en formato CSV conteniendo los errores específicos por fila y el motivo (`motivo_del_error`).
- Resumen final del proceso (creados, actualizados, errores encontrados) al volver a la pantalla de carga masiva.

### Out of Scope
- Soporte para formatos de archivo distintos a CSV (ej. Excel, XML).
- Validaciones de negocio complejas adicionales a las especificadas (ej. validación cruzada entre sistemas externos).
- Carga de imágenes o recursos vinculados a los productos desde el CSV.

## Approach

1. **Frontend (React)**: 
   - Crear una nueva sección para la carga masiva dentro del módulo de administración.
   - Implementar un componente para subir el archivo CSV, con validaciones en el cliente (tamaño < 10MB) y posiblemente validación de cabeceras.
   - Proveer un botón/enlace para la descarga de la plantilla CSV predefinida.
   - Mostrar indicadores de carga (spinner o barra de progreso) mientras se procesa la petición asíncrona.
   - Mostrar el resumen final con la opción de descargar el reporte de errores si aplica.

2. **Backend / Comunicación**: 
   - *Nota: Si esto abarca backend, incluir lógica de Job/Cola para procesamiento asíncrono*.
   - Desde la UI, la petición de subida (Multipart/form-data) se enviará al endpoint correspondiente.
   - La API debe responder con un estado de *Aceptado* o *Bad Request* (si las cabeceras fallan).
   - El cliente sondeará periódicamente o recibirá notificaciones (ej. WebSockets, Server-Sent Events) sobre el estado del procesamiento asíncrono, hasta obtener el resumen final y el enlace al CSV de errores.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/views/admin/BulkUploadView.tsx` | New | Vista principal para la carga masiva |
| `src/components/admin/CSVUploader.tsx` | New | Componente de subida de archivo y validación |
| `src/services/productService.ts` | Modified | Nuevos métodos para enviar CSV, consultar estado y descargar reportes |
| `src/models/` | Modified | Nuevas interfaces para el estado de la carga y respuesta de errores |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Bloqueo del servidor por archivos grandes o peticiones maliciosas | Medium | Limitar tamaño del archivo (10MB) y encolar el procesamiento de forma asíncrona en BD/Jobs. |
| Inconsistencia de codificación/caracteres especiales en CSV | Medium | Validar y forzar lectura del archivo en UTF-8 y estandarizar el delimitador de comas (,). |
| Errores no controlados por datos faltantes / nulos durante el split | Medium | Aplicar validación estricta de formato por tipo de dato, devolviendo errores detallados. |

## Rollback Plan

- En caso de errores impredecibles o crash crítico de la vista, se deberá deshabilitar el botón de acceso en el Dashboard de administración.
- Los cambios de Frontend podrán revertirse mediante `git revert` de los PRs asociados a los componentes visuales de carga masiva.

## Dependencies
- El Backend debe implementar, o soportar, los endpoints específicos para subida masiva, cola de procesamiento (async) y generación del CSV de errores.
- Librerías recomendadas para frontend (ej. `papaparse` si la validación principal de cabeceras se requiere del lado cliente).