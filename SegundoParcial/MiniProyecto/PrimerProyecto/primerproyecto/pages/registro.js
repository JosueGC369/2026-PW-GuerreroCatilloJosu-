import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { pedirJSON } from '../lib/api';
import {
  validarNombre,
  validarCorreo,
  validarBoleta,
  validarContrasena,
} from '../lib/validaciones';
import estilos from '../styles/Talleres.module.css';

export default function Registro() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [boleta, setBoleta] = useState('');
  const [errores, setErrores] = useState({});
  const [errorServidor, setErrorServidor] = useState('');
  const [creado, setCreado] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (router.query.boleta) {
      setBoleta(String(router.query.boleta).replace(/\D/g, '').slice(0, 10));
    }
  }, [router.query]);

  function validarTodo() {
    const nuevosErrores = {};
    const nombreLimpio = nombre.trim().replace(/\s+/g, ' ');
    const correoLimpio = correo.trim();

    if (!nombreLimpio) {
      nuevosErrores.nombre = 'El nombre es obligatorio.';
    } else if (!validarNombre(nombreLimpio)) {
      nuevosErrores.nombre =
        'Usa de 3 a 60 letras; puedes incluir espacios, apóstrofes y guiones.';
    }

    if (!correoLimpio) {
      nuevosErrores.correo = 'El correo es obligatorio.';
    } else if (!validarCorreo(correoLimpio)) {
      nuevosErrores.correo =
        'Escribe un correo válido (máximo 254 caracteres).';
    }

    if (!contrasena) {
      nuevosErrores.contrasena = 'La contraseña es obligatoria.';
    } else if (!validarContrasena(contrasena)) {
      nuevosErrores.contrasena =
        'Usa de 8 a 64 caracteres con mayúscula, minúscula, número y símbolo.';
    }

    if (!boleta.trim()) {
      nuevosErrores.boleta = 'La boleta es obligatoria.';
    } else if (!validarBoleta(boleta)) {
      nuevosErrores.boleta =
        'Deben ser 10 dígitos numéricos y no puede ser puros ceros.';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  async function registrar(e) {
    e.preventDefault();
    setErrorServidor('');
    setCreado(null);

    if (!validarTodo()) return;

    setEnviando(true);
    try {
      const usuario = await pedirJSON('/usuarios', {
        method: 'POST',
        body: JSON.stringify({
          nombre: nombre.trim().replace(/\s+/g, ' '),
          correo: correo.trim().toLowerCase(),
          contrasena: contrasena,
          boleta: boleta.trim(),
        }),
      });
      setCreado(usuario);
    } catch (err) {
      setErrorServidor(err.message);
    } finally {
      setEnviando(false);
    }
  }

  if (creado) {
    return (
      <main>
        <h1>Cuenta creada ✅</h1>
        <section className={estilos.panel}>
          <h2>{creado.nombre}</h2>
          <p>
            <strong>Boleta:</strong> {creado.boleta}
          </p>
          <p>
            <strong>Correo:</strong> {creado.correo}
          </p>
          <p>
            <strong>Rol:</strong> {creado.rol || 'alumno'}
          </p>
          <p>
            Ya puedes ver tus talleres en tu perfil o inscribirte en uno
            nuevo.
          </p>
          <p>
            <Link href={`/perfil?boleta=${creado.boleta}`}>Ir a mi perfil →</Link>
            {' · '}
            <Link href="/talleres">Ver talleres →</Link>
          </p>
        </section>
      </main>
    );
  }

  return (
    <main>
      <h1>Crear cuenta</h1>
      <p>Tus datos quedarán guardados y podrás consultar tu perfil por boleta.</p>

      <section className={estilos.panel}>
        <form onSubmit={registrar} noValidate>
          <label className={estilos.etiqueta} htmlFor="nombre">
            Nombre completo
          </label>
          <input
            id="nombre"
            className={estilos.entrada}
            type="text"
            placeholder="Ej. Josué Guerrero Castillo"
            autoComplete="name"
            maxLength={60}
            required
            aria-invalid={Boolean(errores.nombre)}
            aria-describedby={errores.nombre ? 'error-nombre' : undefined}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          {errores.nombre && (
            <p id="error-nombre" className={estilos.errorCampo} role="alert">
              {errores.nombre}
            </p>
          )}

          <label className={estilos.etiqueta} htmlFor="correo">
            Correo
          </label>
          <input
            id="correo"
            className={estilos.entrada}
            type="email"
            placeholder="Ej. josue@alumno.ipn.mx"
            autoComplete="email"
            maxLength={254}
            required
            aria-invalid={Boolean(errores.correo)}
            aria-describedby={errores.correo ? 'error-correo' : undefined}
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
          {errores.correo && (
            <p id="error-correo" className={estilos.errorCampo} role="alert">
              {errores.correo}
            </p>
          )}

          <label className={estilos.etiqueta} htmlFor="contrasena">
            Contraseña
          </label>
          <input
            id="contrasena"
            className={estilos.entrada}
            type="password"
            placeholder="8-64 caracteres, mayúscula, minúscula, número y símbolo"
            autoComplete="new-password"
            maxLength={64}
            required
            aria-invalid={Boolean(errores.contrasena)}
            aria-describedby={errores.contrasena ? 'error-contrasena' : undefined}
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
          />
          {errores.contrasena && (
            <p
              id="error-contrasena"
              className={estilos.errorCampo}
              role="alert"
            >
              {errores.contrasena}
            </p>
          )}

          <label className={estilos.etiqueta} htmlFor="boleta">
            Boleta
          </label>
          <input
            id="boleta"
            className={estilos.entrada}
            type="text"
            inputMode="numeric"
            maxLength={10}
            placeholder="10 dígitos, ej. 2025090402"
            required
            aria-invalid={Boolean(errores.boleta)}
            aria-describedby={errores.boleta ? 'error-boleta' : undefined}
            value={boleta}
            onChange={(e) => setBoleta(e.target.value.replace(/\D/g, ''))}
          />
          {errores.boleta && (
            <p id="error-boleta" className={estilos.errorCampo} role="alert">
              {errores.boleta}
            </p>
          )}

          <p className={estilos.ayuda}>
            La boleta es como te identificarán en los talleres: con ella
            consultas tu perfil y te inscribes a un taller (solo uno a la vez).
          </p>

          <button type="submit" disabled={enviando}>
            {enviando ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
        </form>

        {errorServidor && (
          <p className={estilos.errorCampo}>{errorServidor}</p>
        )}

        <p>
          ¿Ya tienes cuenta?{' '}
          <Link href="/perfil">Consulta tu perfil con tu boleta →</Link>
        </p>
      </section>
    </main>
  );
}
