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
  "https://docs.google.com/forms/d/e/1FAIpQLSe4qzkJIvgWWS0OhKrrOu2BJbuaHRNR5skoWoFQW3Sv-3430Q/formResponse";

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
 * DOM
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

  /****************************************************
   * CARGAR PRODUCTOS
   ****************************************************/
  async function cargarProductos() {
    try {
      const res = await fetch(SHEET_URL);
      const data = await res.json();

      productos = data.map(row => ({
        id: Number(row.id),
        nombre: row.nombre,
        precio: Number(row.precio),
        precioMayoreo: Number(row.precio_mayoreo),
        minMayoreo: Number(row.minimo_mayoreo),
        colores: row.colores.split(',').map(c => c.trim()),
        imagen: row.imagen
      }));

      renderProductos();
    } catch (err) {
      console.error(err);
      alert('No se pudieron cargar los productos');
    }
  }

  /****************************************************
   * RENDER CATÁLOGO
   ****************************************************/
  function renderProductos() {
    catalogoEl.innerHTML = '';

    productos.forEach((p, i) => {
      const opcionesColores = p.colores
        .map(c => `<option value="${c}">${c}</option>`)
        .join('');

      const card = document.createElement('article');
      card.className = 'card';
      card.innerHTML = `
        <img src="${p.imagen}" alt="${p.nombre}">
        <h3>${p.nombre}</h3>
        <div class="price">$${p.precio} MXN</div>

        <select class="color-select" data-index="${i}">
          ${opcionesColores}
        </select>

        <div style="font-size:13px;color:#16a34a;margin:8px 0">
          Mayoreo: $${p.precioMayoreo} desde ${p.minMayoreo} pzas
        </div>

        <button class="btn" data-index="${i}">Agregar al carrito</button>
      `;

      catalogoEl.appendChild(card);
    });
  }

  /****************************************************
   * CARRITO
   ****************************************************/
  function saveCart() {
    localStorage.setItem('amat_carrito_v1', JSON.stringify(carrito));
  }

  function updateBadge() {
    const totalItems = carrito.reduce((s, i) => s + i.cantidad, 0);
    cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
    cartBadge.textContent = totalItems;
  }

  function renderCart() {
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

      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <img src="${item.imagen}">
        <div class="meta">
          <b>${item.nombre} (${item.color})</b>
          <div style="font-size:13px;color:#6b7280">
            $${precioUnit} MXN c/u
          </div>
        </div>
        <div>
          <input class="qty" type="number" min="1" value="${item.cantidad}" data-index="${index}">
          <button class="small-btn" data-remove="${index}">Eliminar</button>
        </div>
      `;
      cartBody.appendChild(div);
    });

    cartTotalEl.textContent = total;
    updateBadge();
  }

  /****************************************************
   * AGREGAR AL CARRITO
   ****************************************************/
  catalogoEl.addEventListener('click', e => {
    const btn = e.target.closest('button[data-index]');
    if (!btn) return;

    const idx = Number(btn.dataset.index);
    const producto = productos[idx];
    const selectColor = document.querySelector(`select[data-index="${idx}"]`);
    const colorSeleccionado = selectColor.value;

    const existente = carrito.find(
      i => i.id === producto.id && i.color === colorSeleccionado
    );

    if (existente) {
      existente.cantidad++;
    } else {
      carrito.push({
        ...producto,
        color: colorSeleccionado,
        cantidad: 1
      });
    }

    saveCart();
    renderCart();
  });

  /****************************************************
   * EVENTOS CARRITO
   ****************************************************/
  cartBody.addEventListener('change', e => {
    const input = e.target.closest('.qty');
    if (!input) return;

    carrito[input.dataset.index].cantidad = parseInt(input.value) || 1;
    saveCart();
    renderCart();
  });

  cartBody.addEventListener('click', e => {
    const rm = e.target.closest('button[data-remove]');
    if (!rm) return;

    carrito.splice(rm.dataset.remove, 1);
    saveCart();
    renderCart();
  });

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
    cartPanel.classList.contains('open') ? closeCartPanel() : openCart()
  );
  closeCart.addEventListener('click', closeCartPanel);
  overlay.addEventListener('click', closeCartPanel);

  /****************************************************
   * ENVIAR PEDIDO
   ****************************************************/
  submitBtn.addEventListener('click', () => {
    if (carrito.length === 0) return alert('Carrito vacío');

    const nombre = nombreInput.value.trim();
    const telefono = telefonoInput.value.trim();
    const direccion = direccionInput.value.trim();
    const email = emailInput.value.trim();

    if (!nombre || !telefono || !direccion || !email)
      return alert('Completa tus datos');

    const pedido = carrito
      .map(i => `${i.nombre} (${i.color}) x${i.cantidad}`)
      .join('\n');

    const fd = new FormData();
    fd.append(ENTRY.nombre, nombre);
    fd.append(ENTRY.telefono, telefono);
    fd.append(ENTRY.direccion, direccion);
    fd.append(ENTRY.email, email);
    fd.append(ENTRY.pedido, pedido);
    fd.append(ENTRY.total, cartTotalEl.textContent);

    fetch(FORM_URL, { method: 'POST', body: fd, mode: 'no-cors' })
      .then(() => {
        alert('Pedido enviado');
        carrito = [];
        saveCart();
        renderCart();
        closeCartPanel();
      });
  });

  /****************************************************
   * INIT
   ****************************************************/
  cargarProductos();
  renderCart();
});



