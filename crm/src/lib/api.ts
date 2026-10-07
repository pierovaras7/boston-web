export async function api<T>(ruta: string, opciones?: RequestInit): Promise<T> {
  const respuesta = await fetch(ruta, {
    ...opciones,
    credentials: 'same-origin',
    headers: {
      ...(opciones?.body ? { 'Content-Type': 'application/json' } : {}),
      ...opciones?.headers,
    },
  });
  if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
  return respuesta.json() as Promise<T>;
}
