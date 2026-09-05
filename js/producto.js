/* KIHAP - producto.js vanilla - detalle dinámico ?id= */
let currentProduct = products[0];
let detailSize = null;
let detailColor = null;
let detailQty = 1;

function productCardHTML(p) {
  const media = `<div class="tarjeta-producto__media ${catClass[p.category]}"><svg class="icono" style="color:${p.category === 'cinturones' ? 'var(--ink)' : '#fff'}"><use href="#${catIcon[p.category]}"/></svg></div>`;
  return `<div class="tarjeta-producto" data-id="${p.id}">
    ${media}
    <div class="tarjeta-producto__cuerpo">
      <span class="tarjeta-producto__categoria">${catLabel[p.category]}</span>
      <span class="tarjeta-producto__nombre">${p.name}</span>
      <span class="tarjeta-producto__precio">${formatPrice(p.price)}</span>
      <button class="tarjeta-producto__accion" data-quickadd="${p.id}"><svg class="icono" style="width:14px;height:14px"><use href="#i-cart"/></svg> Agregar</button>
    </div>
  </div>`;
}
function productCardHTMLWithBadge(p) {
  let html = productCardHTML(p);
  if (p.badge && !html.includes('tarjeta-producto__etiqueta')) {
    html = html.replace(
      '<svg class="icono"',
      '<span class="tarjeta-producto__etiqueta">' + p.badge + '</span><svg class="icono"',
    );
  }
  return html;
}

function renderDetalle() {
  const p = currentProduct;
  document.getElementById('breadcrumbName').textContent = p.name;
  document.getElementById('detalleCat').textContent = catLabel[p.category];
  document.getElementById('detalleName').textContent = p.name;
  document.getElementById('detallePrice').textContent = formatPrice(p.price);
  document.getElementById('tabDescripcion').innerHTML = `<p>${p.desc}</p>`;

  const mediaColor = catClass[p.category];
  const iconColor = p.category === 'cinturones' ? 'var(--ink)' : '#fff';
  document.getElementById('galleryMain').className = 'galeria__principal ' + mediaColor;
  document.getElementById('galleryMain').innerHTML =
    `<svg class="icono" style="color:${iconColor}"><use href="#${catIcon[p.category]}"/></svg>`;
  document.getElementById('galleryThumbs').innerHTML = [1, 2, 3]
    .map(
      (n, i) =>
        `<div class="galeria__miniatura ${mediaColor} ${i === 0 ? 'galeria__miniatura--activa' : ''}"><svg class="icono" style="color:${iconColor}"><use href="#${catIcon[p.category]}"/></svg></div>`,
    )
    .join('');

  const sizeBlock = document.getElementById('sizeBlock');
  if (p.sizes) {
    sizeBlock.style.display = 'block';
    document.getElementById('sizeRow').innerHTML = p.sizes
      .map(
        (s) =>
          `<button class="opcion ${s === detailSize ? 'opcion--seleccionada' : ''}" data-size="${s}">${s}</button>`,
      )
      .join('');
  } else {
    sizeBlock.style.display = 'none';
  }

  const colorBlock = document.getElementById('colorBlock');
  if (p.colors) {
    colorBlock.style.display = 'block';
    document.getElementById('colorRow').innerHTML = p.colors
      .map(
        (c) =>
          `<button class="opcion__color ${c === detailColor ? 'opcion__color--seleccionada' : ''}" data-color="${c}" style="${c === '#FFFFFF' ? 'border-color:#DDD9CF' : ''}"><i style="background:${c}"></i></button>`,
      )
      .join('');
  } else {
    colorBlock.style.display = 'none';
  }

  document.getElementById('detailQty').textContent = detailQty;

  const related = products.filter((pr) => pr.category === p.category && pr.id !== p.id).slice(0, 4);
  const fallback = related.length ? related : products.filter((pr) => pr.id !== p.id).slice(0, 4);
  document.getElementById('relatedGrid').innerHTML = fallback.map(productCardHTMLWithBadge).join('');
}

function changeDetailQty(delta) {
  detailQty = Math.max(1, detailQty + delta);
  document.getElementById('detailQty').textContent = detailQty;
}
function addDetailToCartHandler() {
  addDetailToCart(currentProduct, detailSize, detailColor, detailQty);
}
function buyNow() {
  addDetailToCart(currentProduct, detailSize, detailColor, detailQty);
  location.href = 'carrito.html';
}

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(location.search);
  const id = Number(params.get('id')) || 1;
  currentProduct = products.find((p) => p.id === id) || products[0];
  detailSize = currentProduct.sizes ? currentProduct.sizes[0] : null;
  detailColor = currentProduct.colors ? currentProduct.colors[0] : null;
  detailQty = 1;
  renderDetalle();

  document.getElementById('sizeRow').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-size]');
    if (btn) {
      detailSize = btn.dataset.size;
      renderDetalle();
    }
  });
  document.getElementById('colorRow').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-color]');
    if (btn) {
      detailColor = btn.dataset.color;
      renderDetalle();
    }
  });
  document.querySelectorAll('.pestanas__boton').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.pestanas__boton').forEach((t) => t.classList.remove('pestanas__boton--activo'));
      document.querySelectorAll('.pestanas__panel').forEach((p) => p.classList.remove('pestanas__panel--activo'));
      tab.classList.add('pestanas__boton--activo');
      document.querySelector(`[data-tabpanel="${tab.dataset.tab}"]`).classList.add('pestanas__panel--activo');
    });
  });
  document.body.addEventListener('click', (e) => {
    const quickBtn = e.target.closest('[data-quickadd]');
    if (quickBtn) {
      e.preventDefault();
      e.stopPropagation();
      const p = products.find((pr) => pr.id === Number(quickBtn.dataset.quickadd));
      quickAddToCart(p);
      return;
    }
    const card = e.target.closest('.tarjeta-producto');
    if (card) {
      location.href = 'producto.html?id=' + card.dataset.id;
    }
  });
});
