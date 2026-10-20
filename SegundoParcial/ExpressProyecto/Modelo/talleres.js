const pool = require('../db-local');
const crypto = require('crypto');

// Consultar todos los talleres
async function listar() {
    const [filas] = await pool.query('SELECT id, nombre, instructor, fecha, cupo FROM talleres ORDER BY fecha ASC');
    return filas;
}

// Consultar taller por ID con el número de alumnos inscritos (asistentes)
async function obtenerPorId(id) {
    const [filas] = await pool.query('SELECT id, nombre, instructor, fecha, cupo FROM talleres WHERE id = ?', [id]);
    if (!filas || filas.length === 0) return undefined;

    const [conteo] = await pool.query('SELECT COUNT(*) AS total FROM asistencias WHERE taller_id = ?', [id]);
    const asistentes = (conteo && conteo[0]) ? Number(conteo[0].total) : 0;

    return {
        ...filas[0],
        asistentes
    };
}

// Alias para satisfacer el requerimiento del profesor en clase
const consultarPorTaller = obtenerPorId;

// Registrar un nuevo taller
async function crear({ nombre, instructor, fecha, cupo }) {
    const id = crypto.randomUUID();
    const cupoFinal = (cupo !== undefined && cupo !== null) ? Number(cupo) : 20;

    await pool.query(
        'INSERT INTO talleres (id, nombre, instructor, fecha, cupo) VALUES (?, ?, ?, ?, ?)',
        [id, nombre, instructor || '', fecha, cupoFinal]
    );

    return obtenerPorId(id);
}

// Eliminar un taller por ID
async function eliminar(id) {
    const [info] = await pool.query('DELETE FROM talleres WHERE id = ?', [id]);
    return info.affectedRows > 0;
}

module.exports = {
    listar,
    obtenerPorId,
    consultarPorTaller,
    crear,
    eliminar
};

