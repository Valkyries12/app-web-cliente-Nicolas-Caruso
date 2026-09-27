/* KIHAP - contacto.js vanilla global | ES6+ */

// ─────────────────────────────────────────────
// Contact form handling
// ─────────────────────────────────────────────

/**
 * Restablece el formulario de contacto a su estado inicial.
 * Vuelve a mostrar el formulario y oculta el mensaje de éxito.
 */
const resetContactForm = () => {
  const contactForm = document.getElementById('contactForm');
  const successMessageBox = document.getElementById('successBox');

  contactForm.reset();
  contactForm.style.display = 'block';
  successMessageBox.classList.remove('contacto__exito--visible');
};

const initContactoPage = () => {
  const contactForm = document.getElementById('contactForm');
  const successMessageBox = document.getElementById('successBox');

  if (contactForm) {
    contactForm.addEventListener('submit', (submitEvent) => {
      submitEvent.preventDefault();

      contactForm.style.display = 'none';
      successMessageBox.classList.add('contacto__exito--visible');
    });
  }

  document.querySelectorAll('[data-action="reset-contact"]').forEach((btn) => {
    btn.addEventListener('click', resetContactForm);
  });
};

document.addEventListener('DOMContentLoaded', initContactoPage);
