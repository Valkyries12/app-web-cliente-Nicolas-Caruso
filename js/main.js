/* KIHAP - main.js vanilla global - header hamburger + badge init */

// ─────────────────────────────────────────────
// Header navigation initialization
// ─────────────────────────────────------------

document.addEventListener('DOMContentLoaded', () => {
  const hamburgerButton = document.getElementById('hamburgerBtn');
  const mainNavigation = document.getElementById('mainNav');

  if (hamburgerButton && mainNavigation) {
    hamburgerButton.addEventListener('click', () => {
      mainNavigation.classList.toggle('navegacion--abierta');
    });
  }

  updateCartBadge();
});
