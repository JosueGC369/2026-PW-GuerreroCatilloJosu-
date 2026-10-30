const bcrypt = require('bcryptjs');
//necesitamos al modelo
const usuariosModel = require('../Modelo/usuarios');

const {
    validarNombre,
    validarCorreo,
    validarBoleta,
    validarContrasena
} = require('../validaciones');

//que pasa si el correo y la boleta se duplica
function esDuplicado(error){
    if (!error) return false;
    return error.code === 'ER_DUP_ENTRY' || error.code === '23505' || (error.message && error.message.includes('Duplicate entry'));
}

async function listarUsuarios(req, res) {
    try{
        const usuarios = await usuariosModel.listar();
        res.json(usuarios);
    }catch(error){
        res.status(500).json({error: error.message});
    }
}

async function obtenerUsuario(req, res) {
    try{
        const usuario = await usuariosModel.obtenerPorId(req.params.id);
        if(!usuario) return res.status(404).json({error: 'Usuario no encontrado'});
        res.json(usuario);
    }catch(error){
        res.status(500).json({error: error.message});
    }
}

async function crearUsuario(req, res) {
    const {nombre, correo, contrasena, boleta} = req.body || {};
    if(!nombre || !correo || !contrasena || !boleta){
        return res.status(400).json({error: 'nombre, correo, contrasena y boleta son obligatorios'});
    }
    const nombreLimpio = typeof nombre === 'string' ? nombre.trim().replace(/\s+/g, ' ') : '';
    const correoLimpio = typeof correo === 'string' ? correo.trim().toLowerCase() : '';
    const boletaLimpia = typeof boleta === 'string' ? boleta.trim() : '';
    if(!validarNombre(nombreLimpio)) {
        return res.status(400).json({error: 'El nombre debe tener entre 3 y 60 caracteres y solo incluir letras, espacios, apóstrofes o guiones'});
    }
    if(!validarCorreo(correoLimpio)) return res.status(400).json({error: 'El correo no tiene un formato válido'});
    if(!validarBoleta(boletaLimpia)) return res.status(400).json({error: 'La boleta debe tener 10 dígitos y no puede ser 0000000000'});
    if(!validarContrasena(contrasena)) {
        return res.status(400).json({error: 'La contraseña debe tener de 8 a 64 caracteres e incluir mayúscula, minúscula, número y símbolo'});
    }

    try{
        const contrasenaHash = await bcrypt.hash(contrasena, 10);
        const usuario = await usuariosModel.crear({
            nombre: nombreLimpio,
            correo: correoLimpio,
            contrasenaHash,
            boleta: boletaLimpia,
            rol: 'alumno'
        });

        res.status(201).json(usuario);
    }catch(error){
        if (esDuplicado(error)) return res.status(409).json({error: 'Ya existe un usuario con ese correo o boleta'});
        res.status(500).json({error: error.message});
    }
}

async function actualizarUsuario(req, res) {
    const {nombre, correo, rol} = req.body || {};

    if(correo === undefined && nombre === undefined && rol === undefined){
        return res.status(400).json({error: 'Envía al menos uno de: nombre, correo, rol'});
    }
    if(correo !== undefined && !validarCorreo(correo)){
        return res.status(400).json({error: 'El correo no tiene un formato válido'});
    }
    //faltaria agregar una validacion mas para el nombre
    try{
        const usuario = await usuariosModel.actualizar(req.params.id, {nombre, correo, rol});
        if(!usuario) return res.status(404).json({error: 'Usuario no encontrado'});
        res.status(200).json(usuario);
    }catch(error){
        if(esDuplicado(error)) return res.status(409).json({error: 'Ya existe un usuario con ese correo'});
        res.status(500).json({error: error.message});
    }
}

async function eliminarUsuario(req, res) {
    try{
        const eliminado = await usuariosModel.eliminar(req.params.id);
        if(!eliminado) return res.status(404).json({error: 'Usuario no encontrado'});
        res.status(204).send();
    }catch(error){
        res.status(500).json({error: error.message});
    }
}

module.exports = {listarUsuarios, obtenerUsuario, crearUsuario, actualizarUsuario, eliminarUsuario, esDuplicado};
