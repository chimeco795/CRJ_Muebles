const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const model = require('../catalog-model.js');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root,file),'utf8');
const products = model.normalize(JSON.parse(read('data/productos.json')));
const base = 'https://chimeco795.github.io/CRJ_Muebles/';

test('cada enlace compartible tiene título, texto e imagen en el HTML inicial y figura en el sitemap', () => {
  const sitemap = read('sitemap.xml');
  const routes = new Set([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]));
  for (const product of products) {
    const route = 'pieza-' + product.id + '.html';
    const html = read(route);
    assert.ok(routes.has(base + route));
    assert.ok(html.includes('property="og:url" content="' + base + route + '"'));
    assert.ok(html.includes('property="og:image" content="' + base + (product.imagen || 'public/img/marca/icon-512.png') + '"'));
    assert.ok(html.includes('name="twitter:card" content="summary_large_image"'));
    const escape = value => value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    assert.ok(html.includes('<h1>' + escape(product.nombre) + '</h1>'));
    assert.ok(html.includes('property="og:description" content="' + escape(product.descripcion) + '"'));
  }
  assert.equal([...routes].filter(url => /pieza-\d+\.html$/.test(url)).length, products.length);
});
