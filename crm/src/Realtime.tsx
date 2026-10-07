import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type EstadoConexion = 'conectando' | 'en-vivo' | 'reconectando';
type Evento = { tipo: string; id: number; fecha: string };
const Contexto = createContext<{ revision: number; conexion: EstadoConexion; evento: Evento | null }>({
  revision: 0, conexion: 'conectando', evento: null,
});
export const useRealtimeCRM = () => useContext(Contexto);

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const [revision, setRevision] = useState(0);
  const [conexion, setConexion] = useState<EstadoConexion>('conectando');
  const [evento, setEvento] = useState<Evento | null>(null);

  useEffect(() => {
    let cerrado = false;
    let reintentos = 0;
    let temporizador: ReturnType<typeof setTimeout> | undefined;
    let socket: WebSocket | undefined;
    const revalidar = () => setRevision((actual) => actual + 1);
    const visible = () => { if (document.visibilityState === 'visible') revalidar(); };
    document.addEventListener('visibilitychange', visible);
    window.addEventListener('focus', revalidar);

    function conectar() {
      if (cerrado) return;
      const protocolo = location.protocol === 'https:' ? 'wss:' : 'ws:';
      socket = new WebSocket(`${protocolo}//${location.host}/api/realtime`);
      socket.onopen = () => {
        if (cerrado) return;
        reintentos = 0;
        setConexion('en-vivo');
        revalidar(); // Refetch any writes missed while disconnected.
      };
      socket.onmessage = (mensaje) => {
        try {
          const recibido = JSON.parse(String(mensaje.data)) as Evento;
          if (typeof recibido.tipo !== 'string' || !Number.isSafeInteger(recibido.id)) return;
          setEvento(recibido);
          revalidar();
        } catch { /* Ignore malformed messages. */ }
      };
      socket.onclose = () => {
        if (cerrado) return;
        setConexion('reconectando');
        const espera = Math.min(30_000, 1000 * 2 ** reintentos) + Math.random() * 500;
        reintentos = Math.min(reintentos + 1, 5);
        temporizador = setTimeout(conectar, espera);
      };
      socket.onerror = () => socket?.close();
    }
    conectar();
    return () => {
      cerrado = true;
      if (temporizador) clearTimeout(temporizador);
      socket?.close();
      document.removeEventListener('visibilitychange', visible);
      window.removeEventListener('focus', revalidar);
    };
  }, []);

  return <Contexto.Provider value={{ revision, conexion, evento }}>{children}</Contexto.Provider>;
}
