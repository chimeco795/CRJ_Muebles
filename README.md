# CRJ Muebles

Catálogo estático de piezas de madera, con consultas por WhatsApp. HTML, CSS y JavaScript puro; sin compilación, dependencias de frontend ni servicios externos para renderizar la interfaz.

Actualización del 30/09/2026: 15 piezas, galerías de fotografías, logo CRJ y botón visible **Instalar app**. Ver `docs/imagenes-y-pwa.md` para la organización de imágenes y la validación más reciente.

## Ejecutar

Desde esta carpeta, con Python 3 instalado:

```sh
python runserver.py
```

Abrir `http://127.0.0.1:8000`. No abrir los HTML mediante `file://`: el catálogo utiliza `fetch` y la PWA necesita un origen HTTP local o HTTPS.

## Archivos

- `index.html`: inicio, líneas del taller y proyectos personalizados.
- `tienda.html`: catálogo, búsqueda y filtros con URL compartible.
- `producto.html`: detalle por `?id=…` y consulta contextual.
- `app.js`: carga única de datos, normalización, componentes DOM, estados y registro PWA.
- `install.js`: instalador nativo cuando está disponible, instrucciones alternativas y estado de instalación.
- `styles.css`: sistema visual y reglas responsive.
- `data/productos.json`: única fuente de datos comerciales.
- `manifest.json` y `service-worker.js`: instalación y funcionamiento sin conexión.
- `img/placeholder.svg`: recurso visual de respaldo para imágenes no disponibles offline.
- `tests/service-worker.test.cjs`: pruebas sin dependencias, con el runner de Node.
- `docs/modernizacion.md`: decisiones, validación y pendientes de información.

## Mantener el catálogo

Conservar los IDs existentes para no romper enlaces. Categorías: `tablas`, `muebles`, `montessori`. Se aceptan los alias heredados `grill` y `medida`. Solo aparecen filtros de categorías con productos.

Los campos son `id`, `nombre`, `precio`, `descripcion`, `imagen` y `linea`. Usar un número para el precio en MXN o `null` si no está confirmado. No añadir texto a un campo numérico. Una imagen sin confirmar debe quedar en `null`; la interfaz mostrará un marcador sin solicitar una URL inexistente.

Campos opcionales: `galeria` (lista de rutas de imágenes), `detalles` (lista de textos confirmados) y `destacado` (prioridad numérica para elegir hasta tres piezas del inicio). Las copias de uso web están en las carpetas `web`; los originales se conservan aparte. No enlazar anuncios de `promociones/archivo` como ofertas activas sin confirmar su vigencia.

El precio y las descripciones actuales proceden del repositorio anterior. No se ha confirmado su vigencia comercial. Las fotos de las fichas deben corresponder al producto exacto, no solo a su categoría.

`CONTACT.whatsapp` en `app.js` controla los mensajes de producto y proyecto. Si cambia el número, actualizar también los enlaces estáticos de contacto y el pie en los tres HTML. Correo y redes sociales se añadirán solo cuando existan enlaces reales.

## PWA y publicación

Publicar la carpeta en un hosting estático con HTTPS, manteniendo rutas relativas. Funciona también dentro de un subdirectorio. No se ha configurado ni publicado un dominio.

- La instalación precarga los tres HTML, CSS, JS, manifest, iconos, JSON y las tres imágenes utilizadas.
- HTML y JSON: red primero, con un límite de cuatro segundos y respaldo en la última respuesta correcta guardada.
- CSS, JS, manifest e imágenes: caché primero.
- Solo se interceptan solicitudes GET del mismo origen dentro del alcance del proyecto.
- Al activar una versión, se eliminan únicamente las cachés anteriores de CRJ, incluidas las heredadas `crj-mm-vN`.
- Una actualización queda en espera y ofrece un aviso discreto. Solo el botón **Actualizar** solicita activación y recarga; no hay recargas al volver atrás.

Al cambiar HTML, CSS, JS, manifest o imágenes para una entrega, incrementar **solo** `CACHE_NAME` en `service-worker.js`. Si se añade un recurso imprescindible offline, incluirlo en `SHELL`. No añadir parámetros de versión a enlaces ni `Date.now()` a solicitudes. El JSON se consulta primero en red y no necesita incrementar la versión para cambios de datos; offline puede mostrar la última versión guardada.

La capacidad offline depende de una primera visita completa y del almacenamiento que permita el navegador. WhatsApp requiere conexión. Los iconos de 192 y 512 px usan el logo CRJ proporcionado y están en `public/img/marca/`. La instalación en el sistema operativo no se realiza automáticamente: se inicia desde **Instalar app**, cuando el navegador la permite.

No se ha definido `canonical`, `og:url` ni `og:image` absoluto porque falta la URL pública definitiva. Los títulos y descripciones de producto se actualizan con JavaScript; los rastreadores que no lo ejecutan verán los metadatos genéricos de la ficha.

## Validación

Con Node.js instalado:

```sh
node --check app.js
node --check install.js
node --check service-worker.js
node --test tests/service-worker.test.cjs tests/install.test.cjs
```

Antes de publicar, revisar inicio, catálogo, detalle, un ID inexistente, filtros y búsqueda combinados, menú móvil, enlaces de WhatsApp y actualización de la PWA. Verificar también la instalación en los navegadores y dispositivos finales del negocio. Las pruebas realizadas en esta entrega se detallan en `docs/modernizacion.md`.
