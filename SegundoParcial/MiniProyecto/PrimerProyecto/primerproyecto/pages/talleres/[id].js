import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { pedirJSON } from '../../lib/api';
import { formatearFecha, yaPaso, ocultarBoleta } from '../../lib/formato';
import { validarBoleta, validarNombre } from '../../lib/validaciones';
import estilos from '../../styles/Talleres.module.css';

export default function TallerDetalle() {
  const router = useRouter();
  const { id } = router.query;

  const [taller, setTaller] = useState(null);
  const [asistencias, setAsistencias] = useState([]);
  const [todas, setTodas] = useState([]); // todas las asistencias (todos los talleres)
  const [talleresLista, setTalleresLista] = useState([]);
  const [errorCarga, setErrorCarga] = useState('');
  const [cargando, setCargando] = useState(true);

  const [nombre, setNombre] = useState('');
  const [boleta, setBoleta] = useState('');
  const [errorForm, setErrorForm] = useState('');
  const [exito, setExito] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (router.query.boleta) setBoleta(String(router.query.boleta));
    if (router.query.nombre) setNombre(String(router.query.nombre));
  }, [router.query]);

  useEffect(() => {
    if (!router.isReady) return;
    cargar();
  }, [router.isReady, id]);

  async function cargar() {
    try {
      // Carga el taller, sus inscritos y también TODAS las asistencias,
      // para poder impedir inscribirse en dos talleres a la vez.
      const [t, a, todasAsistencias, listaTalleres] = await Promise.all([
        pedirJSON(`/talleres/${id}`),
        pedirJSON(`/talleres/${id}/asistencias`),
        pedirJSON('/asistencias'),
        pedirJSON('/talleres'),
      ]);
      setTaller(t);
      setAsistencias(a);
      setTodas(todasAsistencias);
      setTalleresLista(listaTalleres);
      setErrorCarga('');
    } catch (err) {
      setErrorCarga(err.message);
    } finally {
      setCargando(false);
    }
  }

  const ocupados = asistencias.length;
  const libres = taller ? Math.max(0, taller.cupo - ocupados) : 0;
  const lleno = taller !== null && libres === 0;

  async function inscribir(e) {
    e.preventDefault();
    setErrorForm('');
    setExito('');

    const nombreLimpio = nombre.trim();
    const boletaLimpia = boleta.trim();

    // Validaciones "cero friendly": campo vacío o puro cero no pasa
    if (!nombreLimpio || /^0+$/.test(nombreLimpio))
      return setErrorForm('Escribe tu nombre (no se aceptan solo ceros).');
    if (!boletaLimpia || /^0+$/.test(boletaLimpia))
      return setErrorForm(
        'La boleta es obligatoria y no se acepta puros ceros (0000000000).'
      );
    if (!validarNombre(nombreLimpio))
      return setErrorForm(
        'El nombre solo admite letras y espacios (entre 3 y 60 caracteres).'
      );
    if (!validarBoleta(boletaLimpia))
      return setErrorForm('La boleta debe tener 10 dígitos.');
    if (asistencias.some((a) => a.boleta === boletaLimpia))
      return setErrorForm('Esa boleta ya está inscrita en este taller.');

    // Regla: una boleta solo puede estar inscrita en UN taller a la vez
    const otra = todas.find(
      (a) => a.boleta === boletaLimpia && a.taller_id !== id
    );
    if (otra) {
      const t = talleresLista.find((x) => x.id === otra.taller_id);
      return setErrorForm(
        `Esa boleta ya está inscrita en otro taller${
          t ? `: «${t.nombre}»` : ''
        }. Solo puedes estar inscrito en uno a la vez.`
      );
    }

    if (lleno) return setErrorForm('El taller ya no tiene lugares.');

    setEnviando(true);
    try {
      await pedirJSON('/asistencias', {
        method: 'POST',
        body: JSON.stringify({
          taller_id: id,
          nombre_alumno: nombreLimpio,
          boleta: boletaLimpia,
        }),
      });
      setExito(`¡Listo! ${nombreLimpio} quedó inscrito(a) en el taller.`);
      setNombre('');
      setBoleta('');
      await cargar();
    } catch (err) {
      setErrorForm(err.message);
    } finally {
      setEnviando(false);
    }
  }

  if (errorCarga) {
    return (
      <main>
        <p className="error">{errorCarga}</p>
        <Link className={estilos.volver} href="/talleres">
          ← Volver a talleres
        </Link>
      </main>
    );
  }

  if (cargando) {
    return (
      <main>
        <p>Cargando taller…</p>
      </main>
    );
  }

  const porcentaje = Math.min(100, (ocupados / taller.cupo) * 100);

  return (
    <main>
      <Link className={estilos.volver} href="/talleres">
        ← Volver a talleres
      </Link>
      <h1>{taller.nombre}</h1>

      <section className={estilos.panel}>
        <p>
          <strong>Instructor:</strong> {taller.instructor || 'Por confirmar'}
        </p>
        <p>
          <strong>Fecha:</strong> {formatearFecha(taller.fecha)}
        </p>
        <div className={estilos.barra}>
          <div className={estilos.relleno} style={{ width: `${porcentaje}%` }} />
        </div>
        <p>
          {ocupados} de {taller.cupo} lugares ocupados ·{' '}
          {lleno ? (
            <span className={estilos.lleno}>Taller lleno</span>
          ) : (
            `${libres} ${libres === 1 ? 'lugar libre' : 'lugares libres'}`
          )}
        </p>
      </section>

      {/* Formulario de inscripción */}
      <section className={estilos.panel}>
        <h2>Inscribirme</h2>
        <form onSubmit={inscribir} className="formulario">
          <input
            placeholder="Nombre completo (solo letras)"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <input
            placeholder="Boleta (10 dígitos, no puros ceros)"
            value={boleta}
            onChange={(e) => setBoleta(e.target.value)}
          />
          <button type="submit" disabled={lleno || enviando}>
            {lleno
              ? 'Sin lugares'
              : enviando
              ? 'Inscribiendo…'
              : 'Inscribirme'}
          </button>
        </form>
        <p className={estilos.ayuda}>
          Reglas: la boleta debe tener 10 dígitos, no puede ser puros ceros y
          una boleta solo puede estar inscrita en un taller a la vez.
        </p>
        {errorForm && <p className="error">{errorForm}</p>}
        {exito && <p className={estilos.exito}>{exito}</p>}
      </section>

      <h2>Inscritos ({ocupados})</h2>
      {ocupados === 0 ? (
        <p>Todavía no hay inscritos. ¡Sé el primero!</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Boleta</th>
            </tr>
          </thead>
          <tbody>
            {asistencias.map((a, i) => (
              <tr key={a.id}>
                <td>{i + 1}</td>
                <td>{a.nombre_alumno}</td>
                <td>{ocultarBoleta(a.boleta)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
