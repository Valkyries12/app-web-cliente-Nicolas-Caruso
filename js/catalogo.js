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
 * Limpia todos los filtros de categoría y vuelve a renderizar.
 */
const clearFilters = () => {
  document.querySelectorAll('.cat-filter').forEach((filterCheckbox) => {
    filterCheckbox.checked = false;
  });

  renderCatalog();
};

/**
 * Renderiza la grilla del catálogo según filtros y orden.
 */
const renderCatalog = () => {
  const activeCategoryFilters = getActiveCategoryFilters();

  const filteredProductList = activeCategoryFilters.length
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
