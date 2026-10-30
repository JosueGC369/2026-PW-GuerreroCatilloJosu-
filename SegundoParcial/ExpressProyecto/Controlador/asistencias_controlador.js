const asistenciasModel = require('../Modelo/asistencias');
const { validarNombre, validarBoleta } = require('../validaciones');

async function registrarAsistencia(req, res) {
    const { taller_id, nombre_alumno, boleta } = req.body || {};

    const nombreLimpio = typeof nombre_alumno === 'string'
        ? nombre_alumno.trim().replace(/\s+/g, ' ')
        : '';
    const boletaLimpia = typeof boleta === 'string' ? boleta.trim() : '';
    const tallerIdLimpio = typeof taller_id === 'string' ? taller_id.trim() : '';

    if (!tallerIdLimpio || !nombreLimpio || !boletaLimpia) {
        return res.status(400).json({ error: 'taller_id, nombre_alumno y boleta son obligatorios' });
    }
    if (!validarNombre(nombreLimpio)) {
        return res.status(400).json({ error: 'El nombre debe tener entre 3 y 60 caracteres y solo incluir letras, espacios, apóstrofes o guiones' });
    }
    if (!validarBoleta(boletaLimpia)) {
        return res.status(400).json({ error: 'La boleta debe tener 10 dígitos y no puede ser 0000000000' });
    }

    try {
        const asistencia = await asistenciasModel.registrarAsistencia({
            taller_id: tallerIdLimpio,
            nombre_alumno: nombreLimpio,
            boleta: boletaLimpia
        });
        res.status(201).json(asistencia);
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY' || error.code === '23505') {
            return res.status(409).json({ error: 'Esta boleta ya está inscrita en un taller. Solo se permite una inscripción activa.' });
        }
        if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.code === '23503') {
            return res.status(404).json({ error: 'El taller seleccionado no existe' });
        }
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
