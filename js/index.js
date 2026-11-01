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
    .map((product) => `<li>${productCardHTMLWithBadge(product)}</li>`)
    .join('');
};

const initHomePage = () => {
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

const bootstrapHomePage = async () => {
  const cartPromise = hydrateCart();
  const featuredProducts = await withLoader('featuredLoader', ['featuredGrid'], () =>
    fetchFeaturedProducts()
  );

  renderFeatured(featuredProducts);
  initHomePage();
  await cartPromise;
};

document.addEventListener('DOMContentLoaded', bootstrapHomePage);
