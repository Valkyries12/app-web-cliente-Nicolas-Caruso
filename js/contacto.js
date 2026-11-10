/* KIHAP - contacto.js vanilla global | ES6+ */
/* Usa los helpers compartidos de js/validaciones.js (cargar antes que este archivo) */

// Valida el formulario de contacto. Devuelve true si todo está bien.
const validarContacto = () => {
  const marcador = crearMarcadorErrores();

  if (!validarSoloLetras('contacto-nombre', 'nombre y apellido', 2, 40)) {
    marcador.marcar('contacto-nombre');
  }

  if (!validarEmail('contacto-email')) {
    marcador.marcar('contacto-email');
  }

  // Asunto: debe elegir una opción
  const asunto = document.getElementById('contacto-asunto').value;

  if (!asunto) {
    mostrarError('contacto-asunto', 'Debe seleccionar un asunto.');
    marcador.marcar('contacto-asunto');
  } else {
    limpiarError('contacto-asunto');
  }

  // Mensaje: obligatorio, entre 10 y 1000 caracteres
  const mensaje = normalizarEspacios(document.getElementById('contacto-mensaje').value);

  if (!mensaje) {
    mostrarError('contacto-mensaje', 'El mensaje es obligatorio.');
    marcador.marcar('contacto-mensaje');
  } else if (mensaje.length < 10 || mensaje.length > 1000) {
    mostrarError(
      'contacto-mensaje',
      'El mensaje no es válido. Debe tener entre 10 y 1000 caracteres.'
    );
    marcador.marcar('contacto-mensaje');
  } else {
    limpiarError('contacto-mensaje');
  }

  marcador.enfocarPrimerError();

  return marcador.esValido();
}

/**
 * Restablece el formulario de contacto a su estado inicial.
 * Vuelve a mostrar el formulario y oculta el mensaje de éxito.
 */
const resetContactForm = () => {
  const contactForm = document.getElementById('contactForm');
  const successMessageBox = document.getElementById('successBox');

  contactForm.reset();
  ['contacto-nombre', 'contacto-email', 'contacto-asunto', 'contacto-mensaje'].forEach(limpiarError);
  contactForm.style.display = 'block';
  successMessageBox.classList.remove('contacto__exito--visible');
};

const initContactoPage = () => {
  const contactForm = document.getElementById('contactForm');
  const successMessageBox = document.getElementById('successBox');

  if (contactForm) {
    contactForm.addEventListener('submit', (submitEvent) => {
      submitEvent.preventDefault();

      if (!validarContacto()) {
        return;
      }

      contactForm.style.display = 'none';
      successMessageBox.classList.add('contacto__exito--visible');
    });
  }

  // Filtro en vivo: nombre solo letras (bloquea números al tipear o pegar)
  const nombreInput = document.getElementById('contacto-nombre');

  if (nombreInput) {
    nombreInput.addEventListener('input', () => {
      nombreInput.value = soloLetras(nombreInput.value).slice(0, 40);
      limpiarError('contacto-nombre');
    });
  }

  // Email y mensaje: limpian el error al escribir
  ['contacto-email', 'contacto-mensaje'].forEach((inputId) => {
    const input = document.getElementById(inputId);

    if (input) {
      input.addEventListener('input', () => limpiarError(inputId));
    }
  });

  // Asunto: limpia el error al cambiar
  const asuntoSelect = document.getElementById('contacto-asunto');

  if (asuntoSelect) {
    asuntoSelect.addEventListener('change', () => limpiarError('contacto-asunto'));
  }

  // Al salir del campo: quita espacios del inicio/fin y colapsa dobles
  ['contacto-nombre', 'contacto-email', 'contacto-mensaje'].forEach((inputId) => {
    const input = document.getElementById(inputId);

    if (input) {
      input.addEventListener('blur', () => {
        input.value = normalizarEspacios(input.value);
      });
    }
  });

  document.querySelectorAll('[data-action="reset-contact"]').forEach((btn) => {
    btn.addEventListener('click', resetContactForm);
  });
};

document.addEventListener('DOMContentLoaded', initContactoPage);
