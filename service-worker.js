const CACHE_NAME = "crj-mm-v6";
const URLS_TO_CACHE = [
  "styles.css",
  "app.js",
  "data/productos.json",
  "tienda.html",
  "producto.html"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
});

self.addEventListener("activate", event => {
  // borra caches viejos (v5, etc.)
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
});

self.addEventListener("fetch", event => {
  // No tocamos navegaciones (index.html, etc.)
  if (event.request.mode === "navigate") return;

  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});
