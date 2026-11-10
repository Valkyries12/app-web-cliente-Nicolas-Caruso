/* KIHAP - repositorio de productos (Supabase) | ES6+ */

const PRODUCTS_TABLE = 'products';
const PRODUCTS_COLUMNS = 'id,name,category,price,sizes,colors,featured,badge,description,image';

const PRODUCT_SORT_ORDERS = {
  relevancia: 'featured.desc,id.asc',
  menor: 'price.asc,id.asc',
  mayor: 'price.desc,id.asc',
  nuevos: 'created_at.desc,id.desc',
};

const productCache = new Map();

/**
 * Guarda un producto en la caché en memoria y lo devuelve.
 * @param {import("./products.js").Product} product
 * @returns {import("./products.js").Product}
 */
const cacheProduct = (product) => {
  productCache.set(product.id, product);
  return product;
};

/**
 * Busca un producto ya traído por alguna consulta anterior.
 * @param {number|string} productId
 * @returns {import("./products.js").Product|null}
 */
const getCachedProduct = (productId) => {
  const numericId = Number(productId);
  return productCache.get(numericId) || null;
};

/**
 * Convierte una fila de Supabase al modelo Product del frontend.
 * @param {object} row
 * @returns {import("./products.js").Product}
 */
const mapProductRow = (row) =>
  cacheProduct({
    id: Number(row.id),
    name: row.name,
    category: row.category,
    price: Number(row.price),
    sizes: row.sizes ?? null,
    colors: row.colors ?? null,
    featured: Boolean(row.featured),
    badge: row.badge ?? undefined,
    desc: row.description,
    image: row.image ?? null,
  });

/**
 * Pide productos a Supabase y los mapea al modelo del frontend.
 * Devuelve null si no hay configuración o si la consulta falla,
 * para que cada llamador aplique su fallback local.
 * @param {Record<string, string|number|Array<string|number>>} params
 * @param {{headers?: Record<string, string>, warning: string}} options
 * @returns {Promise<{products: import("./products.js").Product[], total: number|null}|null>}
 */
const requestRemoteProducts = async (params, { headers, warning }) => {
  if (!hasSupabaseConfig) {
    return null;
  }

  try {
    const { data, total } = await supabaseFetch(PRODUCTS_TABLE, params, { headers });

    if (!Array.isArray(data)) {
      throw new Error('Respuesta inválida de Supabase.');
    }

    return { products: data.map(mapProductRow), total };
  } catch (error) {
    console.warn(warning, error);
    return null;
  }
};

const normalizePage = (page) => {
  const numericPage = Number(page);
  return Number.isInteger(numericPage) && numericPage > 0 ? numericPage : 1;
};

const normalizePageSize = (pageSize) => {
  const numericPageSize = Number(pageSize);
  return Number.isInteger(numericPageSize) && numericPageSize > 0
    ? numericPageSize
    : CONFIG.CATALOG_PAGE_SIZE;
};

const normalizeLimit = (limit, fallback) => {
  const numericLimit = Number(limit);
  return Number.isInteger(numericLimit) && numericLimit > 0 ? numericLimit : fallback;
};

/**
 * Limpia caracteres reservados de PostgREST y separa la búsqueda en palabras.
 * @param {string} searchTerm
 * @returns {string[]}
 */
const sanitizeSearchWords = (searchTerm) =>
  String(searchTerm || '')
    .split(/\s+/)
    .map((word) => word.replace(/[(),.*:%\\]/g, '').trim())
    .filter(Boolean)
    .slice(0, 10);

/**
 * Arma un filtro AND de varios OR (una condición por palabra).
 * @param {string} searchTerm
 * @returns {string|null}
 */
const buildSearchFilter = (searchTerm) => {
  const words = sanitizeSearchWords(searchTerm);

  if (!words.length) {
    return null;
  }

  const wordFilters = words.map(
    (word) =>
      `or(name.ilike.*${word}*,description.ilike.*${word}*,category.ilike.*${word}*)`
  );

  return `(${wordFilters.join(',')})`;
};

const matchesLocalSearch = (product, searchTerm) => {
  const normalizedTerm = normalizarTexto(searchTerm);

  if (!normalizedTerm) {
    return true;
  }

  const haystack = normalizarTexto(
    product.name +
      ' ' +
      (CATEGORY_LABELS[product.category] || product.category) +
      ' ' +
      product.desc
  );

  return normalizedTerm.split(/\s+/).every((word) => haystack.includes(word));
};

const sortLocalProducts = (products, sort) => {
  const sortedProducts = [...products];

  if (sort === 'menor') {
    return sortedProducts.sort(
      (productA, productB) => productA.price - productB.price || productA.id - productB.id
    );
  }

  if (sort === 'mayor') {
    return sortedProducts.sort(
      (productA, productB) => productB.price - productA.price || productA.id - productB.id
    );
  }

  if (sort === 'nuevos') {
    return sortedProducts.sort((productA, productB) => productB.id - productA.id);
  }

  return sortedProducts.sort(
    (productA, productB) =>
      Number(productB.featured) - Number(productA.featured) || productA.id - productB.id
  );
};

const filterLocalProducts = ({
  categories = [],
  minPrice = null,
  maxPrice = null,
  search = '',
  sort = 'relevancia',
}) => {
  const searchTerm = String(search || '').trim();
  const isSearching = searchTerm.length > 0;
  const activeCategories = isSearching ? [] : categories;
  const hasMin = !isSearching && Number.isFinite(minPrice);
  const hasMax = !isSearching && Number.isFinite(maxPrice);

  const filteredProducts = PRODUCT_CATALOG.filter(
    (product) =>
      (!activeCategories.length || activeCategories.includes(product.category)) &&
      (!hasMin || product.price >= minPrice) &&
      (!hasMax || product.price <= maxPrice) &&
      matchesLocalSearch(product, searchTerm)
  );

  return sortLocalProducts(filteredProducts, sort);
};

const buildLocalCatalogPage = ({
  page,
  pageSize,
  categories,
  minPrice,
  maxPrice,
  search,
  sort,
}) => {
  const sortedProducts = filterLocalProducts({
    categories,
    minPrice,
    maxPrice,
    search,
    sort,
  });
  const total = sortedProducts.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const resolvedPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (resolvedPage - 1) * pageSize;

  return {
    products: sortedProducts
      .slice(startIndex, startIndex + pageSize)
      .map((product) => cacheProduct(product)),
    total,
    page: resolvedPage,
    pageSize,
    totalPages,
  };
};

const findLocalProduct = (productId) => {
  const localProduct = PRODUCT_CATALOG.find((product) => product.id === productId);
  return localProduct ? cacheProduct(localProduct) : null;
};

const findLocalProductsByIds = (productIds) =>
  PRODUCT_CATALOG.filter((product) => productIds.includes(product.id)).map((product) =>
    cacheProduct(product)
  );

const findLocalRelatedProducts = (category, excludeId, limit) => {
  const sameCategory = PRODUCT_CATALOG.filter(
    (product) => product.category === category && product.id !== excludeId
  );
  const fallbackProducts = PRODUCT_CATALOG.filter((product) => product.id !== excludeId);
  const relatedProducts = sameCategory.length ? sameCategory : fallbackProducts;

  return relatedProducts.slice(0, limit).map((product) => cacheProduct(product));
};

const sortingOrderFor = (sort) => PRODUCT_SORT_ORDERS[sort] || PRODUCT_SORT_ORDERS.relevancia;

const buildCatalogParams = ({
  page,
  pageSize,
  categories = [],
  minPrice = null,
  maxPrice = null,
  search = '',
  sort = 'relevancia',
}) => {
  const params = {
    select: PRODUCTS_COLUMNS,
    active: 'eq.true',
    order: sortingOrderFor(sort),
    limit: pageSize,
    offset: (page - 1) * pageSize,
  };

  const searchFilter = buildSearchFilter(search);

  if (searchFilter) {
    params.and = searchFilter;
    return params;
  }

  if (categories.length) {
    params.category = `in.(${categories.join(',')})`;
  }

  const priceFilters = [];

  if (Number.isFinite(minPrice)) {
    priceFilters.push(`gte.${minPrice}`);
  }

  if (Number.isFinite(maxPrice)) {
    priceFilters.push(`lte.${maxPrice}`);
  }

  if (priceFilters.length) {
    params.price = priceFilters;
  }

  return params;
};

/**
 * Pide una página del catálogo al servidor.
 * @param {{page?: number, pageSize?: number, categories?: string[], minPrice?: number|null, maxPrice?: number|null, search?: string, sort?: string}} [options]
 * @returns {Promise<{products: import("./products.js").Product[], total: number, page: number, pageSize: number, totalPages: number}>}
 */
const fetchCatalogPage = async (options = {}) => {
  const page = normalizePage(options.page);
  const pageSize = normalizePageSize(options.pageSize);
  const categories = options.categories || [];
  const minPrice = Number.isFinite(options.minPrice) ? options.minPrice : null;
  const maxPrice = Number.isFinite(options.maxPrice) ? options.maxPrice : null;
  const search = options.search || '';
  const sort = options.sort || 'relevancia';

  const localPage = () =>
    buildLocalCatalogPage({
      page,
      pageSize,
      categories,
      minPrice,
      maxPrice,
      search,
      sort,
    });

  const remote = await requestRemoteProducts(
    buildCatalogParams({ page, pageSize, categories, minPrice, maxPrice, search, sort }),
    {
      headers: { Prefer: 'count=exact' },
      warning: 'KIHAP: no se pudo paginar el catálogo remoto. Se usa el local.',
    }
  );

  if (!remote) {
    return localPage();
  }

  const { products, total } = remote;
  const resolvedTotal = Number.isFinite(total)
    ? total
    : (page - 1) * pageSize + products.length;

  return {
    products,
    total: resolvedTotal,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(resolvedTotal / pageSize)),
  };
};

/**
 * Trae los productos destacados para la home.
 * @param {number} [limit]
 * @returns {Promise<import("./products.js").Product[]>}
 */
const fetchFeaturedProducts = async (limit = CONFIG.FEATURED_PRODUCTS_LIMIT) => {
  const safeLimit = normalizeLimit(limit, CONFIG.FEATURED_PRODUCTS_LIMIT);
  const localFeatured = () =>
    PRODUCT_CATALOG.filter((product) => product.featured)
      .slice(0, safeLimit)
      .map((product) => cacheProduct(product));

  const remote = await requestRemoteProducts(
    {
      select: PRODUCTS_COLUMNS,
      active: 'eq.true',
      featured: 'eq.true',
      order: 'featured.desc,id.asc',
      limit: safeLimit,
    },
    {
      warning: 'KIHAP: no se pudieron cargar los destacados remotos. Se usan los locales.',
    }
  );

  return remote ? remote.products : localFeatured();
};

/**
 * Trae un producto por ID.
 * @param {number|string} productId
 * @returns {Promise<import("./products.js").Product|null>}
 */
const fetchProductById = async (productId) => {
  const numericId = Number(productId);

  if (!Number.isFinite(numericId)) {
    return null;
  }

  const remote = await requestRemoteProducts(
    {
      select: PRODUCTS_COLUMNS,
      active: 'eq.true',
      id: `eq.${numericId}`,
      limit: 1,
    },
    {
      warning: 'KIHAP: no se pudo cargar el producto remoto. Se usa el local.',
    }
  );

  if (remote) {
    return remote.products[0] || null;
  }

  return findLocalProduct(numericId);
};

/**
 * Trae productos relacionados (misma categoría, con fallback al resto).
 * @param {string} category
 * @param {number} excludeId
 * @param {number} [limit]
 * @returns {Promise<import("./products.js").Product[]>}
 */
const fetchRelatedProducts = async (category, excludeId, limit = 4) => {
  const safeLimit = normalizeLimit(limit, 4);
  const numericExcludeId = Number(excludeId);
  const localRelated = () =>
    findLocalRelatedProducts(category, numericExcludeId, safeLimit);

  const warning =
    'KIHAP: no se pudieron cargar los relacionados remotos. Se usan los locales.';
  const primary = await requestRemoteProducts(
    {
      select: PRODUCTS_COLUMNS,
      active: 'eq.true',
      category: `eq.${category}`,
      id: `neq.${numericExcludeId}`,
      order: 'id.asc',
      limit: safeLimit,
    },
    { warning }
  );

  if (primary && primary.products.length) {
    return primary.products;
  }

  if (primary) {
    const fallback = await requestRemoteProducts(
      {
        select: PRODUCTS_COLUMNS,
        active: 'eq.true',
        id: `neq.${numericExcludeId}`,
        order: 'id.asc',
        limit: safeLimit,
      },
      { warning }
    );

    if (fallback) {
      return fallback.products;
    }
  }

  return localRelated();
};

/**
 * Trae varios productos por ID en una sola consulta (carrito).
 * @param {Array<number|string>} productIds
 * @returns {Promise<import("./products.js").Product[]>}
 */
const fetchProductsByIds = async (productIds) => {
  const normalizedIds = Array.from(
    new Set(
      (Array.isArray(productIds) ? productIds : [])
        .map((productId) => Number(productId))
        .filter((productId) => Number.isFinite(productId))
    )
  );

  if (!normalizedIds.length) {
    return [];
  }

  const remote = await requestRemoteProducts(
    {
      select: PRODUCTS_COLUMNS,
      active: 'eq.true',
      id: `in.(${normalizedIds.join(',')})`,
      limit: normalizedIds.length,
    },
    {
      warning:
        'KIHAP: no se pudieron cargar los productos del carrito. Se usan los locales.',
    }
  );

  return remote ? remote.products : findLocalProductsByIds(normalizedIds);
};

/**
 * Busca productos para el dropdown de sugerencias.
 * @param {string} searchTerm
 * @param {number} [limit]
 * @returns {Promise<import("./products.js").Product[]>}
 */
const searchProducts = async (searchTerm, limit = 6) => {
  const term = String(searchTerm || '').trim();

  if (!term) {
    return [];
  }

  const safeLimit = normalizeLimit(limit, 6);
  const localSearch = () =>
    sortLocalProducts(
      PRODUCT_CATALOG.filter((product) => matchesLocalSearch(product, term)),
      'relevancia'
    )
      .slice(0, safeLimit)
      .map((product) => cacheProduct(product));

  if (!hasSupabaseConfig) {
    return localSearch();
  }

  const searchFilter = buildSearchFilter(term);

  if (!searchFilter) {
    return [];
  }

  const remote = await requestRemoteProducts(
    {
      select: PRODUCTS_COLUMNS,
      active: 'eq.true',
      order: 'featured.desc,id.asc',
      limit: safeLimit,
      and: searchFilter,
    },
    {
      warning:
        'KIHAP: no se pudieron cargar las sugerencias remotas. Se usan las locales.',
    }
  );

  return remote ? remote.products : localSearch();
};
