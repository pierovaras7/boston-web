import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Icono } from '../Icono';
import { useRealtimeCRM } from '../Realtime';

interface Totales { nuevas: number; pendientes: number; matriculadas: number; contactos: number }

export function Dashboard() {
  const [totales, setTotales] = useState<Totales | null>(null);
  const [error, setError] = useState('');
  const { revision } = useRealtimeCRM();
  useEffect(() => {
    let activo = true;
    void api<{ resumen: Totales }>('/api/resumen')
      .then(({ resumen }) => { if (activo) { setTotales(resumen); setError(''); } })
      .catch(() => { if (activo) setError('No se pudieron cargar los indicadores.'); });
    return () => { activo = false; };
  }, [revision]);

  const tarjetas = totales && [
    { numero: totales.nuevas, titulo: 'Postulaciones nuevas', detalle: 'Por revisar', destino: '/postulaciones?estado=nuevo', tono: 'azul' },
    { numero: totales.pendientes, titulo: 'Postulaciones pendientes', detalle: 'En seguimiento', destino: '/postulaciones', tono: 'naranja' },
    { numero: totales.matriculadas, titulo: 'Matriculadas', detalle: 'Procesos completados', destino: '/postulaciones?estado=matriculado', tono: 'verde' },
    { numero: totales.contactos, titulo: 'Contactos nuevos', detalle: 'Consultas por atender', destino: '/contactos', tono: 'violeta' },
  ];
  return <section>
    <div className="encabezado-pagina"><div><p className="ceja">PANEL GENERAL</p><h1>Inicio</h1>
      <p className="subtitulo">Lo importante para tu jornada de admisiones, en un vistazo.</p></div>
      <span className="etiqueta-suave">Boston Bilingual School</span></div>
    {error && <p className="alerta" role="alert">{error}</p>}
    {!totales && !error && <div className="tarjetas">{[0, 1, 2, 3].map((n) => <div className="tarjeta esqueleto" key={n} />)}</div>}
    {tarjetas && <div className="tarjetas">{tarjetas.map((tarjeta) =>
      <Link to={tarjeta.destino} className={`tarjeta tarjeta-${tarjeta.tono}`} key={tarjeta.titulo}>
        <span className="tarjeta-superior"><span className="tarjeta-etiqueta">{tarjeta.titulo}</span><Icono nombre="flecha" /></span>
        <strong>{tarjeta.numero}</strong><span className="tarjeta-detalle">{tarjeta.detalle}</span>
      </Link>)}</div>}
    <div className="inicio-inferior"><div><p className="ceja">ACCESO RÁPIDO</p><h2>Continúa con tu trabajo</h2>
      <p>Revisa solicitudes, responde consultas o consulta la evolución de admisiones.</p></div>
      <div className="acciones-rapidas"><Link to="/postulaciones">Ver postulaciones <Icono nombre="flecha" /></Link>
        <Link to="/contactos">Ver contactos <Icono nombre="flecha" /></Link>
        <Link to="/metricas">Explorar métricas <Icono nombre="flecha" /></Link></div></div>
  </section>;
}
