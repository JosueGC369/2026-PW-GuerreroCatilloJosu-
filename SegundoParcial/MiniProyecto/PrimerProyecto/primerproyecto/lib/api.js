export const API_URL = '';
export const BACKEND_CAIDO = 'El backend no responde…';

export async function pedirJSON(ruta, opciones = {}) {
  let res;
  try {
    res = await fetch(`${API_URL}/api${ruta}`, {
      ...opciones,
      headers: {
        'Content-Type': 'application/json',
        ...(opciones.headers || {})
      }
    });
  } catch (e) {
    throw new Error(BACKEND_CAIDO);
  }

  let datos = null;
  try {
    datos = await res.json();
  } catch (e) {
    datos = null;
  }

  if (!res.ok) {
    if (datos && datos.error) {
      throw new Error(datos.error);
    }
    throw new Error(res.status === 500 ? BACKEND_CAIDO : `El backend respondió ${res.status}`);
  }

  return datos;
}
