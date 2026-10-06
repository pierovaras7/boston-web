import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface Totales { nuevas: number; pendientes: number; matriculadas: number; contactos: number }

export function Dashboard() {
  const [totales, setTotales] = useState<Totales | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;
    const cliente = supabase();
    async function cargar() {
      const consultas = await Promise.all([
        cliente.from('postulaciones').select('*', { count: 'exact', head: true }).eq('estado', 'nuevo'),
        cliente.from('postulaciones').select('*', { count: 'exact', head: true }).in('estado', ['contactado', 'entrevista', 'evaluacion', 'documentos_pendientes', 'aprobado']),
        cliente.from('postulaciones').select('*', { count: 'exact', head: true }).eq('estado', 'matriculado'),
        cliente.from('contactos_web').select('*', { count: 'exact', head: true }).eq('estado', 'nuevo'),
      ]);
      if (!activo) return;
      if (consultas.some((consulta) => consulta.error)) {
        setError('No se pudieron cargar los indicadores.');
      } else {
        setTotales({ nuevas: consultas[0].count ?? 0, pendientes: consultas[1].count ?? 0,
          matriculadas: consultas[2].count ?? 0, contactos: consultas[3].count ?? 0 });
      }
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
