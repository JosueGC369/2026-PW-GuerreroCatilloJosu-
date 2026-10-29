import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { pedirJSON } from '../lib/api';
import { formatearFecha } from '../lib/formato';
import { validarBoleta } from '../lib/validaciones';
import { ocultarBoleta } from '../lib/formato';
import estilos from '../styles/Talleres.module.css';

export default function Perfil() {
  const router = useRouter();
  const [boleta, setBoleta] = useState('');
  const [buscada, setBuscada] = useState('');
  const [alumno, setAlumno] = useState(null);
  const [nombreInscrito, setNombreInscrito] = useState('');
  const [misTalleres, setMisTalleres] = useState([]);
  const [disponibles, setDisponibles] = useState([]);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  // Si llegan con ?boleta= (desde el registro), pre-llena y busca directo
  useEffect(() => {
    if (router.query.boleta) {
      setBoleta(String(router.query.boleta));
      buscarPor(null, String(router.query.boleta));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.boleta]);

  function buscar(e) {
    return buscarPor(e, boleta);
  }

  async function buscarPor(e, valor) {
    if (e) e.preventDefault();
    setError('');
    const b = String(valor || '').trim();
    if (!validarBoleta(b)) return setError('La boleta debe tener 10 dígitos.');
    setCargando(true);
    try {
      const usuarios = await pedirJSON('/usuarios');
      const talleres = await pedirJSON('/talleres');
      const listas = await Promise.all(
        talleres.map((t) => pedirJSON(`/talleres/${t.id}/asistencias`))
      );
      const conAsistencias = talleres.map((t, i) => ({ ...t, asistencias: listas[i] }));

      const mis = conAsistencias.filter((t) =>
        t.asistencias.some((a) => a.boleta === b)
      );
      const disponiblesFilt = conAsistencias.filter(
        (t) => !mis.includes(t) && t.asistencias.length < t.cupo
      );

      const inscripcion =
        mis.length > 0 ? mis[0].asistencias.find((a) => a.boleta === b) : null;

      setAlumno(usuarios.find((u) => u.boleta === b) || null);
      setNombreInscrito(inscripcion ? inscripcion.nombre_alumno : '');
      setMisTalleres(mis);
      setDisponibles(disponiblesFilt);
      setBuscada(b);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  const nombreMostrar = alumno ? alumno.nombre : nombreInscrito;

  return (
    <main>
      <h1>Mi perfil</h1>
      <form onSubmit={buscar} className="formulario">
        <input
          placeholder="Tu boleta (10 dígitos)"
          value={boleta}
          onChange={(e) => setBoleta(e.target.value)}
        />
        <button type="submit" disabled={cargando}>
          {cargando ? 'Buscando…' : 'Ver mi perfil'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}

      {buscada && (
        <>
          <section className={estilos.panel}>
            {alumno ? (
              <>
                <h2>{alumno.nombre}</h2>
                <p>
                  <strong>Correo:</strong> {alumno.correo}
                </p>
                <p>
                  <strong>Boleta:</strong> {alumno.boleta}
                </p>
                <p>
                  <strong>Rol:</strong> {alumno.rol}
                </p>
              </>
            ) : (
              <p>
                La boleta {buscada} no tiene cuenta registrada
                {nombreInscrito
                  ? ` (inscripciones a nombre de ${nombreInscrito})`
                  : ''}. Aun así puedes inscribirte en un taller o{' '}
                <Link href={`/registro?boleta=${buscada}`}>crear tu cuenta</Link>{' '}
                con esa boleta.
              </p>
            )}
          </section>

          <h2>Mis talleres ({misTalleres.length})</h2>
          {misTalleres.length === 0 ? (
            <p>Todavía no estás inscrito en ningún taller.</p>
          ) : (
            <ul className={estilos.lista}>
              {misTalleres.map((t) => (
                <li key={t.id}>
                  <Link href={`/talleres/${t.id}`}>
                    {t.nombre}
                  </Link>{' '}
                  — {formatearFecha(t.fecha)}
                </li>
              ))}
            </ul>
          )}

          <h2>Talleres con lugar disponible</h2>
          {disponibles.length === 0 ? (
            <p>No hay más talleres con lugar.</p>
          ) : (
            <ul className={estilos.lista}>
              {disponibles.map((t) => {
                const libres = t.cupo - t.asistencias.length;
                return (
                  <li key={t.id}>
                    {t.nombre} — {libres} {libres === 1 ? 'lugar' : 'lugares'} ·{' '}
                    <Link
                      href={`/talleres/${t.id}?boleta=${buscada}&nombre=${encodeURIComponent(
                        nombreMostrar
                      )}`}
                    >
                      Inscribirme
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </main>
  );
}
