const bcrypt = require('bcryptjs');
const usuariosModel = require('../Modelo/usuarios');
const { validarCorreo, validarBoleta, validarContrasena } = require('../validaciones');

// Identificar si un error de base de datos es por clave duplicada
function esDuplicado(error) {
    if (!error) return false;
    return error.code === 'ER_DUP_ENTRY' || error.code === '23505' || (error.message && error.message.includes('Duplicate entry'));
}

// Listar todos los usuarios
async function listarUsuarios(req, res) {
    try {
        const usuarios = await usuariosModel.listar();
        res.status(200).json(usuarios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Obtener un usuario por ID
async function obtenerUsuario(req, res) {
    try {
        const usuario = await usuariosModel.obtenerPorId(req.params.id);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.status(200).json(usuario);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Crear un nuevo usuario
async function crearUsuario(req, res) {
    const { nombre, correo, contrasena, boleta, rol } = req.body || {};

    if (!nombre || !correo || !contrasena || !boleta) {
        return res.status(400).json({ error: 'nombre, correo, contrasena y boleta son obligatorios' });
    }
    if (!validarCorreo(correo)) {
        return res.status(400).json({ error: 'El correo no tiene un formato válido' });
    }
    if (!validarBoleta(boleta)) {
        return res.status(400).json({ error: 'La boleta debe tener 10 dígitos' });
    }
    if (!validarContrasena(contrasena)) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    }

    try {
        const contrasenaHash = await bcrypt.hash(contrasena, 10);
        const usuario = await usuariosModel.crear({ nombre, correo, contrasenaHash, boleta, rol });
        res.status(201).json(usuario);
    } catch (error) {
        if (esDuplicado(error)) {
            return res.status(409).json({ error: 'Ya existe un usuario con ese correo o boleta' });
        }
        res.status(500).json({ error: error.message });
    }
}

// Actualizar un usuario existente
async function actualizarUsuario(req, res) {
    const { nombre, correo, rol } = req.body || {};

    if (correo === undefined && nombre === undefined && rol === undefined) {
        return res.status(400).json({ error: 'Envía al menos uno de: nombre, correo, rol' });
    }
    if (correo !== undefined && !validarCorreo(correo)) {
        return res.status(400).json({ error: 'El correo no tiene un formato válido' });
    }

    try {
        const usuario = await usuariosModel.actualizar(req.params.id, { nombre, correo, rol });
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.status(200).json(usuario);
    } catch (error) {
        if (esDuplicado(error)) {
            return res.status(409).json({ error: 'Ya existe un usuario con ese correo' });
        }
        res.status(500).json({ error: error.message });
    }
}

// Eliminar un usuario
async function eliminarUsuario(req, res) {
    try {
        const eliminado = await usuariosModel.eliminar(req.params.id);
        if (!eliminado) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    listarUsuarios,
    obtenerUsuario,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    esDuplicado
};
