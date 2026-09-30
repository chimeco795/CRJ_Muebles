# Modernización de CRJ Muebles

> Informe histórico de la primera entrega. La organización de archivos, catálogo y PWA actuales se describen en [imagenes-y-pwa.md](imagenes-y-pwa.md), actualización del 30/09/2026.

Fecha de revisión: 29 de septiembre de 2026. Base: `ff7a8b9`, rama `main`. Cambios locales; sin commit, push ni publicación.

## Archivos de la entrega

Modificados: `index.html`, `tienda.html`, `producto.html`, `app.js`, `styles.css`, `data/productos.json`, `manifest.json`, `service-worker.js`.

Nuevos: `README.md`, `docs/modernizacion.md`, `img/placeholder.svg`, `tests/service-worker.test.cjs`.

Se conservaron los archivos fotográficos originales, iconos, logotipo y PDF vacío. No se modificó `runserver.py`.

## Decisiones UX/UI tomadas

- Identidad tipográfica sobria para CRJ, marfil, carbón, cognac y una superficie verde grisácea. El verde de acción se reserva al contacto por WhatsApp en la ficha.
- Tipografías del sistema: Segoe UI/Arial para lectura y Georgia para títulos editoriales; ninguna descarga de fuentes.
- Una fotografía editorial existente presenta la línea de cocina. No se vincula esa fotografía a un modelo específico. Se evita convertir el inicio en un catálogo completo.
- Orden de las líneas: tablas, muebles, Montessori. Solo dos piezas destacadas, ambas con foto identificable.
- “Muebles” conduce a proyectos personalizados, porque todavía no hay productos de esa línea. En catálogo no se crea un filtro vacío; aparecerá cuando se incorporen piezas con `linea: muebles`.
- Navegación de escritorio simple; menú desplegable móvil con botones de al menos 44 px, estado expandido y cierre con Escape. Se retira la barra fija inferior para dejar espacio al producto.
- Tarjetas como enlaces reales, foco visible y fotos sin deformación. Los estados sin foto son explícitos y no utilizan imágenes de productos diferentes.
- Ficha con dos columnas en escritorio y una en móvil. El enlace de WhatsApp incorpora nombre, precio publicado y URL de la pieza, sin enviar automáticamente ningún mensaje.
- Proyecto a medida como conversación aparte. Se eliminan enlaces públicos al PDF vacío, correo provisional y redes genéricas.
- Sin Bootstrap, Font Awesome, bundler ni dependencias de frontend: la interfaz utiliza CSS propio, texto y recursos locales.

## Cambios técnicos

Una sola función de carga con promesa compartida por página y reintento tras error. Validación básica del JSON, normalización de categorías y texto acentuado, filtro combinado, URL con categoría/búsqueda, precios con `Intl.NumberFormat`, creación de contenido con nodos y `textContent`.

Un ID ausente o inválido muestra “Producto no encontrado”; nunca otra pieza. Se diseñaron estados de carga, error recuperable, sin resultados y catálogo vacío. Los precios, nombres, IDs y descripciones existentes se conservaron exactamente.

Semántica, enlace para saltar al contenido, label visible del buscador, `aria-pressed` en filtros, `aria-current` en navegación, estado de resultados anunciado, movimiento reducido y metadatos por página. No se añadieron afirmaciones comerciales, reseñas ni disponibilidad.

## Estrategia PWA final

Una sola caché versionada, actualmente `crj-muebles-v3`. App shell y fotos utilizadas precargados. HTML y catálogo usan red primero con respaldo guardado; recursos estructurales e imágenes usan caché primero. Respaldo SVG para imágenes no guardadas cuando no hay red. Rutas relativas, alcance `./`, inicio `./index.html`, nombre “CRJ Muebles”, iconos reales de 192 y 512 px.

Las actualizaciones esperan aprobación mediante el botón discreto “Actualizar”. La recarga ocurre solo tras esa acción. Se eliminaron `cachebust`, versiones en query y recargas forzadas por historial. La limpieza de caché respeta otras aplicaciones del mismo origen.

## Pruebas realizadas

- Servidor real mediante `runserver.py`, con el Python disponible en el entorno.
- Revisión visual del inicio y catálogo a 375, 768, 1024 y 1440 px; ficha y estado inexistente en móvil, ficha de dos columnas en escritorio. Las mediciones de las vistas revisadas no mostraron desbordamiento horizontal.
- Menú móvil, acceso a tablas, navegación a proyecto personalizado y estado activo.
- Catálogo: 9 piezas, 3 tablas y 6 Montessori; categorías vacías omitidas.
- Búsqueda de “edge”, búsqueda combinada de “cama” dentro de tablas (sin resultados), limpieza y búsqueda de “observacion” que encuentra la torre de aprendizaje sin exigir acento.
- Ficha válida, ID inexistente, regreso al catálogo, título dinámico y contenido del enlace de WhatsApp. No se abrió ni envió una conversación.
- Servidor de pruebas aislado: HTTP 503, reintento, JSON malformado, catálogo vacío y respuesta demorada con indicador de carga; posterior carga correcta de 9 productos.
- Service Worker real activado y controlando la página; caché inspeccionada; actualización v1→v2 y v2→v3 mediante el aviso.
- Servidor apagado: apertura de inicio, navegación a catálogo, acceso al detalle, recarga del detalle e imagen cargada desde almacenamiento. Servidor restaurado después.
- Sin errores ni advertencias en consola durante las consultas de las páginas normales del rediseño. Los fallos provocados en el servidor de pruebas y durante la desconexión se evalúan aparte.
- Rutas locales comprobadas: no apuntan a fotos inexistentes ni al PDF vacío. Iconos examinados: 192×192 y 512×512 reales.
- Comparación contra Git de IDs, nombres, precios y descripciones: sin cambios.
- `node --check` para ambos JS y seis pruebas automatizadas del Service Worker: precarga, actualización explícita, limpieza selectiva, navegación offline con query/subdirectorio, JSON actualizado con respaldo, recursos offline y solicitudes excluidas. Todas pasan.

Las pruebas automatizadas simulan el entorno del worker; se complementaron con las pruebas reales de navegador indicadas. No se realizó una auditoría Lighthouse ni una certificación completa WCAG. No se instaló la aplicación en el sistema operativo ni se probó en un teléfono físico/Safari; la revisión responsive usa el navegador integrado.

## Pendientes que requieren información de CRJ Muebles

### Productos y fotografías

- Faltan fotos identificables de los productos 2 a 6: estante, torre, mesa y silla, ropero y librero. Se dejó `imagen: null`.
- Falta identificar una foto exacta para End Grain (8) y Large Grain (9). Se dejó `imagen: null`; no se dedujo el modelo por apariencia.
- La foto Edge Grain (7) está dentro de `edge-grain/tbg-edge-001/` y muestra dos tablas. Confirmar cuál corresponde al precio publicado y aportar una foto individual si la oferta es una sola pieza.
- La foto de la cama conserva su asociación previa. Confirmar que la apariencia representada corresponde a la variante ofrecida; no se dedujeron colores ni materiales de la imagen.

Imágenes sin asociación a una ficha específica, dentro de `public/img/products/tablas-picar/`:

| Archivo | Uso / pendiente |
| --- | --- |
| `4a0c7a60-68b5-48e2-a9ed-543a6b0e94c0.webp` | Foto editorial del inicio; tabla con mango. Sin asignación a SKU. |
| `910bc6a2-f126-4760-9f60-04fbc018e2aa.webp` | Varias tablas; confirmar modelo/variante. |
| `0b4aa360-b42b-444f-a85e-7a8c89618e04.webp` | Escena de cocina; confirmar modelo y uso. |
| `74e8c398-d680-4545-a026-34be7e243c46.webp` | Escena de cocina; confirmar modelo y uso. |
| `e855bbf9-917b-4a55-a922-e9a2fdfecc5d.webp` | Escena de cocina; confirmar modelo y uso. |
| `ec9c5079-9ecc-4198-995f-6ca2d54a1e35.webp` | Escena de cocina; confirmar modelo y uso. |

### Información comercial y publicación

- Confirmar vigencia de precios y descripciones heredados; no se alteraron ni verificaron externamente.
- Proporcionar materiales, medidas, variantes y condiciones comerciales cuando deban publicarse. Se omitieron garantías, stock, envíos, pagos y plazos no documentados.
- Confirmar número de WhatsApp existente, correo y URLs reales de redes.
- Entregar el PDF definitivo: el archivo actual sigue vacío y sin enlace público.
- Aportar piezas y fotografías para un catálogo de muebles generales cuando corresponda.
- Definir dominio/URL pública con HTTPS para canonical y Open Graph absolutos. No se presume que la URL del repositorio sea la del sitio.
- Los iconos PWA heredados son técnicamente válidos pero conservan la identidad naranja anterior. Un rediseño de esos iconos puede acompañar una actualización de marca posterior.

No quedaron fallos funcionales conocidos en las pruebas ejecutadas. La principal limitación visible es la falta de fotografías confirmadas en siete fichas; no se oculta ni se sustituye por imágenes arbitrarias.
