import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useRealtimeCRM } from '../Realtime';
import { grado } from '../types';

interface Dia { fecha: string; cantidad: number }
interface Datos {
  postulaciones: {
    hoy: number; ayer: number; diferencia: number; variacionPorcentual: number | null;
    pendientes: number; matriculadas: number; ultimos7Dias: Dia[];
    porNivel: { primaria: number; secundaria: number };
    porGrado: { grado: string; cantidad: number }[];
  };
  contactos: { nuevos: number; ultimos7Dias: Dia[] };
}

const fechaCorta = (valor: string) => new Intl.DateTimeFormat('es-PE', {
  day: 'numeric', month: 'short', timeZone: 'America/Lima',
}).format(new Date(`${valor}T12:00:00Z`));

export function Metricas() {
  const [datos, setDatos] = useState<Datos | null>(null);
  const [error, setError] = useState('');
  const { revision } = useRealtimeCRM();
  useEffect(() => {
    let activo = true;
    void api<{ metricas: Datos }>('/api/metricas')
      .then(({ metricas }) => { if (activo) { setDatos(metricas); setError(''); } })
      .catch(() => { if (activo) setError('No se pudieron cargar las métricas.'); });
    return () => { activo = false; };
  }, [revision]);

  if (error && !datos) return <section><h1>Métricas</h1><p className="alerta" role="alert">{error}</p></section>;
  if (!datos) return <section><p className="ceja">ANÁLISIS</p><h1>Métricas</h1><div className="panel esqueleto" /></section>;
  const p = datos.postulaciones;
  const maxDia = Math.max(1, ...p.ultimos7Dias.map((d) => d.cantidad));
  const maxGrado = Math.max(1, ...p.porGrado.map((g) => g.cantidad));
  const totalNivel = p.porNivel.primaria + p.porNivel.secundaria;
  const maxReal = Math.max(...p.porGrado.map((g) => g.cantidad));
  const minReal = Math.min(...p.porGrado.map((g) => g.cantidad));
  const mayores = p.porGrado.filter((g) => g.cantidad === maxReal).map((g) => grado(g.grado));
  const menores = p.porGrado.filter((g) => g.cantidad === minReal).map((g) => grado(g.grado));
  const variacion = p.variacionPorcentual === null
    ? `${p.diferencia >= 0 ? '+' : ''}${p.diferencia} respecto de ayer`
    : p.diferencia === 0 ? 'Sin cambio respecto de ayer'
      : `${p.diferencia > 0 ? '↑' : '↓'} ${Math.abs(p.variacionPorcentual)} % respecto de ayer`;

  return <section>
    <div className="encabezado-pagina"><div><p className="ceja">ANÁLISIS DE ADMISIONES</p><h1>Métricas</h1>
      <p className="subtitulo">Evolución de las postulaciones y distribución por grado.</p></div>
      <span className="etiqueta-suave">Horario de Lima</span></div>
    {error && <p className="alerta" role="alert">{error}</p>}
    <div className="metricas-resumen">
      <div className="panel metrica-destacada"><span className="metrica-titulo">Postulaciones de hoy</span>
        <strong>{p.hoy}</strong><span className={`variacion ${p.diferencia < 0 ? 'negativa' : ''}`}>{variacion}</span></div>
      <div className="panel metrica-secundaria"><span className="metrica-titulo">Ayer</span><strong>{p.ayer}</strong><small>postulaciones</small></div>
      <div className="panel metrica-secundaria"><span className="metrica-titulo">Pendientes</span><strong>{p.pendientes}</strong><small>en seguimiento</small></div>
      <div className="panel metrica-secundaria"><span className="metrica-titulo">Matriculadas</span><strong>{p.matriculadas}</strong><small>procesos completados</small></div>
    </div>
    <div className="metricas-dos-columnas">
      <div className="panel panel-grafico"><div className="panel-cabecera"><div><p className="ceja">TENDENCIA</p><h2>Últimos 7 días</h2></div>
        <span className="leyenda-grafico"><i /> Postulaciones</span></div>
        <div className="grafico-dias" role="img" aria-label={`Postulaciones por día: ${p.ultimos7Dias.map((d) => `${fechaCorta(d.fecha)}: ${d.cantidad}`).join(', ')}`}>
          {p.ultimos7Dias.map((dia) => <div className="dia-columna" key={dia.fecha} title={`${fechaCorta(dia.fecha)}: ${dia.cantidad} postulaciones`}>
            <span className="dia-numero">{dia.cantidad}</span><div className="dia-pista"><span style={{ height: `${Math.max(3, dia.cantidad / maxDia * 100)}%` }} /></div>
            <span className="dia-fecha">{fechaCorta(dia.fecha)}</span></div>)}</div>
      </div>
      <div className="panel panel-niveles"><div className="panel-cabecera"><div><p className="ceja">DISTRIBUCIÓN</p><h2>Por nivel</h2></div></div>
        <div className="nivel-fila"><span>Primaria</span><strong>{p.porNivel.primaria}</strong></div>
        <div className="nivel-pista"><span style={{ width: `${totalNivel ? p.porNivel.primaria / totalNivel * 100 : 0}%` }} /></div>
        <div className="nivel-fila"><span>Secundaria</span><strong>{p.porNivel.secundaria}</strong></div>
        <div className="nivel-pista secundario"><span style={{ width: `${totalNivel ? p.porNivel.secundaria / totalNivel * 100 : 0}%` }} /></div>
        <p className="nivel-total">{totalNivel} postulaciones en total</p>
      </div>
    </div>
    <div className="panel grados-panel"><div className="panel-cabecera"><div><p className="ceja">DETALLE</p><h2>Postulaciones por grado</h2></div>
      <span className="etiqueta-suave">11 grados</span></div>
      <div className="grados-lista">{p.porGrado.map((g) => <div className="grado-fila" key={g.grado} title={`${grado(g.grado)}: ${g.cantidad} ${g.cantidad === 1 ? 'postulación' : 'postulaciones'}`}>
        <span>{grado(g.grado)}</span><div className="grado-pista"><span style={{ width: `${g.cantidad / maxGrado * 100}%` }} /></div><strong>{g.cantidad}</strong>
      </div>)}</div>
      <div className="grados-extremos"><div><span>Mayor número de postulaciones</span><strong>{mayores.join(', ')}</strong></div>
        <div><span>Menor número de postulaciones</span><strong>{menores.join(', ')}</strong></div></div>
    </div>
    <div className="contactos-resumen"><div><p className="ceja">CONTACTOS WEB</p><strong>{datos.contactos.nuevos} nuevos</strong>
      <span>Consultas pendientes de atención</span></div><div><strong>{datos.contactos.ultimos7Dias.reduce((s, d) => s + d.cantidad, 0)}</strong>
        <span>Contactos recibidos en los últimos 7 días</span></div></div>
  </section>;
}
