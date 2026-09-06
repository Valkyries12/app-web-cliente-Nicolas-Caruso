/* KIHAP - contacto.js vanilla global */

// ─────────────────────────────────────────────
// Contact form handling
// ─────────────────────────────────------------

document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contactForm');
  const successMessageBox = document.getElementById('successBox');

  if (contactForm) {
    contactForm.addEventListener('submit', (submitEvent) => {
      submitEvent.preventDefault();

      contactForm.style.display = 'none';
      successMessageBox.classList.add('contacto__exito--visible');
    });
  }
});

/**
 * Restablece el formulario de contacto a su estado inicial.
 * Vuelve a mostrar el formulario y oculta el mensaje de éxito.
 */
function resetContactForm() {
  const contactForm = document.getElementById('contactForm');
  const successMessageBox = document.getElementById('successBox');

  contactForm.reset();
  contactForm.style.display = 'block';
  successMessageBox.classList.remove('contacto__exito--visible');
}
