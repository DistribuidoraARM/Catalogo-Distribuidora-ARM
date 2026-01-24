/****************************************************
 * CONFIGURACIÓN GOOGLE SHEETS
 ****************************************************/
const SHEET_ID = '1ZYDo3phbc-IhaD-blVlaH7gbYkoyjhhX-I7Dtm06Cuo';
const params = new URLSearchParams(window.location.search);
const catalogoSeleccionado = params.get('catalogo') || 'ClienteA';
koyjhhX-I7Dtm06Cuo';
const params = new URLSearchParams(window.location.search);
const catalogoSeleccionado = params.get('catalogo') || 'ClienteA';
const SHEET_URL = `https://opensheet.elk.sh/${SHEET_IDconst SHEET_URL = `https://opensheet.elk.sh/${SHEET_ID}/${catalogoSeleccion}/${catalogoSeleccionado}`;

/****************************************************
 * CONFIGURACIÓN GOOGLE FORMS
 ************************************************ado}`;

/****************************************************
 * CONFIGURACIÓN GOOGLE FORMS
 ****************************************************/
const FORM****/
const FORM_URL =
  'https://docs.google.com/forms_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSe4qzkJIvgWWS0OhKrrOu2BJbuaHRNR5skoWo/d/e/1FAIpQLSe4qzkJIvgWWS0OhKrrOu2BJbuaHRNR5skoWoFQW3Sv-3430Q/formResponse';

const ENTRY = {
  nombreFQW3Sv-3430Q/formResponse';

const ENTRY = {
  nombre: 'entry.313556667',
  telefono: 'entry.675797328',
: 'entry.313556667',
  telefono: 'entry.675797328',
  direccion: 'entry  direccion: 'entry.1917704239',
  email: 'entry.865391267',
  pedido: 'entry.1917704239',
  email: 'entry.865391267',
  pedido: 'entry.889150100',
  total: 'entry.1238815983'
};

/****************************************************
 * VARIABLES.889150100',
  total: 'entry.1238815983'
};

/****************************************************
 * VARIABLES GLOBALES
 ****************************************************/
let productos = [];
let carrito = JSON.parse(localStorage.getItem('amat_carrito_v1') || '[]');

/****************************************************
 * UTILIDADES
 ****************************************************/
// Debounce helper: evita ejecutar GLOBALES
 ****************************************************/
let productos = [];
let carrito = JSON.parse(localStorage.getItem('amat_carrito_v1') || '[]');

/****************************************************
 * UTILIDADES
 ****************************************************/
// Debounce helper: evita ejecutar la búsqueda en cada tecla
function debounce la búsqueda en cada tecla
function debounce(fn, wait = 220) {
  let t;
  return (...args) => {
    clearTimeout(fn, wait = 220) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

function escapeHtml(str) {
  if (str === null || str === undefined) return), wait);
  };
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
 '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/************************************************quot;')
    .replace(/'/g, '&#039;');
}

/****************************************************
 * DOM READY
 ****************************************************/
document.add****
 * DOM READY
 ****************************************************/
document.addEventListener('DOMContentLoaded', () => {
  const catalogoEventListener('DOMContentLoaded', () => {
  const catalogoEl = document.getElementById('catalogo');
  const cartBtn = document.getEl = document.getElementById('catalogo');
  const cartBtn = document.getElementById('cart-btn');
  const cartBadge = document.getElementById('cart-badge');
  constElementById('cart-btn');
  const cartBadge = document.getElementById('cart-badge');
  const cartPanel = document.getElementById('cart-panel');
  const overlay = document.getElementById(' cartPanel = document.getElementById('cart-panel');
  const overlay = document.getElementById('overlay');
  const cartBody = document.getElementById('cart-body');
  const cartTotalEl = document.getElementById('cart-total');
  const closeCart = documentoverlay');
  const cartBody = document.getElementById('cart-body');
  const cartTotalEl = document.getElementById('cart-total');
  const.getElementById('close-cart');
  const submitBtn = document.getElementById('submit-order');

 closeCart = document.getElementById('close-cart');
  const submitBtn = document.getElementById('submit-order');

  const searchInput = document.getElementById('search');
  const clearBtn = document.getElement  const searchInput = document.getElementById('search');
  const clearBtn = document.getElementById('clear-search'); // opcional en HTML
  const categoryButtons = document.querySelectorAll('.filter-btn');

ById('clear-search'); // opcional en HTML
  const categoryButtons = document.querySelectorAll('.filter-btn');

  let activeCategory = 'todos';
  let lastSearch = '';

  /****************************************************
   * CARGAR  let activeCategory = 'todos';
  let lastSearch = '';

  /****************************************************
   * CARGAR PRODUCTOS
   ****************************************************/
  async function cargarProductos PRODUCTOS
   ****************************************************/
  async function cargarProductos() {
    try {
      const res = await fetch(SHEET_URL);
      if (!res() {
    try {
      const res = await fetch(SHEET_URL);
      if (!res.ok) throw new Error('Error al cargar Sheet');
      const data = await res.json();

      productos.ok) throw new Error('Error al cargar Sheet');
      const data = await res.json();

      productos = data.map(row => = data.map(row => ({
        id: String(row.id || Math.random().toString(36). ({
        id: String(row.id || Math.random().toString(36).slice(2, 9)),
        nombre: row.nombre || '',
        descripcion: row.descripcion || '',
        precioslice(2, 9)),
        nombre: row.nombre || '',
        descripcion: row.descripcion || '',
        precio: Number(row.precio) || 0,
        precioMayoreo: Number: Number(row.precio) || 0,
        precioMayoreo: Number(row.precio_mayoreo) || 0,
        minMayoreo: Number(row.minimo_mayoreo)(row.precio_mayoreo) || 0,
        minMayoreo: Number(row.minimo_mayoreo) || 0,
        categoria: (row.categoria || 'Otros').trim(),
        // Si la celda está vac || 0,
        categoria: (row.categoria || 'Otros').trim(),
        // Si la celda está vacía => [], si hay 1 color => ['Rojo'], si hay varios => ['Rojo','Azul']
        coloresía => [], si hay 1 color => ['Rojo'], si hay varios => ['Rojo','Azul']
        colores: row.colores
          ? row.colores.split(',').map(c => c.trim()).filter(Boolean)
          : [],
        imagen: row: row.colores
          ? row.colores.split(',').map(c => c.trim()).filter(Boolean)
          : [],
        imagen: row.imagen || ''
      }));

      applyFilters();
    } catch (err) {
     .imagen || ''
      }));

      applyFilters();
    } catch (err) {
      console.error(err);
      alert('No se pudieron cargar los productos');
    }
  }

  /************************************************ console.error(err);
      alert('No se pudieron cargar los productos');
    }
  }

  /****************************************************
   * RENDER CATÁLOGO (acepta****
   * RENDER lista opcional)
   ****************************************************/
  function renderProductos(lista = productos) {
    if (!catalogoEl) return;
    CATÁLOGO (acepta lista opcional)
   ****************************************************/
  function renderProductos(lista = productos) {
    if (!catalogoEl) return;
    catalogoEl.innerHTML = '';

    if (!lista || lista.length === 0) {
 catalogoEl.innerHTML = '';

    if (!lista || lista.length === 0) {
      catalogoEl.innerHTML = '<div style="padding:18px;color:#6b7280">No hay productos      catalogoEl.innerHTML = '<div style="padding:18px;color:#6b7280">No hay productos</div>';
      return</div>';
      return;
    }

    lista.forEach(p => {
      const card;
    }

    lista.forEach(p => {
      const card = document.createElement('article');
      card.className = 'card';

      let colorHTML = '';
      // Mostrar selector solo si = document.createElement('article');
      card.className = 'card';

      let colorHTML = '';
      // Mostrar selector solo si hay más de 1 color
      if (Array.isArray(p.colores) && p.colores.length > 1) {
        colorHTML = `
          hay más de 1 color
      if (Array.isArray(p.colores) && p.colores.length > 1) {
        color <select class="color-select" data-id="${escapeHtml(p.id)}">
            ${p.colores.map(c =>HTML = `
          <select class="color-select" data-id="${escapeHtml(p.id)}">
            ${p.colores.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('')}
          </select>
        `;
      }

      card.innerHTML = `
        <img src="${escapeHtml(p.imagen)}" alt="${escapeHtml(p.nombre)}">
        <h3>${escapeHtml(p.nombre)}</h3>
        <div class="price">$${Number(p.precio).toFixed(2)} MX('')}
          </select>
        `;
      }

      card.innerHTML = `
        <img src="${escapeHtml(p.imagen)}" alt="${escapeHtml(p.nombre)}">
        <h3>${escapeHtml(p.nombre)}</h3>
        <div class="price">$${Number(p.precN</div>
        <div style="font-size:13px;color:#16a34a;margin-bottom:8px">
          Mayoreoio).toFixed(2)} MXN</div>
        <div style="font-size:13px;color:#16a34a;margin-bottom:8px">
          Mayoreo: $${Number(p.precioMayoreo).toFixed: $${Number(p.precioMayoreo).toFixed(2)} desde ${p.minMayoreo} pzas
        </div>
        ${colorHTML}
       (2)} desde ${p.minMayoreo} pzas
        </div>
        ${colorHTML}
        <button class="btn" data-id="${escapeHtml(p.id)}">Agregar al carrito</button>
      `;

      catalogoEl.appendChild(card);
    });
  }

 <button class="btn" data-id="${escapeHtml(p.id)}">Agregar al carrito</button>
      `;

      catalogoEl.appendChild(card);
    });
  }

  /************************************************  /****************************************************
   * FILTRADO****
   * FILTRADO (búsqueda + categoría)
   ****************************************************/
  function applyFilters() {
    const q = (last (búsqueda + categoría)
   ****************************************************/
  function applyFilters() {
    const q = (lastSearch || '').trim().toLowerCase();

    const filtrados = productos.filter(p => {
      const nombre = (p.nombreSearch || '').trim().toLowerCase();

    const filtrados = productos.filter(p => {
      const nombre = (p.nombre || '').toLowerCase();
      const descripcion = (p.descripcion || '').toLowerCase();
      const categoria = (p.categoria || || '').toLowerCase();
      const descripcion = (p.descripcion || '').toLowerCase();
      const categoria '').toLowerCase();

      const textMatch = q === '' || nombre.includes(q) || descripcion = (p.categoria || '').toLowerCase();

      const textMatch = q === '' || nombre.includes(q) || descripcion.includes(q);
      const catMatch = activeCategory === 'todos' || categoria === activeCategory;

      return text.includes(q);
      const catMatch = activeCategory === 'todos' || categoria === activeCategory;

      return textMatch && catMatch;
    });

    renderProductos(filtrados);
  }

  /****************************************************
   * BUSCADOR (con debounce) y botón limpiarMatch && catMatch;
    });

    renderProductos(filtrados);
  }

  /****************************************************
   * BUSCADOR (con debounce) y botón limpiar
   ************************************************
   ****************************************************/
  function updateClearBtn() {
    if (!searchInput || !clearBtn) return;
    clearBtn.hidden = searchInput.value.trim() === '';
  }

  const debouncedApply = debounce****/
  function updateClearBtn() {
    if (!searchInput || !clearBtn) return;
    clearBtn.hidden = searchInput.value.trim() === '';
  }

  const debouncedApply = debounce(() => {
    lastSearch = searchInput ? searchInput.value || '' : '';
    applyFilters();
    updateClearBtn();
  }, 220);

  if (searchInput(() => {
    lastSearch = searchInput ? searchInput.value || '' : '';
    applyFilters();
    updateClearBtn();
  }, 220);

  if (searchInput) {
    // Usamos debounce para mejorar rendimiento
    searchInput.addEventListener('input', debouncedApply);

    // Enter ejecuta búsqueda inmediata
    search) {
    // Usamos debounce para mejorar rendimiento
    searchInput.addEventListener('input', debouncedApply);

    // Enter ejecuta búsqueda inmediata
    searchInput.addEventListener('keydown', (e) => {
      if (e.keyInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        lastSearch = searchInput.value || '';
        applyFilters();
        updateClearBtn();
      === 'Enter') {
        e.preventDefault();
        lastSearch = searchInput.value || '';
        applyFilters();
        updateClearBtn();
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (!searchInput) return;
      searchInput.value = '';
      lastSearch = '';
      applyFilters();
     ', () => {
      if (!searchInput) return;
      searchInput.value = '';
      lastSearch = '';
      applyFilters();
      updateClearBtn();
      searchInput.focus();
    });
 updateClearBtn();
      searchInput.focus();
    });
  }

  /****************************************************
   * BOTONES DE CATEGORÍA
   ****************************************************/
  if (categoryButtons && categoryButtons.length) {
    categoryButtons  }

  /****************************************************
   * BOTONES DE CATEGORÍA
   ****************************************************/
  if (categoryButtons && categoryButtons.length) {
    categoryButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        categoryButtons.forEach(b => b.classList.remove('active'));
        btn.forEach(btn => {
      btn.addEventListener('click', () => {
        categoryButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        activeCategory = (btn.dataset.filter || 'Todos').toString().trim().toLower.classList.add('active');

        activeCategory = (btn.dataset.filter || 'Todos').toString().trim().toLowerCase();
        applyFilters();
      });
    });
  }

Case();
        applyFilters();
      });
    });
  }

  /****************************************************
   * CARRITO
   ****************************************************/
  function saveCart() {
    localStorage.setItem('amat_carrito  /****************************************************
   * CARRITO
   ****************************************************/
  function saveCart() {
    localStorage.setItem('amat_carrito_v1', JSON.stringify_v1', JSON.stringify(carrito));
  }

  function updateBadge() {
    const cantidad = carrito.reduce((s, i) => s + (i.cantidad(carrito));
  }

  function updateBadge() {
    const cantidad = carrito.reduce((s, i) => s + (i.cantidad || 0), 0);
    if (!cartBadge) return;
    cartBadge.style.display = cantidad > 0 ? 'flex' : ' || 0), 0);
    if (!cartBadge) return;
    cartBadge.style.display = cantidad > 0 ? 'flex' : 'none';
    cartBadge.textContent = cantidad;
  }

  function renderCart() {
    if (!cartBody || !cartTotalElnone';
    cartBadge.textContent = cantidad;
  }

  function renderCart() {
    if (!cartBody || !cartTotalEl) return;
    cartBody.innerHTML = '';

    if (carrito.length === ) return;
    cartBody.innerHTML = '';

    if (carrito.length === 0) {
      cartBody0) {
      cartBody.innerHTML =
        '<div style="padding:18px;color:#6b7280">Tu carrito está vacío</div>';
      cart.innerHTML =
        '<div style="padding:18px;color:#6b7280">Tu carrito está vacío</div>';
      cartTotalEl.textContent = '0';
      updateBadge();
      return;
    }

    let total = 0;

    carrito.forEachTotalEl.textContent = '0';
      updateBadge();
      return;
    }

    let total = 0;

   ((item, index) => {
      const precioUnit =
        item.cantidad >= item.minMayoreo
          ? item.precioMayoreo
          : item.precio;

      total += precioUnit * item.cantidad;

      // Mostrar color solo si item.color tiene contenido
      const nombreConColor = item.color && item.color.toString().trim() !== ''
        ? `${escapeHtml(item.nombre)} (${escapeHtml(item.color)})`
        : escapeHtml(item.nombre);

      const node = document.createElement('div');
      node.className = 'cart-item';

      node.innerHTML = `
        <img src="${escapeHtml(item.imagen)}">
        <div class="meta">
          <b>${nombreConColor}</b>
          <div style="font-size:13px;color:#6b7280">
            $${Number(precioUnit).toFixed(2)} MXN c/u
          </div>
        </div>
        <div>
          <input class="qty" type="number" min="1" value="${item.cantidad}" data-index="${index}">
          <button class="small-btn" data-remove="${index}">Eliminar</button>
        </div>
      `;

      cartBody.appendChild(node);
    });

    cartTotalEl.textContent = total.toFixed(2);
    update);

      const node = document.createElement('div');
      node.className = 'cart-item';

      node.innerHTML = `
        <img src="${escapeHtml(item.imagen)}">
        <div class="meta">
          <b>${nombreConColor}</b>
          <div style="font-size:13px;color:#6b7280">
            $${Number(precioUnit).toFixed(2)} MXN c/u
          </div>
        </div>
        <div>
          <input class="qty" type="number" min="1" value="${item.cantidad}" data-index="${index}">
          <button class="small-btn" data-remove="${index}">Eliminar</button>
        </div>
      `;

      cartBody.appendChild(node);
    });

    cartTotalEl.textContent = total.toFixed(2);
    updateBadge();
  }

  /****************************************************
   * EVENTOS CATÁLOGO (agregar al carrito)
   ****************************************************/
  if (catalogBadge();
  }

  /****************************************************
   * EVENTOS CATÁLOGO (agregar al carrito)
   ****************************************************/
  if (catalogoEl) {
    catalogoEl) {
    catalogoEl.addEventListener('click', e => {
      const btn = e.target.closest('button[data-id]');
      if (!btn) return;

     oEl.addEventListener('click', e => {
      const btn = e.target.closest('button[data-id]');
      if (!btn) return;

      const id = String(btn.dataset.id);
      const p = productos.find(x => String const id = String(btn.dataset.id);
      const p = productos(x.id) === id);
      if (!p) return;

      // Si existe select (varios colores) usamos su valor.
      // Si no.find(x => String(x.id) === id);
      if (!p) return;

      // Si existe select (varios colores) usamos su valor.
      // Si no existe select pero p.colores tiene al menos 1 elemento, usamos el primero.
      // Si no hay colores, dejamos existe select pero p.colores tiene al menos 1 elemento, usamos el primero.
      // Si no hay colores, dejamos color como cadena vacía ''.
      const select = document.querySelector(`.color-select[data color como cadena vacía ''.
      const select = document.querySelector(`.color-select[data-id="${id}"]`);
      const color = select
        ? select.value
        : (Array.isArray(p.colores) && p.colores.length > 0 ? p.colores[0] : '');

      const existing = carrito.find(x => String(x.id) === String(p.id) && x.color === color);

      if (existing) existing.cantidad = (existing.cantidad-id="${id}"]`);
      const color = select
        ? select.value
        : (Array.isArray(p.colores) && p.colores.length > 0 ? p.colores[0] : '');

      const existing = carrito.find(x => String(x.id) === String(p.id) && x.color === color);

      if (existing) existing.cantidad = (existing.cantidad || 0) + 1;
      else carrito.push({ ...p, color, cantidad: 1 });

      save || 0) + 1;
      else carrito.push({ ...p, color, cantidadCart();
      renderCart();
    });
  }

  // cambiar cantidad en carrito y eliminar
  if (cartBody) {
    cartBody.addEvent: 1 });

      saveCart();
      renderCart();
    });
  }

  // cambiar cantidad en carrito y eliminar
  if (cartBody) {
    cartBody.addEventListener('change', e => {
      const input = e.target.closest('input.qty');
      if (!input) return;

     Listener('change', e => {
      const input = e.target.closest('input.qty');
      if (!input) return;

      const idx = Number(input.dataset.index);
      carrito[idx].cantidad = parseInt(input.value const idx = Number(input.dataset.index);
      carrito[idx].cantidad = parseInt(input.value, 10) || 1;

      saveCart();
      renderCart();
    });

    cartBody.addEventListener('click', e => {
      const rm = e.target.closest, 10) || 1;

      saveCart();
      renderCart();
    });

    cartBody.addEventListener('click', e => {
      const rm = e.target.closest('button[data-remove]');
      if (!rm) return;

      carrito.splice(Number(rm.dataset.remove), 1);
      saveCart();
      renderCart();
    });
('button[data-remove]');
      if (!rm) return;

      carrito.splice(Number(rm.dataset.remove), 1);
      saveCart();
      renderCart();
    });
  }

  /****************************************************
   * ABRIR / CERRAR CARRITO
   ************************************************  }

  /****************************************************
   * ABRIR / CERRAR CARRITO
   ****************************************************/
  function openCart() {
    if (!cartPanel || !overlay) return;
    cartPanel.classList.add('open');
****/
  function openCart() {
    if (!cartPanel || !overlay) return;
    cartPanel.classList.add('open');
    overlay.classList.add('show');
  }

  function closeCartPanel() {
    if (!cartPanel || !overlay) return;
    cartPanel.class    overlay.classList.add('show');
  }

  function closeCartPanel() {
    if (!cartPanel || !overlay) return;
    cartPanel.classList.remove('open');
    overlay.classList.remove('show');
  }

  if (cartBtn) {
    cartBtn.addEventListener('click', () =>
      cartPanel.classList.contains('open') ? closeCartPanel() : openCart()
    );
  }
  if (closeCart) closeCart.addEventListener('click', closeCartPanel);
  if (overlay) overlay.addEventListener('click', closeCartPanel);

List.remove('open');
    overlay.classList.remove('show');
  }

  if (cartBtn) {
    cartBtn.addEventListener('click', () =>
      cartPanel.classList.contains('open') ? closeCartPanel() : openCart()
    );
  }
  if (closeCart) closeCart.addEventListener('click', closeCartPanel);
  if (overlay) overlay.addEventListener('click', closeCartPanel);

  /****************************************************
   * ENVIAR PEDIDO
   ****************************************************/
  if (submitBtn) {
    submitBtn.addEventListener  /****************************************************
   * ENVIAR PEDIDO
   ****************************************************/
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
('click', () => {
      if (carrito      if (carrito.length === 0) return alert('El carrito está vacío');

      const nombre = document.getElementById('nombre').value.length === 0) return alert('El carrito está vacío');

      const nombre = document.getElementById('nombre').value.trim();
      const telefono = document.getElementById('telefono').value.trim();
      const direccion = document.getElementById('.trim();
      const telefono = document.getElementById('telefono').value.trim();
      const direccion = document.getElementById('direccion').value.trim();
      const email = document.getElementById('email').value.trim();

      if (!nombre || !telefono || !direccion || !email)
       direccion').value.trim();
      const email = document.getElementById('email').value.trim();

      if (!nombre || !telefono || !direccion || !email)
        return alert('Completa tus datos');

      const pedidoTexto = carrito
        .map(i => {
          const nombreConColor = return alert('Completa tus datos');

      const pedidoTexto = carrito
        .map(i => {
          const nombreConColor = i.color && i.color.toString().trim() !== '' ? `${i.nombre} (${i.color i.color && i.color.toString().trim() !== '' ? `${i.nombre} (${i.color})` : i.nombre;
          const precioUnit = i.cantidad >= i.minMayoreo ? i.precioMayoreo : i.precio;
          return `${nombre})` : i.nombre;
          const precioUnit = i.cantidad >= i.minMayoreo ? i.precioMayoreo : i.precio;
          return `${nombreConColor} x${i.cantidad} = $${(precioUnit * i.cantidadConColor} x${i.cantidad} = $${(precioUnit * i.cantidad).toFixed(2)}`;
        })
        .join('\n');

      const fd = new FormData();
      fd.append(ENTRY.nombre, nombre);
      fd.append(ENTRY.telefono, telefono);
      fd.append(ENTRY.direccion, direccion);
      fd.append(ENTRY.email, email);
      fd.append(ENTRY.pedido, pedidoTexto);
      fd).toFixed(2)}`;
        })
        .join('\n');

      const fd = new FormData();
      fd.append(ENTRY.nombre, nombre);
      fd.append(ENTRY.telefono, telefono);
      fd.append(ENTRY.direccion, direccion);
      fd.append(ENTRY.email, email);
      fd.append(ENTRY.pedido, pedidoTexto);
      fd.append(ENTRY.total, cartTotalEl.textContent);

      fetch(FORM_URL, {
        method: 'POST',
        body: fd,
        mode: 'no-cors'
.append(ENTRY.total, cartTotalEl.textContent);

      fetch(FORM_URL, {
        method: 'POST',
        body: fd,
        mode: 'no-cors'
      })
        .then(() => {
          alert('Pedido enviado con éxito');
          carrito = [];
          saveCart();
          renderCart();
          closeCartPanel();
        })
             })
        .then(() => {
          alert('Pedido enviado con éxito');
          carrito = [];
          saveCart();
          renderCart();
          closeCartPanel();
 .catch(() => alert('Error al enviar pedido'));
    });
  }

  /************************************************        })
        .catch(() => alert('Error al enviar pedido'));
    });
  }

  /****************************************************
   * INIT
   ****************************************************/
  renderCart();
  cargarProductos****
   * INIT
   ****************************************************/
  renderCart();
  cargarProductos();
});
```();
});




