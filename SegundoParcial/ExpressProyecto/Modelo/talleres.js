const pool = require('../db-local');
const crypto = require('crypto');

//consultar todos los talleres
async function listar() {
    const [filas] = await pool.query('SELECT id, nombre, instructor, fecha, cupo FROM talleres ORDER BY fecha ASC');
    const claves = new Set();
    return filas.filter(taller => {
        const clave = JSON.stringify([
            String(taller.nombre || '').trim().toLocaleLowerCase(),
            String(taller.instructor || '').trim().toLocaleLowerCase(),
            String(taller.fecha || '').slice(0, 10),
            Number(taller.cupo)
        ]);
        if (claves.has(clave)) return false;
        claves.add(clave);
        return true;
    });
}

//consultar por taller
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

const consultarPorTaller = obtenerPorId;

//crear taller
async function crear({ nombre, instructor, fecha, cupo }) {
    const id = crypto.randomUUID();
    const cupoFinal = (cupo !== undefined && cupo !== null) ? Number(cupo) : 20;

    await pool.query(
        'INSERT INTO talleres (id, nombre, instructor, fecha, cupo) VALUES (?, ?, ?, ?, ?)',
        [id, nombre, instructor || '', fecha, cupoFinal]
    );

    return obtenerPorId(id);
}

//eliminar taller
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
