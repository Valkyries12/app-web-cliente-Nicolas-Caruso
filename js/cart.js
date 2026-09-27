/* KIHAP - Shopping cart (vanilla global) - ES6+ */

/**
 * @typedef {Object} ShoppingCartItem
 * @property {import("./products.js").Product} product
 * @property {string|null} size
 * @property {string|null} color
 * @property {number} qty
 */

// Compat: el tope vive en CONFIG (ver js/config.js)
const MAX_QTY_POR_PRODUCTO = CONFIG.MAX_QTY;

/** @type {ShoppingCartItem[]} */
let shoppingCart = [
  { product: PRODUCT_CATALOG[0], size: '160', color: null, qty: 1 },
  { product: PRODUCT_CATALOG[2], size: 'M', color: '#C41E3A', qty: 1 },
];

// ─────────────────────────────────────────────
// Cart calculations
// ─────────────────────────────────────────────

/**
 * @returns {number}
 */
const getCartItemCount = () =>
  shoppingCart.reduce((totalAccumulator, cartItem) => totalAccumulator + cartItem.qty, 0);

/**
 * @returns {number}
 */
const calculateCartSubtotal = () =>
  shoppingCart.reduce(
    (totalAccumulator, cartItem) => totalAccumulator + cartItem.qty * cartItem.product.price,
    0
  );

/**
 * @returns {number}
 */
const calculateShippingCost = () =>
  shoppingCart.length ? CONFIG.SHIPPING_FLAT_RATE : 0;

// ─────────────────────────────────────────────
// Cart mutations
// ─────────────────────────────────────────────

/**
 * @param {import("./products.js").Product} product
 */
const quickAddToCart = (product) => {
  const existingCartItem = shoppingCart.find(
    (cartItem) => cartItem.product.id === product.id && !cartItem.size && !cartItem.color
  );

  if (existingCartItem) {
    if (existingCartItem.qty + 1 > CONFIG.MAX_QTY) {
      showToast('Máximo 10 unidades por producto');
      return;
    }

    existingCartItem.qty += 1;
  } else {
    shoppingCart.push({
      product,
      size: product.sizes ? product.sizes[0] : null,
      color: product.colors ? product.colors[0] : null,
      qty: 1,
    });
  }

  updateCartBadge();
  showToast('Agregado al carrito');
};

/**
 * Agrega la selección de detalle al carrito.
 * Firma fija: (product, size, color, qty). Si product es null,
 * usa DetailState (producto.js, única fuente de verdad del detalle).
 * La guarda typeof cubre las páginas que no cargan producto.js.
 */
const addDetailToCart = (targetProduct, selectedSize, selectedColor, requestedQuantity) => {
  const detail = typeof DetailState !== 'undefined' ? DetailState : null;
  const effectiveProduct = targetProduct || detail?.product || null;

  const effectiveSize =
    selectedSize !== undefined && selectedSize !== null ? selectedSize : detail?.size || null;
  const effectiveColor =
    selectedColor !== undefined && selectedColor !== null ? selectedColor : detail?.color || null;
  const effectiveQuantity = requestedQuantity || detail?.qty || 1;

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
    if (existingCartItem.qty + effectiveQuantity > CONFIG.MAX_QTY) {
      existingCartItem.qty = CONFIG.MAX_QTY;
      updateCartBadge();
      showToast('Máximo 10 unidades por producto');
      return;
    }

    existingCartItem.qty += effectiveQuantity;
  } else {
    shoppingCart.push({
      product: effectiveProduct,
      size: effectiveSize,
      color: effectiveColor,
      qty: Math.min(effectiveQuantity, CONFIG.MAX_QTY),
    });

    if (effectiveQuantity > CONFIG.MAX_QTY) {
      updateCartBadge();
      showToast('Máximo 10 unidades por producto');
      return;
    }
  }

  updateCartBadge();
  showToast('Agregado al carrito');
};

/**
 * @param {number} itemIndex
 */
const removeFromCart = (itemIndex) => {
  shoppingCart.splice(itemIndex, 1);
  updateCartBadge();

  if (typeof renderCart === 'function') {
    renderCart();
  }

  if (typeof renderCheckoutSummary === 'function') {
    renderCheckoutSummary();
  }
};

/**
 * @param {number} itemIndex
 * @param {number} quantityDelta
 */
const changeCartQty = (itemIndex, quantityDelta) => {
  const nuevaCantidad = shoppingCart[itemIndex].qty + quantityDelta;

  if (nuevaCantidad > CONFIG.MAX_QTY) {
    showToast('Máximo 10 unidades por producto');
    return;
  }

  shoppingCart[itemIndex].qty = Math.max(1, nuevaCantidad);
  updateCartBadge();

  if (typeof renderCart === 'function') {
    renderCart();
  }

  if (typeof renderCheckoutSummary === 'function') {
    renderCheckoutSummary();
  }
};

// ─────────────────────────────────────────────
// Facade para ui.js / badge
// ─────────────────────────────────────────────

const CartStore = {
  all: () => shoppingCart,
  count: getCartItemCount,
  subtotal: calculateCartSubtotal,
  shipping: calculateShippingCost,
};
