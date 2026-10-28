const fs = require('node:fs');
const path = require('node:path');
const model = require('../catalog-model.js');
const ROOT = path.resolve(__dirname, '..');
function validateCatalog(items, root = ROOT) {
  const errors = model.errors(items);
  if (!Array.isArray(items)) return errors;
  for (const p of items) {
    if (!p || typeof p !== 'object') continue;
    const urls = [p.imagen, ...(Array.isArray(p.galeria) ? p.galeria : [])].filter(url => url !== null && url !== undefined);
    for (const url of urls) {
      const label = `Folio ${p.id ?? 'faltante'}: imagen ${JSON.stringify(url)}`;
      if (typeof url !== 'string' || !/^public\/img\/products\/(tablas|muebles|montessori)\/[a-z0-9-]+\/[a-zA-Z0-9_.-]+\.(webp|png|jpe?g)$/.test(url)) { errors.push(`${label}: ruta inválida; usa products/{categoria}/{slug}/archivo.webp`); continue; }
      if (url.split('/')[3] !== model.category(p)) errors.push(`${label}: carpeta y categoría no coinciden`);
      if (!fs.existsSync(path.join(root, url))) errors.push(`${label}: archivo inexistente`);
    }
  }
  return errors;
}
function validateReferences(root = ROOT, items = []) {
  const errors = [], ids = new Set(items.map(p => String(p.id)));
  for (const name of ['index.html','tienda.html','producto.html']) {
    const html = fs.readFileSync(path.join(root, name), 'utf8');
    for (const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
      const ref = match[1];
      if (/^(?:[a-z]+:|#|\/\/)/i.test(ref)) continue;
      const url = new URL(ref, 'https://local.test/');
      const file = decodeURIComponent(url.pathname.slice(1));
      if (!fs.existsSync(path.join(root,file))) errors.push(`${name}: referencia inexistente ${ref}`);
      if (file === 'producto.html' && url.searchParams.has('id') && !ids.has(url.searchParams.get('id'))) errors.push(`${name}: enlace a folio inexistente ${url.searchParams.get('id')}`);
    }
  }
  return errors;
}
if (require.main === module) {
  try {
    const items = JSON.parse(fs.readFileSync(path.join(ROOT,'data/productos.json'),'utf8'));
    const issues = [...validateCatalog(items), ...validateReferences(ROOT, Array.isArray(items) ? items : [])];
    if (issues.length) { console.error(issues.join('\n')); process.exitCode = 1; }
    else console.log(`Catálogo válido: ${items.length} folios; imágenes y referencias locales correctas.`);
  } catch (error) { console.error(`Catálogo: ${error.message}`); process.exitCode = 1; }
}
module.exports = {validateCatalog, validateReferences};
