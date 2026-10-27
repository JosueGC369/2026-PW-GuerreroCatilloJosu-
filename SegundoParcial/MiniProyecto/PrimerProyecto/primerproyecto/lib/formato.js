export function yaPaso(fecha) {
  if (!fecha) return false;
  const hoy = new Date();
  const fechaDate = new Date(fecha);
  return fechaDate.setHours(0, 0, 0, 0) < hoy.setHours(0, 0, 0, 0);
}

export function formatearFecha(fecha) {
  if (!fecha) return '';
  const date = new Date(fecha);
  const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  const dia = dias[date.getUTCDay()];
  const num = date.getUTCDate();
  const mes = meses[date.getUTCMonth()];
  const año = date.getUTCFullYear();
  return `${dia}, ${num} de ${mes} de ${año}`;
}

export function ocultarBoleta(boleta) {
  if (!boleta) return '';
  const visibles = boleta.slice(-4);
  const ocultos = '*'.repeat(Math.max(0, boleta.length - 4));
  return `${ocultos}${visibles}`;
}
