'use strict';
// Increment this single version when releasing changed shell assets.
const CACHE_NAME = 'crj-muebles-v4';
const ROOT = new URL('./', self.location.href);
const local = path => new URL(path, ROOT).href;
const SHELL = [
  "index.html",
  "tienda.html",
  "producto.html",
  "styles.css",
  "app.js",
  "install.js",
  "manifest.json",
  "data/productos.json",
  "img/placeholder.svg",
  "public/img/marca/logo-crj.png",
  "public/img/marca/icon-192.png",
  "public/img/marca/icon-512.png",
  "public/img/products/tablas-picar/rayas/web/portada.webp",
  "public/img/products/montessori/cama-piso/mnt-cama-001/01-cover.webp",
  "public/img/products/tablas-picar/edge-grain/tbg-edge-001/ba6fa31a-9830-43ea-afa6-bb5c477569fc.webp",
  "public/img/products/tablas-picar/rayas/web/detalle.webp",
  "public/img/products/tablas-picar/rayas/web/conjunto.webp",
  "public/img/products/tablas-picar/con-mango/web/portada.webp",
  "public/img/products/muebles/organizador-con-cajon/web/portada.webp",
  "public/img/products/muebles/organizador-con-cajon/web/cajon.webp",
  "public/img/products/muebles/organizador-con-cajon/web/detalle.webp",
  "public/img/products/muebles/organizador-con-cajon/web/lateral.webp",
  "public/img/products/muebles/especiero-bandejas/web/portada.webp",
  "public/img/products/muebles/especiero-bandejas/web/frente.webp",
  "public/img/products/muebles/especiero-bandejas/web/lateral.webp",
  "public/img/products/muebles/cama-mascota/web/portada.webp",
  "public/img/products/muebles/cama-mascota/web/perspectiva.webp",
  "public/img/products/muebles/cama-mascota/web/estructura.webp",
  "public/img/products/muebles/mesa-insertos/web/portada.webp",
  "public/img/products/muebles/mesa-insertos/web/detalle.webp",
  "public/img/products/tablas-picar/bandeja/web/portada.webp"
].map(local);

self.addEventListener('install', event => {
  // Do not skip waiting automatically: open pages can finish with their version.
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL.map(url => new Request(url, { cache: 'reload' })))));
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
async function cacheFirst(request, image = false) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch {
    if (image) return (await cache.match(local('img/placeholder.svg'))) || Response.error();
    return Response.error();
  }
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
    event.respondWith(cacheFirst(request, true));
  } else if (['styles.css', 'app.js', 'install.js', 'manifest.json'].includes(path)) {
    event.respondWith(cacheFirst(request));
  }
});
