const fs = require('node:fs');
const path = require('node:path');
const model = require('../catalog-model.js');

const root = path.resolve(__dirname, '..');
const base = 'https://chimeco795.github.io/CRJ_Muebles/';
const products = model.normalize(JSON.parse(fs.readFileSync(path.join(root, 'data/productos.json'), 'utf8')));
const template = fs.readFileSync(path.join(root, 'producto.html'), 'utf8');
const marker = '<!-- Generado por scripts/generate-sitemap.js -->';
const escape = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[ch]));
const routes = ['', 'tienda.html', 'privacidad.html', 'terminos.html',
  ...model.availableCategories(products).map(category => 'tienda.html?categoria=' + encodeURIComponent(category))];

for (const product of products) {
  const route = 'pieza-' + product.id + '.html';
  const title = escape(product.nombre + ' | CRJ Muebles');
  const description = escape(product.descripcion);
  const image = escape(base + (product.imagen || 'public/img/marca/icon-512.png'));
  const url = base + route;
  const tags = [
    '<title>' + title + '</title>',
    '<meta name="description" content="' + description + '">',
    '<link rel="canonical" href="' + url + '">',
    '<meta name="theme-color" content="#f8f6f1">',
    '<meta property="og:type" content="website"><meta property="og:site_name" content="CRJ Muebles"><meta property="og:locale" content="es_MX">',
    '<meta property="og:title" content="' + title + '"><meta property="og:description" content="' + description + '">',
    '<meta property="og:url" content="' + url + '"><meta property="og:image" content="' + image + '">',
    '<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="' + title + '">',
    '<meta name="twitter:description" content="' + description + '"><meta name="twitter:image" content="' + image + '">'
  ];
  const name = escape(product.nombre);
  const category = escape(product.categoriaNombre);
  const categoryUrl = 'tienda.html?categoria=' + encodeURIComponent(product.categoria);
  const price = product.precio === null ? 'Precio a consultar' : new Intl.NumberFormat('es-MX', {style:'currency',currency:'MXN'}).format(product.precio) + ' MXN';
  const photo = product.imagen
    ? `<img src="${escape(product.imagen)}" alt="${name}" width="800" height="900" fetchpriority="high">`
    : '<div class="image-placeholder">Fotografía por confirmar</div>';
  const views = product.galeria.length
    ? `<div class="gallery-thumbs">${[product.imagen,...product.galeria].filter(Boolean).map((src,i) => `<a class="gallery-thumb" href="${escape(src)}" aria-label="Ver imagen ${i+1}"><img src="${escape(src)}" width="96" height="96" loading="lazy" alt=""></a>`).join('')}</div><p class="gallery-caption">Vista 1 de ${product.galeria.length+1}</p>`
    : '';
  const facts = (product.detalles || []).map(fact => '<li>' + escape(fact) + '</li>').join('');
  const message = model.quoteMessage(product, url, () => price);
  const content = `<article class="product-detail">
    <div class="product-gallery"><div class="product-media">${photo}</div>${views}</div>
    <div class="product-copy">
      <a class="eyebrow category-link" href="${categoryUrl}">${category}</a>
      <h1>${name}</h1>
      <p class="product-price">${price}</p>
      <p class="product-description">${description}</p>
      ${facts ? '<ul class="product-facts">' + facts + '</ul>' : ''}
      <div class="product-contact">
        <a class="button button-whatsapp" href="https://wa.me/525537027887?text=${encodeURIComponent(message)}">Consultar por WhatsApp ↗</a>
      </div>
    </div>
  </article>`;
  const html = template.replace('<p class="loading-state">Cargando pieza…</p>', () => content).replace('<html', marker + '\n<html').replace(/<title>[\s\S]*?(?=<link rel="stylesheet")/, () => tags.join('\n') + '\n');
  fs.writeFileSync(path.join(root, route), html.replace(/^[ \t]+$/gm, ''));
  routes.push(route);
}
for (const file of fs.readdirSync(root)) {
  if (/^pieza-\d+\.html$/.test(file) && !routes.includes(file) && fs.readFileSync(path.join(root,file),'utf8').includes(marker)) {
    fs.unlinkSync(path.join(root,file));
  }
}
const entries = routes.map(route => '  <url><loc>' + escape(base + route) + '</loc></url>');
const xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', ...entries, '</urlset>', ''].join('\n');
fs.writeFileSync(path.join(root, 'sitemap.xml'), xml);
