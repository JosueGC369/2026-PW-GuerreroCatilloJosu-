const http = require('http');
process.env.USE_MEMORY_DB = 'true';
const app = require('./server');

const TEST_PORT = 3099;
let server;

function makeRequest(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const payload = body ? JSON.stringify(body) : null;
        const options = {
            hostname: '127.0.0.1',
            port: TEST_PORT,
            path,
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        if (payload) {
            options.headers['Content-Length'] = Buffer.byteLength(payload);
        }

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                let parsed = null;
                try {
                    parsed = data ? JSON.parse(data) : null;
                } catch (e) {
                    parsed = data;
                }
                resolve({ status: res.statusCode, body: parsed, raw: data });
            });
        });

        req.on('error', reject);
        if (payload) req.write(payload);
        req.end();
    });
}

async function runTests() {
    server = app.listen(TEST_PORT, '127.0.0.1');
    await new Promise(r => setTimeout(r, 200));

    const results = [];
    let tallerId = null;
    let otroTallerId = null;
    let usuarioId = null;

    try {
        let res = await makeRequest('GET', '/');
        results.push({ id: 1, name: 'GET /', expected: 200, actual: res.status, ok: res.status === 200 });

        res = await makeRequest('GET', '/api/talleres');
        if (Array.isArray(res.body) && res.body.length > 0) {
            tallerId = res.body[res.body.length - 1].id;
            otroTallerId = res.body[0].id;
        }
        results.push({ id: 2, name: 'GET /api/talleres', expected: 200, actual: res.status, ok: res.status === 200 });

        res = await makeRequest('GET', `/api/talleres/${tallerId}`);
        results.push({ id: 3, name: 'GET /api/talleres/:id', expected: 200, actual: res.status, ok: res.status === 200 });

        res = await makeRequest('GET', '/api/talleres/00000000-0000-0000-0000-000000000000');
        results.push({ id: 4, name: 'GET /api/talleres/:id inexistente', expected: 404, actual: res.status, ok: res.status === 404 });

        res = await makeRequest('POST', '/api/talleres', {
            nombre: 'Taller de Postman',
            instructor: 'Ing. Tu Nombre',
            fecha: '2026-11-20',
            cupo: 15
        });
        if (res.body && res.body.id) tallerId = res.body.id;
        results.push({ id: 5, name: 'POST /api/talleres', expected: 201, actual: res.status, ok: res.status === 201 });

        res = await makeRequest('POST', '/api/talleres', {
            nombre: 'Taller de Postman',
            instructor: 'Ing. Tu Nombre',
            fecha: '2026-11-20',
            cupo: 15
        });
        const tallerDuplicadoId = res.body && res.body.id;
        const talleresVisibles = await makeRequest('GET', '/api/talleres');
        const duplicadosVisibles = talleresVisibles.body.filter(t =>
            t.nombre === 'Taller de Postman' &&
            t.instructor === 'Ing. Tu Nombre' &&
            String(t.fecha).slice(0, 10) === '2026-11-20' &&
            Number(t.cupo) === 15
        );
        results.push({
            id: 30,
            name: 'GET /api/talleres sin duplicados exactos',
            expected: 1,
            actual: duplicadosVisibles.length,
            ok: res.status === 201 && Boolean(tallerDuplicadoId) && duplicadosVisibles.length === 1
        });

        res = await makeRequest('POST', '/api/talleres', { instructor: 'Ing. Sin Nombre' });
        results.push({ id: 6, name: 'POST /api/talleres sin nombre', expected: 400, actual: res.status, ok: res.status === 400 });

        res = await makeRequest('POST', '/api/asistencias', {
            taller_id: String(tallerId),
            nombre_alumno: 'Tu Nombre Completo',
            boleta: '2026090099'
        });
        results.push({ id: 7, name: 'POST /api/asistencias', expected: 201, actual: res.status, ok: res.status === 201 });

        res = await makeRequest('POST', '/api/asistencias', {
            taller_id: String(otroTallerId),
            nombre_alumno: 'Tu Nombre Completo',
            boleta: '2026090099'
        });
        results.push({ id: 25, name: 'POST /api/asistencias segundo taller', expected: 409, actual: res.status, ok: res.status === 409 });

        const inscripcionesSimultaneas = await Promise.all([
            makeRequest('POST', '/api/asistencias', {
                taller_id: String(tallerId),
                nombre_alumno: 'Alumno Concurrente',
                boleta: '2026090097'
            }),
            makeRequest('POST', '/api/asistencias', {
                taller_id: String(otroTallerId),
                nombre_alumno: 'Alumno Concurrente',
                boleta: '2026090097'
            })
        ]);
        const estadosSimultaneos = inscripcionesSimultaneas.map(r => r.status);
        const unaInscripcionAceptada =
            estadosSimultaneos.filter(status => status === 201).length === 1 &&
            estadosSimultaneos.filter(status => status === 409).length === 1;
        results.push({
            id: 29,
            name: 'POST /api/asistencias simultáneas',
            expected: '1x 201 y 1x 409',
            actual: estadosSimultaneos.join(', '),
            ok: unaInscripcionAceptada
        });

        res = await makeRequest('POST', '/api/asistencias', {
            taller_id: String(otroTallerId),
            nombre_alumno: 'Tu Nombre Completo',
            boleta: '0000000000'
        });
        results.push({ id: 26, name: 'POST /api/asistencias boleta de ceros', expected: 400, actual: res.status, ok: res.status === 400 });

        res = await makeRequest('GET', `/api/talleres/${tallerId}/asistencias`);
        results.push({ id: 8, name: 'GET /api/talleres/:id/asistencias', expected: 200, actual: res.status, ok: res.status === 200 });

        res = await makeRequest('POST', '/api/asistencias', { nombre_alumno: 'Tu Nombre Completo' });
        results.push({ id: 9, name: 'POST /api/asistencias incompleta', expected: 400, actual: res.status, ok: res.status === 400 });

        res = await makeRequest('POST', '/api/asistencias', {
            taller_id: '00000000-0000-0000-0000-000000000000',
            nombre_alumno: 'Tu Nombre Completo',
            boleta: '2026090098'
        });
        results.push({ id: 10, name: 'POST /api/asistencias taller inexistente', expected: 404, actual: res.status, ok: res.status === 404 });

        res = await makeRequest('GET', '/api/usuarios');
        results.push({ id: 11, name: 'GET /api/usuarios', expected: 200, actual: res.status, ok: res.status === 200 });

        res = await makeRequest('POST', '/api/usuarios', {
            nombre: 'Tu Nombre Completo',
            correo: 'tu.nombre@alumno.ipn.mx',
            contrasena: 'Segura#2026',
            boleta: '2026090099',
            rol: 'admin'
        });
        if (res.body && res.body.id) usuarioId = res.body.id;
        results.push({ id: 12, name: 'POST /api/usuarios', expected: 201, actual: res.status, ok: res.status === 201 && res.body.rol === 'alumno' });

        res = await makeRequest('GET', `/api/usuarios/${usuarioId}`);
        results.push({ id: 13, name: 'GET /api/usuarios/:id', expected: 200, actual: res.status, ok: res.status === 200 });

        res = await makeRequest('GET', '/api/usuarios/99999');
        results.push({ id: 14, name: 'GET /api/usuarios/:id inexistente', expected: 404, actual: res.status, ok: res.status === 404 });

        res = await makeRequest('POST', '/api/usuarios', {
            nombre: 'Tu Nombre Completo',
            correo: 'tu.nombre@alumno.ipn.mx',
            contrasena: 'Segura#2026',
            boleta: '2026090099'
        });
        results.push({ id: 15, name: 'POST /api/usuarios repetido', expected: 409, actual: res.status, ok: res.status === 409 });

        res = await makeRequest('POST', '/api/usuarios', {
            nombre: 'Usuario Prueba',
            correo: 'correo-sin-arroba',
            contrasena: 'Segura2026',
            boleta: '2026090088'
        });
        results.push({ id: 16, name: 'POST /api/usuarios correo inválido', expected: 400, actual: res.status, ok: res.status === 400 });

        res = await makeRequest('POST', '/api/usuarios', {
            nombre: 'Usuario Prueba',
            correo: 'prueba.boleta@alumno.ipn.mx',
            contrasena: 'Segura2026',
            boleta: '123'
        });
        results.push({ id: 17, name: 'POST /api/usuarios boleta corta', expected: 400, actual: res.status, ok: res.status === 400 });

        res = await makeRequest('POST', '/api/usuarios', {
            nombre: 'Usuario Prueba',
            correo: 'prueba.pass@alumno.ipn.mx',
            contrasena: 'corta',
            boleta: '2026090087'
        });
        results.push({ id: 18, name: 'POST /api/usuarios contraseña corta', expected: 400, actual: res.status, ok: res.status === 400 });

        res = await makeRequest('POST', '/api/usuarios', {
            nombre: 'Usuario Prueba',
            correo: 'prueba.ceros@alumno.ipn.mx',
            contrasena: 'Segura#2026',
            boleta: '0000000000'
        });
        results.push({ id: 27, name: 'POST /api/usuarios boleta de ceros', expected: 400, actual: res.status, ok: res.status === 400 });

        res = await makeRequest('POST', '/api/usuarios', {
            nombre: 'Josue 123',
            correo: 'prueba.nombre@alumno.ipn.mx',
            contrasena: 'Segura#2026',
            boleta: '2026090086'
        });
        results.push({ id: 28, name: 'POST /api/usuarios nombre inválido', expected: 400, actual: res.status, ok: res.status === 400 });

        res = await makeRequest('POST', '/api/usuarios', { nombre: 'X' });
        results.push({ id: 19, name: 'POST /api/usuarios sin datos', expected: 400, actual: res.status, ok: res.status === 400 });

        res = await makeRequest('PUT', `/api/usuarios/${usuarioId}`, { rol: 'docente' });
        results.push({ id: 20, name: 'PUT /api/usuarios/:id solo rol', expected: 200, actual: res.status, ok: res.status === 200 });

        res = await makeRequest('PUT', `/api/usuarios/${usuarioId}`, {});
        results.push({ id: 21, name: 'PUT /api/usuarios/:id sin datos', expected: 400, actual: res.status, ok: res.status === 400 });

        res = await makeRequest('PUT', `/api/usuarios/${usuarioId}`, { correo: 'admin@cecyt9.ipn.mx' });
        results.push({ id: 22, name: 'PUT /api/usuarios/:id correo repetido', expected: 409, actual: res.status, ok: res.status === 409 });

        res = await makeRequest('PUT', '/api/usuarios/99999', { rol: 'docente' });
        results.push({ id: 23, name: 'PUT /api/usuarios/:id inexistente', expected: 404, actual: res.status, ok: res.status === 404 });

        res = await makeRequest('DELETE', `/api/usuarios/${usuarioId}`);
        results.push({ id: 24, name: 'DELETE /api/usuarios/:id', expected: 204, actual: res.status, ok: res.status === 204 });

        console.log('| #  | Petición                                | Esperado | Obtuve | Estado |');
        console.log('|----|-----------------------------------------|----------|--------|--------|');
        let allPassed = true;
        for (const r of results) {
            const check = r.ok ? '✓ PASS' : '✗ FAIL';
            if (!r.ok) allPassed = false;
            console.log(`| ${String(r.id).padEnd(2)} | ${r.name.padEnd(39)} | ${String(r.expected).padEnd(8)} | ${String(r.actual).padEnd(6)} | ${check.padEnd(6)} |`);
        }

        if (allPassed) {
            console.log(`\n✓ Todas las pruebas pasaron exitosamente (${results.length}/${results.length})`);
        }
    } catch (err) {
        console.error('Error durante la ejecución:', err);
    } finally {
        server.close();
    }
}

if (require.main === module) {
    runTests();
}

module.exports = runTests;
