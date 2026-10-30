const pool = require('../db-local');
const crypto = require('crypto');

//registrar asistencia
async function registrarAsistencia({ taller_id, nombre_alumno, boleta }) {
    const [inscripcionesExistentes] = await pool.query(
        'SELECT id FROM asistencias WHERE boleta = ? LIMIT 1',
        [boleta]
    );
    if (inscripcionesExistentes && inscripcionesExistentes.length > 0) {
        const error = new Error('Esta boleta ya está inscrita en un taller');
        error.code = 'ER_DUP_ENTRY';
        throw error;
    }

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

//consultar lista de asistencia
async function consultarListaDeAsistencia(taller_id) {
    const [filas] = await pool.query(
        'SELECT id, taller_id, nombre_alumno, boleta, fecha_registro FROM asistencias WHERE taller_id = ? ORDER BY fecha_registro ASC',
        [taller_id]
    );
    return filas || [];
}

//consultar todas las asistencias
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
