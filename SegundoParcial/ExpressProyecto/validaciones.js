//vamos atener funciones que se encargan de validar correo, boleta y contraseña

//wiii mas tarea siiiii

//aqui va funcion de correo
function validarCorreo(correo) {
    if (typeof correo !== 'string') return false;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(correo.trim());
}

//aqui va funcion de boleta
function validarBoleta(boleta) {
    if (typeof boleta !== 'string') return false;
    const limpio = boleta.trim();
    const regex = /^\d{10}$/;
    // 10 dígitos exactos y no se acepta puros ceros
    return regex.test(limpio) && limpio !== '0000000000';
}

function validarContrasena(contrasena) {
    if (typeof contrasena !== 'string') return false;
    return contrasena.length >= 8;
}

module.exports = {validarCorreo, validarBoleta, validarContrasena};
