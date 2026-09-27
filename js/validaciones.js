/* KIHAP - validaciones.js vanilla global | ES6+ - helpers compartidos checkout/contacto */

// Solo números de un texto (ignora puntos, espacios, guiones y +)
const soloNumeros = (texto) => {
  return String(texto || '').replace(/\D/g, '');
}

// Solo letras permitidas: letras con tilde, ñ, espacio, apóstrofe y guion
const soloLetras = (texto) => {
  return String(texto || '').replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñÜü\s'-]/g, '');
}

// Quita espacios del inicio/fin y colapsa espacios dobles intermedios
const normalizarEspacios = (texto) => {
  return String(texto || '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Muestra un error debajo del campo
const mostrarError = (inputId, mensaje) => {
  const input = document.getElementById(inputId);
  const error = document.getElementById('err-' + inputId);

  if (input) {
    input.classList.add('input--error');
    input.setAttribute('aria-invalid', 'true');
  }

  if (error) {
    error.textContent = mensaje;
  }
}

// Limpia el error de un campo
const limpiarError = (inputId) => {
  const input = document.getElementById(inputId);
  const error = document.getElementById('err-' + inputId);

  if (input) {
    input.classList.remove('input--error');
    input.removeAttribute('aria-invalid');
  }

  if (error) {
    error.textContent = '';
  }
}

// Valida un campo de solo letras: obligatorio + rango + sin números
const validarSoloLetras = (inputId, nombreCampo, min, max) => {
  const valor = normalizarEspacios(document.getElementById(inputId).value);

  if (!valor) {
    mostrarError(inputId, 'El ' + nombreCampo + ' es obligatorio.');
    return false;
  }

  if (/[0-9]/.test(valor)) {
    mostrarError(inputId, 'El ' + nombreCampo + ' no es válido. Use solo letras, sin números.');
    return false;
  }

  if (valor.length < min || valor.length > max) {
    mostrarError(
      inputId,
      'El ' + nombreCampo + ' no es válido. Debe tener entre ' + min + ' y ' + max + ' caracteres.'
    );
    return false;
  }

  limpiarError(inputId);
  return true;
}

// Valida un email con formato básico y ejemplo de corrección
const validarEmail = (inputId) => {
  const email = normalizarEspacios(document.getElementById(inputId).value);

  if (!email) {
    mostrarError(inputId, 'El email es obligatorio.');
    return false;
  }

  if (email.includes(' ') || !email.includes('@') || !email.includes('.')) {
    mostrarError(inputId, 'El email no es válido. Ej: nombre@correo.com.');
    return false;
  }

  const partesEmail = email.split('@');

  if (partesEmail.length !== 2 || !partesEmail[0] || !partesEmail[1].includes('.')) {
    mostrarError(inputId, 'El email no es válido. Ej: nombre@correo.com.');
    return false;
  }

  limpiarError(inputId);
  return true;
}
