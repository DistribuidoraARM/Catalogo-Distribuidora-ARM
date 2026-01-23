/****************************************************
 * CONFIGURACIÓN GOOGLE SHEETS
 ****************************************************/
const SHEET_ID = '1ZYDo3phbc-IhaD-blVlaH7gbYkoyjhhX-I7Dtm06Cuo';
const params = new URLSearchParams(window.location.search);
const catalogoSeleccionado = params.get('catalogo') || 'ClienteA';
const SHEET_URL = `https://opensheet.elk.sh/${SHEET_ID}/${catalogoSeleccionado}`;

/****************************************************
 * CONFIGURACIÓN GOOGLE FORMS
 ****************************************************/
const FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSe4qzkJIvgWWS0OhKrrOu2BJbuaHRNR5skoWoFQW3Sv-3430Q/formResponse';

const ENTRY = {
  nombre: 'entry.313556667',
  telefono: 'entry.675797328',
  direccion: 'entry.1917704239',
  email: 'entry.865391267',
  pedido: 'entry.889150100',
  total: 'entry.1238815983'
};

/****************************************************
 * VARIABLES GLOBALES
 ****************************************************/
let productos = [];
let carrito = JSON.parse(localStorage.getItem('amat_carrito_v1') || '[]');

/****************************************************
 * DOM READY
 ****************************************************/
document.addEventListener('DOMContentLoaded', () => {
  const catalogoEl = document.getElementById('catalogo');
  const cartBtn = document.getElementById('cart-btn');
  const cartBadge = document.getElementById('cart-badge');
  const cartPanel = document.getElementById('cart-panel');
  const overlay = document.getElementById('overlay');
  const cartBody = document.getElementById('cart-body');
  const cartTotalEl = document.getElementById('cart-total');
  const closeCart = document.getElementById('close-cart');
  const submitBtn = document.getElementById('submit-order');

  const searchInput = document.getElementById('search');
  const categoryButtons = document.querySelectorAll('.filter-btn');

  let activeCategory = 'todos'; // valor por defecto (coincide con data-filter "Todos")
  let lastSearch = '';

  /****************************************************
   * CARGAR PRODUCTOS
   ****************************************************/
  async function cargarProductos() {
    try {
      const res = await fetch(SHEET_URL);
      if (!res.ok) throw new Error('Error al cargar Sheet');
      const data = await res.json();

      productos = data.map(row => ({
        id: String(row.id || Math.random().toString(36).slice(2, 9)), // asegurar id único como string
        nombre: row.nombre || '',
        descripcion: row.descripcion || '',
        precio: Number(row.precio) || 0,
        precioMayoreo: Number(row.precio_mayoreo) || 0,
        minMayoreo: Number(row.minimo_mayoreo) || 0,
        categoria: (row.categoria || 'Otros').trim(),
        colores: row.colores
          ? row.colores.split(',').map(c => c.trim())
          : ['Único'],
        imagen: row.imagen || ''
      }));

      // Mostrar inicialmente aplicando filtros (vacío + todos)
      applyFilters();
    } catch (err) {
      console.error(err);
      alert('No se pudieron cargar los productos');
    }
  }

  /****************************************************
   * RENDER CATÁLOGO (acepta lista opcional)
   ****************************************************/
  function renderProductos(lista = productos) {
    if (!catalogoEl) return;
    catalogoEl.innerHTML = '';

    if (!lista || lista.length === 0) {
      catalogoEl.innerHTML = '<div style="padding:18px;color:#6b7280">No hay productos</div>';
      return;
    }

    lista.forEach(p => {
      const card = document.createElement('article');
      card.className = 'card';

      let colorHTML = '';
      if (p.colores && p.colores.length > 1) {
        colorHTML = `
          <select class="color-select" data-id="${p.id}">
            ${p.colores.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('')}
          </select>
        `;
      }

      card.innerHTML = `
        <img src="${escapeHtml(p.imagen)}" alt="${escapeHtml(p.nombre)}">
        <h3>${escapeHtml(p.nombre)}</h3>
        <div class="price">$${Number(p.precio).toFixed(2)} MXN</div>
        <div style="font-size:13px;color:#16a34a;margin-bottom:8px">
          Mayoreo: $${Number(p.precioMayoreo).toFixed(2)} desde ${p.minMayoreo} pzas
        </div>
        ${colorHTML}
        <button class="btn" data-id="${p.id}">Agregar al carrito</button>
      `;

      catalogoEl.appendChild(card);
    });
  }

  // pequeña función para escapar texto en templates
  function escapeHtml(str) {
    if (!str && str !== 0) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /****************************************************
   * FILTRADO (búsqueda + categoría)
   ****************************************************/
  function applyFilters() {
    const q = (lastSearch || '').trim().toLowerCase();

    const filtrados = productos.filter(p => {
      const nombre = (p.nombre || '').toLowerCase();
      const descripcion = (p.descripcion || '').toLowerCase();
      const categoria = (p.categoria || '').toLowerCase();

      const textMatch = q === '' || nombre.includes(q) || descripcion.includes(q);
      const catMatch = activeCategory === 'todos' || categoria === activeCategory;

      return textMatch && catMatch;
    });

    renderProductos(filtrados);
  }

  /****************************************************
   * BUSCADOR
   ****************************************************/
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      lastSearch = e.target.value || '';
      applyFilters();
    });
  }

  /****************************************************
   * BOTONES DE CATEGORÍA
   ****************************************************/
  if (categoryButtons && categoryButtons.length) {
    categoryButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // actualizar estado visual
        categoryButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // normalizar valor a minúsculas para comparar
        activeCategory = (btn.dataset.filter || 'Todos').toString().trim().toLowerCase();
        applyFilters();
      });
    });
  }

  /****************************************************
   * CARRITO
   ****************************************************/
  function saveCart() {
    localStorage.setItem('amat_carrito_v1', JSON.stringify(carrito));
  }

  function updateBadge() {
    const cantidad = carrito.reduce((s, i) => s + (i.cantidad || 0), 0);
    if (!cartBadge) return;
    cartBadge.style.display = cantidad > 0 ? 'flex' : 'none';
    cartBadge.textContent = cantidad;
  }

  function renderCart() {
    if (!cartBody || !cartTotalEl) return;
    cartBody.innerHTML = '';

    if (carrito.length === 0) {
      cartBody.innerHTML =
        '<div style="padding:18px;color:#6b7280">Tu carrito está vacío</div>';
      cartTotalEl.textContent = '0';
      updateBadge();
      return;
    }

    let total = 0;

    carrito.forEach((item, index) => {
      const precioUnit =
        item.cantidad >= item.minMayoreo
          ? item.precioMayoreo
          : item.precio;

      total += precioUnit * item.cantidad;

      const node = document.createElement('div');
      node.className = 'cart-item';

      node.innerHTML = `
        <img src="${escapeHtml(item.imagen)}">
        <div class="meta">
          <b>${escapeHtml(item.nombre)} (${escapeHtml(item.color)})</b>
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
  if (catalogoEl) {
    catalogoEl.addEventListener('click', e => {
      const btn = e.target.closest('button[data-id]');
      if (!btn) return;

      const id = String(btn.dataset.id);
      const p = productos.find(x => String(x.id) === id);
      if (!p) return;

      const select = document.querySelector(`.color-select[data-id="${id}"]`);
      const color = select ? select.value : (p.colores && p.colores[0]) || 'Único';

      const existing = carrito.find(x => String(x.id) === String(p.id) && x.color === color);

      if (existing) existing.cantidad = (existing.cantidad || 0) + 1;
      else carrito.push({ ...p, color, cantidad: 1 });

      saveCart();
      renderCart();
    });
  }

  // cambiar cantidad en carrito
  if (cartBody) {
    cartBody.addEventListener('change', e => {
      const input = e.target.closest('input.qty');
      if (!input) return;

      const idx = Number(input.dataset.index);
      carrito[idx].cantidad = parseInt(input.value, 10) || 1;

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
  }

  /****************************************************
   * ABRIR / CERRAR CARRITO
   ****************************************************/
  function openCart() {
    if (!cartPanel || !overlay) return;
    cartPanel.classList.add('open');
    overlay.classList.add('show');
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

  /****************************************************
   * ENVIAR PEDIDO
   ****************************************************/
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      if (carrito.length === 0) return alert('El carrito está vacío');

      const nombre = document.getElementById('nombre').value.trim();
      const telefono = document.getElementById('telefono').value.trim();
      const direccion = document.getElementById('direccion').value.trim();
      const email = document.getElementById('email').value.trim();

      if (!nombre || !telefono || !direccion || !email)
        return alert('Completa tus datos');

      const pedidoTexto = carrito
        .map(
          i =>
            `${i.nombre} (${i.color}) x${i.cantidad} = $${(
              (i.cantidad >= i.minMayoreo ? i.precioMayoreo : i.precio) *
              i.cantidad
            ).toFixed(2)}`
        )
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
      })
        .then(() => {
          alert('Pedido enviado con éxito');
          carrito = [];
          saveCart();
          renderCart();
          closeCartPanel();
        })
        .catch(() => alert('Error al enviar pedido'));
    });
  }

  /****************************************************
   * INIT
   ****************************************************/
  // render del carrito guardado
  renderCart();
  // cargar productos desde Google Sheet
  cargarProductos();
});


