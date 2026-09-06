/* KIHAP - producto.js vanilla global - dynamic detail ?id= */

// ─────────────────────────────────────────────
// Product detail state
// ─────────────────────────────────------------

/** @type {import("./products.js").Product} */
let selectedProduct = PRODUCT_CATALOG[0];

/** @type {string|null} */
let selectedSize = null;

/** @type {string|null} */
let selectedColor = null;

/** @type {number} */
let selectedQuantity = 1;

// Legacy aliases for cart.js compatibility (vanilla global)
let currentProduct = selectedProduct;
let detailSize = selectedSize;
let detailColor = selectedColor;
let detailQty = selectedQuantity;

// ─────────────────────────────────────────────
// Product card helpers (detail page)
// ─────────────────────────────────------------

/**
 * Genera el markup del bloque visual de una tarjeta de producto.
 * @param {import("./products.js").Product} product - Producto a renderizar
 * @returns {string} HTML del área visual
 */
function productMediaHTML(product) {
  const iconColor = product.category === 'cinturones' ? 'var(--ink)' : '#fff';

  return `<div class="tarjeta-producto__media ${CATEGORY_STYLE_MAP[product.category]}"><svg class="icono" style="color:${iconColor}"><use href="#${CATEGORY_ICON_MAP[product.category]}"/></svg></div>`;
}

/**
 * Genera el markup completo de la tarjeta de producto.
 * @param {import("./products.js").Product} product - Producto a renderizar
 * @returns {string} HTML de la tarjeta
 */
function productCardHTML(product) {
  const mediaMarkup = `<div class="tarjeta-producto__media ${CATEGORY_STYLE_MAP[product.category]}"><svg class="icono" style="color:${product.category === 'cinturones' ? 'var(--ink)' : '#fff'}"><use href="#${CATEGORY_ICON_MAP[product.category]}"/></svg></div>`;

  return `<div class="tarjeta-producto" data-id="${product.id}">
    ${mediaMarkup}
    <div class="tarjeta-producto__cuerpo">
      <span class="tarjeta-producto__categoria">${CATEGORY_LABELS[product.category]}</span>
      <span class="tarjeta-producto__nombre">${product.name}</span>
      <span class="tarjeta-producto__precio">${formatPrice(product.price)}</span>
      <button class="tarjeta-producto__accion" data-quickadd="${product.id}"><svg class="icono" style="width:14px;height:14px"><use href="#i-cart"/></svg> Agregar</button>
    </div>
  </div>`;
}

/**
 * Genera el markup de la tarjeta incluyendo la etiqueta promocional cuando existe.
 * @param {import("./products.js").Product} product - Producto a renderizar
 * @returns {string} HTML de la tarjeta con etiqueta
 */
function productCardHTMLWithBadge(product) {
  let cardMarkup = productCardHTML(product);

  if (product.badge && !cardMarkup.includes('tarjeta-producto__etiqueta')) {
    cardMarkup = cardMarkup.replace(
      '<svg class="icono"',
      '<span class="tarjeta-producto__etiqueta">' + product.badge + '</span><svg class="icono"'
    );
  }

  return cardMarkup;
}

// ─────────────────────────────────────────────
// Detail rendering
// ─────────────────────────────────------------

/**
 * Renderiza el contenido de la página de detalle para el producto actualmente seleccionado.
 */
function renderProductDetail() {
  const product = selectedProduct;

  document.getElementById('breadcrumbName').textContent = product.name;
  document.getElementById('detalleCat').textContent = CATEGORY_LABELS[product.category];
  document.getElementById('detalleName').textContent = product.name;
  document.getElementById('detallePrice').textContent = formatPrice(product.price);
  document.getElementById('tabDescripcion').innerHTML = `<p>${product.desc}</p>`;

  const mediaBackgroundClass = CATEGORY_STYLE_MAP[product.category];
  const iconColor = product.category === 'cinturones' ? 'var(--ink)' : '#fff';

  const galleryMainElement = document.getElementById('galleryMain');
  galleryMainElement.className = 'galeria__principal ' + mediaBackgroundClass;
  galleryMainElement.innerHTML =
    `<svg class="icono" style="color:${iconColor}"><use href="#${CATEGORY_ICON_MAP[product.category]}"/></svg>`;

  const thumbnailNumbers = [1, 2, 3];
  document.getElementById('galleryThumbs').innerHTML = thumbnailNumbers
    .map(
      (thumbnailNumber, thumbnailIndex) =>
        `<div class="galeria__miniatura ${mediaBackgroundClass} ${thumbnailIndex === 0 ? 'galeria__miniatura--activa' : ''}"><svg class="icono" style="color:${iconColor}"><use href="#${CATEGORY_ICON_MAP[product.category]}"/></svg></div>`
    )
    .join('');

  const sizeBlockElement = document.getElementById('sizeBlock');

  if (product.sizes) {
    sizeBlockElement.style.display = 'block';
    document.getElementById('sizeRow').innerHTML = product.sizes
      .map(
        (sizeOption) =>
          `<button class="opcion ${sizeOption === selectedSize ? 'opcion--seleccionada' : ''}" data-size="${sizeOption}">${sizeOption}</button>`
      )
      .join('');
  } else {
    sizeBlockElement.style.display = 'none';
  }

  const colorBlockElement = document.getElementById('colorBlock');

  if (product.colors) {
    colorBlockElement.style.display = 'block';
    document.getElementById('colorRow').innerHTML = product.colors
      .map(
        (colorOption) =>
          `<button class="opcion__color ${colorOption === selectedColor ? 'opcion__color--seleccionada' : ''}" data-color="${colorOption}" style="${colorOption === '#FFFFFF' ? 'border-color:#DDD9CF' : ''}"><i style="background:${colorOption}"></i></button>`
      )
      .join('');
  } else {
    colorBlockElement.style.display = 'none';
  }

  document.getElementById('detailQty').textContent = selectedQuantity;

  const relatedProducts = PRODUCT_CATALOG.filter(
    (catalogProduct) => catalogProduct.category === product.category && catalogProduct.id !== product.id
  ).slice(0, 4);

  const fallbackProducts =
    relatedProducts.length > 0
      ? relatedProducts
      : PRODUCT_CATALOG.filter((catalogProduct) => catalogProduct.id !== product.id).slice(0, 4);

  document.getElementById('relatedGrid').innerHTML = fallbackProducts
    .map(productCardHTMLWithBadge)
    .join('');

  // Keep legacy globals in sync
  currentProduct = selectedProduct;
  detailSize = selectedSize;
  detailColor = selectedColor;
  detailQty = selectedQuantity;
}

// Backwards-compatible alias
function renderDetalle() {
  renderProductDetail();
}

// ─────────────────────────────────────────────
// Detail actions
// ─────────────────────────────────------------

/**
 * Cambia la cantidad seleccionada según un delta, mínimo 1.
 * @param {number} quantityDelta - Cantidad a sumar (negativa para restar)
 */
function changeDetailQty(quantityDelta) {
  selectedQuantity = Math.max(1, selectedQuantity + quantityDelta);
  document.getElementById('detailQty').textContent = selectedQuantity;

  // Keep legacy global in sync
  detailQty = selectedQuantity;
}

/**
 * Agrega el detalle del producto actualmente seleccionado al carrito.
 */
function addDetailToCartHandler() {
  addDetailToCart(selectedProduct, selectedSize, selectedColor, selectedQuantity);
}

/**
 * Agrega la selección actual al carrito y navega a la página del carrito.
 */
function buyNow() {
  addDetailToCart(selectedProduct, selectedSize, selectedColor, selectedQuantity);
  location.href = 'carrito.html';
}

// ─────────────────────────────────────────────
// Page initialization
// ─────────────────────────────────------------

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(location.search);
  const productIdFromUrl = Number(urlParams.get('id')) || 1;

  selectedProduct =
    PRODUCT_CATALOG.find((catalogProduct) => catalogProduct.id === productIdFromUrl) ||
    PRODUCT_CATALOG[0];

  selectedSize = selectedProduct.sizes ? selectedProduct.sizes[0] : null;
  selectedColor = selectedProduct.colors ? selectedProduct.colors[0] : null;
  selectedQuantity = 1;

  // Sync legacy globals
  currentProduct = selectedProduct;
  detailSize = selectedSize;
  detailColor = selectedColor;
  detailQty = selectedQuantity;

  renderProductDetail();

  const sizeRowElement = document.getElementById('sizeRow');
  sizeRowElement.addEventListener('click', (clickEvent) => {
    const optionButton = clickEvent.target.closest('[data-size]');

    if (optionButton) {
      selectedSize = optionButton.dataset.size;
      detailSize = selectedSize;
      renderProductDetail();
    }
  });

  const colorRowElement = document.getElementById('colorRow');
  colorRowElement.addEventListener('click', (clickEvent) => {
    const optionButton = clickEvent.target.closest('[data-color]');

    if (optionButton) {
      selectedColor = optionButton.dataset.color;
      detailColor = selectedColor;
      renderProductDetail();
    }
  });

  document.querySelectorAll('.pestanas__boton').forEach((tabButton) => {
    tabButton.addEventListener('click', () => {
      document.querySelectorAll('.pestanas__boton').forEach((tabButtonItem) => {
        tabButtonItem.classList.remove('pestanas__boton--activo');
      });

      document.querySelectorAll('.pestanas__panel').forEach((panelElement) => {
        panelElement.classList.remove('pestanas__panel--activo');
      });

      tabButton.classList.add('pestanas__boton--activo');

      const targetPanelSelector = `[data-tabpanel="${tabButton.dataset.tab}"]`;
      document.querySelector(targetPanelSelector).classList.add('pestanas__panel--activo');
    });
  });

  document.body.addEventListener('click', (clickEvent) => {
    const quickAddButton = clickEvent.target.closest('[data-quickadd]');

    if (quickAddButton) {
      clickEvent.preventDefault();
      clickEvent.stopPropagation();

      const productToAdd = PRODUCT_CATALOG.find(
        (catalogProduct) => catalogProduct.id === Number(quickAddButton.dataset.quickadd)
      );

      quickAddToCart(productToAdd);
      return;
    }

    const productCardElement = clickEvent.target.closest('.tarjeta-producto');

    if (productCardElement) {
      location.href = 'producto.html?id=' + productCardElement.dataset.id;
    }
  });
});
