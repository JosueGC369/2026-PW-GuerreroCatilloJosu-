// Validaciones compartidas por las páginas de registro, inscripción y perfil.
// Son al menos tan estrictas como las del backend
// (SegundoParcial/ExpressProyecto/validaciones.js), así nada se cuela en la
// pantalla y luego truena en el servidor.

export function validarNombre(nombre) {
  if (typeof nombre !== 'string') return false;
  const limpio = nombre.trim().replace(/\s+/g, ' ');
  return (
    limpio.length >= 3 &&
    limpio.length <= 60 &&
    /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:[ '-][A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*$/.test(limpio)
  );
}

export function validarCorreo(correo) {
  if (typeof correo !== 'string') return false;
  const limpio = correo.trim();
  return limpio.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpio);
}

export function validarBoleta(boleta) {
  if (typeof boleta !== 'string') return false;
  const limpio = boleta.trim();
  return /^\d{10}$/.test(limpio) && !/^0{10}$/.test(limpio);
}

export function validarContrasena(contrasena) {
  if (typeof contrasena !== 'string') return false;
  const bytes = new TextEncoder().encode(contrasena).length;
  return (
    contrasena.length >= 8 &&
    contrasena.length <= 64 &&
    bytes <= 72 &&
    /[A-Z]/.test(contrasena) &&
    /[a-z]/.test(contrasena) &&
    /\d/.test(contrasena) &&
    /[^A-Za-z0-9\s]/.test(contrasena)
  );
}
