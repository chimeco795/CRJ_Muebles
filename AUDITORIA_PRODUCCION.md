# Auditoría de producción de CRJ Muebles

11 de noviembre de 2026 · Base revisada: `39b0f9b`, rama `main`. Las correcciones de esta auditoría se probaron localmente. Las comprobaciones remotas corresponden al sitio que ya estaba publicado.

## Arquitectura

GitHub Pages sirve HTML, CSS y JavaScript sin framework ni bundler. El modelo compartido `catalog-model.js` valida y normaliza `data/productos.json`. El catálogo, los filtros, la búsqueda, las galerías y las cotizaciones se construyen en `app.js`. El usuario completa la consulta en WhatsApp. `install.js`, el manifest y el service worker proporcionan instalación y acceso offline. Hay 17 productos activos y cuatro categorías. Se conservó el contenido del catálogo y de sus imágenes.

## Diagnóstico inicial

El estado indica lo observado antes de modificar el repositorio. La columna de acción describe la respuesta aplicada o pendiente.

| ID | Elemento | Estado | Hallazgo y ubicación | Prioridad | Acción |
|---|---|---|---|---|---|
| 1 | Privacidad | Pendiente | Los pies de página no enlazaban un aviso. El catálogo se aloja en GitHub y deriva las consultas a WhatsApp. | Alta | Añadir página informativa con las prácticas observables. Revisión del titular pendiente. |
| 2 | Términos | Pendiente | Faltaba una página de condiciones de uso. | Media | Explicar consulta de precios y cotizaciones. Validar condiciones reales con el taller. |
| 3 | API y secretos | Implementado | Aplicación estática. Revisión de archivos versionados y búsqueda de patrones de claves privadas, GitHub, AWS y Google sin coincidencias. El HTML de verificación de Google es público por diseño. | Alta | Mantener fuera del despliegue archivos de trabajo. Revisión limitada al árbol actual, sin análisis del historial ni de los secretos de la cuenta. |
| 4 | HTTPS | Implementado | La URL HTTP pública devolvió 301 a HTTPS. Los enlaces de WhatsApp usan HTTPS. | Alta | Mantener la configuración de Pages. |
| 5 | Consentimiento | No aplica | En la versión inicial el sitio no cargaba analítica ni etiquetas publicitarias. La caché de la PWA guarda recursos locales. | Alta al activar GA4 | Preparar aceptación, rechazo y retirada. El aviso solo aparece al configurar un ID válido. |
| 6 | Metadescripciones | Parcial | Inicio y catálogo tenían metadatos. La ficha dependía de JavaScript para sustituir el título y la descripción genéricos de producto.html. | Alta | Generar HTML por producto con título, descripción y canonical. |
| 7 | Vista previa al compartir | Parcial | Open Graph genérico en las fichas iniciales. Faltaban imagen específica y Twitter Cards. | Alta | Enlazar HTML por folio desde tarjetas y WhatsApp. Generar OG y Twitter Cards antes de ejecutar JavaScript. |
| 8 | Favicon | Implementado | Enlaces icon y apple-touch-icon en las páginas principales. PNG del manifest comprobados a 192 y 512 px. | Baja | Reutilizar los iconos existentes. Verificar instalación física en los dispositivos objetivo. |
| 9 | Sitemap y robots | Parcial | Existía sitemap con 23 URL y robots en la subruta del proyecto. Google busca robots.txt en la raíz del host. | Alta | Regenerar sitemap con rutas canónicas y dos páginas informativas. Excluir archivos internos del build de Pages. |
| 10 | Texto alternativo | Implementado | Portadas con nombre de la pieza, fotografías editoriales con alt, miniaturas decorativas dentro de botones con nombre accesible. | Media | Mantener esas convenciones en el HTML generado y comprobar atributos en las 17 fichas. |
| 11 | Compresión de imágenes | Implementado | Los 24 archivos activos de producto son WebP y suman 2.984.830 bytes. Varias imágenes ya provienen de recortes pequeños. | Media | Conservar los archivos. Evaluar variantes más pequeñas para tarjetas si el catálogo crece. |
| 12 | Velocidad | Parcial | Carga diferida y caché existentes. Al cargar el detalle, el bloque de espera cedía su lugar a una ficha de altura muy distinta. | Alta | Entregar la ficha en el HTML inicial y conservarla durante la carga del catálogo. Medir con Lighthouse móvil. |
| 13 | Contraste | Implementado | Variables de color y foco visible en styles.css. Texto principal/fondo 13,54:1, secundario/superficie 4,79:1, acento/fondo 6,48:1 y blanco/botón de WhatsApp 8,29:1. | Media | Mantener paleta. Estos pares y la prueba automática cubren parte de WCAG AA, no una certificación completa. |
| 14 | Móvil y PWA | Implementado | Menú plegable, búsqueda, controles táctiles, manifest con scope e id relativos, modo standalone y actualización explícita. | Alta | Probar a 360 px y extender la recuperación offline a los nuevos enlaces. |
| 15 | 404 | Pendiente | Había estado de producto inexistente, pero faltaba 404.html para rutas de Pages. | Media | Añadir página con noindex y vuelta al catálogo desde rutas anidadas. |
| 16 | Enlaces | Parcial | El validador recorría tres páginas. | Alta | Ampliar al HTML del directorio raíz. Comprobar URL del sitemap, imágenes sociales, iconos y destino externo de WhatsApp. |
| 17 | Formularios | No aplica | Búsqueda local y campo de instalación de solo lectura. No hay checkout ni envío de datos a un endpoint. | Baja | Comprobar búsqueda y limpieza. Las búsquedas filtradas por texto reciben noindex al renderizarse. |
| 18 | Antispam | No aplica | No hay formularios públicos de envío ni backend de correo. El enlace de WhatsApp requiere acción del visitante. | Baja | Conservar contacto directo. Reevaluar si se abre un endpoint de recepción. |
| 19 | GA4 | Pendiente | Sin ID de medición ni integración. | Media | Preparar carga opcional tras consentimiento y probar con un identificador de ensayo local, interceptando la petición. |
| 20 | CTA | Implementado | Tarjetas con “Ver pieza”, consulta por WhatsApp en el detalle y acceso a proyecto a medida en inicio/catálogo. | Media | Mantener CTA y diseño. Incluir cotización en el HTML inicial de cada ficha. |

## Cambios y archivos

- `scripts/generate-sitemap.js` genera las páginas `pieza-1.html` a `pieza-17.html` a partir del catálogo y la plantilla `producto.html`. Cada ficha incluye una vista inicial de la pieza, descripción, precio disponible, enlace de cotización y etiquetas sociales con URL absolutas. Los productos sin foto usan el icono de marca como imagen social. Al regenerar se retiran fichas obsoletas identificadas como generadas.
- `app.js` enlaza la ficha estática desde el catálogo y conserva el acceso por `producto.html?id=FOLIO`. Tras identificar una pieza por el enlace anterior, actualiza la dirección del navegador. El filtro de búsqueda añade o retira noindex según el texto.
- `index.html`, `tienda.html` y `producto.html` enlazan las páginas legales y la integración opcional. Inicio y tienda también reciben imagen social y Twitter Cards.
- `privacidad.html`, `terminos.html` y `404.html` usan los estilos del sitio. El texto se limita a cómo funciona la consulta del catálogo.
- `analytics.js` deja vacío el identificador y carga Google solo tras aceptar. La elección se guarda en este navegador. Se deshabilitan señales personalizadas de anuncios; la configuración envía una dirección de página sin parámetros de búsqueda.
- `service-worker.js` pasa a v18, conserva el ciclo de actualización manual y atiende las nuevas rutas con respaldo offline. Las páginas informativas y el script local de analítica pasan a la caché de la aplicación.
- `sitemap.xml` contiene 25 direcciones canónicas. `_config.yml` excluye del build de GitHub Pages scripts internos, pruebas, fotos de entrada e instrucciones de mantenimiento. La exclusión del sitio no cambia la visibilidad de los archivos en GitHub.
- `scripts/validate-catalog.js` amplía la revisión de referencias locales. `tests/social.test.cjs` comprueba las fichas iniciales y el sitemap. `docs/gestion-productos.md` incorpora la regeneración de fichas al mantenimiento del catálogo.

## Validaciones realizadas

- Generación estática con `node scripts/generate-sitemap.js`. No se requiere instalación de paquetes para servir, generar o validar el sitio. La compilación remota de Jekyll para estos cambios se verifica después del despliegue.
- `node scripts/validate-catalog.js`: catálogo válido, 17 folios. `node --test tests/*.test.cjs`: 20 pruebas aprobadas. `node --check` ejecutado sobre app.js y analytics.js. `git diff --check` sin errores.
- Lectura de las 17 fichas como HTML sin JavaScript y comparación de títulos, descripciones e imágenes sociales con el JSON. Verificación de existencia de las 25 rutas del sitemap y decodificación de los 24 recursos de producto con Pillow. El catálogo, manifest, imágenes y archivo de verificación de Google conservan su contenido versionado.
- Chrome local a 360 × 800: menú, filtro Mascotas, búsqueda, limpieza, enlace antiguo del folio 17, galería, acceso a WhatsApp y apertura de la ficha 13 sin conexión con el service worker activo. Sin desbordamiento horizontal en la ficha comprobada.
- Prueba de consentimiento en contexto de navegador aislado: rechazar dejó a cero las solicitudes de la etiqueta; aceptar produjo una solicitud interceptada localmente; retirar guardó la negativa y la recarga no produjo otra solicitud. No se envió telemetría de ensayo a Google.
- Sitio público anterior: HTTP → HTTPS 301, archivo de Search Console 200 y enlace wa.me → WhatsApp 302/200. El nuevo 404 personalizado y las exclusiones de Jekyll deben comprobarse en Pages una vez publicado.

### Lighthouse móvil

Una ejecución por página sobre un servidor HTTP local, Chrome y Lighthouse 12.8.2 con configuración móvil. No se incorporó Lighthouse como dependencia del proyecto. Los tiempos de laboratorio orientan sobre la carga y varían con la máquina, el servidor y el dispositivo.

| Página | Rendimiento | Accesibilidad | Buenas prácticas | SEO | LCP | CLS | TBT |
|---|---:|---:|---:|---:|---:|---:|---:|
| Inicio | 97 | 100 | 100 | 100 | 2,6 s | 0 | 0 ms |
| Catálogo | 95 | 100 | 100 | 100 | 2,8 s | 0,054 | 0 ms |
| Ficha 17 | 97 | 100 | 100 | 100 | 2,6 s | 0 | 0 ms |

Antes de servir el contenido inicial del producto, la misma ficha obtuvo rendimiento 80 y CLS 0,317. El objetivo de LCP de 2,5 s aún merece seguimiento. INP requiere interacciones reales; TBT es una medición de laboratorio distinta. No se midieron datos de campo al percentil 75. [Core Web Vitals](https://web.dev/articles/vitals)

## Pendientes del titular y puesta en producción

1. Revisar el aviso y los términos con el responsable del negocio. Completar identidad y domicilio del responsable, medios para ejercer derechos, finalidades y tratamiento real de consultas de WhatsApp, transferencias y procedimiento de cambios según corresponda. Validar condiciones de contratación antes de incorporar políticas sobre pagos, garantías, envíos o devoluciones. El texto técnico inicial no acredita por sí solo cumplimiento legal. [Ley mexicana de protección de datos](https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPDPPP.pdf)
2. Antes de publicar, regenerar con `node scripts/generate-sitemap.js`, validar el catálogo y ejecutar las pruebas. Incluir las fichas generadas y el sitemap en la entrega. La entrada de fotos contiene material local ajeno a esta auditoría.
3. Tras publicar, abrir una ruta inexistente anidada y comprobar HTTP 404, estilo y enlace al catálogo. Comprobar que las rutas excluidas ya no se sirven, el archivo de verificación sigue disponible y el service worker ofrece actualizar. Probar también instalación y reapertura en un Android y un iPhone físicos.
4. En la propiedad verificada de Search Console, revisar `sitemap.xml` en Sitemaps. Inspeccionar una URL como `https://chimeco795.github.io/CRJ_Muebles/pieza-17.html` y solicitar indexación si procede. Confirmar que la URL canónica y el HTML renderizado muestran esa pieza. El robots.txt del proyecto está bajo /CRJ_Muebles/; para directivas de rastreo de todo el host se requiere acceso a la raíz de chimeco795.github.io. [Documentación de Google](https://developers.google.com/search/docs/crawling-indexing/robots/create-robots-txt)
5. Compartir la URL nueva de prueba en WhatsApp y revisar el Depurador de contenido compartido de Facebook una vez publicada. Los metadatos se verificaron localmente; cachés de plataformas pueden conservar una previsualización anterior. Los enlaces antiguos siguen abriendo el producto en navegadores, pero las solicitudes sin JavaScript a producto.html?id=… reciben la plantilla genérica de Pages.
6. Para activar GA4, aprobar el aviso y crear o seleccionar la propiedad y el flujo web del taller. Copiar el ID real G-… en `GA4_ID` dentro de analytics.js. Revisar las opciones de medición mejorada, publicidad y retención en la propiedad. Publicar con nueva versión de caché y comprobar en un perfil limpio que antes de aceptar no se contacta con Google. Aceptar, comprobar Tiempo real/DebugView con una visita de ensayo y probar la retirada desde “Preferencias de analítica”. El informe no da por configurada ninguna propiedad externa. [Consentimiento en Google Tag Platform](https://developers.google.com/tag-platform/security/concepts/consent-mode)
7. Medir Core Web Vitals de campo tras acumular tráfico. Si crece el peso de la PWA, evaluar miniaturas responsivas y el coste de precargar galerías, conservando el comportamiento offline. Completar una revisión con lector de pantalla y de recorridos en dispositivos reales.
