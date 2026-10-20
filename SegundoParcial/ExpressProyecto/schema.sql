CREATE DATABASE IF NOT EXISTS proyecto_web CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE proyecto_web;

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    correo VARCHAR(255) NOT NULL UNIQUE,
    contrasena_hash VARCHAR(255) NOT NULL,
    boleta VARCHAR(20) NOT NULL UNIQUE,
    rol ENUM('alumno', 'docente', 'admin') DEFAULT 'alumno',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS talleres (
    id VARCHAR(36) PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    instructor VARCHAR(255),
    fecha DATE NOT NULL,
    cupo INT DEFAULT 20,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS asistencias (
    id VARCHAR(36) PRIMARY KEY,
    taller_id VARCHAR(36) NOT NULL,
    nombre_alumno VARCHAR(255) NOT NULL,
    boleta VARCHAR(20) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (taller_id) REFERENCES talleres(id) ON DELETE CASCADE
);

INSERT IGNORE INTO usuarios (id, nombre, correo, contrasena_hash, boleta, rol) VALUES
(1, 'Admin Semilla', 'admin@cecyt9.ipn.mx', '$2b$10$wTqg.qZl7p0xV8.Z7p1bse2Q2x5qN6V5g1b4a8e9e1c2d3f4a5b6c', '2026090001', 'admin'),
(2, 'Ana López', 'ana.lopez@alumno.ipn.mx', '$2b$10$wTqg.qZl7p0xV8.Z7p1bse2Q2x5qN6V5g1b4a8e9e1c2d3f4a5b6c', '2026090002', 'alumno'),
(3, 'Luis Pérez', 'luis.perez@alumno.ipn.mx', '$2b$10$wTqg.qZl7p0xV8.Z7p1bse2Q2x5qN6V5g1b4a8e9e1c2d3f4a5b6c', '2026090003', 'alumno'),
(4, 'María Hernández', 'maria.hdez@alumno.ipn.mx', '$2b$10$wTqg.qZl7p0xV8.Z7p1bse2Q2x5qN6V5g1b4a8e9e1c2d3f4a5b6c', '2026090004', 'alumno');

INSERT IGNORE INTO talleres (id, nombre, instructor, fecha, cupo) VALUES
('a1000000-0000-4000-8000-000000000001', 'Introducción a Python', 'Ing. Roberto Soto', '2026-11-01', 20),
('a1000000-0000-4000-8000-000000000002', 'Desarrollo Web con HTML y CSS', 'Lic. Carmen Cruz', '2026-11-05', 25),
('a1000000-0000-4000-8000-000000000003', 'Bases de Datos con MySQL', 'Mtro. Alejandro Ruiz', '2026-11-10', 20),
('a1000000-0000-4000-8000-000000000004', 'Git y GitHub en equipo', 'Ing. Tu Nombre', '2026-11-15', 3),
('a1000000-0000-4000-8000-000000000005', 'Next.js desde cero', 'Ing. Laura Martínez', '2026-11-25', 15);

INSERT IGNORE INTO asistencias (id, taller_id, nombre_alumno, boleta, fecha_registro) VALUES
('asist-00000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000004', 'Ana López', '2026090002', '2026-10-15 10:00:00'),
('asist-00000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000004', 'Luis Pérez', '2026090003', '2026-10-15 11:30:00');
