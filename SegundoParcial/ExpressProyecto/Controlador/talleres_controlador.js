const talleresModel = require('../Modelo/talleres');
const asistenciasModel = require('../Modelo/asistencias');

async function listarTalleres(req, res) {
    try {
        const talleres = await talleresModel.listar();
        res.status(200).json(talleres);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function obtenerTaller(req, res) {
    try {
        const taller = await talleresModel.obtenerPorId(req.params.id);
        if (!taller) {
            return res.status(404).json({ error: 'Taller no encontrado' });
        }
        res.status(200).json(taller);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function crearTaller(req, res) {
    const { nombre, instructor, fecha, cupo } = req.body || {};

    if (!nombre || !fecha) {
        return res.status(400).json({ error: 'nombre y fecha son obligatorios' });
    }

    try {
        const taller = await talleresModel.crear({ nombre, instructor, fecha, cupo });
        res.status(201).json(taller);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function listarAsistenciasPorTaller(req, res) {
    try {
        const asistencias = await asistenciasModel.consultarListaDeAsistencia(req.params.id);
        res.status(200).json(asistencias);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    listarTalleres,
    obtenerTaller,
    crearTaller,
    listarAsistenciasPorTaller
};
