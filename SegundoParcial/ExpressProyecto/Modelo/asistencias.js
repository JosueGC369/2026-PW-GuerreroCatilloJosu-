const pool = require('../db-local');
const crypto = require('crypto');

// Registrar la asistencia de un alumno a un taller
async function registrarAsistencia({ taller_id, nombre_alumno, boleta }) {
    const id = crypto.randomUUID();

    await pool.query(
        'INSERT INTO asistencias (id, taller_id, nombre_alumno, boleta) VALUES (?, ?, ?, ?)',
        [id, taller_id, nombre_alumno, boleta]
    );

    const [filas] = await pool.query(
        'SELECT id, taller_id, nombre_alumno, boleta, fecha_registro FROM asistencias WHERE id = ?',
        [id]
    );

    if (filas && filas[0]) {
        return filas[0];
    }

    return {
        id,
        taller_id,
        nombre_alumno,
        boleta,
        fecha_registro: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };
}

// Consultar la lista de asistencias registradas para un taller
async function consultarListaDeAsistencia(taller_id) {
    const [filas] = await pool.query(
        'SELECT id, taller_id, nombre_alumno, boleta, fecha_registro FROM asistencias WHERE taller_id = ? ORDER BY fecha_registro ASC',
        [taller_id]
    );
    return filas || [];
}

// Consultar todas las asistencias generales
async function listar() {
    const [filas] = await pool.query(
        'SELECT id, taller_id, nombre_alumno, boleta, fecha_registro FROM asistencias ORDER BY fecha_registro ASC'
    );
    return filas || [];
}

module.exports = {
    registrarAsistencia,
    crear: registrarAsistencia,
    consultarListaDeAsistencia,
    listarPorTaller: consultarListaDeAsistencia,
    listar
};

