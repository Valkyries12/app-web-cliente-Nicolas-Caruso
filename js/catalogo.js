/* KIHAP - catalog.js vanilla global | BEM español | ES6+ */
// Cards (productMediaHTML / productCardHTML / productCardHTMLWithBadge) viven en js/ui.js
// Paginado, filtros, orden y búsqueda se resuelven en Supabase (PostgREST).

// ─────────────────────────────────────────────
// Catalog state & configuration
// ─────────────────────────────────────────────

const CATALOG_PAGE_SIZE = CONFIG.CATALOG_PAGE_SIZE;
const SEARCH_SUGGESTION_LIMIT = 6;
const SEARCH_DEBOUNCE_MS = 180;
const CATALOG_SORT_VALUES = ['relevancia', 'menor', 'mayor', 'nuevos'];
const CATALOG_CATEGORY_VALUES = ['doboks', 'protecciones', 'cinturones', 'accesorios'];

const catalogState = {
  page: 1,
  total: 0,
  totalPages: 1,
  products: [],
};

let catalogRequestToken = 0;
let searchDebounceTimer = null;
let suggestionRequestToken = 0;
let activeSuggestionIndex = -1;

// ─────────────────────────────────────────────
// Catalog filters
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
 * Lee el orden activo del selector.
 * @returns {string}
 */
const getActiveSortOrder = () => {
  const sortSelect = document.getElementById('sortSelect');
  return sortSelect ? sortSelect.value : 'relevancia';
};

/**
 * Lee todo el estado desde los controles de la UI.
 * @returns {{categories: string[], minPrice: number|null, maxPrice: number|null, search: string, sort: string}}
 */
const readStateFromControls = () => {
  const priceFilter = getActivePriceFilter();

  return {
    categories: getActiveCategoryFilters(),
    minPrice: priceFilter ? priceFilter.min : null,
    maxPrice: priceFilter ? priceFilter.max : null,
    search: getActiveSearchTerm(),
    sort: getActiveSortOrder(),
  };
};

/**
 * Busca el chip de precio que coincide con un rango.
 * @param {number} minPrice
 * @param {number|null} maxPrice
 * @returns {HTMLElement|null}
 */
const findPriceChip = (minPrice, maxPrice) =>
  Array.from(document.querySelectorAll('.filtro__chip[data-min]')).find((chip) => {
    const chipMin = Number(chip.dataset.min);
    const chipMax = chip.dataset.max === '' ? null : Number(chip.dataset.max);
    return chipMin === minPrice && chipMax === maxPrice;
  }) || null;

/**
 * Aplica un estado a los controles del catálogo.
 * @param {{categories?: string[], minPrice?: number|null, maxPrice?: number|null, search?: string, sort?: string}} state
 */
const applyStateToControls = (state = {}) => {
  const searchInput = document.getElementById('searchInput');
  const clearButton = document.getElementById('searchClear');
  const searchTerm = String(state.search || '').trim();

  if (searchInput) {
    searchInput.value = searchTerm;
  }

  if (clearButton) {
    clearButton.hidden = !searchTerm;
  }

  const categories = state.categories || [];

  document.querySelectorAll('.cat-filter').forEach((filterCheckbox) => {
    filterCheckbox.checked = categories.includes(filterCheckbox.value);
  });

  document.querySelectorAll('.filtro__chip[data-min]').forEach((chip) => {
    chip.setAttribute('aria-pressed', 'false');
  });

  if (Number.isFinite(state.minPrice)) {
    const priceChip = findPriceChip(
      state.minPrice,
      Number.isFinite(state.maxPrice) ? state.maxPrice : null
    );

    if (priceChip) {
      priceChip.setAttribute('aria-pressed', 'true');
    }
  }

  const sortSelect = document.getElementById('sortSelect');

  if (sortSelect) {
    sortSelect.value = CATALOG_SORT_VALUES.includes(state.sort)
      ? state.sort
      : 'relevancia';
  }

  closeSearchSuggestions();
};

/**
 * Desmarca visualmente todos los filtros de categoría y precio.
 */
const resetFilterControls = () => {
  document.querySelectorAll('.cat-filter').forEach((filterCheckbox) => {
    filterCheckbox.checked = false;
  });

  document.querySelectorAll('.filtro__chip[aria-pressed="true"]').forEach((chip) => {
    chip.setAttribute('aria-pressed', 'false');
  });
};

// ─────────────────────────────────────────────
// URL state
// ─────────────────────────────────────────────

const parsePriceParam = (value) => {
  if (value === null || value === '') {
    return null;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
};

/**
 * Lee el estado del catálogo desde la URL.
 * @returns {{categories: string[], minPrice: number|null, maxPrice: number|null, search: string, sort: string, page: number}}
 */
const readStateFromUrl = () => {
  const urlParams = new URLSearchParams(location.search);
  const search = (urlParams.get('q') || '').trim();
  const categories = (urlParams.get('cat') || '')
    .split(',')
    .map((category) => category.trim())
    .filter((category) => CATALOG_CATEGORY_VALUES.includes(category));
  const minPrice = parsePriceParam(urlParams.get('min'));
  const maxPrice = parsePriceParam(urlParams.get('max'));
  const sortParam = urlParams.get('sort');
  const sort = CATALOG_SORT_VALUES.includes(sortParam) ? sortParam : 'relevancia';
  const pageParam = Number(urlParams.get('page'));
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  if (search) {
    return {
      categories: [],
      minPrice: null,
      maxPrice: null,
      search,
      sort,
      page,
    };
  }

  return { categories, minPrice, maxPrice, search, sort, page };
};

/**
 * Construye la URL con todo el estado no-default del catálogo.
 * @returns {URL}
 */
const buildCatalogUrl = () => {
  const state = readStateFromControls();
  const url = new URL(location.href);
  const searchTerm = state.search.trim();

  if (searchTerm) {
    url.searchParams.set('q', searchTerm);
  } else {
    url.searchParams.delete('q');
  }

  if (!searchTerm && state.categories.length) {
    url.searchParams.set('cat', state.categories.join(','));
  } else {
    url.searchParams.delete('cat');
  }

  if (!searchTerm && Number.isFinite(state.minPrice)) {
    url.searchParams.set('min', String(state.minPrice));
  } else {
    url.searchParams.delete('min');
  }

  if (!searchTerm && Number.isFinite(state.maxPrice)) {
    url.searchParams.set('max', String(state.maxPrice));
  } else {
    url.searchParams.delete('max');
  }

  if (state.sort !== 'relevancia') {
    url.searchParams.set('sort', state.sort);
  } else {
    url.searchParams.delete('sort');
  }

  if (catalogState.page > 1) {
    url.searchParams.set('page', String(catalogState.page));
  } else {
    url.searchParams.delete('page');
  }

  return url;
};

/**
 * Sincroniza el estado actual con la URL.
 * @param {{push?: boolean}} [options]
 */
const syncCatalogUrl = ({ push = false } = {}) => {
  const url = buildCatalogUrl();

  if (push) {
    history.pushState(null, '', url.toString());
  } else {
    history.replaceState(null, '', url.toString());
  }
};

// ─────────────────────────────────────────────
// Catalog rendering
// ─────────────────────────────────────────────

/**
 * Renderiza las tarjetas, el contador y el paginador.
 * @param {import("./products.js").Product[]} products
 * @param {number} total
 * @param {string} searchTerm
 */
const renderCatalog = (products, total, searchTerm) => {
  const catalogGrid = document.getElementById('catalogGrid');

  if (!catalogGrid) {
    return;
  }

  catalogGrid.innerHTML = products.length
    ? products.map((product) => `<li>${productCardHTMLWithBadge(product)}</li>`).join('')
    : '<li class="catalogo__vacio">No se encontraron productos con esos filtros.</li>';

  const resultCountElement = document.getElementById('resultCount');

  if (!resultCountElement) {
    return;
  }

  const trimmedTerm = String(searchTerm || '').trim();

  if (total === 0) {
    resultCountElement.textContent = trimmedTerm
      ? '0 productos para “' + trimmedTerm + '”'
      : '0 productos';
    return;
  }

  const start = (catalogState.page - 1) * CATALOG_PAGE_SIZE + 1;
  const end = Math.min(start + CATALOG_PAGE_SIZE - 1, total);
  const summary = 'Mostrando ' + start + '–' + end + ' de ' + total + ' productos';

  resultCountElement.textContent = trimmedTerm
    ? summary + ' para “' + trimmedTerm + '”'
    : summary;
};

/**
 * Calcula qué páginas mostrar, con elipsis para rangos largos.
 * @param {number} currentPage
 * @param {number} totalPages
 * @returns {Array<number|'ellipsis'>}
 */
const getPageItems = (currentPage, totalPages) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, currentPage]);

  for (let offset = -2; offset <= 2; offset += 1) {
    const pageNumber = currentPage + offset;

    if (pageNumber >= 1 && pageNumber <= totalPages) {
      pages.add(pageNumber);
    }
  }

  if (currentPage <= 3) {
    [2, 3, 4].forEach((pageNumber) => pages.add(pageNumber));
  }

  if (currentPage >= totalPages - 2) {
    [totalPages - 3, totalPages - 2, totalPages - 1].forEach((pageNumber) =>
      pages.add(pageNumber)
    );
  }

  const sortedPages = Array.from(pages)
    .filter((pageNumber) => pageNumber >= 1 && pageNumber <= totalPages)
    .sort((pageA, pageB) => pageA - pageB);

  const pageItems = [];

  sortedPages.forEach((pageNumber, index) => {
    if (index > 0 && pageNumber - sortedPages[index - 1] > 1) {
      pageItems.push('ellipsis');
    }

    pageItems.push(pageNumber);
  });

  return pageItems;
};

/**
 * Renderiza el paginador completo.
 */
const renderPagination = () => {
  const paginationElement = document.getElementById('catalogPagination');

  if (!paginationElement) {
    return;
  }

  if (catalogState.totalPages <= 1) {
    paginationElement.hidden = true;
    paginationElement.innerHTML = '';
    return;
  }

  const currentPage = catalogState.page;
  const previousPage = Math.max(1, currentPage - 1);
  const nextPage = Math.min(catalogState.totalPages, currentPage + 1);
  const pageItems = getPageItems(currentPage, catalogState.totalPages);

  const numbersMarkup = pageItems
    .map((item) => {
      if (item === 'ellipsis') {
        return '<span class="paginacion__puntos" aria-hidden="true">…</span>';
      }

      const isCurrent = item === currentPage;

      return (
        '<button class="paginacion__boton' +
        (isCurrent ? ' paginacion__boton--activo' : '') +
        '" type="button" data-page="' +
        item +
        '" aria-label="Página ' +
        item +
        '"' +
        (isCurrent ? ' aria-current="page"' : '') +
        '>' +
        item +
        '</button>'
      );
    })
    .join('');

  paginationElement.innerHTML =
    '<button class="paginacion__boton paginacion__boton--nav" type="button" data-page="' +
    previousPage +
    '" aria-label="Página anterior"' +
    (currentPage <= 1 ? ' disabled' : '') +
    '>‹ Anterior</button>' +
    '<span class="paginacion__numeros">' +
    numbersMarkup +
    '</span>' +
    '<button class="paginacion__boton paginacion__boton--nav" type="button" data-page="' +
    nextPage +
    '" aria-label="Página siguiente"' +
    (currentPage >= catalogState.totalPages ? ' disabled' : '') +
    '>Siguiente ›</button>';

  paginationElement.hidden = false;
};

/**
 * Desplaza la vista al inicio del catálogo al cambiar de página.
 */
const scrollToCatalog = () => {
  const catalogBar = document.getElementById('catalogoBarra');

  if (!catalogBar) {
    return;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  catalogBar.scrollIntoView({
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
    block: 'start',
  });
};

// ─────────────────────────────────────────────
// Catalog loading
// ─────────────────────────────────────────────

/**
 * Pide y renderiza una página del catálogo.
 * @param {{page?: number, pushUrl?: boolean, scroll?: boolean}} [options]
 */
const loadCatalogPage = async ({ page = 1, pushUrl = true, scroll = true } = {}) => {
  const requestToken = ++catalogRequestToken;
  const filters = readStateFromControls();
  const requestedPage = Math.max(1, Number(page) || 1);
  const catalogGrid = document.getElementById('catalogGrid');

  if (catalogGrid) {
    catalogGrid.setAttribute('aria-busy', 'true');
  }

  try {
    const baseQuery = {
      pageSize: CATALOG_PAGE_SIZE,
      categories: filters.categories,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      search: filters.search,
      sort: filters.sort,
    };

    let result = await fetchCatalogPage({ ...baseQuery, page: requestedPage });

    if (requestToken !== catalogRequestToken) {
      return;
    }

    if (result.total > 0 && result.page === requestedPage && requestedPage > result.totalPages) {
      result = await fetchCatalogPage({ ...baseQuery, page: result.totalPages });

      if (requestToken !== catalogRequestToken) {
        return;
      }
    }

    catalogState.page = result.total > 0 ? result.page : 1;
    catalogState.total = result.total;
    catalogState.totalPages = result.totalPages;
    catalogState.products = result.products;

    renderCatalog(result.products, result.total, filters.search);
    renderPagination();
    syncCatalogUrl({ push: pushUrl });

    if (scroll) {
      scrollToCatalog();
    }
  } catch (error) {
    if (requestToken !== catalogRequestToken) {
      return;
    }

    console.error('KIHAP: no se pudo cargar el catálogo.', error);
    catalogState.page = 1;
    catalogState.total = 0;
    catalogState.totalPages = 1;
    catalogState.products = [];
    renderCatalog([], 0, filters.search);
    renderPagination();
  } finally {
    if (requestToken === catalogRequestToken && catalogGrid) {
      catalogGrid.setAttribute('aria-busy', 'false');
    }
  }
};

// ─────────────────────────────────────────────
// Buscador con sugerencias
// ─────────────────────────────────────────────

/**
 * Limpia el término de búsqueda y sus sugerencias.
 */
const clearSearchTerm = () => {
  const searchInput = document.getElementById('searchInput');
  const clearButton = document.getElementById('searchClear');

  if (searchInput) {
    searchInput.value = '';
  }

  if (clearButton) {
    clearButton.hidden = true;
  }

  closeSearchSuggestions();
};

/**
 * Cierra el dropdown de sugerencias y resetea el índice activo.
 */
const closeSearchSuggestions = () => {
  suggestionRequestToken += 1;

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
 * Normaliza texto para comparar sin mayúsculas ni tildes.
 * @param {string} text
 * @returns {string}
 */
const foldSearchText = (text) =>
  String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

/**
 * Genera el texto plegado y el rango original de cada carácter.
 * Permite resaltar coincidencias ignorando tildes sin romper el HTML.
 * @param {string} text
 * @returns {{folded: string, ranges: Array<{start: number, end: number}>}}
 */
const buildFoldedName = (text) => {
  let folded = '';
  const ranges = [];
  let offset = 0;

  for (const character of String(text || '')) {
    const start = offset;
    offset += character.length;

    const foldedCharacter = foldSearchText(character);

    for (let index = 0; index < foldedCharacter.length; index += 1) {
      folded += foldedCharacter[index];
      ranges.push({ start, end: offset });
    }
  }

  return { folded, ranges };
};

/**
 * Resalta la primera palabra buscada dentro del nombre del producto,
 * ignorando mayúsculas y tildes.
 * @param {string} productName
 * @param {string} searchTerm
 * @returns {string}
 */
const highlightSearchMatch = (productName, searchTerm) => {
  const name = String(productName || '');
  const firstWord = String(searchTerm || '').trim().split(/\s+/)[0];
  const foldedTerm = foldSearchText(firstWord);

  if (!foldedTerm) {
    return escaparHTML(name);
  }

  const { folded, ranges } = buildFoldedName(name);
  let originalCursor = 0;
  let matchIndex = folded.indexOf(foldedTerm);
  let highlightedName = '';

  while (matchIndex !== -1) {
    const matchStart = ranges[matchIndex].start;
    const matchEnd = ranges[matchIndex + foldedTerm.length - 1].end;

    highlightedName += escaparHTML(name.slice(originalCursor, matchStart));
    highlightedName += '<mark>' + escaparHTML(name.slice(matchStart, matchEnd)) + '</mark>';

    originalCursor = matchEnd;
    matchIndex = folded.indexOf(foldedTerm, matchIndex + foldedTerm.length);
  }

  if (!highlightedName) {
    return escaparHTML(name);
  }

  return highlightedName + escaparHTML(name.slice(originalCursor));
};

/**
 * Renderiza el dropdown de sugerencias debajo del input.
 * Cada sugerencia enlaza directo al detalle del producto.
 */
const renderSearchSuggestions = async () => {
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

  const requestToken = ++suggestionRequestToken;
  const matches = await searchProducts(searchTerm, SEARCH_SUGGESTION_LIMIT);

  if (requestToken !== suggestionRequestToken || searchInput.value.trim() !== searchTerm) {
    return;
  }

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
    resetFilterControls();
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      catalogState.page = 1;
      renderSearchSuggestions();
      loadCatalogPage({ page: 1, pushUrl: false });
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
      clearSearchTerm();
      searchInput.focus();
      loadCatalogPage({ page: 1, pushUrl: false });
      renderSearchSuggestions();
    }
  });

  if (clearButton) {
    clearButton.addEventListener('click', () => {
      clearSearchTerm();
      searchInput.focus();
      loadCatalogPage({ page: 1, pushUrl: false });
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
// Catalog events
// ─────────────────────────────────────────────

/**
 * Activa un chip de precio en modo único y recarga desde la página 1.
 * @param {HTMLElement} priceChip - Chip de precio presionado
 */
const selectPriceChip = (priceChip) => {
  if (getActiveSearchTerm()) {
    clearSearchTerm();
  }

  const wasActive = priceChip.getAttribute('aria-pressed') === 'true';

  document
    .querySelectorAll('.filtro__chip[data-min]')
    .forEach((chip) => chip.setAttribute('aria-pressed', 'false'));

  priceChip.setAttribute('aria-pressed', String(!wasActive));
  loadCatalogPage({ page: 1, pushUrl: true });
};

/**
 * Limpia todos los filtros (categoría, precio, búsqueda) y restaura el orden.
 */
const clearFilters = () => {
  resetFilterControls();

  const sortSelect = document.getElementById('sortSelect');

  if (sortSelect) {
    sortSelect.value = 'relevancia';
  }

  clearSearchTerm();
  loadCatalogPage({ page: 1, pushUrl: true });
};

const bindCatalogControls = () => {
  document.querySelectorAll('.cat-filter').forEach((filterCheckbox) => {
    filterCheckbox.addEventListener('change', () => {
      if (getActiveSearchTerm()) {
        clearSearchTerm();
      }

      loadCatalogPage({ page: 1, pushUrl: true });
    });
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
    sortSelectElement.addEventListener('change', () => {
      loadCatalogPage({ page: 1, pushUrl: true });
    });
  }

  const clearFiltersBtn = document.getElementById('clearFiltersBtn');

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', clearFilters);
  }
};

const bindPagination = () => {
  const paginationElement = document.getElementById('catalogPagination');

  if (!paginationElement) {
    return;
  }

  paginationElement.addEventListener('click', (clickEvent) => {
    const pageButton = clickEvent.target.closest('button[data-page]');

    if (!pageButton || pageButton.disabled) {
      return;
    }

    const targetPage = Number(pageButton.dataset.page);

    if (!Number.isInteger(targetPage) || targetPage === catalogState.page) {
      return;
    }

    loadCatalogPage({ page: targetPage, pushUrl: true });
  });
};

const bindProductActions = () => {
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

const handlePopState = () => {
  const urlState = readStateFromUrl();
  applyStateToControls(urlState);
  loadCatalogPage({ page: urlState.page, pushUrl: false, scroll: false });
};

// ─────────────────────────────────────────────
// Page initialization
// ─────────────────────────────────────────────

const initCatalogoPage = async () => {
  const urlState = readStateFromUrl();

  applyStateToControls(urlState);
  initSearch();
  bindCatalogControls();
  bindPagination();
  bindProductActions();
  window.addEventListener('popstate', handlePopState);

  await withLoader('catalogLoader', ['catalogGrid'], () =>
    loadCatalogPage({ page: urlState.page, pushUrl: false, scroll: false })
  );
};

const bootstrapCatalogoPage = async () => {
  await initCatalogoPage();
  await hydrateCart();
};

document.addEventListener('DOMContentLoaded', bootstrapCatalogoPage);
