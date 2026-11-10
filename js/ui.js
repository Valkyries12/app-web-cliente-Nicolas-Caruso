/* KIHAP - ui.js vanilla global - helpers visuales compartidos (ES6+) */

// ─────────────────────────────────────────────
// Toast + badge
// ─────────────────────────────────────────────

let toastTimer = null;

/**
 * Muestra una notificación toast temporal.
 * @param {string} mensaje - Texto a mostrar
 */
const showToast = (mensaje) => {
  const toastElement = document.getElementById('toast');

  if (!toastElement) {
    return;
  }

  document.getElementById('toastText').textContent = mensaje;
  toastElement.classList.add('aviso--visible');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(
    () => toastElement.classList.remove('aviso--visible'),
    CONFIG.TOAST_MS
  );
};

/**
 * Actualiza el contador del carrito en el encabezado.
 */
const updateCartBadge = () => {
  const badge = document.getElementById('cartBadge');

  if (badge) {
    badge.textContent = getCartItemCount();
  }
};

// ─────────────────────────────────────────────
// Cargador (spinner)
// ─────────────────────────────────────────────

/**
 * Muestra el cargador indicado.
 * @param {string} loaderId - ID del elemento cargador
 */
const showLoader = (loaderId) => {
  const loaderElement = document.getElementById(loaderId);

  if (loaderElement) {
    loaderElement.hidden = false;
  }
};

/**
 * Oculta el cargador indicado.
 * @param {string} loaderId - ID del elemento cargador
 */
const hideLoader = (loaderId) => {
  const loaderElement = document.getElementById(loaderId);

  if (loaderElement) {
    loaderElement.hidden = true;
  }
};

/**
 * Muestra u oculta los contenedores de contenido indicados.
 * @param {string[]} contentIds - IDs de los contenedores
 * @param {boolean} isVisible - Verdadero para mostrarlos
 */
const setContentVisibility = (contentIds, isVisible) => {
  contentIds.forEach((contentId) => {
    const contentElement = document.getElementById(contentId);

    if (contentElement) {
      contentElement.hidden = !isVisible;
    }
  });
};

/**
 * Ejecuta una tarea mostrando el cargador y ocultando el contenido indicado.
 * @param {string} loaderId - ID del elemento cargador
 * @param {string[]} contentIds - IDs de los contenedores a ocultar mientras carga
 * @param {() => Promise<unknown>} task - Tarea a ejecutar
 * @returns {Promise<unknown>}
 */
const withLoader = async (loaderId, contentIds = [], task) => {
  showLoader(loaderId);
  setContentVisibility(contentIds, false);

  try {
    return await task();
  } finally {
    hideLoader(loaderId);
    setContentVisibility(contentIds, true);
  }
};

// ─────────────────────────────────────────────
// Texto y sanitización (helpers compartidos)
// ─────────────────────────────────────────────

/**
 * Normaliza un texto para comparaciones sin tildes ni mayúsculas.
 * @param {string} texto - Texto a normalizar
 * @returns {string} Texto normalizado
 */
const normalizarTexto = (texto) =>
  String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

/**
 * Escapa HTML para interpolar texto seguro en plantillas.
 * @param {string} texto - Texto a escapar
 * @returns {string} Texto escapado
 */
const escaparHTML = (texto) =>
  String(texto || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// ─────────────────────────────────────────────
// Product cards (fuente única, antes triplicada)
// ─────────────────────────────────────────────

/**
 * Color del ícono según la categoría del producto.
 * @param {import("./products.js").Product} product
 * @returns {string}
 */
const productIconColor = (product) =>
  product.category === 'cinturones' ? 'var(--ink)' : '#fff';

/**
 * Imagen del producto con manejo uniforme de lazy loading y error.
 * @param {import("./products.js").Product} product
 * @param {{alt?: string, loading?: string|null}} [options]
 * @returns {string}
 */
const productImageHTML = (product, { alt = product.name, loading = 'lazy' } = {}) => {
  if (!product.image) {
    return '';
  }

  const loadingAttribute = loading ? ` loading="${loading}"` : '';

  return `<img src="${product.image}" alt="${escaparHTML(alt)}"${loadingAttribute} onerror="this.remove()">`;
};

/**
 * Ícono SVG según la categoría del producto.
 * @param {import("./products.js").Product} product
 * @returns {string}
 */
const productIconHTML = (product) =>
  `<svg class="icono" style="color:${productIconColor(product)}"><use href="#${CATEGORY_ICON_MAP[product.category]}"/></svg>`;

/**
 * @param {import("./products.js").Product} product
 * @returns {string}
 */
const productMediaHTML = (product) => {
  const badgeMarkup = product.badge
    ? `<span class="tarjeta-producto__etiqueta">${escaparHTML(product.badge)}</span>`
    : '';

  return `<div class="tarjeta-producto__media ${CATEGORY_STYLE_MAP[product.category]}">${productImageHTML(product)}${badgeMarkup}${productIconHTML(product)}</div>`;
};

/**
 * @param {import("./products.js").Product} product
 * @returns {string}
 */
const productCardHTML = (product) => `<article class="tarjeta-producto" data-id="${product.id}">
    ${productMediaHTML(product)}
    <div class="tarjeta-producto__cuerpo">
      <p class="tarjeta-producto__categoria">${CATEGORY_LABELS[product.category]}</p>
      <h3 class="tarjeta-producto__nombre"><a class="tarjeta-producto__enlace" href="producto.html?id=${product.id}">${escaparHTML(product.name)}</a></h3>
      <p class="tarjeta-producto__precio">${formatPrice(product.price)}</p>
      <button class="tarjeta-producto__accion" data-quickadd="${product.id}" type="button" aria-label="Agregar ${escaparHTML(product.name)} al carrito"><svg class="icono" style="width:14px;height:14px" aria-hidden="true"><use href="#i-cart"/></svg> Agregar</button>
    </div>
  </article>`;

/**
 * @param {object} cartItem - Ítem del carrito
 * @param {number} itemIndex - Índice para data attributes
 * @returns {string}
 */
const cartItemRowHTML = (cartItem, itemIndex) => {
  const product = cartItem.product;
  const metadataParts = [];

  if (cartItem.size) {
    metadataParts.push('Talle ' + cartItem.size);
  }

  if (cartItem.color) {
    metadataParts.push(
      `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${cartItem.color};vertical-align:middle;margin-right:4px;border:1px solid #ddd"></span>Color`
    );
  }

  return `<article class="carrito__item">
    <div class="carrito__miniatura ${CATEGORY_STYLE_MAP[product.category]}">${productImageHTML(product)}${productIconHTML(product)}</div>
    <div class="carrito__detalle">
      <h3 class="carrito__nombre">${escaparHTML(product.name)}</h3>
      <p class="carrito__meta">${metadataParts.join(' · ') || '&nbsp;'}</p>
      <button class="carrito__quitar" data-remove="${itemIndex}" type="button">Quitar</button>
    </div>
    <div class="carrito__cantidad cantidad" style="height:40px;">
      <button class="cantidad__boton" data-qtyminus="${itemIndex}"><svg class="icono"><use href="#i-minus"/></svg></button>
      <span class="cantidad__valor">${cartItem.qty}</span>
      <button class="cantidad__boton" data-qtyplus="${itemIndex}"><svg class="icono"><use href="#i-plus"/></svg></button>
    </div>
    <div class="carrito__precio">${formatPrice(cartItem.qty * product.price)}</div>
  </article>`;
}

// ─────────────────────────────────────────────
// Acciones comunes de las tarjetas de producto
// ─────────────────────────────────────────────

let productCardActionsBound = false;

/**
 * Conecta el "agregar rápido" y la navegación al detalle de las tarjetas.
 * Se registra una sola vez por página.
 */
const initProductCardActions = () => {
  if (productCardActionsBound) {
    return;
  }

  productCardActionsBound = true;

  document.body.addEventListener('click', async (clickEvent) => {
    const quickAddButton = clickEvent.target.closest('[data-quickadd]');

    if (quickAddButton) {
      clickEvent.preventDefault();
      clickEvent.stopPropagation();

      const productId = Number(quickAddButton.dataset.quickadd);
      const productToAdd = getCachedProduct(productId) || (await fetchProductById(productId));

      if (productToAdd) {
        quickAddToCart(productToAdd);
      }

      return;
    }

    const productCardElement = clickEvent.target.closest('.tarjeta-producto');

    if (productCardElement) {
      location.href = 'producto.html?id=' + productCardElement.dataset.id;
    }
  });
};
