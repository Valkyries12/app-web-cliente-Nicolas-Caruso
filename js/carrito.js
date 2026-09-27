/* KIHAP - carrito.js vanilla global - página del carrito | ES6+ */
// Usa shoppingCart (cart.js), cards/toast (ui.js) y formato (products.js)

/**
 * Renderiza el contenido de la página del carrito.
 */
const renderCart = () => {
  const cartItemsListElement = document.getElementById('cartItemsList');
  const cartLayoutElement = document.getElementById('cartLayout');

  if (!cartItemsListElement || !cartLayoutElement) {
    return;
  }

  if (shoppingCart.length === 0) {
    cartLayoutElement.innerHTML = `<div class="carrito__vacio" style="grid-column:1/-1;">
      <svg class="icono"><use href="#i-cart"/></svg>
      <h3 style="font-size:22px;margin-bottom:10px;">Tu carrito está vacío</h3>
      <p style="margin-bottom:20px;">Explorá el catálogo y encontrá tu próximo equipo.</p>
      <a class="boton boton--primario" href="catalogo.html">Ir al catálogo</a>
    </div>`;
    return;
  }

  cartItemsListElement.innerHTML = shoppingCart.map(cartItemRowHTML).join('');

  const subtotalElement = document.getElementById('cartSubtotal');
  const shippingElement = document.getElementById('cartShipping');
  const totalElement = document.getElementById('cartTotal');

  if (subtotalElement) {
    subtotalElement.textContent = formatPrice(calculateCartSubtotal());
  }

  if (shippingElement) {
    shippingElement.textContent = formatPrice(calculateShippingCost());
  }

  if (totalElement) {
    totalElement.textContent = formatPrice(calculateCartSubtotal() + calculateShippingCost());
  }

  const totalMovilElement = document.getElementById('cartTotalMovil');

  if (totalMovilElement) {
    totalMovilElement.textContent = formatPrice(calculateCartSubtotal() + calculateShippingCost());
  }
};

const initCarritoPage = () => {
  const cartItemsListElement = document.getElementById('cartItemsList');

  if (cartItemsListElement) {
    cartItemsListElement.addEventListener('click', (clickEvent) => {
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
  }

  renderCart();

  const promoBtn = document.getElementById('promoBtn');
  const promoInput = document.getElementById('promoInput');

  if (promoBtn && promoInput) {
    // Solo letras y números, en mayúsculas, máximo 12 caracteres
    promoInput.addEventListener('input', () => {
      promoInput.value = promoInput.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
    });

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

      if (codigo.length < 4) {
        showToast('Revisá tu código, mínimo 4 caracteres');
        promoInput.focus();
        return;
      }

      showToast('Código aplicado');
    };

    promoBtn.addEventListener('click', applyPromo);

    const promoForm = promoBtn.closest('form');

    if (promoForm) {
      promoForm.addEventListener('submit', applyPromo);
    }
  }

  // No deja ir al checkout con el carrito vacío
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

document.addEventListener('DOMContentLoaded', initCarritoPage);
