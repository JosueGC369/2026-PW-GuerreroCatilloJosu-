// Validaciones compartidas por las páginas de registro, inscripción y perfil.
// Son al menos tan estrictas como las del backend
// (SegundoParcial/ExpressProyecto/validaciones.js), así nada se cuela en la
// pantalla y luego truena en el servidor.

export function validarNombre(nombre) {
  if (typeof nombre !== 'string') return false;
  const limpio = nombre.trim();
  // 3 a 60 caracteres; solo letras (con acentos y ñ), separadas por espacios simples
  return (
    limpio.length >= 3 &&
    limpio.length <= 60 &&
    /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?: [A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*$/.test(limpio)
  );
}

export function validarCorreo(correo) {
  if (typeof correo !== 'string') return false;
  const limpio = correo.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpio);
}

export function validarBoleta(boleta) {
  if (typeof boleta !== 'string') return false;
  const limpio = boleta.trim();
  // Exactamente 10 dígitos y no se acepta que sean puros ceros (0000000000)
  return /^\d{10}$/.test(limpio) && !/^0{10}$/.test(limpio);
}

export function validarContrasena(contrasena) {
  if (typeof contrasena !== 'string') return false;
  // Mínimo 8 caracteres, con al menos una letra y un número
  // (así una contraseña de puros ceros también se rechaza)
  return (
    contrasena.length >= 8 &&
    /[A-Za-z]/.test(contrasena) &&
    /[0-9]/.test(contrasena)
  );
}
