/* KIHAP - repositorio de productos (Supabase) | ES6+ */

const PRODUCTS_TABLE = 'products';
const PRODUCTS_COLUMNS = 'id,name,category,price,sizes,colors,featured,badge,description,image';

let catalogLoadPromise = null;

/**
 * Convierte una fila de Supabase al modelo Product del frontend.
 * @param {object} row
 * @returns {import("./products.js").Product}
 */
const mapProductRow = (row) => ({
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
 * Carga el catálogo desde Supabase una sola vez por página.
 * Si falla o no hay configuración, mantiene PRODUCT_CATALOG local.
 * @returns {Promise<import("./products.js").Product[]>}
 */
const loadCatalog = () => {
  if (catalogLoadPromise) {
    return catalogLoadPromise;
  }

  catalogLoadPromise = (async () => {
    if (!supabaseClient) {
      return PRODUCT_CATALOG;
    }

    try {
      const { data, error } = await supabaseClient
        .from(PRODUCTS_TABLE)
        .select(PRODUCTS_COLUMNS)
        .eq('active', true)
        .order('id', { ascending: true });

      if (error) {
        throw error;
      }

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('El catálogo remoto está vacío.');
      }

      PRODUCT_CATALOG = data.map(mapProductRow);
    } catch (error) {
      console.warn('KIHAP: no se pudo cargar el catálogo remoto. Se usa el local.', error);
    }

    return PRODUCT_CATALOG;
  })();

  return catalogLoadPromise;
};
