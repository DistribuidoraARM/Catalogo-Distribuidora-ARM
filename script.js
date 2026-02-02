/****************************************************
 * VARIABLES
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

  let activeCategory = 'todos';
  let lastSearch = '';

  /****************************************************
   * CATEGORÍAS AUTOMÁTICAS
   ****************************************************/
  function renderCategoryButtons() {
    const container = document.getElementById('category-buttons');
    if (!container) return;

    const categorias = [
      'todos',
      ...new Set(productos.map(p => (p.categoria || 'otros').toLowerCase()))
    ];

    container.innerHTML = '';

    categorias.forEach((cat, i) => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn';
      if (i === 0) btn.classList.add('active');
      btn.dataset.filter = cat;
      btn.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);

      btn.addEventListener('click', () => {
        container.querySelectorAll('.filter-btn')
          .forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCategory = cat;
        applyFilters();
      });

      container.appendChild(btn);
    });
  }

  /****************************************************
   * CARGAR PRODUCTOS
   ****************************************************/
  async function cargarProductos() {
    try {
      const res = await fetch(SHEET_URL);
      if (!res.ok) throw new Error('Error al cargar Sheet');
      const data = await res.json();

      productos = data.map(row => ({
        id: String(row.id || Math.random().toString(36).slice(2)),
        nombre: row.nombre || '',
        descripcion: row.descripcion || '',
        precio: Number(row.precio) || 0,
        precioMayoreo: Number(row.precio_mayoreo) || 0,
        minMayoreo: Number(row.minimo_mayoreo) || 0,
        categoria: (row.categoria || 'Otros').trim(),
        colores: row.colores
          ? row.colores.split(',').map(c => c.trim()).filter(Boolean)
          : [],
        imagen: row.imagen || ''
      }));

      renderCategoryButtons();   // 👈 AQUÍ ERA CLAVE
      applyFilters();
    } catch (err) {
      console.error(err);
      alert('No se pudieron cargar los productos');
    }
  }

  /****************************************************
   * FILTRADO
   ****************************************************/
  function applyFilters() {
    const q = lastSearch.toLowerCase();

    const filtrados = productos.filter(p => {
      const textMatch =
        p.nombre.toLowerCase().includes(q) ||
        p.descripcion.toLowerCase().includes(q);

      const catMatch =
        activeCategory === 'todos' ||
        p.categoria.toLowerCase() === activeCategory;

      return textMatch && catMatch;
    });

    renderProductos(filtrados);
  }

  /****************************************************
   * RENDER PRODUCTOS
   ****************************************************/
  function renderProductos(lista) {
    catalogoEl.innerHTML = '';

    if (!lista.length) {
      catalogoEl.innerHTML =
        '<div style="padding:18px;color:#6b7280">No hay productos</div>';
      return;
    }

    lista.forEach(p => {
      const card = document.createElement('article');
      card.className = 'card';

      const colorHTML =
        p.colores.length > 1
          ? `<select class="color-select" data-id="${p.id}">
              ${p.colores.map(c => `<option>${c}</option>`).join('')}
            </select>`
          : '';

      card.innerHTML = `
        <img src="${p.imagen}">
        <h3>${p.nombre}</h3>
        <div class="price">$${p.precio.toFixed(2)} MXN</div>
        <div class="mayoreo">
          Mayoreo: $${p.precioMayoreo.toFixed(2)} desde ${p.minMayoreo}
        </div>
        ${colorHTML}
        <button class="btn" data-id="${p.id}">Agregar al carrito</button>
      `;

      catalogoEl.appendChild(card);
    });
  }

  /****************************************************
   * BUSCADOR
   ****************************************************/
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      lastSearch = e.target.value;
      applyFilters();
    });
  }

  /****************************************************
   * CARRITO 
   ****************************************************/
  function saveCart() {
    localStorage.setItem('amat_carrito_v1', JSON.stringify(carrito));
  }

  function updateBadge() {
    const total = carrito.reduce((s, i) => s + i.cantidad, 0);
    cartBadge.style.display = total ? 'flex' : 'none';
    cartBadge.textContent = total;
  }

  function renderCart() {
    cartBody.innerHTML = '';
    let total = 0;

    carrito.forEach((item, i) => {
      const precio =
        item.cantidad >= item.minMayoreo
          ? item.precioMayoreo
          : item.precio;

      total += precio * item.cantidad;

      const div = document.createElement('div');
      div.innerHTML = `
        <strong>${item.nombre} (${item.color || ''})</strong>
        <input type="number" min="1" value="${item.cantidad}" data-i="${i}">
        <button data-rm="${i}">✕</button>
      `;
      cartBody.appendChild(div);
    });

    cartTotalEl.textContent = total.toFixed(2);
    updateBadge();
  }

  /****************************************************
   * ABRIR / CERRAR CARRITO 
   ****************************************************/
  function openCart() {
    cartPanel.classList.add('open');
    overlay.classList.add('show');
  }

  function closeCartPanel() {
    cartPanel.classList.remove('open');
    overlay.classList.remove('show');
  }

  cartBtn.addEventListener('click', () =>
    cartPanel.classList.contains('open')
      ? closeCartPanel()
      : openCart()
  );

  closeCart.addEventListener('click', closeCartPanel);
  overlay.addEventListener('click', closeCartPanel);

  /****************************************************
   * INIT
   ****************************************************/
  renderCart();
  cargarProductos();
});
















