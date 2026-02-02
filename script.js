/****************************************************
 * CONFIGURACIÓN GOOGLE SHEETS
 ****************************************************/
const SHEET_ID = '1ZYDo3phbc-IhaD-blVlaH7gbYkoyjhhX-I7Dtm06Cuo';
const params = new URLSearchParams(window.location.search);
const catalogoSeleccionado = params.get('catalogo') || 'ClienteA';
const SHEET_URL = `https://opensheet.elk.sh/${SHEET_ID}/${catalogoSeleccionado}?nocache=${Date.now()}`;

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
  let activeCategory = 'todos';
  let lastSearch = '';

  /****************************************************
   * CARGAR PRODUCTOS
   ****************************************************/
  async function cargarProductos() {
    try {
      const res = await fetch(SHEET_URL);
      if (!res.ok) throw new Error('Error al cargar Sheet');
      const data = await res.json();

      console.log("Primer producto crudo:", data[0]);

      productos = data.map(row => ({
        id: String(row.id || Math.random().toString(36).slice(2, 9)),
        nombre: row.nombre || '',
        descripcion: row.descripcion || '',
        precio: Number(row.precio) || 0,
        precioMayoreo: Number(row.precio_mayoreo) || 0,
        minMayoreo: Number(row.minimo_mayoreo) || 0,
        categoria: (
          row.categoria ||
          row.Categoria ||
          row.categoría ||
          'Otros'
        ).trim(),
        colores: row.colores
          ? row.colores.split(',').map(c => c.trim()).filter(Boolean)
          : [],
        imagenes: row.imagen
          ? row.imagen.split(',').map(url => url.trim()).filter(Boolean)
          : []
      }));

      console.log("Categorías detectadas:", productos.map(p => p.categoria));

      renderCategoryButtons();
      applyFilters();
    } catch (err) {
      console.error(err);
      alert('No se pudieron cargar los productos');
    }
  }

  /****************************************************
   * CATEGORÍAS AUTOMÁTICAS
   ****************************************************/
  function renderCategoryButtons() {
    const container = document.getElementById('category-buttons');
    if (!container) return;

    const categorias = [
      'todos',
      ...new Set(
        productos.map(p => (p.categoria || 'otros').trim().toLowerCase())
      )
    ];

    container.innerHTML = '';

    categorias.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn';
      if (cat === activeCategory) btn.classList.add('active');

      btn.dataset.filter = cat;
      btn.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);

      btn.addEventListener('click', () => {
        container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCategory = cat;
        applyFilters();
      });

      container.appendChild(btn);
    });
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
      const catMatch = activeCategory === 'todos' || categoria === activeCategory.toLowerCase();

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
   * RENDER CATÁLOGO
   ****************************************************/
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

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
      if (Array.isArray(p.colores) && p.colores.length > 1) {
        colorHTML = `
          <select class="color-select" data-id="${escapeHtml(p.id)}">
            ${p.colores.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('')}
          </select>
        `;
      }

      let imagenHTML = '';
      if (Array.isArray(p.imagenes) && p.imagenes.length > 1) {
        const imgs = p.imagenes.map((img, idx) =>
          `<img src="${escapeHtml(img)}" class="carousel-img ${idx === 0 ? 'active' : ''}" alt="${escapeHtml(p.nombre)}">`
        ).join('');
        imagenHTML = `
          <div class="carousel" data-id="${escapeHtml(p.id)}">
            <button class="carousel-btn prev" aria-label="Anterior">‹</button>
            <div class="carousel-track">${imgs}</div>
            <button class="carousel-btn next" aria-label="Siguiente">›</button>
          </div>
        `;
      } else {
        const imgSrc = p.imagenes && p.imagenes.length ? p.imagenes[0] : p.imagen;
        imagenHTML = `<img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(p.nombre)}">`;
      }

      card.innerHTML = `
        <div class="card-image">
          ${imagenHTML}
        </div>
        <div class="card-info">
          <h3>${escapeHtml(p.nombre)}</h3>
          <div class="price">$${Number(p.precio).toFixed(2)} MXN</div>
          <div class="mayoreo">
            Mayoreo: $${Number(p.precioMayoreo).toFixed(2)} desde ${p.minMayoreo} pzas
          </div>
        </div>
        <div class="card-actions">
          ${colorHTML}
          <button class="btn" data-id="${escapeHtml(p.id)}">Agregar al carrito</button>
        </div>
      `;

      catalogoEl.appendChild(card);
    });
  }

  /****************************************************
   * INIT
   ****************************************************/
  renderCart();
  cargarProductos();
});







