const asistenciasModel = require('../Modelo/asistencias');

// Registrar la asistencia de un alumno a un taller
async function registrarAsistencia(req, res) {
    const { taller_id, nombre_alumno, boleta } = req.body || {};

    if (!taller_id || !nombre_alumno || !boleta) {
        return res.status(400).json({ error: 'taller_id, nombre_alumno y boleta son obligatorios' });
    }

    try {
        const asistencia = await asistenciasModel.registrarAsistencia({ taller_id, nombre_alumno, boleta });
        res.status(201).json(asistencia);
    } catch (error) {
        // En caso de que el taller no exista, el error de llave foránea responde 500
        res.status(500).json({ error: error.message });
    }
}

// Listar todas las asistencias registradas
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

