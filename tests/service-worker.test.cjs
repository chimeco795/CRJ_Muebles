// Run with: node --test tests/service-worker.test.cjs
const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '..', 'service-worker.js'), 'utf8');
const base = 'https://example.test/CRJ_Muebles/';

function worker() {
  const listeners = {}, stores = new Map();
  let offline = false, payload = 'fresh', status = 200, requests = 0, skipped = false, claimed = false;
  const key = request => typeof request === 'string' ? request : request.url;
  const caches = {
    keys: async () => [...stores.keys()],
    delete: async name => stores.delete(name),
    open: async name => {
      if (!stores.has(name)) stores.set(name, new Map());
      const store = stores.get(name);
      return {
        match: async request => store.get(key(request))?.clone(),
        put: async (request, response) => { store.set(key(request), response.clone()); },
        addAll: async requests => {
          for (const request of requests) {
            const relative = decodeURIComponent(new URL(request.url).pathname).replace('/CRJ_Muebles/', '');
            const filename = path.join(__dirname, '..', relative);
            assert.ok(fs.existsSync(filename), `Missing precache asset: ${relative}`);
            store.set(request.url, new Response(fs.readFileSync(filename)));
          }
        }
      };
    }
  };
  vm.runInNewContext(source, {
    URL, Request, Response, AbortController, setTimeout, clearTimeout, caches,
    self: { location: { href: `${base}service-worker.js` }, addEventListener: (type, fn) => { listeners[type] = fn; }, skipWaiting: () => { skipped = true; }, clients: { claim: async () => { claimed = true; } } },
    fetch: async () => { requests++; if (offline) throw new TypeError('offline'); return new Response(payload, { status }); }
  });
  async function lifecycle(type) { let promise; listeners[type]({ waitUntil: p => { promise = p; } }); await promise; }
  function request(relative, mode = 'navigate', destination = '', method = 'GET') {
    let result;
    listeners.fetch({ request: { url: new URL(relative, base).href, mode, destination, method }, respondWith: p => { result = p; } });
    return result;
  }
  return { caches, stores, lifecycle, request, message: data => listeners.message({ data }),
    setOffline: value => { offline = value; }, setResponse: (text, code = 200) => { payload = text; status = code; },
    get requests() { return requests; }, get skipped() { return skipped; }, get claimed() { return claimed; } };
}

test('install precaches existing assets and waits for an explicit update', async () => {
  const w = worker(); await w.lifecycle('install');
  assert.equal(w.skipped, false);
  w.message({ type: 'SKIP_WAITING' }); assert.equal(w.skipped, true);
});
test('activate removes only CRJ caches, preserving unrelated applications', async () => {
  const w = worker(); await w.lifecycle('install');
  const current = (await w.caches.keys())[0];
  await w.caches.open('crj-mm-v6'); await w.caches.open('crj-muebles-v0'); await w.caches.open('other-app');
  await w.lifecycle('activate');
  assert.equal(w.claimed, true);
  assert.deepEqual((await w.caches.keys()).sort(), [current, 'other-app'].sort());
});
test('offline root and product query URLs resolve to their own cached HTML under a subdirectory', async () => {
  const w = worker(); await w.lifecycle('install'); w.setOffline(true);
  assert.match(await (await w.request('')).text(), /hero-title/);
  assert.match(await (await w.request('producto.html?id=7')).text(), /product-detail/);
  assert.match(await (await w.request('producto.html?id=inexistente')).text(), /product-detail/);
  assert.match(await (await w.request('tienda.html?categoria=tablas')).text(), /lista-productos/);
});
test('catalog data uses network first, retaining the last successful response offline or on server errors', async () => {
  const w = worker(); await w.lifecycle('install');
  w.setResponse('[{"id":99}]');
  assert.equal(await (await w.request('data/productos.json', 'cors')).text(), '[{"id":99}]');
  w.setOffline(true);
  assert.equal(await (await w.request('data/productos.json', 'cors')).text(), '[{"id":99}]');
  w.setOffline(false); w.setResponse('server error', 503);
  assert.equal(await (await w.request('data/productos.json', 'cors')).text(), '[{"id":99}]');
});
test('shell avoids network calls and an uncached offline image has a real fallback', async () => {
  const w = worker(); await w.lifecycle('install'); w.setOffline(true);
  const before = w.requests;
  assert.match(await (await w.request('styles.css', 'cors', 'style')).text(), /--color-bg/);
  assert.equal(w.requests, before);
  assert.match(await (await w.request('unknown.webp', 'cors', 'image')).text(), /Fotografía no disponible/);
});
test('external requests, unknown pages and writes are not intercepted', async () => {
  const w = worker();
  assert.equal(w.request('https://wa.me/525537027887'), undefined);
  assert.equal(w.request('../another-app/index.html'), undefined);
  assert.equal(w.request('missing.html'), undefined);
  assert.equal(w.request('data/productos.json', 'cors', '', 'POST'), undefined);
});
