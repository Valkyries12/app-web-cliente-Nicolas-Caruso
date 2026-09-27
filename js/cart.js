/* KIHAP - Shopping cart (vanilla global) - ES6+ */

/**
 * @typedef {Object} ShoppingCartItem
 * @property {import("./products.js").Product} product
 * @property {string|null} size
 * @property {string|null} color
 * @property {number} qty
 */

// Mensajes (el tope de unidades vive en CONFIG, ver js/config.js)
const MSG_MAX_QTY = 'Máximo 10 unidades por producto';
const MSG_ADDED = 'Agregado al carrito';

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
// Helpers internos (no cambian la API pública)
// ─────────────────────────────────────────────

/**
 * Busca un ítem por identidad exacta de variante.
 */
const findCartItem = (productId, size, color) =>
  shoppingCart.find(
    (cartItem) =>
      cartItem.product.id === productId && cartItem.size === size && cartItem.color === color
  );

/**
 * Fuente de verdad del detalle (producto.js).
 * La guarda typeof cubre las páginas que no cargan producto.js.
 */
const resolverDetalle = () => (typeof DetailState !== 'undefined' ? DetailState : null);

/**
 * Confirma un agregado: badge + toast.
 * Sin re-render: el agregado ocurre fuera de carrito/checkout
 * y esas páginas se pintan al cargarse.
 */
const confirmCartAdd = (mensaje) => {
  updateCartBadge();
  showToast(mensaje);
};

/**
 * Sincroniza badge + vistas tras quitar o cambiar cantidad.
 */
const notifyCartChange = () => {
  updateCartBadge();

  if (typeof renderCart === 'function') {
    renderCart();
  }

  if (typeof renderCheckoutSummary === 'function') {
    renderCheckoutSummary();
  }
};

// ─────────────────────────────────────────────
// Cart mutations
// ─────────────────────────────────────────────

/**
 * @param {import("./products.js").Product} product
 */
const quickAddToCart = (product) => {
  // Agrupa solo ítems sin variante (size/color falsy), como antes.
  const existingCartItem = shoppingCart.find(
    (cartItem) => cartItem.product.id === product.id && !cartItem.size && !cartItem.color
  );

  if (existingCartItem) {
    if (existingCartItem.qty + 1 > CONFIG.MAX_QTY) {
      showToast(MSG_MAX_QTY);
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

  confirmCartAdd(MSG_ADDED);
};

/**
 * Agrega la selección de detalle al carrito.
 * Firma fija: (product, size, color, qty). Si product es null,
 * usa DetailState (producto.js, única fuente de verdad del detalle).
 */
const addDetailToCart = (targetProduct, selectedSize, selectedColor, requestedQuantity) => {
  const detail = resolverDetalle();
  const effectiveProduct = targetProduct || detail?.product || null;
  const effectiveSize = selectedSize ?? (detail?.size || null);
  const effectiveColor = selectedColor ?? (detail?.color || null);
  const effectiveQuantity = requestedQuantity || detail?.qty || 1;

  if (!effectiveProduct) {
    return;
  }

  const existingCartItem = findCartItem(effectiveProduct.id, effectiveSize, effectiveColor);

  if (existingCartItem) {
    if (existingCartItem.qty + effectiveQuantity > CONFIG.MAX_QTY) {
      existingCartItem.qty = CONFIG.MAX_QTY;
      confirmCartAdd(MSG_MAX_QTY);
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
      confirmCartAdd(MSG_MAX_QTY);
      return;
    }
  }

  confirmCartAdd(MSG_ADDED);
};

/**
 * @param {number} itemIndex
 */
const removeFromCart = (itemIndex) => {
  shoppingCart.splice(itemIndex, 1);
  notifyCartChange();
};

/**
 * @param {number} itemIndex
 * @param {number} quantityDelta
 */
const changeCartQty = (itemIndex, quantityDelta) => {
  const nuevaCantidad = shoppingCart[itemIndex].qty + quantityDelta;

  if (nuevaCantidad > CONFIG.MAX_QTY) {
    showToast(MSG_MAX_QTY);
    return;
  }

  shoppingCart[itemIndex].qty = Math.max(1, nuevaCantidad);
  notifyCartChange();
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
