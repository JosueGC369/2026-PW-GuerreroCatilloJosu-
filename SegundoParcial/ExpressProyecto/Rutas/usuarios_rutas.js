const express = require('express');
const router = express.Router();
const usuariosControlador = require('../Controlador/usuarios_controlador');

// CRUD de Usuarios
router.get('/', usuariosControlador.listarUsuarios);
router.post('/', usuariosControlador.crearUsuario);
router.get('/:id', usuariosControlador.obtenerUsuario);
router.put('/:id', usuariosControlador.actualizarUsuario);
router.delete('/:id', usuariosControlador.eliminarUsuario);

module.exports = router;

