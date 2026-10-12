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
 * Lee el término de búsqueda activo del input.
 * @returns {string} Término recortado o cadena vacía
 */
const getActiveSearchTerm = () => {
  const searchInput = document.getElementById('searchInput');

  if (!searchInput) {
    return '';
  }

  return searchInput.value.trim();
};

/**
 * Indica si un producto coincide con el término de búsqueda
 * (nombre + etiqueta de categoría + descripción).
 * @param {import("./products.js").Product} product - Producto a evaluar
 * @param {string} searchTerm - Término de búsqueda
 * @returns {boolean} Verdadero si coincide o no hay término
 */
const matchesSearch = (product, searchTerm) => {
  const normalizedTerm = normalizarTexto(searchTerm);

  if (!normalizedTerm) {
    return true;
  }

  const haystack = normalizarTexto(
    product.name + ' ' + (CATEGORY_LABELS[product.category] || product.category) + ' ' + product.desc
  );

  return normalizedTerm.split(/\s+/).every((word) => haystack.includes(word));
};

/**
 * Resalta el término buscado dentro del nombre del producto.
 * @param {string} productName - Nombre del producto
 * @param {string} searchTerm - Término de búsqueda
 * @returns {string} Nombre con <mark> en las coincidencias
 */
const highlightSearchMatch = (productName, searchTerm) => {
  const safeName = escaparHTML(productName);
  const normalizedTerm = normalizarTexto(searchTerm);

  if (!normalizedTerm) {
    return safeName;
  }

  const firstWord = normalizarTexto(searchTerm.split(/\s+/)[0]);

  if (!firstWord) {
    return safeName;
  }

  const safeTerm = firstWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  return safeName.replace(new RegExp('(' + safeTerm + ')', 'ig'), '<mark>$1</mark>');
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

  const searchInput = document.getElementById('searchInput');

  if (searchInput) {
    searchInput.value = '';
  }

  closeSearchSuggestions();
  syncSearchUrl('');

  renderCatalog();
};

/**
 * Renderiza la grilla del catálogo según filtros y orden.
 */
const renderCatalog = () => {
  const activeCategoryFilters = getActiveCategoryFilters();
  const activePriceFilter = getActivePriceFilter();
  const activeSearchTerm = getActiveSearchTerm();

  const filteredProductList = PRODUCT_CATALOG.filter(
    (product) =>
      (!activeCategoryFilters.length || activeCategoryFilters.includes(product.category)) &&
      matchesPrice(product, activePriceFilter) &&
      matchesSearch(product, activeSearchTerm)
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
  const trimmedTerm = activeSearchTerm.trim();

  if (trimmedTerm) {
    resultCountElement.textContent =
      filteredProductList.length +
      (filteredProductList.length === 1 ? ' producto para “' : ' productos para “') +
      trimmedTerm +
      '”';
  } else {
    resultCountElement.textContent =
      filteredProductList.length + (filteredProductList.length === 1 ? ' producto' : ' productos');
  }
};

// ─────────────────────────────────────────────
// Buscador con sugerencias
// ─────────────────────────────────────────────

const SEARCH_SUGGESTION_LIMIT = 6;
const SEARCH_DEBOUNCE_MS = 180;

let searchDebounceTimer = null;
let activeSuggestionIndex = -1;

/**
 * Sincroniza el término de búsqueda con el parámetro ?q= de la URL.
 * @param {string} searchTerm - Término a sincronizar
 */
const syncSearchUrl = (searchTerm) => {
  const url = new URL(location.href);

  if (searchTerm.trim()) {
    url.searchParams.set('q', searchTerm.trim());
  } else {
    url.searchParams.delete('q');
  }

  history.replaceState(null, '', url);
};

/**
 * Cierra el dropdown de sugerencias y resetea el índice activo.
 */
const closeSearchSuggestions = () => {
  const searchInput = document.getElementById('searchInput');
  const suggestList = document.getElementById('searchSuggest');

  if (suggestList) {
    suggestList.innerHTML = '';
    suggestList.hidden = true;
  }

  if (searchInput) {
    searchInput.setAttribute('aria-expanded', 'false');
  }

  activeSuggestionIndex = -1;
};

/**
 * Marca visualmente la sugerencia activa para navegación por teclado.
 */
const paintActiveSuggestion = () => {
  document.querySelectorAll('#searchSuggest .buscador__item').forEach((item, index) => {
    const isActive = index === activeSuggestionIndex;
    item.classList.toggle('buscador__item--activo', isActive);

    const link = item.querySelector('a');

    if (link) {
      if (isActive) {
        link.setAttribute('aria-selected', 'true');
      } else {
        link.removeAttribute('aria-selected');
      }
    }
  });
};

/**
 * Renderiza el dropdown de sugerencias debajo del input.
 * Cada sugerencia enlaza directo al detalle del producto.
 */
const renderSearchSuggestions = () => {
  const searchInput = document.getElementById('searchInput');
  const suggestList = document.getElementById('searchSuggest');
  const clearButton = document.getElementById('searchClear');

  if (!searchInput || !suggestList) {
    return;
  }

  const searchTerm = searchInput.value.trim();

  if (clearButton) {
    clearButton.hidden = searchTerm.length === 0;
  }

  if (!searchTerm) {
    closeSearchSuggestions();
    return;
  }

  const matches = PRODUCT_CATALOG.filter((product) => matchesSearch(product, searchTerm)).slice(
    0,
    SEARCH_SUGGESTION_LIMIT
  );

  activeSuggestionIndex = -1;

  if (!matches.length) {
    suggestList.innerHTML =
      '<li class="buscador__vacio" role="option" aria-selected="false"><span>Sin resultados para “' +
      escaparHTML(searchTerm) +
      '”</span><button type="button" data-action="clear-search">Limpiar</button></li>';
  } else {
    suggestList.innerHTML = matches
      .map((product) => {
        const iconColor = product.category === 'cinturones' ? 'var(--ink)' : '#fff';
        const imageMarkup = product.image
          ? '<img src="' +
            product.image +
            '" alt="" loading="lazy" onerror="this.remove()">'
          : '';

        return (
          '<li class="buscador__item" role="option"><a href="producto.html?id=' +
          product.id +
          '">' +
          '<span class="buscador__miniatura ' +
          CATEGORY_STYLE_MAP[product.category] +
          '">' +
          imageMarkup +
          '<svg class="icono" style="color:' +
          iconColor +
          '"><use href="#' +
          CATEGORY_ICON_MAP[product.category] +
          '"/></svg></span>' +
          '<span class="buscador__textos"><span class="buscador__nombre">' +
          highlightSearchMatch(product.name, searchTerm) +
          '</span><span class="buscador__meta">' +
          escaparHTML(CATEGORY_LABELS[product.category]) +
          ' · ' +
          formatPrice(product.price) +
          '</span></span></a></li>'
        );
      })
      .join('');
  }

  suggestList.hidden = false;
  searchInput.setAttribute('aria-expanded', 'true');
};

/**
 * Conecta los eventos del buscador: debounce, teclado, limpiar y click fuera.
 */
const initSearch = () => {
  const searchInput = document.getElementById('searchInput');
  const suggestList = document.getElementById('searchSuggest');
  const clearButton = document.getElementById('searchClear');

  if (!searchInput || !suggestList) {
    return;
  }

  searchInput.addEventListener('input', () => {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      renderCatalog();
      renderSearchSuggestions();
      syncSearchUrl(searchInput.value);
    }, SEARCH_DEBOUNCE_MS);
  });

  searchInput.addEventListener('focus', () => {
    if (searchInput.value.trim()) {
      renderSearchSuggestions();
    }
  });

  searchInput.addEventListener('keydown', (keyboardEvent) => {
    const items = suggestList.querySelectorAll('.buscador__item a');

    if (suggestList.hidden || !items.length) {
      if (keyboardEvent.key === 'Escape') {
        closeSearchSuggestions();
      }
      return;
    }

    if (keyboardEvent.key === 'ArrowDown') {
      keyboardEvent.preventDefault();
      activeSuggestionIndex = (activeSuggestionIndex + 1) % items.length;
      paintActiveSuggestion();
    }

    if (keyboardEvent.key === 'ArrowUp') {
      keyboardEvent.preventDefault();
      activeSuggestionIndex =
        (activeSuggestionIndex - 1 + items.length) % items.length;
      paintActiveSuggestion();
    }

    if (keyboardEvent.key === 'Enter' && activeSuggestionIndex >= 0 && items[activeSuggestionIndex]) {
      keyboardEvent.preventDefault();
      location.href = items[activeSuggestionIndex].getAttribute('href');
    }

    if (keyboardEvent.key === 'Escape') {
      closeSearchSuggestions();
    }
  });

  suggestList.addEventListener('click', (clickEvent) => {
    const clearEmpty = clickEvent.target.closest('[data-action="clear-search"]');

    if (clearEmpty) {
      searchInput.value = '';
      searchInput.focus();
      closeSearchSuggestions();
      syncSearchUrl('');
      renderCatalog();
      renderSearchSuggestions();
    }
  });

  if (clearButton) {
    clearButton.addEventListener('click', () => {
      searchInput.value = '';
      searchInput.focus();
      closeSearchSuggestions();
      syncSearchUrl('');
      renderCatalog();
      renderSearchSuggestions();
    });
  }

  document.addEventListener('click', (clickEvent) => {
    if (!clickEvent.target.closest('.buscador')) {
      closeSearchSuggestions();
    }
  });
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

  const searchFromUrl = urlParams.get('q');
  const searchInput = document.getElementById('searchInput');

  if (searchFromUrl && searchInput) {
    searchInput.value = searchFromUrl;
  }

  initSearch();

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
