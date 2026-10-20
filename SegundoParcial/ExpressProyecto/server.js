const express = require('express');

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3001;

// ========================================================
// Paso 2 — Prueba de vida
// ========================================================
app.get('/', (req, res) => {
    res.json({ mensaje: 'API de Registro de Asistencia - CECyT 9 funcionando correctamente' });
});

// ========================================================
// Rutas anteriores para compatibilidad
// ========================================================
app.get('/saludo', (req, res) => {
    res.json({ mensaje: 'Hola esto es una prueba en GET' });
});

app.post('/eco', (req, res) => {
    const { texto } = req.body || {};
    if (!texto) {
        return res.status(400).json({ error: 'EL texto es obligatorio' });
    }
    res.status(201).json({ eco: texto });
});

// ========================================================
// Rutas de la API (Talleres, Asistencias, Usuarios)
// ========================================================
const talleresRutas = require('./Rutas/talleres_rutas');
const asistenciasRutas = require('./Rutas/asistencias_rutas');
const usuariosRutas = require('./Rutas/usuarios_rutas');

app.use('/api/talleres', talleresRutas);
app.use('/api/asistencias', asistenciasRutas);
app.use('/api/usuarios', usuariosRutas);

// Iniciar servidor
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Servidor escuchando en el puerto: ${PORT}`);
    });
}

module.exports = app;
