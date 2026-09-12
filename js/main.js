/* KIHAP - main.js vanilla global - header hamburger + badge init */

document.addEventListener('DOMContentLoaded', () => {
  const hamburgerButton = document.getElementById('hamburgerBtn');
  const mainNavigation = document.getElementById('mainNav');

  if (hamburgerButton && mainNavigation) {
    hamburgerButton.addEventListener('click', () => {
      const isOpen = mainNavigation.classList.toggle('navegacion--abierta');
      hamburgerButton.setAttribute('aria-expanded', String(isOpen));
      hamburgerButton.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    });
  }

  const filtrosBtn = document.getElementById('filtrosBtn');
  const filtrosPanel = document.getElementById('filtrosPanel');

  if (filtrosBtn && filtrosPanel) {
    filtrosBtn.addEventListener('click', () => {
      const isOpen = filtrosPanel.classList.toggle('catalogo__filtros--abierto');
      filtrosBtn.setAttribute('aria-expanded', String(isOpen));
    });
  }

  updateCartBadge();
});
