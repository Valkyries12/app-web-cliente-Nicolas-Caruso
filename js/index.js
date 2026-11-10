/* KIHAP - index.js vanilla global - home: destacados + navegación | ES6+ */
// Usa el repositorio de productos (server-side), cards (ui.js) y carrito (cart.js)

/**
 * Renderiza la grilla de productos "Más elegidos" en la página de inicio.
 * @param {import("./products.js").Product[]} featuredProducts
 */
const renderFeatured = (featuredProducts) => {
  const featuredGrid = document.getElementById('featuredGrid');

  if (!featuredGrid) {
    return;
  }

  featuredGrid.innerHTML = featuredProducts
    .map((product) => `<li>${productCardHTML(product)}</li>`)
    .join('');
};

const bootstrapHomePage = async () => {
  const cartPromise = hydrateCart();
  const featuredProducts = await withLoader('featuredLoader', ['featuredGrid'], () =>
    fetchFeaturedProducts()
  );

  renderFeatured(featuredProducts);
  initProductCardActions();
  await cartPromise;
};

document.addEventListener('DOMContentLoaded', bootstrapHomePage);
