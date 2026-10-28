const fs = require('node:fs');
const path = require('node:path');
const {nextId} = require('../catalog-model.js');
try {
  const items = JSON.parse(fs.readFileSync(path.join(__dirname,'../data/productos.json'),'utf8'));
  console.log(`Siguiente folio: ${nextId(items)} (no se modificó ningún archivo).`);
} catch (error) { console.error(error.message); process.exitCode = 1; }
