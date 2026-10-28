'use strict';
// Increment this single version when releasing changed shell assets.
const CACHE_NAME = 'crj-muebles-v16';
const ROOT = new URL('./', self.location.href);
const local = path => new URL(path, ROOT).href;
const SHELL = [
  'index.html', 'tienda.html', 'producto.html', 'styles.css', 'catalog-model.js',
  'app.js', 'install.js', 'manifest.json', 'data/productos.json', 'img/placeholder.svg',
  'public/img/marca/logo-crj.png', 'public/img/marca/icon-192.png', 'public/img/marca/icon-512.png',
  'public/img/products/tablas-picar/rayas/web/portada.webp'
].map(local);

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(SHELL.map(url => new Request(url, {cache:'reload'})));
    const catalog = await (await cache.match(local('data/productos.json'))).json();
    // New products automatically participate in offline precaching: no per-product JS edits.
    const images = [...new Set(catalog.filter(p => p.activo !== false)
      .flatMap(p => [p.imagen, ...(p.galeria || [])]).filter(Boolean))];
    await Promise.allSettled(images.map(image => {
      const url = new URL(image, ROOT);
      if (url.origin !== ROOT.origin || !url.pathname.startsWith(ROOT.pathname + 'public/img/products/')) return;
      return cache.addAll([new Request(url.href, {cache:'reload'})]);
    }));
  })());
});
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key !== CACHE_NAME && (key.startsWith('crj-muebles-') || /^crj-mm-v\d+$/.test(key))).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

async function networkFirst(request, key) {
  const cache = await caches.open(CACHE_NAME);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    const response = await fetch(request, { signal: controller.signal, cache: 'no-cache' });
    if (response.ok) {
      await cache.put(key, response.clone());
      return response;
    }
    if (response.status >= 500) return (await cache.match(key)) || response;
    return response;
  } catch {
    return (await cache.match(key)) || new Response('Sin conexión. Vuelve a intentarlo cuando tengas acceso a Internet.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  } finally { clearTimeout(timer); }
}
self.addEventListener('fetch', event => {
  const request = event.request, url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== ROOT.origin || !url.pathname.startsWith(ROOT.pathname)) return;
  const path = url.pathname.slice(ROOT.pathname.length);
  if (request.mode === 'navigate') {
    // Query parameters select content in JS; each page shares its HTML shell.
    const page = path || 'index.html';
    if (['index.html', 'tienda.html', 'producto.html'].includes(page)) event.respondWith(networkFirst(request, local(page)));
  } else if (path === 'data/productos.json') {
    event.respondWith(networkFirst(request, local(path)));
  } else if (request.destination === 'image') {
    event.respondWith((async () => {
      const response = await networkFirst(request, request);
      if (response.ok) return response;
      const cache = await caches.open(CACHE_NAME);
      return (await cache.match(local('img/placeholder.svg'))) || response;
    })());
  } else if (['styles.css', 'app.js', 'catalog-model.js', 'install.js', 'manifest.json'].includes(path)) {
    event.respondWith(networkFirst(request, request));
  }
});
