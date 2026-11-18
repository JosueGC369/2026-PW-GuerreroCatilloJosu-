# Portafolio de Evidencias — Programación Web

Portafolio de trabajos y proyectos de la asignatura **Programación Web**.

**Alumno:** Guerrero Castillo Josué
**Institución:** Instituto Politécnico Nacional (IPN)

- Landing del portafolio: <https://josuegc369.github.io/2026-PW-GuerreroCatilloJosu-/>

## Contenido

| Carpeta | Descripción |
| --- | --- |
| `LANDING_PAGE/` | Landing page del portafolio |
| `Primer Parcial/` | Formularios con validaciones en JavaScript y ejercicios básicos (arreglos, objetos JSON, strings y fechas) |
| `SegundoParcial/` | API REST con Express (controladores, modelos, rutas, colección de Postman) y mini proyectos en Next.js |
| `TercerParcial/` | Demo de sesiones: servidor Express con base de datos MySQL |
| `index.html` + `styleprincipal.css` | Página principal del portafolio |

## Cómo ejecutar

**Portafolio:** es HTML/CSS/JS estático, basta con abrir `index.html` en el navegador o visitar el enlace de GitHub Pages.

**API con Express** (`SegundoParcial/ExpressProyecto`):

```bash
cd "SegundoParcial/ExpressProyecto"
npm install
npm start
```

Las variables de entorno se configuran a partir de `.env.example`. La colección `coleccion-2025090402.json` se importa en Postman para probar los endpoints.

**Demo de sesiones** (`TercerParcial/demo-sesiones/base`):

```bash
cd "TercerParcial/demo-sesiones/base"
npm install
npm start
```

Requiere una base de datos MySQL; el script de creación está en `bd/demo_sesiones.sql`.
