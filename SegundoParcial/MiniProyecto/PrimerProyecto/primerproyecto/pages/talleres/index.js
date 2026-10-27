import { useEffect, useState } from 'react';
import Link from 'next/link';
import { pedirJSON } from '../../lib/api';
import TarjetaTaller from '../../components/TarjetaTaller';
import estilos from '../../styles/Talleres.module.css';

export default function TalleresPage() {
  const [talleres, setTalleres] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarTalleres();
  }, []);

  async function cargarTalleres() {
    try {
      const datos = await pedirJSON('/talleres');
      setTalleres(datos);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  const texto = busqueda.trim().toLowerCase();
  const visibles = talleres.filter((t) =>
    `${t.nombre} ${t.instructor || ''}`.toLowerCase().includes(texto)
  );

  return (
    <main>
      <h1>Talleres</h1>
      <input
        type="text"
        placeholder="Buscar por nombre o instructor"
        className={estilos.buscador}
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />
      {cargando && <p>Cargando talleres…</p>}
      {error && <p className="error">{error}</p>}
      {!cargando && !error && talleres.length === 0 && (
        <p>No hay talleres registrados.</p>
      )}
      {!cargando && !error && talleres.length > 0 && visibles.length === 0 && (
        <p>No hay talleres que coincidan con la búsqueda.</p>
      )}
      {!cargando && !error && visibles.length > 0 && (
        <div className={estilos.rejilla}>
          {visibles.map((t) => (
            <TarjetaTaller key={t.id} taller={t} />
          ))}
        </div>
      )}
    </main>
  );
}
