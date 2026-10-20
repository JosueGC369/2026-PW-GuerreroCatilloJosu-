const mysql = require('mysql2/promise');

const DB_CONFIG = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'n03ml0',
    database: process.env.DB_NAME || 'proyecto_web',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true,
};

class MemoryDatabase {
    constructor() {
        this.usuarios = [
            { id: 1, nombre: 'Admin Semilla', correo: 'admin@cecyt9.ipn.mx', contrasena_hash: '$2b$10$wTqg.qZl7p0xV8.Z7p1bse2Q2x5qN6V5g1b4a8e9e1c2d3f4a5b6c', boleta: '2026090001', rol: 'admin' },
            { id: 2, nombre: 'Ana López', correo: 'ana.lopez@alumno.ipn.mx', contrasena_hash: '$2b$10$wTqg.qZl7p0xV8.Z7p1bse2Q2x5qN6V5g1b4a8e9e1c2d3f4a5b6c', boleta: '2026090002', rol: 'alumno' },
            { id: 3, nombre: 'Luis Pérez', correo: 'luis.perez@alumno.ipn.mx', contrasena_hash: '$2b$10$wTqg.qZl7p0xV8.Z7p1bse2Q2x5qN6V5g1b4a8e9e1c2d3f4a5b6c', boleta: '2026090003', rol: 'alumno' },
            { id: 4, nombre: 'María Hernández', correo: 'maria.hdez@alumno.ipn.mx', contrasena_hash: '$2b$10$wTqg.qZl7p0xV8.Z7p1bse2Q2x5qN6V5g1b4a8e9e1c2d3f4a5b6c', boleta: '2026090004', rol: 'alumno' }
        ];

        this.talleres = [
            { id: 'a1000000-0000-4000-8000-000000000001', nombre: 'Introducción a Python', instructor: 'Ing. Roberto Soto', fecha: '2026-11-01', cupo: 20 },
            { id: 'a1000000-0000-4000-8000-000000000002', nombre: 'Desarrollo Web con HTML y CSS', instructor: 'Lic. Carmen Cruz', fecha: '2026-11-05', cupo: 25 },
            { id: 'a1000000-0000-4000-8000-000000000003', nombre: 'Bases de Datos con MySQL', instructor: 'Mtro. Alejandro Ruiz', fecha: '2026-11-10', cupo: 20 },
            { id: 'a1000000-0000-4000-8000-000000000004', nombre: 'Git y GitHub en equipo', instructor: 'Ing. Tu Nombre', fecha: '2026-11-15', cupo: 3 },
            { id: 'a1000000-0000-4000-8000-000000000005', nombre: 'Next.js desde cero', instructor: 'Ing. Laura Martínez', fecha: '2026-11-25', cupo: 15 }
        ];

        this.asistencias = [
            { id: 'asist-00000000-0000-4000-8000-000000000001', taller_id: 'a1000000-0000-4000-8000-000000000004', nombre_alumno: 'Ana López', boleta: '2026090002', fecha_registro: '2026-10-15 10:00:00' },
            { id: 'asist-00000000-0000-4000-8000-000000000002', taller_id: 'a1000000-0000-4000-8000-000000000004', nombre_alumno: 'Luis Pérez', boleta: '2026090003', fecha_registro: '2026-10-15 11:30:00' }
        ];

        this.nextUserId = 5;
    }

    async query(sql, params = []) {
        const cleanSql = sql.trim().replace(/\s+/g, ' ');

        if (/^SELECT\s+.*FROM\s+usuarios\s+ORDER\s+BY/i.test(cleanSql)) {
            const filas = this.usuarios.map(u => ({
                id: u.id,
                nombre: u.nombre,
                correo: u.correo,
                boleta: u.boleta,
                rol: u.rol
            }));
            return [filas];
        }

        if (/^SELECT\s+.*FROM\s+usuarios\s+WHERE\s+id\s*=\s*\?/i.test(cleanSql)) {
            const id = Number(params[0]);
            const u = this.usuarios.find(x => x.id === id);
            if (!u) return [[]];
            return [[{ id: u.id, nombre: u.nombre, correo: u.correo, boleta: u.boleta, rol: u.rol }]];
        }

        if (/^SELECT\s+.*FROM\s+usuarios\s+WHERE\s+correo\s*=\s*\?/i.test(cleanSql)) {
            const correo = params[0];
            const u = this.usuarios.find(x => x.correo === correo);
            return [u ? [u] : []];
        }

        if (/^INSERT\s+INTO\s+usuarios/i.test(cleanSql)) {
            const [nombre, correo, contrasenaHash, boleta, rol] = params;
            const dup = this.usuarios.find(x => x.correo === correo || x.boleta === boleta);
            if (dup) {
                const err = new Error('Duplicate entry for key usuarios.correo or usuarios.boleta');
                err.code = 'ER_DUP_ENTRY';
                throw err;
            }

            const nuevo = {
                id: this.nextUserId++,
                nombre,
                correo,
                contrasena_hash: contrasenaHash,
                boleta,
                rol: rol || 'alumno'
            };
            this.usuarios.push(nuevo);
            return [{ insertId: nuevo.id, affectedRows: 1 }];
        }

        if (/^UPDATE\s+usuarios\s+SET/i.test(cleanSql)) {
            const id = Number(params[params.length - 1]);
            const u = this.usuarios.find(x => x.id === id);
            if (!u) return [{ affectedRows: 0 }];

            const cambios = cleanSql.match(/SET\s+(.*?)\s+WHERE/i)[1].split(',');
            let paramIdx = 0;
            for (const c of cambios) {
                const col = c.trim().split('=')[0].trim();
                const val = params[paramIdx++];
                if (col === 'correo') {
                    const dup = this.usuarios.find(x => x.correo === val && x.id !== id);
                    if (dup) {
                        const err = new Error('Duplicate entry for key usuarios.correo');
                        err.code = 'ER_DUP_ENTRY';
                        throw err;
                    }
                }
                u[col] = val;
            }
            return [{ affectedRows: 1 }];
        }

        if (/^DELETE\s+FROM\s+usuarios\s+WHERE\s+id\s*=\s*\?/i.test(cleanSql)) {
            const id = Number(params[0]);
            const idx = this.usuarios.findIndex(x => x.id === id);
            if (idx === -1) return [{ affectedRows: 0 }];
            this.usuarios.splice(idx, 1);
            return [{ affectedRows: 1 }];
        }

        if (/^SELECT\s+.*FROM\s+talleres\s+WHERE\s+id\s*=\s*\?/i.test(cleanSql)) {
            const id = String(params[0]);
            const t = this.talleres.find(x => String(x.id) === id);
            return [t ? [t] : []];
        }

        if (/^SELECT\s+.*FROM\s+talleres/i.test(cleanSql)) {
            return [[...this.talleres]];
        }

        if (/^INSERT\s+INTO\s+talleres/i.test(cleanSql)) {
            const [id, nombre, instructor, fecha, cupo] = params;
            const nuevo = { id: String(id), nombre, instructor, fecha, cupo: Number(cupo) };
            this.talleres.push(nuevo);
            return [{ affectedRows: 1 }];
        }

        if (/^DELETE\s+FROM\s+talleres\s+WHERE\s+id\s*=\s*\?/i.test(cleanSql)) {
            const id = String(params[0]);
            const idx = this.talleres.findIndex(x => String(x.id) === id);
            if (idx === -1) return [{ affectedRows: 0 }];
            this.talleres.splice(idx, 1);
            this.asistencias = this.asistencias.filter(a => String(a.taller_id) !== id);
            return [{ affectedRows: 1 }];
        }

        if (/^SELECT\s+COUNT\(\*\)\s+AS\s+total\s+FROM\s+asistencias\s+WHERE\s+taller_id\s*=\s*\?/i.test(cleanSql)) {
            const tallerId = String(params[0]);
            const count = this.asistencias.filter(a => String(a.taller_id) === tallerId).length;
            return [[{ total: count }]];
        }

        if (/^SELECT\s+.*FROM\s+asistencias\s+WHERE\s+taller_id\s*=\s*\?/i.test(cleanSql)) {
            const tallerId = String(params[0]);
            const asist = this.asistencias.filter(a => String(a.taller_id) === tallerId);
            return [asist];
        }

        if (/^SELECT\s+.*FROM\s+asistencias/i.test(cleanSql)) {
            return [[...this.asistencias]];
        }

        if (/^INSERT\s+INTO\s+asistencias/i.test(cleanSql)) {
            const [id, taller_id, nombre_alumno, boleta] = params;
            const tallerExiste = this.talleres.some(t => String(t.id) === String(taller_id));
            if (!tallerExiste) {
                const err = new Error('Cannot add or update a child row: a foreign key constraint fails (`proyecto_web`.`asistencias`, CONSTRAINT `asistencias_ibfk_1` FOREIGN KEY (`taller_id`) REFERENCES `talleres` (`id`))');
                err.code = 'ER_NO_REFERENCED_ROW_2';
                throw err;
            }

            const nueva = {
                id: String(id),
                taller_id: String(taller_id),
                nombre_alumno,
                boleta,
                fecha_registro: new Date().toISOString().slice(0, 19).replace('T', ' ')
            };
            this.asistencias.push(nueva);
            return [{ affectedRows: 1, insertId: nueva.id }];
        }

        return [[]];
    }
}

let activePool = null;
let useMemory = process.env.USE_MEMORY_DB === 'true';

if (!useMemory) {
    try {
        const realPool = mysql.createPool(DB_CONFIG);
        realPool.getConnection()
            .then(conn => {
                conn.release();
                activePool = realPool;
                console.log(`Conectado a MySQL (${DB_CONFIG.database}) en ${DB_CONFIG.host}:${DB_CONFIG.port}`);
            })
            .catch(() => {
                activePool = new MemoryDatabase();
            });
    } catch (e) {
        activePool = new MemoryDatabase();
    }
} else {
    activePool = new MemoryDatabase();
}

const poolProxy = {
    async query(sql, params) {
        if (!activePool) {
            await new Promise(r => setTimeout(r, 100));
            if (!activePool) activePool = new MemoryDatabase();
        }
        return activePool.query(sql, params);
    },
    async getConnection() {
        if (activePool && typeof activePool.getConnection === 'function') {
            return activePool.getConnection();
        }
        return {
            release() {},
            query: (s, p) => poolProxy.query(s, p)
        };
    }
};

module.exports = poolProxy;
