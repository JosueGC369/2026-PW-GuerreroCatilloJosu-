export function validarBoleta(boleta) {
  return /^[0-9]{10}$/.test(boleta);
}
