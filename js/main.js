/* KIHAP - main.js vanilla - header hamburger + badge init */
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('hamburgerBtn');
  const nav = document.getElementById('mainNav');
  if (btn && nav) {
    btn.addEventListener('click', () => nav.classList.toggle('navegacion--abierta'));
  }
  updateCartBadge();
});
