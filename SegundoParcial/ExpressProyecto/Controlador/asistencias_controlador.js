const asistenciasModel = require('../Modelo/asistencias');

async function registrarAsistencia(req, res) {
    const { taller_id, nombre_alumno, boleta } = req.body || {};

    if (!taller_id || !nombre_alumno || !boleta) {
        return res.status(400).json({ error: 'taller_id, nombre_alumno y boleta son obligatorios' });
    }

    try {
        const asistencia = await asistenciasModel.registrarAsistencia({ taller_id, nombre_alumno, boleta });
        res.status(201).json(asistencia);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function listarAsistencias(req, res) {
    try {
        const asistencias = await asistenciasModel.listar();
        res.status(200).json(asistencias);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    registrarAsistencia,
    listarAsistencias
};
