const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const model = require('../catalog-model.js');
const {validateCatalog, validateReferences} = require('../scripts/validate-catalog.js');
const root = path.join(__dirname,'..');
const catalog = JSON.parse(fs.readFileSync(path.join(root,'data/productos.json'),'utf8'));
const product = {id:16,nombre:'Solo prueba',linea:'tablas',descripcion:'Dato de prueba',precio:null,imagen:null};
test('current catalog has unique folios and every local reference exists', () => {
  assert.deepEqual(validateCatalog(catalog),[]); assert.deepEqual(validateReferences(root,catalog),[]);
});
test('validator reports folio for duplicates, missing fields and invalid values', () => {
  assert.match(model.errors([product,product]).join(),/folio 16: id duplicado/);
  for (const change of [{id:null},{linea:'otra'},{nombre:''},{descripcion:null},{precio:-1},{precio:undefined},{imagen:undefined},{destacado:-1},{destacado:'sí'},{stock:1.5},{activo:'false'},{galeria:[null]}]) assert.ok(model.errors([{...product,...change}]).length,JSON.stringify(change));
});
test('missing covers, missing gallery images, wrong folders and remote URLs are rejected', () => {
  for (const change of [{imagen:'public/img/products/tablas/prueba/no-existe.webp'}, {galeria:['public/img/products/tablas/prueba/no-existe.webp']},{imagen:'https://example.com/image.webp'},{imagen:catalog.find(p=>p.linea==='muebles'&&p.imagen).imagen}]) assert.ok(validateCatalog([{...product,...change}]).some(e=>e.includes('Folio 16')));
});
test('inactive products never contribute to filters or exact-ID lookup', () => {
  const active=model.normalize([product,{...product,id:17,linea:'muebles',activo:false}]);
  assert.deepEqual(model.availableCategories(active),['tablas']);
  assert.equal(active.find(p=>p.id==='17'),undefined); assert.equal(active.find(p=>p.id==='999'),undefined);
  assert.equal(model.normalize([]).length,0);
});
test('next folio considers inactive records and never modifies the catalog', () => {
  const records=[product,{...product,id:20,activo:false}],before=JSON.stringify(records);
  assert.equal(model.nextId(records),21); assert.equal(JSON.stringify(records),before); assert.equal(model.nextId(catalog),Math.max(...catalog.map(p=>p.id))+1);
});
test('WhatsApp includes folio/name/URL and preserves nullable or zero prices', () => {
  const url='https://example.test/CRJ_Muebles/producto.html?id=16';
  const text=model.quoteMessage(product,url,p=>`$${p} MXN`);
  assert.match(text,/folio 16/);assert.match(text,/Solo prueba/);assert.ok(text.includes(url));assert.ok(!text.includes('Precio publicado'));
  assert.match(model.quoteMessage({...product,precio:0},url,p=>`$${p} MXN`),/Precio publicado: \$0 MXN/);
});
