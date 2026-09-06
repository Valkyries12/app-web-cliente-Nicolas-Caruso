/* KIHAP - catalog.js vanilla global | BEM español */

// ─────────────────────────────────────────────
// Product card markup (catalog page)
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
  return `<div class="tarjeta-producto" data-id="${product.id}">
    ${productMediaHTML(product)}
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

  if (product.badge) {
    if (!cardMarkup.includes('tarjeta-producto__etiqueta')) {
      cardMarkup = cardMarkup.replace(
        '<svg class="icono"',
        '<span class="tarjeta-producto__etiqueta">' + product.badge + '</span><svg class="icono"'
      );
    }
  }

  return cardMarkup;
}

// ─────────────────────────────────────────────
// Catalog filters & sorting
// ─────────────────────────────────------------

/**
 * Obtiene la lista de valores de filtros de categoría actualmente seleccionados.
 * @returns {string[]} Claves de categorías activas
 */
function getActiveCategoryFilters() {
  return Array.from(document.querySelectorAll('.cat-filter:checked')).map(
    (filterCheckbox) => filterCheckbox.value
  );
}

/**
 * Limpia todos los filtros de categoría y vuelve a renderizar el catálogo.
 */
function clearFilters() {
  document.querySelectorAll('.cat-filter').forEach((filterCheckbox) => {
    filterCheckbox.checked = false;
  });

  renderCatalog();
}

/**
 * Renderiza la grilla del catálogo según los filtros activos y el orden elegido.
 */
function renderCatalog() {
  const activeCategoryFilters = getActiveCategoryFilters();

  let filteredProductList = activeCategoryFilters.length
    ? PRODUCT_CATALOG.filter((product) => activeCategoryFilters.includes(product.category))
    : PRODUCT_CATALOG.slice();

  const sortOrder = document.getElementById('sortSelect').value;

  if (sortOrder === 'menor') {
    filteredProductList.sort((productA, productB) => productA.price - productB.price);
  }

  if (sortOrder === 'mayor') {
    filteredProductList.sort((productA, productB) => productB.price - productA.price);
  }

  if (sortOrder === 'nuevos') {
    filteredProductList.sort((productA, productB) => productB.id - productA.id);
  }

  document.getElementById('catalogGrid').innerHTML = filteredProductList
    .map(productCardHTMLWithBadge)
    .join('');

  const resultCountElement = document.getElementById('resultCount');
  const countText =
    filteredProductList.length + (filteredProductList.length === 1 ? ' producto' : ' productos');
  resultCountElement.textContent = countText;
}

// ─────────────────────────────────────────────
// Page initialization
// ─────────────────────────────────------------

document.addEventListener('DOMContentLoaded', () => {
  // Pre-filter by ?cat= doboks|protecciones|cinturones|accesorios
  const urlParams = new URLSearchParams(location.search);
  const categoryFromUrl = urlParams.get('cat');

  if (categoryFromUrl) {
    document.querySelectorAll('.cat-filter').forEach((filterCheckbox) => {
      filterCheckbox.checked = filterCheckbox.value === categoryFromUrl;
    });
  }

  document.querySelectorAll('.cat-filter').forEach((filterCheckbox) => {
    filterCheckbox.addEventListener('change', renderCatalog);
  });

  const sortSelectElement = document.getElementById('sortSelect');

  if (sortSelectElement) {
    sortSelectElement.addEventListener('change', renderCatalog);
  }

  document.body.addEventListener('click', (clickEvent) => {
    const quickAddButton = clickEvent.target.closest('[data-quickadd]');

    if (quickAddButton) {
      clickEvent.preventDefault();
      clickEvent.stopPropagation();

      const productToAdd = PRODUCT_CATALOG.find(
        (product) => product.id === Number(quickAddButton.dataset.quickadd)
      );

      quickAddToCart(productToAdd);
      return;
    }

    const productCardElement = clickEvent.target.closest('.tarjeta-producto');

    if (productCardElement) {
      location.href = 'producto.html?id=' + productCardElement.dataset.id;
    }
  });

  renderCatalog();
});
