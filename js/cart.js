/* KIHAP - Carrito en memoria (vanilla) - sin localStorage por ahora */
let cart = [
  { product: products[0], size: '160', color: null, qty: 1 },
  { product: products[2], size: 'M', color: '#C41E3A', qty: 1 },
];

function cartCount() {
  return cart.reduce((s, i) => s + i.qty, 0);
}
function cartSubtotal() {
  return cart.reduce((s, i) => s + i.qty * i.product.price, 0);
}
function shippingCost() {
  return cart.length ? 4500 : 0;
}

function updateCartBadge() {
  const el = document.getElementById('cartBadge');
  if (el) el.textContent = cartCount();
}

function showToast(text) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  document.getElementById('toastText').textContent = text;
  toast.classList.add('aviso--visible');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => toast.classList.remove('aviso--visible'), 2000);
}

function quickAddToCart(p) {
  const existing = cart.find((i) => i.product.id === p.id && !i.size && !i.color);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ product: p, size: p.sizes ? p.sizes[0] : null, color: p.colors ? p.colors[0] : null, qty: 1 });
  }
  updateCartBadge();
  showToast('Agregado al carrito');
}

function addDetailToCart(product, size, color, qty) {
  // producto.js puede llamar con args; retrocompatibilidad sin args usa currentProduct global
  const p = product || (typeof currentProduct !== 'undefined' ? currentProduct : null);
  const s = size !== undefined ? size : typeof detailSize !== 'undefined' ? detailSize : null;
  const c = color !== undefined ? color : typeof detailColor !== 'undefined' ? detailColor : null;
  const q = qty || (typeof detailQty !== 'undefined' ? detailQty : 1);
  if (!p) return;
  const existing = cart.find((i) => i.product.id === p.id && i.size === s && i.color === c);
  if (existing) {
    existing.qty += q;
  } else {
    cart.push({ product: p, size: s, color: c, qty: q });
  }
  updateCartBadge();
  showToast('Agregado al carrito');
}

function removeFromCart(idx) {
  cart.splice(idx, 1);
  updateCartBadge();
  if (typeof renderCart === 'function') renderCart();
  if (typeof renderCheckoutSummary === 'function') renderCheckoutSummary();
}
function changeCartQty(idx, delta) {
  cart[idx].qty = Math.max(1, cart[idx].qty + delta);
  updateCartBadge();
  if (typeof renderCart === 'function') renderCart();
  if (typeof renderCheckoutSummary === 'function') renderCheckoutSummary();
}

function cartItemRowHTML(item, idx) {
  const p = item.product;
  const iconColor = p.category === 'cinturones' ? 'var(--ink)' : '#fff';
  const metaParts = [];
  if (item.size) metaParts.push('Talle ' + item.size);
  if (item.color)
    metaParts.push(
      `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${item.color};vertical-align:middle;margin-right:4px;border:1px solid #ddd"></span>Color`,
    );
  return `<div class="carrito__item">
    <div class="carrito__thumb ${catClass[p.category]}"><svg class="icono" style="color:${iconColor}"><use href="#${catIcon[p.category]}"/></svg></div>
    <div>
      <div class="carrito__nombre">${p.name}</div>
      <div class="carrito__meta">${metaParts.join(' · ') || '&nbsp;'}</div>
      <button class="carrito__quitar" data-remove="${idx}">Quitar</button>
    </div>
    <div class="cantidad" style="height:40px;">
      <button class="cantidad__boton" data-qtyminus="${idx}"><svg class="icono"><use href="#i-minus"/></svg></button>
      <span class="cantidad__valor">${item.qty}</span>
      <button class="cantidad__boton" data-qtyplus="${idx}"><svg class="icono"><use href="#i-plus"/></svg></button>
    </div>
    <div class="carrito__precio">${formatPrice(item.qty * p.price)}</div>
  </div>`;
}
