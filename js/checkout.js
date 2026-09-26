/* KIHAP - checkout.js vanilla global - validaciones simples de envío y pago */

// Solo números de un texto (acepta puntos, espacios, guiones)
function soloNumeros(texto) {
  return String(texto || '').replace(/\D/g, '');
}

// Muestra un error debajo del campo
function mostrarError(inputId, mensaje) {
  const input = document.getElementById(inputId);
  const error = document.getElementById('err-' + inputId);

  if (input) {
    input.classList.add('input--error');
  }

  if (error) {
    error.textContent = mensaje;
  }
}

// Limpia el error de un campo
function limpiarError(inputId) {
  const input = document.getElementById(inputId);
  const error = document.getElementById('err-' + inputId);

  if (input) {
    input.classList.remove('input--error');
  }

  if (error) {
    error.textContent = '';
  }
}

// Valida un texto simple: obligatorio + mínimo de letras
function validarTexto(inputId, minLetras, mensajeVacio, mensajeCorto) {
  const valor = document.getElementById(inputId).value.trim();

  if (!valor) {
    mostrarError(inputId, mensajeVacio);
    return false;
  }

  if (valor.length < minLetras) {
    mostrarError(inputId, mensajeCorto);
    return false;
  }

  limpiarError(inputId);
  return true;
}

// Valida los datos de envío. Devuelve true si todo está bien.
function validarEnvio() {
  let valido = true;
  let primerError = null;

  const marcaError = (inputId) => {
    valido = false;

    if (!primerError) {
      primerError = document.getElementById(inputId);
    }
  };

  if (!validarTexto('envNombre', 2, 'Contanos tu nombre', 'Mínimo 2 letras')) {
    marcaError('envNombre');
  }

  if (!validarTexto('envApellido', 2, 'Contanos tu apellido', 'Mínimo 2 letras')) {
    marcaError('envApellido');
  }

  // DNI: 7 u 8 dígitos
  const dni = soloNumeros(document.getElementById('envDni').value);

  if (!dni) {
    mostrarError('envDni', 'Contanos tu DNI');
    marcaError('envDni');
  } else if (dni.length < 7 || dni.length > 8) {
    mostrarError('envDni', 'Revisá tu DNI, lleva 7 u 8 números');
    marcaError('envDni');
  } else {
    limpiarError('envDni');
  }

  // Teléfono: mínimo 8 dígitos
  const telefono = soloNumeros(document.getElementById('envTelefono').value);

  if (!telefono) {
    mostrarError('envTelefono', 'Contanos tu teléfono');
    marcaError('envTelefono');
  } else if (telefono.length < 8) {
    mostrarError('envTelefono', 'Revisá tu teléfono, mínimo 8 números');
    marcaError('envTelefono');
  } else {
    limpiarError('envTelefono');
  }

  // Email: chequeo simple con @ y punto
  const email = document.getElementById('envEmail').value.trim();

  if (!email) {
    mostrarError('envEmail', 'Contanos tu email');
    marcaError('envEmail');
  } else if (!email.includes('@') || !email.includes('.')) {
    mostrarError('envEmail', 'Revisá tu email, le falta el @ o el punto');
    marcaError('envEmail');
  } else {
    limpiarError('envEmail');
  }

  if (!validarTexto('envDireccion', 5, 'Contanos tu dirección', 'Escribí calle y número')) {
    marcaError('envDireccion');
  }

  if (!validarTexto('envCiudad', 2, 'Contanos tu ciudad', 'Mínimo 2 letras')) {
    marcaError('envCiudad');
  }

  if (!validarTexto('envProvincia', 2, 'Contanos tu provincia', 'Mínimo 2 letras')) {
    marcaError('envProvincia');
  }

  // Código postal: 4 dígitos
  const cp = soloNumeros(document.getElementById('envCp').value);

  if (!cp) {
    mostrarError('envCp', 'Contanos tu código postal');
    marcaError('envCp');
  } else if (cp.length !== 4) {
    mostrarError('envCp', 'Revisá tu código postal, lleva 4 números');
    marcaError('envCp');
  } else {
    limpiarError('envCp');
  }

  if (!valido && primerError) {
    primerError.focus();
  }

  return valido;
}

// Dice si el método elegido es tarjeta
function pagaConTarjeta() {
  const elegido = document.querySelector('input[name="pago"]:checked');
  return !elegido || elegido.value === 'tarjeta';
}

// Valida el vencimiento MM/AA y que no esté vencido
function vencimientoValido(valor) {
  const partes = String(valor || '').split('/');

  if (partes.length !== 2) {
    return false;
  }

  const mes = Number(partes[0]);
  const anio = Number(partes[1]);

  if (!mes || mes < 1 || mes > 12 || Number.isNaN(anio)) {
    return false;
  }

  const ahora = new Date();
  const anioActual = ahora.getFullYear() % 100;
  const mesActual = ahora.getMonth() + 1;

  return anio > anioActual || (anio === anioActual && mes >= mesActual);
}

// Valida los datos de pago. Si no es tarjeta, no pide nada más.
function validarPago() {
  if (!pagaConTarjeta()) {
    return true;
  }

  let valido = true;
  let primerError = null;

  const marcaError = (inputId) => {
    valido = false;

    if (!primerError) {
      primerError = document.getElementById(inputId);
    }
  };

  // Número: 16 dígitos (ignora espacios)
  const numero = soloNumeros(document.getElementById('payNum').value);

  if (!numero) {
    mostrarError('payNum', 'Contanos el número de tu tarjeta');
    marcaError('payNum');
  } else if (numero.length !== 16) {
    mostrarError('payNum', 'Revisá el número, lleva 16 dígitos');
    marcaError('payNum');
  } else {
    limpiarError('payNum');
  }

  // Vencimiento MM/AA
  const venc = document.getElementById('payVenc').value.trim();

  if (!venc) {
    mostrarError('payVenc', 'Contanos el vencimiento');
    marcaError('payVenc');
  } else if (!vencimientoValido(venc)) {
    mostrarError('payVenc', 'Revisá el vencimiento (MM/AA vigente)');
    marcaError('payVenc');
  } else {
    limpiarError('payVenc');
  }

  // CVV: 3 o 4 dígitos
  const cvv = soloNumeros(document.getElementById('payCvv').value);

  if (!cvv) {
    mostrarError('payCvv', 'Contanos el CVV');
    marcaError('payCvv');
  } else if (cvv.length < 3 || cvv.length > 4) {
    mostrarError('payCvv', 'Revisá el CVV, lleva 3 o 4 números');
    marcaError('payCvv');
  } else {
    limpiarError('payCvv');
  }

  if (!validarTexto('payTitular', 2, 'Contanos el titular', 'Mínimo 2 letras')) {
    marcaError('payTitular');
  }

  if (!valido && primerError) {
    primerError.focus();
  }

  return valido;
}

// Muestra u oculta los campos de tarjeta según el método elegido
function actualizarCamposTarjeta() {
  const esTarjeta = pagaConTarjeta();
  const campos = document.getElementById('payCardFields');
  const mensaje = document.getElementById('payAltMessage');

  if (campos) {
    campos.style.display = esTarjeta ? 'block' : 'none';
  }

  if (mensaje) {
    mensaje.style.display = esTarjeta ? 'none' : 'block';
  }

  if (!esTarjeta) {
    ['payNum', 'payVenc', 'payCvv', 'payTitular'].forEach(limpiarError);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const btnToPago = document.getElementById('btnToPago');
  const btnVolver = document.getElementById('btnBackToEnvio');
  const btnConfirmar = document.getElementById('btnConfirmar');
  const btnMovil = document.getElementById('btnMovil');

  if (btnToPago) {
    btnToPago.addEventListener('click', () => {
      if (validarEnvio()) {
        setCheckoutStep(2);
      }
    });
  }

  if (btnVolver) {
    btnVolver.addEventListener('click', () => setCheckoutStep(1));
  }

  if (btnConfirmar) {
    btnConfirmar.addEventListener('click', () => {
      if (typeof shoppingCart !== 'undefined' && shoppingCart.length === 0) {
        showToast('Tu carrito está vacío');
        return;
      }

      if (validarPago()) {
        setCheckoutStep(3);
      }
    });
  }

  // Barra móvil: acompaña el paso visible sin saltear validaciones
  if (btnMovil) {
    btnMovil.addEventListener('click', () => {
      if (typeof shoppingCart !== 'undefined' && shoppingCart.length === 0) {
        showToast('Tu carrito está vacío');
        return;
      }

      const paso1 = document.getElementById('checkoutStep1');

      if (paso1 && paso1.classList.contains('compra__panel--activo')) {
        if (validarEnvio()) {
          setCheckoutStep(2);
        }
      } else if (validarPago()) {
        setCheckoutStep(3);
      }
    });
  }

  // Limpia el error ni bien el usuario vuelve a escribir
  ['envNombre', 'envApellido', 'envDni', 'envTelefono', 'envEmail', 'envDireccion', 'envCiudad', 'envProvincia', 'envCp', 'payNum', 'payVenc', 'payCvv', 'payTitular'].forEach((inputId) => {
    const input = document.getElementById(inputId);

    if (input) {
      input.addEventListener('input', () => limpiarError(inputId));
    }
  });

  // Cambia campos visibles al elegir método de pago
  document.querySelectorAll('input[name="pago"]').forEach((radio) => {
    radio.addEventListener('change', actualizarCamposTarjeta);
  });

  actualizarCamposTarjeta();
});
