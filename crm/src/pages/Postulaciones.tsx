import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Icono } from '../Icono';
import { useRealtimeCRM } from '../Realtime';
import { estado, estadosPostulacion, fecha, grado, grados, type Postulacion } from '../types';

export function Postulaciones() {
  const [parametros, setParametros] = useSearchParams();
  const parametrosActuales = useRef(new URLSearchParams(parametros));
  const buscar = parametros.get('buscar') ?? '';
  const filtroEstado = parametros.get('estado') ?? '';
  const filtroGrado = parametros.get('grado') ?? '';
  const desde = parametros.get('desde') ?? '';
  const hasta = parametros.get('hasta') ?? '';
  const [registros, setRegistros] = useState<Postulacion[]>([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const { revision } = useRealtimeCRM();
  const activos = [buscar, filtroEstado, filtroGrado, desde, hasta].filter(Boolean).length;
  function cambiar(clave: string, valor: string) {
    const copia = new URLSearchParams(parametrosActuales.current);
    if (valor) copia.set(clave, valor); else copia.delete(clave);
    parametrosActuales.current = copia;
    setParametros(copia, { replace: true });
  }

  useEffect(() => {
    const controlador = new AbortController();
    setCargando(true);
    const temporizador = setTimeout(() => {
      void api<{ postulaciones: Postulacion[]; total: number }>(`/api/postulaciones?${parametros.toString()}`,
        { signal: controlador.signal })
        .then((datos) => { setRegistros(datos.postulaciones); setTotal(datos.total); setError(''); })
        .catch(() => { if (!controlador.signal.aborted) setError('No se pudieron cargar las postulaciones.'); })
        .finally(() => { if (!controlador.signal.aborted) setCargando(false); });
    }, buscar ? 280 : 0);
    return () => { clearTimeout(temporizador); controlador.abort(); };
  }, [parametros, revision, buscar]);

  return <section>
    <div className="encabezado-pagina"><div><p className="ceja">ADMISIONES</p><h1>Postulaciones</h1>
      <p className="subtitulo">Organiza y da seguimiento a cada solicitud.</p></div>
      <span className="contador-cabecera">{total} {total === 1 ? 'postulación' : 'postulaciones'}</span></div>
    <div className="panel filtros"><div className="filtros-principales">
      <label className="campo-busqueda"><span>Buscar</span><span className="entrada-con-icono"><Icono nombre="buscar" />
        <input type="search" placeholder="Buscar por estudiante, apoderado o teléfono…" value={buscar}
          onChange={(e) => cambiar('buscar', e.target.value)} /></span></label>
      <label><span>Estado</span><select value={filtroEstado} onChange={(e) => cambiar('estado', e.target.value)}>
        <option value="">Todos los estados</option>{estadosPostulacion.map((valor) =>
          <option key={valor} value={valor}>{estado(valor)}</option>)}</select></label>
      <label><span>Grado</span><select value={filtroGrado} onChange={(e) => cambiar('grado', e.target.value)}>
        <option value="">Todos los grados</option>{grados.map((valor) =>
          <option key={valor} value={valor}>{grado(valor)}</option>)}</select></label>
    </div><div className="filtros-fechas"><label><span>Desde</span><input type="date" value={desde}
      max={hasta || undefined} onChange={(e) => cambiar('desde', e.target.value)} /></label>
      <label><span>Hasta</span><input type="date" value={hasta} min={desde || undefined}
        onChange={(e) => cambiar('hasta', e.target.value)} /></label>
      <div className="filtro-acciones">{activos > 0 && <span className="filtros-activos">{activos} {activos === 1 ? 'filtro activo' : 'filtros activos'}</span>}
        <button type="button" className="boton-texto" disabled={!activos} onClick={() => {
          parametrosActuales.current = new URLSearchParams(); setParametros({});
        }}>Limpiar filtros</button></div>
    </div></div>
    {error && <p className="alerta" role="alert">{error}</p>}
    <div className="tabla-scroll"><table className="tabla-movil"><thead><tr><th>Estudiante</th><th>Grado</th><th>Apoderado</th><th>Teléfono</th><th>Ingreso</th><th>Estado</th><th><span className="sr-only">Detalle</span></th></tr></thead>
      <tbody>{!cargando && registros.map((p) => <tr key={p.id}>
        <td data-label="Estudiante"><Link className="enlace-fuerte" to={`/postulaciones/${p.id}`}>{p.nombre_estudiante}</Link></td>
        <td data-label="Grado">{grado(p.grado)}</td><td data-label="Apoderado">{p.nombre_apoderado}</td><td data-label="Teléfono">{p.telefono_apoderado}</td>
        <td data-label="Ingreso" className="fecha-tabla">{fecha(p.fecha_creacion)}</td>
        <td data-label="Estado"><span className={`badge badge-${p.estado}`}>{estado(p.estado)}</span></td>
        <td className="celda-accion"><Link className="abrir-fila" to={`/postulaciones/${p.id}`} aria-label={`Abrir postulación de ${p.nombre_estudiante}`}><Icono nombre="flecha" /></Link></td>
      </tr>)}</tbody></table>
      {cargando && <p className="vacio" role="status">Cargando postulaciones…</p>}
      {!cargando && !registros.length && <div className="estado-vacio"><Icono nombre="postulaciones" /><strong>No hay postulaciones para mostrar</strong><p>{activos ? 'Prueba con otros filtros.' : 'Las nuevas solicitudes aparecerán aquí.'}</p></div>}
    </div><p className="ayuda">{total > 500 ? 'Se muestran las 500 más recientes de la selección.' : 'Fechas según la hora de Lima.'}</p>
  </section>;
}
