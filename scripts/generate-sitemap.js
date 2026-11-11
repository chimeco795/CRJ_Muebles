const fs = require('node:fs');
const path = require('node:path');
const model = require('../catalog-model.js');

const root = path.resolve(__dirname, '..');
const base = 'https://chimeco795.github.io/CRJ_Muebles/';
const products = model.normalize(JSON.parse(fs.readFileSync(path.join(root, 'data/productos.json'), 'utf8')));
const routes = [
  '', 'tienda.html',
  ...model.availableCategories(products).map(category => 'tienda.html?categoria=' + encodeURIComponent(category)),
  ...products.map(product => 'producto.html?id=' + encodeURIComponent(product.id))
];
const entries = routes.map(route => '  <url><loc>' + base + route + '</loc></url>');
const xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', ...entries, '</urlset>', ''].join('\n');
fs.writeFileSync(path.join(root, 'sitemap.xml'), xml);
