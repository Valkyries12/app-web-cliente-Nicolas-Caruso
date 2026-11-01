/* KIHAP - producto.js vanilla global - dynamic detail ?id= | ES6+ */
// Cards (productMediaHTML / productCardHTML / productCardHTMLWithBadge) viven en js/ui.js

// ─────────────────────────────────────────────
// Product detail state (fuente única)
// ─────────────────────────────────────────────

const DetailState = {
  product: null,
  related: [],
  size: null,
  color: null,
  qty: 1,
};

// ─────────────────────────────────────────────
// Detail rendering
// ─────────────────────────────────────────────

/**
 * Renderiza el detalle del producto seleccionado.
 */
const renderProductDetail = () => {
  const product = DetailState.product;

  document.getElementById('breadcrumbName').textContent = product.name;
  document.getElementById('detalleCat').textContent = CATEGORY_LABELS[product.category];
  document.getElementById('detalleName').textContent = product.name;
  document.getElementById('detallePrice').textContent = formatPrice(product.price);
  document.getElementById('tabDescripcion').innerHTML = `<p>${escaparHTML(product.desc)}</p>`;

  const mediaBackgroundClass = CATEGORY_STYLE_MAP[product.category];
  const iconColor = product.category === 'cinturones' ? 'var(--ink)' : '#fff';

  const galleryImageMarkup = product.image
    ? `<img src="${product.image}" alt="${escaparHTML(product.name)}" onerror="this.remove()">`
    : '';
  const galleryMainElement = document.getElementById('galleryMain');
  galleryMainElement.className = 'galeria__principal ' + mediaBackgroundClass;
  galleryMainElement.innerHTML =
    `${galleryImageMarkup}<svg class="icono" style="color:${iconColor}"><use href="#${CATEGORY_ICON_MAP[product.category]}"/></svg>`;

  document.getElementById('galleryThumbs').innerHTML = [1, 2, 3]
    .map(
      (thumbnailNumber, thumbnailIndex) =>
        `<div class="galeria__miniatura ${mediaBackgroundClass} ${thumbnailIndex === 0 ? 'galeria__miniatura--activo' : ''}">${thumbnailIndex === 0 ? galleryImageMarkup : ''}<svg class="icono" style="color:${iconColor}"><use href="#${CATEGORY_ICON_MAP[product.category]}"/></svg></div>`
    )
    .join('');

  const sizeBlockElement = document.getElementById('sizeBlock');

  if (product.sizes) {
    sizeBlockElement.style.display = 'block';
    document.getElementById('sizeRow').innerHTML = product.sizes
      .map(
        (sizeOption) =>
          `<button class="opcion ${sizeOption === DetailState.size ? 'opcion--seleccionada' : ''}" data-size="${escaparHTML(sizeOption)}">${escaparHTML(sizeOption)}</button>`
      )
      .join('');
  } else {
    sizeBlockElement.style.display = 'none';
  }

  const colorBlockElement = document.getElementById('colorBlock');

  if (product.colors) {
    colorBlockElement.style.display = 'block';
    document.getElementById('colorRow').innerHTML = product.colors
      .map(
        (colorOption) =>
          `<button class="muestra-color ${colorOption === DetailState.color ? 'muestra-color--seleccionada' : ''}" data-color="${colorOption}" style="${colorOption === '#FFFFFF' ? 'border-color:#DDD9CF' : ''}"><i style="background:${colorOption}"></i></button>`
      )
      .join('');
  } else {
    colorBlockElement.style.display = 'none';
  }

  document.getElementById('detailQty').textContent = DetailState.qty;

  document.getElementById('relatedGrid').innerHTML = DetailState.related
    .map((relatedProduct) => `<li>${productCardHTMLWithBadge(relatedProduct)}</li>`)
    .join('');
};

// Compat
const renderDetalle = () => renderProductDetail();

// ─────────────────────────────────────────────
// Detail actions
// ─────────────────────────────────────────────

/**
 * @param {number} quantityDelta
 */
const changeDetailQty = (quantityDelta) => {
  const topeCantidad = CONFIG.MAX_QTY;

  if (DetailState.qty + quantityDelta > topeCantidad) {
    showToast('Máximo 10 unidades por producto');
    return;
  }

  DetailState.qty = Math.max(1, DetailState.qty + quantityDelta);
  document.getElementById('detailQty').textContent = DetailState.qty;
};

const addDetailToCartHandler = () => {
  addDetailToCart(DetailState.product, DetailState.size, DetailState.color, DetailState.qty);
};

const buyNow = () => {
  addDetailToCart(DetailState.product, DetailState.size, DetailState.color, DetailState.qty);
  location.href = 'carrito.html';
};

// ─────────────────────────────────────────────
// Page initialization
// ─────────────────────────────────────────────

/**
 * @param {import("./products.js").Product} product
 */
const initProductoPage = (product) => {
  DetailState.product = product;
  DetailState.size = DetailState.product.sizes ? DetailState.product.sizes[0] : null;
  DetailState.color = DetailState.product.colors ? DetailState.product.colors[0] : null;
  DetailState.qty = 1;

  renderProductDetail();

  document.getElementById('sizeRow').addEventListener('click', (clickEvent) => {
    const optionButton = clickEvent.target.closest('[data-size]');

    if (optionButton) {
      DetailState.size = optionButton.dataset.size;
      renderProductDetail();
    }
  });

  document.getElementById('colorRow').addEventListener('click', (clickEvent) => {
    const optionButton = clickEvent.target.closest('[data-color]');

    if (optionButton) {
      DetailState.color = optionButton.dataset.color;
      renderProductDetail();
    }
  });

  document.querySelectorAll('.pestanas__boton').forEach((tabButton) => {
    tabButton.addEventListener('click', () => {
      document.querySelectorAll('.pestanas__boton').forEach((tabButtonItem) => {
        tabButtonItem.classList.remove('pestanas__boton--activo');
        tabButtonItem.setAttribute('aria-selected', 'false');
      });

      document.querySelectorAll('.pestanas__panel').forEach((panelElement) => {
        panelElement.classList.remove('pestanas__panel--activo');
      });

      tabButton.classList.add('pestanas__boton--activo');
      tabButton.setAttribute('aria-selected', 'true');
      document
        .querySelector(`[data-tabpanel="${tabButton.dataset.tab}"]`)
        .classList.add('pestanas__panel--activo');
    });
  });

  // Acciones antes inline (onclick) -> data-action
  const bindAction = (action, handler) => {
    document.querySelectorAll(`[data-action="${action}"]`).forEach((btn) => {
      btn.addEventListener('click', handler);
    });
  };

  bindAction('qty-minus', () => changeDetailQty(-1));
  bindAction('qty-plus', () => changeDetailQty(1));
  bindAction('add-cart', addDetailToCartHandler);
  bindAction('buy-now', buyNow);

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

const bootstrapProductoPage = async () => {
  const urlParams = new URLSearchParams(location.search);
  const productIdFromUrl = Number(urlParams.get('id')) || 1;
  const cartPromise = hydrateCart();
  const detail = await withLoader('detailLoader', ['detailContent', 'relatedSection'], async () => {
    const product = await fetchProductById(productIdFromUrl);

    if (!product) {
      return null;
    }

    const relatedProducts = await fetchRelatedProducts(product.category, product.id, 4);

    return { product, relatedProducts };
  });

  if (!detail) {
    location.replace('catalogo.html');
    return;
  }

  DetailState.related = detail.relatedProducts;
  initProductoPage(detail.product);
  await cartPromise;
};

document.addEventListener('DOMContentLoaded', bootstrapProductoPage);
