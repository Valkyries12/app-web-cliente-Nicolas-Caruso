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
    badge.textContent = CartStore.count();
  }
};

// ─────────────────────────────────────────────
// Product cards (fuente única, antes triplicada)
// ─────────────────────────────────────────────

/**
 * @param {import("./products.js").Product} product
 * @returns {string}
 */
const productMediaHTML = (product) => {
  const iconColor = product.category === 'cinturones' ? 'var(--ink)' : '#fff';
  const imageMarkup = product.image
    ? `<img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.remove()">`
    : '';

  return `<div class="tarjeta-producto__media ${CATEGORY_STYLE_MAP[product.category]}">${imageMarkup}<svg class="icono" style="color:${iconColor}"><use href="#${CATEGORY_ICON_MAP[product.category]}"/></svg></div>`;
};

/**
 * @param {import("./products.js").Product} product
 * @returns {string}
 */
const productCardHTML = (product) => `<article class="tarjeta-producto" data-id="${product.id}">
    ${productMediaHTML(product)}
    <div class="tarjeta-producto__cuerpo">
      <p class="tarjeta-producto__categoria">${CATEGORY_LABELS[product.category]}</p>
      <h3 class="tarjeta-producto__nombre"><a class="tarjeta-producto__enlace" href="producto.html?id=${product.id}">${product.name}</a></h3>
      <p class="tarjeta-producto__precio">${formatPrice(product.price)}</p>
      <button class="tarjeta-producto__accion" data-quickadd="${product.id}" type="button" aria-label="Agregar ${product.name} al carrito"><svg class="icono" style="width:14px;height:14px" aria-hidden="true"><use href="#i-cart"/></svg> Agregar</button>
    </div>
  </article>`;

/**
 * @param {import("./products.js").Product} product
 * @returns {string}
 */
const productCardHTMLWithBadge = (product) => {
  const cardMarkup = productCardHTML(product);

  if (product.badge && !cardMarkup.includes('tarjeta-producto__etiqueta')) {
    return cardMarkup.replace(
      '<svg class="icono"',
      '<span class="tarjeta-producto__etiqueta">' + product.badge + '</span><svg class="icono"'
    );
  }

  return cardMarkup;
};

/**
 * @param {object} cartItem - Ítem del carrito
 * @param {number} itemIndex - Índice para data attributes
 * @returns {string}
 */
const cartItemRowHTML = (cartItem, itemIndex) => {
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

  const imageMarkup = product.image
    ? `<img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.remove()">`
    : '';

  return `<article class="carrito__item">
    <div class="carrito__miniatura ${CATEGORY_STYLE_MAP[product.category]}">${imageMarkup}<svg class="icono" style="color:${iconColor}"><use href="#${CATEGORY_ICON_MAP[product.category]}"/></svg></div>
    <div class="carrito__detalle">
      <h3 class="carrito__nombre">${product.name}</h3>
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
};
