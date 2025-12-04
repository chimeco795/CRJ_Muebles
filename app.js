async function cargarProductos(){
  const r = await fetch("data/productos.json");
  return await r.json();
}

// Catálogo completo
if (document.getElementById("lista-productos")) {
  cargarProductos().then(productos => {
    const cont = document.getElementById("lista-productos");
    productos.forEach(p => {
      cont.innerHTML += `
        <article class="card" onclick="location.href='producto.html?id=${p.id}'">
          <img src="${p.imagen}" alt="${p.nombre}">
          <h4>${p.nombre}</h4>
          <p>$${p.precio} MXN</p>
        </article>`;
    });
  }).catch(console.error);
}

// Destacados
if (document.getElementById("productos-destacados")) {
  cargarProductos().then(productos => {
    const cont = document.getElementById("productos-destacados");
    productos.slice(0, 3).forEach(p => {
      cont.innerHTML += `
        <article class="card" onclick="location.href='producto.html?id=${p.id}'">
          <img src="${p.imagen}" alt="${p.nombre}">
          <h4>${p.nombre}</h4>
          <p>$${p.precio} MXN</p>
        </article>`;
    });
  }).catch(console.error);
}

// Detalle
if (location.pathname.endsWith("producto.html")) {
  const params = new URLSearchParams(location.search);
  const id = parseInt(params.get("id") || "0");

  cargarProductos().then(productos => {
    const p = productos.find(x => x.id === id) || productos[0];
    if (!p) return;

    const nombre = document.getElementById("prod-nombre");
    const nombreHeader = document.getElementById("prod-nombre-header");
    const img = document.getElementById("prod-img");
    const precio = document.getElementById("prod-precio");
    const desc = document.getElementById("prod-desc");
    const wa = document.getElementById("whatsapp-btn");

    if (nombre) nombre.textContent = p.nombre;
    if (nombreHeader) nombreHeader.textContent = p.nombre;
    if (img) img.src = p.imagen;
    if (precio) precio.textContent = "$" + p.precio + " MXN";
    if (desc) desc.textContent = p.descripcion;

    if (wa) {
      const msg = encodeURIComponent("Hola, me interesa el modelo: " + p.nombre);
      wa.href = "https://wa.me/525537027887?text=" + msg;
    }
  }).catch(console.error);
}


// Forzar recarga si la página viene del back/forward cache
window.addEventListener("pageshow", function (event) {
  if (event.persisted) {
    window.location.reload();
  }
});

const navEntry = performance.getEntriesByType("navigation")[0];
if (navEntry && navEntry.type === "back_forward") {
  window.location.reload();
}

if (document.getElementById("lista-productos")) {
  // ...
}

async function cargarProductos() {
  const r = await fetch("data/productos.json?cachebust=" + Date.now());
  return await r.json();
}

/* --------- CATÁLOGO COMPLETO (TIENDA) --------- */

let TODOS_PRODUCTOS = [];

async function initCatalogo() {
  const cont = document.getElementById("lista-productos");
  if (!cont) return;

  TODOS_PRODUCTOS = await cargarProductos();

  const searchInput = document.getElementById("search-input");
  const filterButtons = document.querySelectorAll(".filter-pill");
  const summary = document.getElementById("catalog-summary");
  const clearBtn = document.getElementById("clear-filters");

  function renderListaProductos() {
    if (!TODOS_PRODUCTOS.length) return;

    const texto = (searchInput?.value || "").toLowerCase().trim();
    const activeBtn = document.querySelector(".filter-pill.filter-pill-active");
    const linea = activeBtn ? activeBtn.dataset.linea : "all";

    const filtrados = TODOS_PRODUCTOS.filter(p => {
      const matchLinea = (linea === "all") || (p.linea === linea);
      const hayTexto = (p.nombre + " " + p.descripcion).toLowerCase().includes(texto);
      return matchLinea && hayTexto;
    });

    cont.innerHTML = "";
    filtrados.forEach(p => {
      cont.innerHTML += `
        <article class="card" onclick="location.href='producto.html?id=${p.id}'">
          <img src="${p.imagen}" alt="${p.nombre}">
          <h4>${p.nombre}</h4>
          <p>$${p.precio} MXN</p>
        </article>`;
    });

    if (!filtrados.length) {
      cont.innerHTML = `<p style="font-size:13px;color:rgba(63,58,52,.7);">No encontramos modelos con esos filtros.</p>`;
    }

    if (summary) {
      summary.textContent = `${filtrados.length} modelo${filtrados.length === 1 ? "" : "s"} encontrados`;
    }
  }

  // búsqueda
  if (searchInput) {
    searchInput.addEventListener("input", renderListaProductos);
  }

  // filtros
  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      filterButtons.forEach(b => b.classList.remove("filter-pill-active"));
      btn.classList.add("filter-pill-active");
      renderListaProductos();
    });
  });

  // limpiar
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      filterButtons.forEach(b => b.classList.remove("filter-pill-active"));
      const todoBtn = document.querySelector('.filter-pill[data-linea="all"]');
      if (todoBtn) todoBtn.classList.add("filter-pill-active");
      renderListaProductos();
    });
  }

  renderListaProductos();
}


// Inicializar catálogo si existe esa vista
if (document.getElementById("lista-productos")) {
  initCatalogo();
}

/* --------- DESTACADOS EN HOME (igual que antes) --------- */

// deja aquí tu código de destacados y detalle tal y como lo tenías
