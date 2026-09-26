/* KIHAP - checkout.js vanilla global - validaciones de envío y pago */

// Solo números de un texto (ignora puntos, espacios, guiones y +)
function soloNumeros(texto) {
  return String(texto || '').replace(/\D/g, '');
}

// Solo letras permitidas: letras con tilde, ñ, espacio, apóstrofe y guion
function soloLetras(texto) {
  return String(texto || '').replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñÜü\s'-]/g, '');
}

// Quita espacios del inicio/fin y colapsa espacios dobles intermedios
function normalizarEspacios(texto) {
  return String(texto || '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Muestra un error debajo del campo
function mostrarError(inputId, mensaje) {
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
function limpiarError(inputId) {
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
function validarSoloLetras(inputId, nombreCampo, min, max) {
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

  if (!validarSoloLetras('envNombre', 'nombre', 2, 40)) {
    marcaError('envNombre');
  }

  if (!validarSoloLetras('envApellido', 'apellido', 2, 40)) {
    marcaError('envApellido');
  }

  // DNI Argentina: 7 u 8 dígitos, sin puntos
  const dni = soloNumeros(document.getElementById('envDni').value);

  if (!dni) {
    mostrarError('envDni', 'El DNI es obligatorio.');
    marcaError('envDni');
  } else if (dni.length < 7 || dni.length > 8) {
    mostrarError('envDni', 'El DNI no es válido. Ingrese 7 u 8 números, sin puntos. Ej: 30123456.');
    marcaError('envDni');
  } else {
    limpiarError('envDni');
  }

  // Teléfono Argentina: 10 dígitos (se ignora +54, espacios y guiones)
  let telefono = soloNumeros(document.getElementById('envTelefono').value);

  if (telefono.startsWith('54')) {
    telefono = telefono.slice(2);
  }

  if (!telefono) {
    mostrarError('envTelefono', 'El teléfono es obligatorio.');
    marcaError('envTelefono');
  } else if (telefono.length !== 10) {
    mostrarError(
      'envTelefono',
      'El teléfono no es válido. Ingrese 10 números, sin +54 ni espacios. Ej: 2614005566.'
    );
    marcaError('envTelefono');
  } else {
    limpiarError('envTelefono');
  }

  // Email: formato básico con ejemplo de corrección
  const email = normalizarEspacios(document.getElementById('envEmail').value);

  if (!email) {
    mostrarError('envEmail', 'El email es obligatorio.');
    marcaError('envEmail');
  } else if (email.includes(' ') || !email.includes('@') || !email.includes('.')) {
    mostrarError('envEmail', 'El email no es válido. Ej: nombre@correo.com.');
    marcaError('envEmail');
  } else {
    const partesEmail = email.split('@');

    if (partesEmail.length !== 2 || !partesEmail[0] || !partesEmail[1].includes('.')) {
      mostrarError('envEmail', 'El email no es válido. Ej: nombre@correo.com.');
      marcaError('envEmail');
    } else {
      limpiarError('envEmail');
    }
  }

  // Dirección: calle y número, 5 a 80 caracteres
  const direccion = normalizarEspacios(document.getElementById('envDireccion').value);

  if (!direccion) {
    mostrarError('envDireccion', 'La dirección es obligatoria.');
    marcaError('envDireccion');
  } else if (direccion.length < 5 || direccion.length > 80) {
    mostrarError(
      'envDireccion',
      'La dirección no es válida. Incluya calle y número, entre 5 y 80 caracteres.'
    );
    marcaError('envDireccion');
  } else {
    limpiarError('envDireccion');
  }

  if (!validarSoloLetras('envCiudad', 'ciudad', 2, 40)) {
    marcaError('envCiudad');
  }

  if (!validarSoloLetras('envProvincia', 'provincia', 2, 40)) {
    marcaError('envProvincia');
  }

  // Código postal Argentina: 4 dígitos
  const cp = soloNumeros(document.getElementById('envCp').value);

  if (!cp) {
    mostrarError('envCp', 'El código postal es obligatorio.');
    marcaError('envCp');
  } else if (cp.length !== 4) {
    mostrarError('envCp', 'El código postal no es válido. Ingrese 4 números. Ej: 5500.');
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
    mostrarError('payNum', 'El número de tarjeta es obligatorio.');
    marcaError('payNum');
  } else if (numero.length !== 16) {
    mostrarError('payNum', 'El número de tarjeta no es válido. Debe tener 16 dígitos.');
    marcaError('payNum');
  } else {
    limpiarError('payNum');
  }

  // Vencimiento MM/AA
  const venc = normalizarEspacios(document.getElementById('payVenc').value);

  if (!venc) {
    mostrarError('payVenc', 'El vencimiento es obligatorio.');
    marcaError('payVenc');
  } else if (!vencimientoValido(venc)) {
    mostrarError('payVenc', 'El vencimiento no es válido. Use MM/AA vigente. Ej: 12/27.');
    marcaError('payVenc');
  } else {
    limpiarError('payVenc');
  }

  // CVV: 3 o 4 dígitos
  const cvv = soloNumeros(document.getElementById('payCvv').value);

  if (!cvv) {
    mostrarError('payCvv', 'El CVV es obligatorio.');
    marcaError('payCvv');
  } else if (cvv.length < 3 || cvv.length > 4) {
    mostrarError('payCvv', 'El CVV no es válido. Debe tener 3 o 4 números. Ej: 123.');
    marcaError('payCvv');
  } else {
    limpiarError('payCvv');
  }

  if (!validarSoloLetras('payTitular', 'titular', 2, 40)) {
    marcaError('payTitular');
  }

  if (!valido && primerError) {
    primerError.focus();
  }

  return valido;
}

// Selecciona un método de pago: sincroniza radio, estilo visual y campos visibles.
// Única fuente de verdad: evita que el estado visual y los campos se desincronicen.
function seleccionarMetodoPago(opcionLabel) {
  const radio = opcionLabel.querySelector('input[name="pago"]');

  if (radio) {
    radio.checked = true;
  }

  document.querySelectorAll('.pago__opcion').forEach((opcion) => {
    opcion.classList.toggle('pago__opcion--seleccionada', opcion === opcionLabel);
  });

  actualizarCamposTarjeta();
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

  // Filtro en vivo: campos de solo letras (bloquea números al tipear o pegar)
  ['envNombre', 'envApellido', 'envCiudad', 'envProvincia', 'payTitular'].forEach((inputId) => {
    const input = document.getElementById(inputId);

    if (input) {
      input.addEventListener('input', () => {
        input.value = soloLetras(input.value).slice(0, 40);
        limpiarError(inputId);
      });
    }
  });

  // Filtro en vivo: campos de solo números (DNI, teléfono, CP, tarjeta, CVV)
  const limitesNumericos = {
    envDni: 10,
    envTelefono: 15,
    envCp: 4,
    payNum: 19,
    payCvv: 4,
  };

  Object.keys(limitesNumericos).forEach((inputId) => {
    const input = document.getElementById(inputId);

    if (input) {
      input.addEventListener('input', () => {
        input.value = soloNumeros(input.value).slice(0, limitesNumericos[inputId]);
        limpiarError(inputId);
      });
    }
  });

  // Vencimiento: solo dígitos y barra automática MM/AA
  const payVenc = document.getElementById('payVenc');

  if (payVenc) {
    payVenc.addEventListener('input', () => {
      let digitos = soloNumeros(payVenc.value).slice(0, 4);

      if (digitos.length > 2) {
        digitos = digitos.slice(0, 2) + '/' + digitos.slice(2);
      }

      payVenc.value = digitos;
      limpiarError('payVenc');
    });
  }

  // Email y dirección: solo recortan y limpian el error al escribir
  ['envEmail', 'envDireccion'].forEach((inputId) => {
    const input = document.getElementById(inputId);

    if (input) {
      input.addEventListener('input', () => limpiarError(inputId));
    }
  });

  // Al salir del campo: quita espacios del inicio/fin y colapsa dobles
  ['envNombre', 'envApellido', 'envEmail', 'envDireccion', 'envCiudad', 'envProvincia', 'payTitular', 'payVenc'].forEach(
    (inputId) => {
      const input = document.getElementById(inputId);

      if (input) {
        input.addEventListener('blur', () => {
          input.value = normalizarEspacios(input.value);
        });
      }
    }
  );

  // Método de pago: click en la tarjeta/label (mouse y táctil) + change (teclado).
  // Ambos pasan por seleccionarMetodoPago para no desincronizar.
  document.querySelectorAll('.pago__opcion').forEach((opcionLabel) => {
    opcionLabel.addEventListener('click', () => seleccionarMetodoPago(opcionLabel));
  });

  document.querySelectorAll('input[name="pago"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      const label = radio.closest('.pago__opcion');

      if (label) {
        seleccionarMetodoPago(label);
      } else {
        actualizarCamposTarjeta();
      }
    });
  });

  actualizarCamposTarjeta();
});
