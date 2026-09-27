/* KIHAP - index.js vanilla global - home: destacados + navegación | ES6+ */
// Usa PRODUCT_CATALOG (products.js), cards (ui.js) y carrito (cart.js)

/**
 * Renderiza la grilla de productos destacados en la página de inicio.
 */
const renderFeatured = () => {
  const featuredProducts = PRODUCT_CATALOG.filter((product) => product.featured);

  document.getElementById('featuredGrid').innerHTML = featuredProducts
    .map(productCardHTMLWithBadge)
    .join('');
};

const initHomePage = () => {
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

  renderFeatured();
};

document.addEventListener('DOMContentLoaded', initHomePage);
