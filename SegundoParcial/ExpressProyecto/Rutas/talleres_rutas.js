const express = require('express');
const router = express.Router();
const talleresControlador = require('../Controlador/talleres_controlador');

// Rutas de Talleres
router.get('/', talleresControlador.listarTalleres);
router.post('/', talleresControlador.crearTaller);
router.get('/:id', talleresControlador.obtenerTaller);
router.get('/:id/asistencias', talleresControlador.listarAsistenciasPorTaller);

module.exports = router;

