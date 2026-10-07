import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

interface Totales { nuevas: number; pendientes: number; matriculadas: number; contactos: number }

export function Dashboard() {
  const [totales, setTotales] = useState<Totales | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;
    async function cargar() {
      try {
        const { resumen } = await api<{ resumen: Totales }>('/api/resumen');
        if (activo) setTotales(resumen);
      } catch { if (activo) setError('No se pudieron cargar los indicadores.'); }
    }
    void cargar();
    return () => { activo = false; };
  }, []);

  return <section>
    <h1>Resumen</h1>
    {error && <p className="alerta" role="alert">{error}</p>}
    {!totales && !error && <p>Cargando indicadores...</p>}
    {totales && <div className="tarjetas">
      <Link to="/postulaciones" className="tarjeta"><strong>{totales.nuevas}</strong><span>Postulaciones nuevas</span></Link>
      <Link to="/postulaciones" className="tarjeta"><strong>{totales.pendientes}</strong><span>Postulaciones pendientes</span></Link>
      <Link to="/postulaciones" className="tarjeta"><strong>{totales.matriculadas}</strong><span>Matriculadas</span></Link>
      <Link to="/contactos" className="tarjeta"><strong>{totales.contactos}</strong><span>Contactos nuevos</span></Link>
    </div>}
  </section>;
}
