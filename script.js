/********************************************
 * CONFIG Google Forms
 ********************************************/
const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSe4qzkJIvgWWS0OhKrrOu2BJbuaHRNR5skoWoFQW3Sv-3430Q/formResponse";
const ENTRY = {
  nombre: 'entry.313556667',
  telefono: 'entry.675797328',
  direccion: 'entry.1917704239',
  email: 'entry.865391267',
  pedido: 'entry.889150100',
  total: 'entry.1238815983'
};

document.addEventListener('DOMContentLoaded', ()=>{

  /********************************************
   * PRODUCTOS — Aquí defines precio y precioMayoreo
   ********************************************/
  const productos = [
    { id:1, nombre:'Sombrero Palma Fina', precio:189, precioMayoreo:160, imagen:'...' },
    { id:2, nombre:'Sombrero Charro Juvenil', precio:249, precioMayoreo:215, imagen:'...' },
    { id:3, nombre:'Sombrero Rancho Premium', precio:329, precioMayoreo:290, imagen:'...' },
    { id:4, nombre:'Sombrero Palmita Económico', precio:129, precioMayoreo:110, imagen:'...' },
    // 👉 en cada producto agregas precioMayoreo
  ];

  /********************************************
   * Estado inicial del carrito
   ********************************************/
  let carrito = JSON.parse(localStorage.getItem('amat_carrito_v1')||'[]');

  /********************************************
   * ELEMENTOS
   ********************************************/
  const catalogoEl = document.getElementById('catalogo');
  const cartBtn = document.getElementById('cart-btn');
  const cartBadge = document.getElementById('cart-badge');
  const cartPanel = document.getElementById('cart-panel');
  const overlay = document.getElementById('overlay');
  const cartBody = document.getElementById('cart-body');
  const cartTotalEl = document.getElementById('cart-total');
  const closeCart = document.getElementById('close-cart');
  const submitBtn = document.getElementById('submit-order');

  /********************************************
   * Render de productos en la página
   ********************************************/
  function renderProductos(){
    catalogoEl.innerHTML = '';
    productos.forEach((p,i)=>{
      const ahorro = p.precio - p.precioMayoreo;

      const card = document.createElement('article');
      card.className = 'card';
      card.innerHTML = `
        <img src="${p.imagen}" alt="${p.nombre}">
        <h3>${p.nombre}</h3>

        <div class="price">
          $${p.precio} MXN
        </div>

        <small class="mayoreo">Precio mayoreo: $${p.precioMayoreo} MXN</small><br>
        <small style="color:#10b981">¡Ahorra $${ahorro} por pieza!</small>

        <button class="btn" data-index="${i}">Agregar al carrito</button>
      `;
      catalogoEl.appendChild(card);
    });
  }

  /********************************************
   * Guardar carrito local
   ********************************************/
  function saveCart(){
    localStorage.setItem('amat_carrito_v1', JSON.stringify(carrito));
  }

  /********************************************
   * Badge carrito
   ********************************************/
  function updateBadge(){
    const cantidad = carrito.reduce((s,i)=>s+i.cantidad,0);
    if(cantidad>0){
      cartBadge.style.display='flex';
      cartBadge.textContent = cantidad;
    }else{
      cartBadge.style.display='none';
    }
  }

  /********************************************
   * Render del carrito
   ********************************************/
  function renderCart(){
    cartBody.innerHTML = '';
    if(carrito.length===0){
      cartBody.innerHTML='<div style="padding:18px;color:var(--muted)">Tu carrito está vacío</div>';
      cartTotalEl.textContent='0';
      updateBadge(); return;
    }

    carrito.forEach((item,index)=>{
      const precioAplicado = item.precioMayoreo;   // 👈 aplicamos SIEMPRE precioMayoreo (por producto)

      const node = document.createElement('div');
      node.className='cart-item';

      node.innerHTML=`
        <img src="${item.imagen}" alt="${item.nombre}">
        <div class="meta">
          <b>${item.nombre}</b>
          <div style="color:var(--muted);font-size:13px">
            $${precioAplicado} c/u (mayoreo)
          </div>
        </div>

        <div style="display:flex;flex-direction:column;align-items:flex-end">
          <input class="qty" type="number" min="1" value="${item.cantidad}" data-index="${index}">
          <button class="small-btn" data-remove="${index}" title="Eliminar">Eliminar</button>
        </div>
      `;

      cartBody.appendChild(node);
    });

    const total = carrito.reduce((s,i)=>s + i.precioMayoreo * i.cantidad,0);

    cartTotalEl.textContent=total;
    updateBadge();
  }

  /********************************************
   * Eventos agregar carrito
   ********************************************/
  catalogoEl.addEventListener('click', e=>{
    const btn = e.target.closest('button[data-index]');
    if(!btn) return;
    const idx = Number(btn.getAttribute('data-index'));
    const p = productos[idx];
    const existing = carrito.find(x=>x.id===p.id);

    if(existing){
      existing.cantidad += 1;
    }else{
      carrito.push({...p,cantidad:1});
    }

    saveCart(); renderCart();
  });

  cartBody.addEventListener('change', e=>{
    const input = e.target.closest('input.qty');
    if(!input) return;
    const index = Number(input.getAttribute('data-index'));
    const val = parseInt(input.value)||1;
    carrito[index].cantidad=val;
    saveCart(); renderCart();
  });

  cartBody.addEventListener('click', e=>{
    const rm = e.target.closest('button[data-remove]');
    if(!rm) return;
    const index = Number(rm.getAttribute('data-remove'));
    carrito.splice(index,1);
    saveCart(); renderCart();
  });

  /********************************************
   * Abrir / cerrar carrito
   ********************************************/
  function openCart(){
    cartPanel.classList.add('open');
    overlay.classList.add('show');
  }
  function closeCartPanel(){
    cartPanel.classList.remove('open');
    overlay.classList.remove('show');
  }
  cartBtn.addEventListener('click', ()=>{ cartPanel.classList.contains('open')?closeCartPanel():openCart(); });
  closeCart.addEventListener('click', closeCartPanel);
  overlay.addEventListener('click', closeCartPanel);

  /********************************************
   * Enviar pedido
   ********************************************/
  submitBtn.addEventListener('click', ()=>{
    if(carrito.length===0){ alert('El carrito está vacío'); return; }

    const nombre = document.getElementById('nombre').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const direccion = document.getElementById('direccion').value.trim();
    const email = document.getElementById('email').value.trim();
    if(!nombre||!telefono||!direccion||!email){
      alert('Completa tus datos'); return;
    }

    const pedidoTexto = carrito.map(i=>`${i.nombre} x${i.cantidad} @ ${i.precioMayoreo}`).join("\n");
    const total = carrito.reduce((s,i)=>s + i.precioMayoreo*i.cantidad,0);

    const fd = new FormData();
    fd.append(ENTRY.nombre,nombre);
    fd.append(ENTRY.telefono,telefono);
    fd.append(ENTRY.direccion,direccion);
    fd.append(ENTRY.email,email);
    fd.append(ENTRY.pedido,pedidoTexto);
    fd.append(ENTRY.total,total);

    submitBtn.disabled=true; submitBtn.textContent='Enviando...';

    fetch(FORM_URL,{method:'POST',body:fd,mode:'no-cors'})
    .then(()=>{
      alert('Pedido enviado. ¡Gracias!');
      carrito=[]; saveCart(); renderCart();
      document.getElementById('nombre').value='';
      document.getElementById('telefono').value='';
      document.getElementById('direccion').value='';
      document.getElementById('email').value='';
      submitBtn.disabled=false; submitBtn.textContent='Finalizar pedido';
      closeCartPanel();
    });
  });

  /********************************************
   * Inicializar
   ********************************************/
  renderProductos();
  renderCart();
});


