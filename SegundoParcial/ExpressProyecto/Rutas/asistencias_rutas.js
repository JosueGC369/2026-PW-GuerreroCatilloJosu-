const express = require('express');
const router = express.Router();
const asistenciasControlador = require('../Controlador/asistencias_controlador');

router.post('/', asistenciasControlador.registrarAsistencia);
router.get('/', asistenciasControlador.listarAsistencias);

module.exports = router;
