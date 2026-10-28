// Shared by the browser and Node validators; no dependencies or build step.
(function (root, factory) {
  const model = factory();
  if (typeof module === 'object' && module.exports) module.exports = model;
  else root.CRJCatalog = model;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const categories = {tablas:'Tablas de picar', muebles:'Muebles', montessori:'Montessori', mascotas:'Mascotas'};
  const aliases = {grill:'tablas', medida:'muebles'};
  const category = item => aliases[item.linea ?? item.categoria] || item.linea || item.categoria;
  function errors(items) {
    if (!Array.isArray(items)) return ['Catálogo: debe ser una lista JSON.'];
    const result = [], ids = new Set();
    items.forEach((p, index) => {
      const label = `Producto ${index + 1} / folio ${p?.id ?? 'faltante'}`;
      const fail = message => result.push(`${label}: ${message}`);
      if (!p || typeof p !== 'object' || Array.isArray(p)) { fail('registro inválido'); return; }
      if (!/^[1-9]\d*$/.test(String(p.id)) || !Number.isSafeInteger(Number(p.id))) fail('id debe ser un folio entero positivo y estable');
      else if (ids.has(String(p.id))) fail('id duplicado');
      else ids.add(String(p.id));
      for (const field of ['nombre','descripcion']) if (typeof p[field] !== 'string' || !p[field].trim()) fail(`${field} obligatorio`);
      if (!Object.hasOwn(categories, category(p))) fail('categoría inválida: usa tablas, muebles, montessori o mascotas');
      if (p.linea && p.categoria && (aliases[p.linea] || p.linea) !== (aliases[p.categoria] || p.categoria)) fail('linea y categoria se contradicen');
      if (p.precio !== null && (typeof p.precio !== 'number' || !Number.isFinite(p.precio) || p.precio < 0)) fail('precio obligatorio: número no negativo o null');
      if (p.imagen !== null && (typeof p.imagen !== 'string' || !p.imagen.trim())) fail('imagen obligatoria: ruta local o null');
      for (const field of ['galeria','detalles']) if (p[field] !== undefined && (!Array.isArray(p[field]) || p[field].some(v => typeof v !== 'string' || !v.trim()))) fail(`${field} debe ser una lista de textos no vacíos`);
      if (p.destacado !== undefined && typeof p.destacado !== 'boolean' && (!Number.isSafeInteger(p.destacado) || p.destacado < 0)) fail('destacado debe ser booleano o prioridad entera no negativa');
      if (p.activo !== undefined && typeof p.activo !== 'boolean') fail('activo debe ser booleano');
      if (p.stock !== undefined && (!Number.isSafeInteger(p.stock) || p.stock < 0)) fail('stock debe ser entero no negativo si está confirmado');
    });
    return result;
  }
  function normalize(items) {
    const issues = errors(items);
    if (issues.length) throw new Error(issues.join('\n'));
    return items.filter(p => p.activo !== false).map(p => ({...p, id:String(p.id), categoria:category(p), categoriaNombre:categories[category(p)], galeria:p.galeria || []}));
  }
  const availableCategories = products => Object.keys(categories).filter(key => products.some(p => category(p) === key && p.activo !== false));
  function nextId(items) {
    const issues = errors(items);
    if (issues.length) throw new Error(issues.join('\n'));
    const id = Math.max(0, ...items.map(p => Number(p.id))) + 1;
    if (!Number.isSafeInteger(id)) throw new Error('No hay un folio seguro disponible.');
    return id;
  }
  function quoteMessage(product, url, priceText) {
    return `Hola, me interesa consultar la pieza “${product.nombre}” (folio ${product.id}) que vi en CRJ Muebles.${product.precio === null ? '' : `\nPrecio publicado: ${priceText(product.precio)}`}\n\nProducto: ${url}`;
  }
  return {categories, aliases, category, errors, normalize, availableCategories, nextId, quoteMessage};
});
