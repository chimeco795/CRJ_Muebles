# Fotografías, contenido e instalación de CRJ Muebles

Actualización del 30 de septiembre de 2026. Complementa y sustituye los datos de estado de la primera entrega descrita en `modernizacion.md`.

## Organización de los archivos

Se revisaron visualmente 96 imágenes y se organizaron también tres documentos adjuntos: **99 archivos originales en total**. Los archivos se movieron sin sobrescribir destinos, y sus hashes SHA-256 se comprobaron después de la operación. No se borraron duplicados ni se alteraron los originales.

`organizacion-imagenes.json` contiene la ruta anterior, la ruta nueva y el hash de cada archivo, para localizarlo o revertir un traslado.

```text
public/img/
  products/
    tablas-picar/
      con-mango/        originales, referencias y web
      rayas/            originales y web
      bandeja/          originales y web
      ambientes/       composiciones generales existentes
      edge-grain/      foto previamente vinculada al producto 7
    muebles/
      organizador-con-cajon/  originales, ambientes y web
      especiero-bandejas/     originales y web
      cama-mascota/           originales y web
      mesa-insertos/          originales y web
    montessori/cama-piso/     imagen previamente vinculada
  marca/
    originales/        tres archivos de logo aportados
    logo-crj.png       copia de uso web con márgenes transparentes recortados
    icon-192.png       icono PWA con el logo real
    icon-512.png       icono PWA con el logo real
  promociones/
    archivo/           anuncios con precios y descuentos por confirmar
    documentos/        Evento.pdf y Evento.pptx
  referencias/
    maderas/           láminas del catálogo de maderas
    planos/            mesa de servicio, especiero y banca
    proyectos/         carrito de servicio y presentación
    terceros/          anuncios, capturas y planos de otra marca
    guias/             lámina de cuidado de tablas
```

Se crearon 17 copias WebP optimizadas, sin alterar el contenido de las fotografías. Se conservó la proporción y se normalizó la orientación EXIF. `scripts/prepare-images.py` reproduce esas copias y los iconos usando Python y Pillow. No añade dependencias al sitio.

## Incorporación al sitio

- Logo CRJ aportado en cabecera, pie y diálogo de instalación; iconos nuevos de 192 y 512 px derivados del mismo logo.
- Hero con una fotografía de las tablas a rayas. Entradas fotográficas a Tablas, Muebles y Montessori.
- Tres destacados: tabla Edge Grain, organizador con cajón y cama Montessori.
- Galerías manuales con miniaturas, alt de la vista seleccionada, estado de selección y contador; sin carrusel automático.
- Sección de taller con una fotografía real del especiero en proceso y guía desplegable para preparar una cotización.
- Orden del catálogo: primero las piezas con foto; se conservaron las siete fichas anteriores que aún no tienen una imagen confirmada.

El catálogo ahora tiene **15 piezas: 5 de cocina/tablas, 4 muebles y 6 Montessori**. Se añadieron estas fichas con `precio: null` (la interfaz muestra “Precio a consultar”):

| ID | Pieza | Fotografías utilizadas |
| --- | --- | --- |
| 10 | Tabla de madera con mango | Foto original de la tabla con mango |
| 11 | Organizador con cajón | Frente, cajón, detalle y lateral |
| 12 | Especiero de bandejas | Fotos del taller: portada, frente y lateral |
| 13 | Cama de madera para mascota | Portada, perspectiva y estructura |
| 14 | Mesa con insertos | Dos vistas de la mesa |
| 15 | Bandeja de madera a rayas | Foto original de la pieza con borde |

Los nombres son descriptivos de lo observado, no nuevos códigos comerciales confirmados. No se trasladaron precios de promociones a estas fichas. Se conservaron los nueve precios anteriores, así como sus IDs y descripciones. No se asignaron materiales específicos, stock, garantías, medidas ni plazos a partir de una fotografía.

## Instalación PWA

Ahora hay un botón **Instalar app** en la navegación (dentro del menú en móvil) y un bloque visible al final de cada página. `install.js`:

- Guarda `beforeinstallprompt` cuando el navegador lo proporciona.
- Abre el instalador únicamente tras pulsar un botón.
- Consume cada evento una sola vez y distingue aceptación, cancelación y error.
- Confirma “App instalada” con `appinstalled` o ejecución en modo standalone, no solo con la aceptación del aviso.
- Si no hay evento nativo, abre instrucciones para Chrome/Edge y Safari, con dirección del sitio y botón para copiarla.
- Aclara que una dirección `localhost` solo sirve en ese equipo. Instalar en un teléfono requiere una dirección pública HTTPS accesible desde él.

El navegador integrado no ofreció un evento nativo durante esta revisión; se validó el diálogo alternativo. No se instaló una app en el sistema operativo. El flujo nativo se comprobó mediante pruebas automatizadas con eventos simulados.

Referencia técnica: [evento beforeinstallprompt](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeinstallprompt_event) y [requisitos de instalación PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable).

La caché `crj-muebles-v4` incluye 31 recursos (aproximadamente 2 MB): estructura, scripts, datos, identidad y fotografías/galerías publicadas. No precarga originales, planos ni promociones. Se mantienen red primero para HTML/JSON y caché primero para recursos; actualización explícita y limpieza selectiva de cachés anteriores.

## Validación de esta actualización

- Integridad de los 99 originales y ausencia de destinos duplicados.
- Referencias locales, imágenes y galerías existentes; 15 IDs distintos.
- 11 pruebas automatizadas aprobadas: seis de Service Worker y cinco de instalación.
- Sintaxis de `app.js`, `install.js` y `service-worker.js`.
- Navegador: actualización v3→v4, 15 piezas, filtro de cuatro muebles, búsqueda sin acento “cajon”, restablecimiento de filtros, cambio de miniatura y mensaje de WhatsApp sin precio inventado.
- Revisión visual a 375, 768, 1024 y 1440 px en las vistas comprobadas. Sin desbordamiento horizontal; galería y diálogo de instalación usables en móvil.
- Consola sin errores ni advertencias durante la revisión normal.
- Servidor apagado: apertura y recarga de la nueva cama para mascota, cambio a la tercera vista, fotos y logos cargados desde caché. Servidor restaurado al terminar.

## Pendientes comerciales

- Confirmar vigencia de precios de carteles antes de mostrarlos como promociones activas. Hay anuncios de Buen Fin y otros con precios diferentes; no deben presentarse automáticamente como oferta actual.
- Confirmar nombres comerciales, medidas, materiales, variantes y precios de las seis fichas nuevas.
- Confirmar qué variantes de las tablas a rayas corresponden al precio del producto 7. Las imágenes de detalle muestran tablas de esa familia; no se presupone un juego de dos piezas.
- Siguen faltando fotos identificadas para los productos 2–6 y 8–9. No se utilizaron imágenes ajenas para rellenarlos.
- Las láminas de maderas son referencias; no se publica que todas esas especies estén disponibles en el taller.
- Los archivos identificados con otra marca se guardaron como referencias, sin presentarlos como trabajos de CRJ.
- Para instalar desde un teléfono fuera de este equipo, falta publicar la versión en una dirección HTTPS. No se hizo commit, push ni despliegue.
