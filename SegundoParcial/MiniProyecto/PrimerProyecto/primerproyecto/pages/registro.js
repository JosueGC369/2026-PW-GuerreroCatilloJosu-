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

    if (!nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio.';
    } else if (!validarNombre(nombre)) {
      nuevosErrores.nombre =
        'Solo letras y espacios, mínimo 3 caracteres y máximo 60.';
    }

    if (!correo.trim()) {
      nuevosErrores.correo = 'El correo es obligatorio.';
    } else if (!validarCorreo(correo)) {
      nuevosErrores.correo =
        'Formato inválido. Ejemplo: nombre@alumno.ipn.mx';
    }

    if (!contrasena) {
      nuevosErrores.contrasena = 'La contraseña es obligatoria.';
    } else if (!validarContrasena(contrasena)) {
      nuevosErrores.contrasena =
        'Mínimo 8 caracteres, con al menos una letra y un número.';
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
          nombre: nombre.trim(),
          correo: correo.trim(),
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
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          {errores.nombre && (
            <p className={estilos.errorCampo}>{errores.nombre}</p>
          )}

          <label className={estilos.etiqueta} htmlFor="correo">
            Correo
          </label>
          <input
            id="correo"
            className={estilos.entrada}
            type="email"
            placeholder="Ej. josue@alumno.ipn.mx"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
          {errores.correo && (
            <p className={estilos.errorCampo}>{errores.correo}</p>
          )}

          <label className={estilos.etiqueta} htmlFor="contrasena">
            Contraseña
          </label>
          <input
            id="contrasena"
            className={estilos.entrada}
            type="password"
            placeholder="Mínimo 8 caracteres, una letra y un número"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
          />
          {errores.contrasena && (
            <p className={estilos.errorCampo}>{errores.contrasena}</p>
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
            value={boleta}
            onChange={(e) => setBoleta(e.target.value.replace(/\D/g, ''))}
          />
          {errores.boleta && (
            <p className={estilos.errorCampo}>{errores.boleta}</p>
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
