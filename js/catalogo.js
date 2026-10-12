/* KIHAP - catalog.js vanilla global | BEM español | ES6+ */
// Cards (productMediaHTML / productCardHTML / productCardHTMLWithBadge) viven en js/ui.js

// ─────────────────────────────────────────────
// Catalog filters & sorting
// ─────────────────────────────────────────────

/**
 * @returns {string[]}
 */
const getActiveCategoryFilters = () =>
  Array.from(document.querySelectorAll('.cat-filter:checked')).map(
    (filterCheckbox) => filterCheckbox.value
  );

/**
 * Lee el chip de precio activo (selección única).
 * @returns {{min: number, max: number|null}|null} Rango activo o null si no hay filtro
 */
const getActivePriceFilter = () => {
  const priceChip = document.querySelector(
    '.filtro__chip[data-min][aria-pressed="true"]'
  );

  if (!priceChip) {
    return null;
  }

  return {
    min: Number(priceChip.dataset.min),
    max: priceChip.dataset.max === '' ? null : Number(priceChip.dataset.max),
  };
};

/**
 * Indica si un producto coincide con el rango de precio activo.
 * @param {import("./products.js").Product} product - Producto a evaluar
 * @param {{min: number, max: number|null}|null} priceFilter - Rango activo o null
 * @returns {boolean} Verdadero si coincide o no hay filtro
 */
const matchesPrice = (product, priceFilter) => {
  if (!priceFilter) {
    return true;
  }

  if (product.price < priceFilter.min) {
    return false;
  }

  if (priceFilter.max !== null && product.price > priceFilter.max) {
    return false;
  }

  return true;
};

/**
 * Selecciona un chip de precio en modo único y vuelve a renderizar.
 * @param {HTMLElement} priceChip - Chip de precio presionado
 */
const selectPriceChip = (priceChip) => {
  const wasActive = priceChip.getAttribute('aria-pressed') === 'true';

  document
    .querySelectorAll('.filtro__chip[data-min]')
    .forEach((chip) => chip.setAttribute('aria-pressed', 'false'));

  priceChip.setAttribute('aria-pressed', String(!wasActive));
  renderCatalog();
};

/**
 * Limpia todos los filtros (categoría, precio) y restaura el orden.
 */
const clearFilters = () => {
  document.querySelectorAll('.cat-filter').forEach((filterCheckbox) => {
    filterCheckbox.checked = false;
  });

  document.querySelectorAll('.filtro__chip[aria-pressed="true"]').forEach((chip) => {
    chip.setAttribute('aria-pressed', 'false');
  });

  document.getElementById('sortSelect').value = 'relevancia';

  renderCatalog();
};

/**
 * Renderiza la grilla del catálogo según filtros y orden.
 */
const renderCatalog = () => {
  const activeCategoryFilters = getActiveCategoryFilters();
  const activePriceFilter = getActivePriceFilter();

  const filteredProductList = PRODUCT_CATALOG.filter(
    (product) =>
      (!activeCategoryFilters.length || activeCategoryFilters.includes(product.category)) &&
      matchesPrice(product, activePriceFilter)
  );

  const sortOrder = document.getElementById('sortSelect').value;

  if (sortOrder === 'relevancia') {
    filteredProductList.sort(
      (productA, productB) => Number(productB.featured) - Number(productA.featured)
    );
  }

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
    .map((product) => `<li>${productCardHTMLWithBadge(product)}</li>`)
    .join('');

  const resultCountElement = document.getElementById('resultCount');
  resultCountElement.textContent =
    filteredProductList.length + (filteredProductList.length === 1 ? ' producto' : ' productos');
};

// ─────────────────────────────────────────────
// Page initialization
// ─────────────────────────────────────────────

const initCatalogoPage = () => {
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

  const filtrosForm = document.getElementById('filtrosForm');

  if (filtrosForm) {
    filtrosForm.addEventListener('click', (clickEvent) => {
      const priceChip = clickEvent.target.closest('.filtro__chip[data-min]');

      if (priceChip) {
        selectPriceChip(priceChip);
      }
    });
  }

  const sortSelectElement = document.getElementById('sortSelect');

  if (sortSelectElement) {
    sortSelectElement.addEventListener('change', renderCatalog);
  }

  const clearFiltersBtn = document.getElementById('clearFiltersBtn');

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', clearFilters);
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
};

document.addEventListener('DOMContentLoaded', initCatalogoPage);
