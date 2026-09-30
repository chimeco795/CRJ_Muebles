(() => {
  'use strict';
  const CONTACT = { whatsapp: '525537027887' };
  const CATEGORIES = { tablas: 'Tablas de picar', muebles: 'Muebles', montessori: 'Montessori' };
  const ALIASES = { grill: 'tablas', medida: 'muebles' };
  const currency = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 });
  const $ = selector => document.querySelector(selector);
  const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const priceText = price => price === null ? 'Precio a consultar' : `${currency.format(price)} MXN`;
  const whatsapp = text => `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`;
  let productsPromise;

  // One data request per page. A failed request can be retried explicitly.
  function loadProducts() {
    if (!productsPromise) productsPromise = fetch('data/productos.json', { cache: 'no-cache', signal: AbortSignal.timeout(10000) })
      .then(response => { if (!response.ok) throw new Error('Catálogo no disponible'); return response.json(); })
      .then(data => {
        if (!Array.isArray(data)) throw new Error('Formato incorrecto');
        const ids = new Set();
        return data.map(item => {
          if (!item || item.id == null || typeof item.nombre !== 'string' || ids.has(String(item.id))) throw new Error('Producto incorrecto');
          ids.add(String(item.id));
          const category = ALIASES[item.linea] || item.linea;
          return { ...item, id: String(item.id), categoria: category,
            categoriaNombre: CATEGORIES[category] || 'Piezas de madera',
            descripcion: typeof item.descripcion === 'string' ? item.descripcion : '',
            precio: typeof item.precio === 'number' && Number.isFinite(item.precio) && item.precio >= 0 ? item.precio : null,
            imagen: typeof item.imagen === 'string' && item.imagen ? item.imagen : null };
        });
      }).catch(error => { productsPromise = undefined; throw error; });
    return productsPromise;
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function link(text, href, className = 'text-link') { const node = el('a', className, text); node.href = href; return node; }
  function media(product, eager = false) {
    const box = el('div', 'product-media');
    function fallback() {
      const placeholder = el('div', 'image-placeholder');
      placeholder.append(el('span', 'placeholder-mark', 'CRJ'), el('span', '', 'Fotografía por confirmar'));
      box.replaceChildren(placeholder);
    }
    if (!product.imagen) fallback();
    else {
      const img = el('img');
      img.alt = product.alt || product.nombre; img.width = 800; img.height = 900;
      img.loading = eager ? 'eager' : 'lazy'; img.decoding = 'async';
      if (eager) img.fetchPriority = 'high';
      img.addEventListener('error', fallback, { once: true });
      img.src = product.imagen; box.append(img);
    }
    return box;
  }
  function gallery(product) {
    const sources = [product.imagen, ...(product.galeria || [])].filter((src, index, all) => src && all.indexOf(src) === index);
    const group = el('div', 'product-gallery');
    const stage = media(product, true);
    stage.id = 'gallery-stage';
    group.append(stage);
    if (sources.length > 1) {
      const caption = el('p', 'gallery-caption', `Vista 1 de ${sources.length}`);
      caption.setAttribute('aria-live', 'polite');
      const thumbs = el('div', 'gallery-thumbs');
      thumbs.setAttribute('role', 'group'); thumbs.setAttribute('aria-label', 'Vistas de la pieza');
      sources.forEach((src, index) => {
        const thumb = el('button', 'gallery-thumb'); thumb.type = 'button';
        thumb.setAttribute('aria-label', `Ver imagen ${index + 1} de ${product.nombre}`);
        thumb.setAttribute('aria-controls', 'gallery-stage'); thumb.setAttribute('aria-pressed', String(index === 0));
        const image = el('img'); image.src = src; image.alt = ''; image.width = 96; image.height = 96; image.loading = 'lazy';
        thumb.append(image);
        thumb.addEventListener('click', () => {
          const next = media({ ...product, imagen: src, alt: `${product.nombre}, vista ${index + 1}` }, true);
          stage.replaceChildren(...next.childNodes);
          thumbs.querySelectorAll('button').forEach(node => node.setAttribute('aria-pressed', String(node === thumb)));
          caption.textContent = `Vista ${index + 1} de ${sources.length}`;
        });
        thumbs.append(thumb);
      });
      group.append(thumbs, caption);
    }
    return group;
  }
  function card(product, heading = 'h2') {
    const node = link('', `producto.html?id=${encodeURIComponent(product.id)}`, 'product-card');
    const info = el('div', 'product-card-info');
    info.append(el('p', 'eyebrow', product.categoriaNombre), el(heading, '', product.nombre));
    const bottom = el('div', 'card-bottom');
    bottom.append(el('span', 'price', priceText(product.precio)), el('span', 'card-action', 'Ver pieza ↗'));
    info.append(bottom); node.append(media(product), info); return node;
  }
  function state(container, title, message, action, heading = 'h2') {
    const box = el('div', 'state-panel');
    box.append(el('p', 'eyebrow', 'CRJ Muebles'), el(heading, '', title), el('p', 'muted', message));
    if (action) box.append(action);
    container.replaceChildren(box); container.setAttribute('aria-busy', 'false');
  }
  function button(text, callback) {
    const node = el('button', 'button button-secondary', text); node.type = 'button';
    node.addEventListener('click', callback); return node;
  }
  function loading(container) { container.setAttribute('aria-busy', 'true'); container.replaceChildren(el('p', 'loading-state', 'Cargando piezas…')); }
  function updateNav(category = '') {
    const page = document.body.dataset.page;
    document.querySelectorAll('[data-nav]').forEach(anchor => {
      const current = page === 'home' ? (location.hash === '#proyectos' ? 'muebles' : 'inicio') : category || 'catalogo';
      if (anchor.dataset.nav === current) anchor.setAttribute('aria-current', 'page');
      else anchor.removeAttribute('aria-current');
    });
  }
  async function initFeatured() {
    const container = $('#productos-destacados'); loading(container);
    try {
      const products = await loadProducts();
      const featured = products.filter(p => p.imagen && p.destacado).sort((a, b) => a.destacado - b.destacado).slice(0, 3);
      if (!featured.length) state(container, 'Conoce nuestras piezas', 'Explora el catálogo o cuéntanos qué tienes en mente.', link('Explorar catálogo →', 'tienda.html'), 'h3');
      else container.replaceChildren(...featured.map(p => card(p, 'h3')));
    } catch { state(container, 'No pudimos cargar las piezas', 'Revisa tu conexión y vuelve a intentar.', button('Volver a intentar', initFeatured), 'h3'); }
    finally { container.setAttribute('aria-busy', 'false'); }
  }
  async function initCatalog() {
    const container = $('#lista-productos'), filters = $('#category-filters'), input = $('#search-input'), clear = $('#clear-filters');
    loading(container); input.disabled = true; clear.disabled = true; filters.replaceChildren(); $('#catalog-summary').textContent = '';
    try {
      const products = await loadProducts();
      if (!products.length) {
        state(container, 'Estamos preparando el catálogo', 'Mientras tanto, podemos conversar sobre tu proyecto.', link('Cotizar proyecto ↗', whatsapp('Hola, quiero consultar un proyecto personalizado con CRJ Muebles.'), 'button button-primary'));
        return;
      }
      const available = Object.keys(CATEGORIES).filter(key => products.some(p => p.categoria === key));
      const params = new URLSearchParams(location.search);
      let category = ALIASES[params.get('linea')] || params.get('categoria') || params.get('linea') || 'todos';
      if (!available.includes(category)) category = 'todos';
      input.value = params.get('q') || '';
      for (const key of ['todos', ...available]) {
        const node = el('button', 'filter-chip', key === 'todos' ? 'Todos' : CATEGORIES[key]); node.type = 'button'; node.dataset.category = key;
        node.addEventListener('click', () => { category = key; render(); }); filters.append(node);
      }
      function render() {
        const query = normalize(input.value);
        const matching = products.filter(p => (category === 'todos' || p.categoria === category) && normalize(`${p.nombre} ${p.descripcion} ${p.categoriaNombre}`).includes(query));
        matching.sort((a, b) => Number(!a.imagen) - Number(!b.imagen) || Object.keys(CATEGORIES).indexOf(a.categoria) - Object.keys(CATEGORIES).indexOf(b.categoria));
        filters.querySelectorAll('button').forEach(node => node.setAttribute('aria-pressed', String(node.dataset.category === category)));
        $('#catalog-summary').textContent = `${matching.length} ${matching.length === 1 ? 'pieza' : 'piezas'}`;
        if (matching.length) container.replaceChildren(...matching.map(p => card(p)));
        else state(container, 'Sin resultados', 'Prueba con otra palabra o explora todas las piezas.', button('Limpiar búsqueda y filtros', () => { reset(); input.focus(); }));
        const url = new URL(location.href); url.searchParams.delete('linea');
        if (category === 'todos') url.searchParams.delete('categoria'); else url.searchParams.set('categoria', category);
        if (input.value.trim()) url.searchParams.set('q', input.value.trim()); else url.searchParams.delete('q');
        history.replaceState(null, '', url); updateNav(category === 'todos' ? '' : category);
      }
      function reset() { input.value = ''; category = 'todos'; render(); }
      input.oninput = render; clear.onclick = () => { reset(); input.focus(); };
      input.disabled = false; clear.disabled = false; render();
    } catch { state(container, 'No pudimos cargar el catálogo', 'Revisa tu conexión y vuelve a intentar. Las piezas guardadas en una visita anterior pueden consultarse sin conexión.', button('Volver a intentar', initCatalog)); }
    finally { container.setAttribute('aria-busy', 'false'); }
  }
  function metadata(title, description) {
    document.title = title; $('meta[name="description"]').content = description;
    $('meta[property="og:title"]').content = title; $('meta[property="og:description"]').content = description;
  }
  async function initProduct() {
    const container = $('#product-detail'); loading(container);
    try {
      const products = await loadProducts();
      const product = products.find(p => p.id === new URLSearchParams(location.search).get('id'));
      if (!product) {
        metadata('Producto no encontrado | CRJ Muebles', 'Explora las piezas disponibles en el catálogo de CRJ Muebles.');
        const actions = el('div', 'actions'); actions.append(link('Volver al catálogo', 'tienda.html', 'button button-primary'), link('Ir al inicio', 'index.html', 'button button-secondary'));
        state(container, 'Producto no encontrado', 'Esta pieza no está en nuestro catálogo. Puedes explorar las demás o volver al inicio.', actions, 'h1'); return;
      }
      metadata(`${product.nombre} | CRJ Muebles`, product.descripcion);
      const article = el('article', 'product-detail'), content = el('div', 'product-copy');
      content.append(link(product.categoriaNombre, `tienda.html?categoria=${product.categoria}`, 'eyebrow category-link'), el('h1', '', product.nombre), el('p', 'product-price', priceText(product.precio)), el('p', 'product-description', product.descripcion));
      const url = new URL('producto.html', location.href); url.searchParams.set('id', product.id);
      const message = `Hola, me interesa consultar la pieza “${product.nombre}” que vi en CRJ Muebles.${product.precio === null ? '' : `\nPrecio publicado: ${priceText(product.precio)}`}\n\nProducto: ${url.href}`;
      const actions = el('div', 'product-contact'), wa = link('Consultar por WhatsApp ↗', whatsapp(message), 'button button-whatsapp'); wa.id = 'whatsapp-btn';
      actions.append(wa, el('p', 'small muted', 'Conversemos sobre esta pieza y lo que necesitas para tu espacio.'));
      content.append(actions, link('¿Buscas algo a la medida? →', 'index.html#proyectos'));
      if (Array.isArray(product.detalles) && product.detalles.length) {
        const details = el('ul', 'product-facts');
        product.detalles.forEach(detail => details.append(el('li', '', detail)));
        content.insertBefore(details, actions);
      }
      article.append(gallery(product), content); container.replaceChildren(article); updateNav(product.categoria);
    } catch { state(container, 'No pudimos cargar esta pieza', 'Revisa tu conexión y vuelve a intentar.', button('Volver a intentar', initProduct), 'h1'); }
    finally { container.setAttribute('aria-busy', 'false'); }
  }
  function initShell() {
    const menu = $('#menu-toggle'), nav = $('#main-nav');
    function closeMenu() { menu.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); }
    menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); nav.classList.toggle('is-open', open); });
    nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); } });
    document.querySelectorAll('[data-project-contact]').forEach(anchor => { anchor.href = whatsapp('Hola, quiero consultar un proyecto personalizado con CRJ Muebles. Mi idea es:'); });
    document.querySelectorAll('[data-year]').forEach(node => { node.textContent = new Date().getFullYear(); });
    function updateConnection() { $('#offline-notice').hidden = navigator.onLine; }
    window.addEventListener('online', updateConnection); window.addEventListener('offline', updateConnection);
    if (document.body.dataset.page === 'home') window.addEventListener('hashchange', () => updateNav());
    updateConnection(); updateNav();
  }
  function initPwa() {
    if (!('serviceWorker' in navigator) || !window.isSecureContext) return;
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('service-worker.js', { scope: './', updateViaCache: 'none' });
        const notice = $('#update-notice');
        function offerUpdate() { if (registration.waiting && navigator.serviceWorker.controller) notice.hidden = false; }
        offerUpdate();
        registration.addEventListener('updatefound', () => { const worker = registration.installing; worker?.addEventListener('statechange', () => { if (worker.state === 'installed') offerUpdate(); }); });
        let requested = false;
        $('#update-button').addEventListener('click', () => { if (!registration.waiting) return; requested = true; registration.waiting.postMessage({ type: 'SKIP_WAITING' }); });
        navigator.serviceWorker.addEventListener('controllerchange', () => { if (requested) { requested = false; location.reload(); } });
      } catch { $('#pwa-status').textContent = 'El modo sin conexión no está disponible en este navegador.'; }
    }, { once: true });
  }
  initShell(); initPwa();
  if ($('#productos-destacados')) initFeatured();
  if ($('#lista-productos')) initCatalog();
  if ($('#product-detail')) initProduct();
})();
