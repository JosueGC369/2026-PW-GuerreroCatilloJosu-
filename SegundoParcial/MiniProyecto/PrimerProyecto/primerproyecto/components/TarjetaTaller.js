import Link from 'next/link';
import { yaPaso, formatearFecha } from '../lib/formato';
import estilos from './TarjetaTaller.module.css';

export default function TarjetaTaller({ taller }) {
  const pasado = yaPaso(taller.fecha);

  return (
    <article className={estilos.tarjeta}>
      <span className={pasado ? estilos.etiquetaPasado : estilos.etiqueta}>
        {pasado ? 'Ya pasó' : 'Próximo'}
      </span>
      <h3 className={estilos.titulo}>{taller.nombre}</h3>
      <p className={estilos.dato}>
        <strong>Instructor:</strong> {taller.instructor || 'Por confirmar'}
      </p>
      <p className={estilos.dato}>
        <strong>Fecha:</strong> {formatearFecha(taller.fecha)}
      </p>
      <p className={estilos.dato}>
        <strong>Cupo:</strong> {taller.cupo} lugares
      </p>
      <Link className={estilos.enlace} href={`/talleres/${taller.id}`}>Ver detalle e inscribirme →</Link>
    </article>
  );
}
