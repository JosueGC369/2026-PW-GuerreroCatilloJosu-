function validarNombre(nombre) {
    if (typeof nombre !== 'string') return false;
    const limpio = nombre.trim().replace(/\s+/g, ' ');
    return limpio.length >= 3 &&
        limpio.length <= 60 &&
        /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:[ '-][A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*$/.test(limpio);
}

function validarCorreo(correo) {
    if (typeof correo !== 'string') return false;
    const limpio = correo.trim();
    return limpio.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpio);
}

function validarBoleta(boleta) {
    if (typeof boleta !== 'string') return false;
    const limpio = boleta.trim();
    return /^\d{10}$/.test(limpio) && !/^0{10}$/.test(limpio);
}

function validarContrasena(contrasena) {
    if (typeof contrasena !== 'string') return false;
    return contrasena.length >= 8 &&
        contrasena.length <= 64 &&
        Buffer.byteLength(contrasena, 'utf8') <= 72 &&
        /[A-Z]/.test(contrasena) &&
        /[a-z]/.test(contrasena) &&
        /\d/.test(contrasena) &&
        /[^A-Za-z0-9\s]/.test(contrasena);
}

module.exports = { validarNombre, validarCorreo, validarBoleta, validarContrasena };
