const express = require('express');
const router = express.Router();
const asistenciasControlador = require('../Controlador/asistencias_controlador');

// Rutas de Asistencias
router.post('/', asistenciasControlador.registrarAsistencia);
router.get('/', asistenciasControlador.listarAsistencias);

module.exports = router;

