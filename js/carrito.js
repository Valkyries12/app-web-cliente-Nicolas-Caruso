/* KIHAP - carrito.js vanilla global - página del carrito | ES6+ */
// Usa shoppingCart (cart.js), cards/toast (ui.js) y formato (products.js)

const PROMO_MAX = 12;
const PROMO_MIN = 4;

const setText = (elementId, valor) => {
  const elemento = document.getElementById(elementId);

  if (elemento) {
    elemento.textContent = valor;
  }
};

const emptyCartHTML = `<div class="carrito__vacio" style="grid-column:1/-1;">
      <svg class="icono"><use href="#i-cart"/></svg>
      <h3 style="font-size:22px;margin-bottom:10px;">Tu carrito está vacío</h3>
      <p style="margin-bottom:20px;">Explorá el catálogo y encontrá tu próximo equipo.</p>
      <a class="boton boton--primario" href="catalogo.html">Ir al catálogo</a>
    </div>`;

const renderCarritoVacio = () => {
  const layout = document.getElementById('cartLayout');

  if (layout) {
    layout.innerHTML = emptyCartHTML;
  }
};

const renderCarritoItems = () => {
  document.getElementById('cartItemsList').innerHTML = shoppingCart.map(cartItemRowHTML).join('');
};

const renderCarritoTotales = () => {
  const subtotal = calculateCartSubtotal();
  const envio = calculateShippingCost();
  const total = subtotal + envio;

  setText('cartSubtotal', formatPrice(subtotal));
  setText('cartShipping', formatPrice(envio));
  setText('cartTotal', formatPrice(total));
  setText('cartTotalMovil', formatPrice(total));
};

/**
 * Renderiza el contenido de la página del carrito.
 * Llamada también desde cart.js tras quitar/cambiar cantidad (ver notifyCartChange).
 */
const renderCart = () => {
  if (!document.getElementById('cartItemsList') || !document.getElementById('cartLayout')) {
    return;
  }

  if (shoppingCart.length === 0) {
    renderCarritoVacio();
    return;
  }

  renderCarritoItems();
  renderCarritoTotales();
};

const initCantidadControls = () => {
  const lista = document.getElementById('cartItemsList');

  if (!lista) {
    return;
  }

  lista.addEventListener('click', (clickEvent) => {
    const removeButton = clickEvent.target.closest('[data-remove]');
    const decreaseButton = clickEvent.target.closest('[data-qtyminus]');
    const increaseButton = clickEvent.target.closest('[data-qtyplus]');

    if (removeButton) {
      removeFromCart(Number(removeButton.dataset.remove));
    }

    if (decreaseButton) {
      changeCartQty(Number(decreaseButton.dataset.qtyminus), -1);
    }

    if (increaseButton) {
      changeCartQty(Number(increaseButton.dataset.qtyplus), 1);
    }
  });
};

const normalizarCodigoPromo = (promoInput) => {
  promoInput.value = promoInput.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, PROMO_MAX);
};

const initPromoForm = () => {
  const promoBtn = document.getElementById('promoBtn');
  const promoInput = document.getElementById('promoInput');

  if (!promoBtn || !promoInput) {
    return;
  }

  // Solo letras y números, en mayúsculas, máximo PROMO_MAX caracteres
  promoInput.addEventListener('input', () => normalizarCodigoPromo(promoInput));

  const applyPromo = (promoEvent) => {
    if (promoEvent) {
      promoEvent.preventDefault();
    }

    const codigo = promoInput.value.trim();

    if (!codigo) {
      showToast('Escribí un código primero');
      promoInput.focus();
      return;
    }

    if (codigo.length < PROMO_MIN) {
      showToast('Revisá tu código, mínimo 4 caracteres');
      promoInput.focus();
      return;
    }

    showToast('Código aplicado');
  };

  // El botón ya es type="submit": con el submit alcanza para click + Enter
  const promoForm = promoBtn.closest('form');

  if (promoForm) {
    promoForm.addEventListener('submit', applyPromo);
  } else {
    promoBtn.addEventListener('click', applyPromo);
  }
};

// No deja ir al checkout con el carrito vacío
const initCheckoutGuard = () => {
  ['btnCheckout', 'btnCheckoutMovil'].forEach((btnId) => {
    const btn = document.getElementById(btnId);

    if (btn) {
      btn.addEventListener('click', (clickEvent) => {
        if (shoppingCart.length === 0) {
          clickEvent.preventDefault();
          showToast('Tu carrito está vacío');
        }
      });
    }
  });
};

const initCarritoPage = () => {
  initCantidadControls();
  renderCart();
  initPromoForm();
  initCheckoutGuard();
};

document.addEventListener('DOMContentLoaded', initCarritoPage);
