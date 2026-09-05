/* KIHAP - Shopping cart (vanilla global) - in-memory, no localStorage yet */

// ─────────────────────────────────────────────
// Shopping cart state
// ─────────────────────────────────------------

/**
 * @typedef {Object} ShoppingCartItem
 * @property {import("./products.js").Product} product - Producto referenciado
 * @property {string|null} size - Talle seleccionado
 * @property {string|null} color - Color hexadecimal seleccionado
 * @property {number} qty - Cantidad en el carrito
 */

const SHIPPING_FLAT_RATE = 4500;
const TOAST_VISIBLE_DURATION_MS = 2000;

/** @type {ShoppingCartItem[]} */
let shoppingCart = [
  { product: PRODUCT_CATALOG[0], size: '160', color: null, qty: 1 },
  { product: PRODUCT_CATALOG[2], size: 'M', color: '#C41E3A', qty: 1 },
];

// ─────────────────────────────────────────────
// Cart calculations
// ─────────────────────────────────------------

/**
 * Obtiene la cantidad total de unidades en el carrito.
 * @returns {number} Cantidad total de productos
 */
function getCartItemCount() {
  return shoppingCart.reduce((totalAccumulator, cartItem) => totalAccumulator + cartItem.qty, 0);
}

/**
 * Calcula el subtotal de todos los ítems del carrito.
 * @returns {number} Monto del subtotal en ARS
 */
function calculateCartSubtotal() {
  return shoppingCart.reduce(
    (totalAccumulator, cartItem) => totalAccumulator + cartItem.qty * cartItem.product.price,
    0
  );
}

/**
 * Calcula el costo de envío con tarifa plana.
 * @returns {number} Monto del envío en ARS
 */
function calculateShippingCost() {
  return shoppingCart.length ? SHIPPING_FLAT_RATE : 0;
}

// Backwards-compatible aliases for inline page scripts
function cartCount() {
  return getCartItemCount();
}

function cartSubtotal() {
  return calculateCartSubtotal();
}

function shippingCost() {
  return calculateShippingCost();
}

// ─────────────────────────────────────────────
// Cart UI helpers
// ─────────────────────────────────------------

/**
 * Actualiza el contador de la insignia del carrito en el encabezado.
 */
function updateCartBadge() {
  const cartBadgeElement = document.getElementById('cartBadge');

  if (cartBadgeElement) {
    cartBadgeElement.textContent = getCartItemCount();
  }
}

/**
 * Muestra una notificación toast temporal.
 * @param {string} messageText - Texto a mostrar en el toast
 */
function showToast(messageText) {
  const toastElement = document.getElementById('toast');

  if (!toastElement) {
    return;
  }

  const toastTextElement = document.getElementById('toastText');
  toastTextElement.textContent = messageText;

  toastElement.classList.add('aviso--visible');

  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(
    () => toastElement.classList.remove('aviso--visible'),
    TOAST_VISIBLE_DURATION_MS
  );
}

// ─────────────────────────────────────────────
// Cart mutations
// ─────────────────────────────────------------

/**
 * Agrega rápidamente un producto al carrito usando su talle y color por defecto.
 * @param {import("./products.js").Product} product - Producto a agregar
 */
function quickAddToCart(product) {
  const existingCartItem = shoppingCart.find(
    (cartItem) => cartItem.product.id === product.id && !cartItem.size && !cartItem.color
  );

  if (existingCartItem) {
    existingCartItem.qty += 1;
  } else {
    const defaultSize = product.sizes ? product.sizes[0] : null;
    const defaultColor = product.colors ? product.colors[0] : null;

    shoppingCart.push({
      product: product,
      size: defaultSize,
      color: defaultColor,
      qty: 1,
    });
  }

  updateCartBadge();
  showToast('Agregado al carrito');
}

/**
 * Agrega la selección de detalle de producto al carrito.
 * Mantiene compatibilidad con las globales de producto.js
 * (currentProduct / detailSize / detailColor / detailQty).
 * @param {import("./products.js").Product|null} targetProduct - Producto a agregar
 * @param {string|null} selectedSize - Talle elegido
 * @param {string|null} selectedColor - Color hexadecimal elegido
 * @param {number} requestedQuantity - Cantidad a agregar
 */
function addDetailToCart(targetProduct, selectedSize, selectedColor, requestedQuantity) {
  const effectiveProduct =
    targetProduct || (typeof selectedProduct !== 'undefined' ? selectedProduct : null) ||
    (typeof currentProduct !== 'undefined' ? currentProduct : null);

  const effectiveSize =
    selectedSize !== undefined
      ? selectedSize
      : typeof selectedSize !== 'undefined' && selectedSize !== null
        ? selectedSize
        : typeof detailSize !== 'undefined'
          ? detailSize
          : null;

  const effectiveColor =
    selectedColor !== undefined
      ? selectedColor
      : typeof selectedColor !== 'undefined' && selectedColor !== null
        ? selectedColor
        : typeof detailColor !== 'undefined'
          ? detailColor
          : null;

  const effectiveQuantity =
    requestedQuantity ||
    (typeof selectedQuantity !== 'undefined' ? selectedQuantity : null) ||
    (typeof detailQty !== 'undefined' ? detailQty : 1);

  if (!effectiveProduct) {
    return;
  }

  const existingCartItem = shoppingCart.find(
    (cartItem) =>
      cartItem.product.id === effectiveProduct.id &&
      cartItem.size === effectiveSize &&
      cartItem.color === effectiveColor
  );

  if (existingCartItem) {
    existingCartItem.qty += effectiveQuantity;
  } else {
    shoppingCart.push({
      product: effectiveProduct,
      size: effectiveSize,
      color: effectiveColor,
      qty: effectiveQuantity,
    });
  }

  updateCartBadge();
  showToast('Agregado al carrito');
}

/**
 * Elimina un ítem del carrito por índice.
 * @param {number} itemIndex - Posición en el arreglo shoppingCart
 */
function removeFromCart(itemIndex) {
  shoppingCart.splice(itemIndex, 1);
  updateCartBadge();

  if (typeof renderCart === 'function') {
    renderCart();
  }

  if (typeof renderCheckoutSummary === 'function') {
    renderCheckoutSummary();
  }
}

/**
 * Cambia la cantidad de un ítem del carrito según un delta.
 * @param {number} itemIndex - Posición en el arreglo shoppingCart
 * @param {number} quantityDelta - Cantidad a sumar (negativa para restar)
 */
function changeCartQty(itemIndex, quantityDelta) {
  shoppingCart[itemIndex].qty = Math.max(1, shoppingCart[itemIndex].qty + quantityDelta);
  updateCartBadge();

  if (typeof renderCart === 'function') {
    renderCart();
  }

  if (typeof renderCheckoutSummary === 'function') {
    renderCheckoutSummary();
  }
}

// ─────────────────────────────────────────────
// Cart item markup
// ─────────────────────────────────------------

/**
 * Genera el markup HTML para un ítem del carrito.
 * @param {ShoppingCartItem} cartItem - Ítem del carrito a renderizar
 * @param {number} itemIndex - Índice usado para los data attributes
 * @returns {string} HTML de la fila del carrito
 */
function cartItemRowHTML(cartItem, itemIndex) {
  const product = cartItem.product;
  const iconColor = product.category === 'cinturones' ? 'var(--ink)' : '#fff';
  const metadataParts = [];

  if (cartItem.size) {
    metadataParts.push('Talle ' + cartItem.size);
  }

  if (cartItem.color) {
    metadataParts.push(
      `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${cartItem.color};vertical-align:middle;margin-right:4px;border:1px solid #ddd"></span>Color`
    );
  }

  return `<div class="carrito__item">
    <div class="carrito__thumb ${CATEGORY_STYLE_MAP[product.category]}"><svg class="icono" style="color:${iconColor}"><use href="#${CATEGORY_ICON_MAP[product.category]}"/></svg></div>
    <div>
      <div class="carrito__nombre">${product.name}</div>
      <div class="carrito__meta">${metadataParts.join(' · ') || '&nbsp;'}</div>
      <button class="carrito__quitar" data-remove="${itemIndex}">Quitar</button>
    </div>
    <div class="cantidad" style="height:40px;">
      <button class="cantidad__boton" data-qtyminus="${itemIndex}"><svg class="icono"><use href="#i-minus"/></svg></button>
      <span class="cantidad__valor">${cartItem.qty}</span>
      <button class="cantidad__boton" data-qtyplus="${itemIndex}"><svg class="icono"><use href="#i-plus"/></svg></button>
    </div>
    <div class="carrito__precio">${formatPrice(cartItem.qty * product.price)}</div>
  </div>`;
}

// ─────────────────────────────────────────────
// Legacy alias for vanilla global compatibility
// Inline pages reference `cart` directly.
// ─────────────────────────────────------------
let cart = shoppingCart;
