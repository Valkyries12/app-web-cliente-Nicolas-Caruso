/* KIHAP - Shopping cart (vanilla global) - ES6+ */

/**
 * @typedef {Object} ShoppingCartItem
 * @property {import("./products.js").Product} product
 * @property {string|null} size
 * @property {string|null} color
 * @property {number} qty
 */

/**
 * @typedef {Object} StoredCartItem
 * @property {number} productId
 * @property {string|null} size
 * @property {string|null} color
 * @property {number} qty
 */

// Mensajes (el tope de unidades vive en CONFIG, ver js/config.js)
const MSG_MAX_QTY = 'Máximo 10 unidades por producto';
const MSG_ADDED = 'Agregado al carrito';

/** @type {ShoppingCartItem[]} */
let shoppingCart = [];

// ─────────────────────────────────────────────
// Persistencia (localStorage)
// ─────────────────────────────────────────────

const CART_STORAGE_KEY = 'kihap_shoppingCart';

/**
 * Lee el carrito guardado y rehidrata los productos desde el catálogo.
 * @returns {ShoppingCartItem[]}
 */
const loadCartFromStorage = () => {
  try {
    const rawCart = localStorage.getItem(CART_STORAGE_KEY);

    if (!rawCart) {
      return [];
    }

    const storedItems = JSON.parse(rawCart);

    if (!Array.isArray(storedItems)) {
      return [];
    }

    return storedItems
      .map((storedItem) => {
        const product = PRODUCT_CATALOG.find(
          (catalogProduct) => catalogProduct.id === storedItem.productId
        );

        if (!product) {
          return null;
        }

        return {
          product,
          size: storedItem.size ?? null,
          color: storedItem.color ?? null,
          qty: Math.min(Math.max(Number(storedItem.qty) || 1, 1), CONFIG.MAX_QTY),
        };
      })
      .filter(Boolean);
  } catch (error) {
    console.warn('KIHAP: no se pudo leer el carrito', error);
    return [];
  }
};

/**
 * Guarda el carrito actual en localStorage.
 */
const saveCartToStorage = () => {
  try {
    const storedItems = shoppingCart.map(({ product, size, color, qty }) => ({
      productId: product.id,
      size,
      color,
      qty,
    }));

    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(storedItems));
  } catch (error) {
    console.warn('KIHAP: no se pudo guardar el carrito', error);
  }
};

shoppingCart = loadCartFromStorage();

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
  saveCartToStorage();
  updateCartBadge();
  showToast(mensaje);
};

/**
 * Sincroniza badge + vistas tras quitar o cambiar cantidad.
 */
const notifyCartChange = () => {
  saveCartToStorage();
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

/**
 * Vacía el carrito por completo (ej. tras confirmar la compra).
 */
const clearCart = () => {
  shoppingCart.splice(0, shoppingCart.length);
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
