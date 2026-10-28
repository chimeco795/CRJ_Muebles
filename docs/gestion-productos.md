# Gestión de productos por folio

`data/productos.json` es la única fuente. No hay backend, panel de acceso ni servicios pagados. El sitio genera categorías disponibles, filtros, destacados, fichas y galerías desde JSON. No editar HTML para dar de alta una pieza.

## Crear

1. Ejecutar `node scripts/next-product-id.js` (actualmente sugiere 16). Conservar IDs existentes y no reutilizar folios retirados; preferir desactivar para mantener el registro.
2. Crear `public/img/products/{categoria}/{slug-producto}/`: categoría `tablas`, `muebles` o `montessori`; slug sin acentos, en minúsculas y con guiones.
3. Preparar copias WebP de hasta 1600 px, conservando originales aparte. Utilidad opcional con Python + Pillow: `python scripts/prepare-product-images.py --categoria tablas --slug nombre-producto foto1.jpg foto2.jpg`. Primera foto → `portada.webp`; siguientes → `vista-01.webp`, etc. No sobrescribe destinos.
4. Añadir el registro con `id` entero positivo, `nombre`, `linea`, `descripcion`, `precio` (número MXN o `null`) e `imagen` (ruta de portada o `null`). Opcionales: `galeria` (rutas), `detalles` (textos confirmados), `destacado` (false/0 desactivado; true/entero positivo como prioridad), `activo` (por defecto true). No añadir stock si no está confirmado; si se conserva, entero ≥0.
5. Ejecutar `node scripts/validate-catalog.js` y `node --test tests/*.test.cjs`. Revisar `producto.html?id=FOLIO`, catálogo, portada y WhatsApp en el servidor local. El mensaje incluye folio, nombre, precio si existe y URL.

## Actualizar por folio

Buscar el `id` en JSON y editar únicamente los campos solicitados. Precio desconocido → `null`; foto sin confirmar → `imagen: null`. Para portada cambiar `imagen`; para agregar/quitar vistas editar `galeria`. Destacar: `destacado: 1` (prioridades menores aparecen primero; máximo tres en inicio); quitar destacado: `false` o `0`. No inventar atributos comerciales.

Al cambiar categoría, conservar el folio; copiar las fotos web a la carpeta de la nueva categoría y actualizar sus rutas. No borrar originales. Las carpetas anteriores se conservaron como archivo; el catálogo utiliza las rutas normalizadas. Para sustituir una foto se recomienda un nombre nuevo y cambiar la ruta en JSON.

## Desactivar o eliminar

Preferir `activo: false`: desaparece de catálogo/filtros/destacados y su URL muestra «Producto no encontrado», sin redirigir a otra pieza. Para reactivar: `true`. Eliminar el registro o archivos físicamente solo por instrucción explícita; nunca borrar fotos compartidas con otras referencias.

## Publicar y PWA

Incrementar `CACHE_NAME` en `service-worker.js` en cada entrega (actual: `crj-muebles-v8`). Las imágenes activas se precargan automáticamente desde JSON; no mantener listas de productos en JS ni HTML. Recursos públicos usan red primero y respaldo offline, por lo que al recargar con conexión se comprueban versiones recientes. Una pestaña que permanezca abierta conserva su catálogo hasta recargar; offline usa la última copia disponible.

Commit/push **solo cuando se solicite**. GitHub Pages publicará según la configuración del repositorio. Abrir por HTTP/HTTPS, no `file://`; usar **Actualizar** si la PWA ofrece una nueva versión. Validar también el sitio publicado tras el despliegue.
