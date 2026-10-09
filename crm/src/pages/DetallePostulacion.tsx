import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Icono } from '../Icono';
import { useRealtimeCRM } from '../Realtime';
import { estado, estadosPostulacion, fecha, grado, type EstadoPostulacion, type Historial, type Nota, type Postulacion } from '../types';

export function DetallePostulacion() {
  const { id } = useParams<{ id: string }>();
  const [postulacion, setPostulacion] = useState<Postulacion | null>(null);
  const [notas, setNotas] = useState<Nota[]>([]);
  const [historial, setHistorial] = useState<Historial[]>([]);
  const [nuevaNota, setNuevaNota] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const { revision } = useRealtimeCRM();

  const cargar = useCallback(async () => {
    if (!id) return;
    try {
      const datos = await api<{ postulacion: Postulacion; notas: Nota[]; historial: Historial[] }>(`/api/postulaciones/${id}`);
      setPostulacion(datos.postulacion);
      setNotas(datos.notas);
      setHistorial(datos.historial);
      setError('');
    } catch {
      setError('No se pudo cargar el detalle o no tienes acceso.');
    }
    setCargando(false);
  }, [id]);
  useEffect(() => { void cargar(); }, [cargar, revision]);

  async function cambiarEstado(nuevo: EstadoPostulacion) {
    if (!postulacion || nuevo === postulacion.estado) return;
    setGuardando(true);
    setError('');
    try {
      await api(`/api/postulaciones/${postulacion.id}/estado`, {
        method: 'PATCH', body: JSON.stringify({ estadoAnterior: postulacion.estado, estado: nuevo }),
      });
      await cargar();
    } catch {
      await cargar();
      setError('No se cambió el estado. La postulación pudo haber sido modificada por otro usuario.');
    }
    setGuardando(false);
  }

  async function agregarNota(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!id || !nuevaNota.trim()) return;
    setGuardando(true);
    setError('');
    try {
      await api(`/api/postulaciones/${id}/notas`, {
        method: 'POST', body: JSON.stringify({ contenido: nuevaNota.trim() }),
      });
      setNuevaNota('');
      await cargar();
    } catch { setError('No se pudo guardar la nota.'); }
    setGuardando(false);
  }

  return <section>
    <p><Link className="volver" to="/postulaciones"><Icono nombre="volver" /> Volver a postulaciones</Link></p>
    {cargando && <p className="panel estado-carga" role="status">Cargando postulación…</p>}
    {error && <p className="alerta" role="alert">{error}</p>}
    {postulacion && <>
      <div className="titulo-detalle"><div><p className="ceja">FICHA DE POSTULACIÓN · #{postulacion.id}</p><h1>{postulacion.nombre_estudiante}</h1><span className={`badge badge-${postulacion.estado}`}>{estado(postulacion.estado)}</span></div><label>Estado actual
        <select value={postulacion.estado} disabled={guardando} onChange={(e) => { void cambiarEstado(e.target.value as EstadoPostulacion); }}>
          {estadosPostulacion.map((valor) => <option key={valor} value={valor}>{estado(valor)}</option>)}
        </select></label></div>
      <div className="detalle-resumen">
        <section className="panel datos"><h2>Estudiante</h2><dl>
          <div><dt>Edad</dt><dd>{postulacion.edad_estudiante}</dd></div>
          <div><dt>Grado</dt><dd>{grado(postulacion.grado)}</dd></div>
          <div><dt>Idioma</dt><dd>{postulacion.idioma}</dd></div>
          <div><dt>Origen</dt><dd>{postulacion.origen}</dd></div>
        </dl></section>
        <section className="panel datos"><h2>Apoderado y contacto</h2><dl>
          <div><dt>Apoderado</dt><dd>{postulacion.nombre_apoderado}</dd></div>
          <div><dt>Teléfono</dt><dd>{postulacion.telefono_apoderado}</dd></div>
          <div><dt>Correo</dt><dd><a href={`mailto:${postulacion.correo_apoderado}`}>{postulacion.correo_apoderado}</a></dd></div>
          <div><dt>Medio preferido</dt><dd>{postulacion.medio_contacto}</dd></div>
        </dl></section>
        <section className="panel datos detalle-fechas"><h2>Seguimiento</h2><dl>
          <div><dt>Creación</dt><dd>{fecha(postulacion.fecha_creacion)}</dd></div>
          <div><dt>Última actualización</dt><dd>{fecha(postulacion.fecha_actualizacion)}</dd></div>
        </dl></section>
      </div>
      <div className="dos-columnas">
        <div className="panel">
          <h2>Notas</h2>
          <form onSubmit={(e) => { void agregarNota(e); }}>
            <label>Nueva nota<textarea value={nuevaNota} maxLength={3000} required onChange={(e) => setNuevaNota(e.target.value)} /></label>
            <button disabled={guardando || !nuevaNota.trim()} type="submit">Guardar nota</button>
          </form>
          {notas.length === 0 ? <p>Sin notas.</p> : <ol className="registro">{notas.map((nota) => <li key={nota.id}>
            <p>{nota.contenido}</p><small>{fecha(nota.fecha_creacion)} · {nota.usuario_email}</small>
          </li>)}</ol>}
        </div>
        <div className="panel">
          <h2>Historial de estado</h2>
          {historial.length === 0 ? <p>Sin cambios de estado.</p> : <ol className="registro">{historial.map((cambio) => <li key={cambio.id}>
            <p>{cambio.estado_anterior ? estado(cambio.estado_anterior) : '—'} → {estado(cambio.estado_nuevo)}</p>
            <small>{fecha(cambio.fecha_creacion)} · {cambio.usuario_email}</small>
          </li>)}</ol>}
        </div>
      </div>
    </>}
  </section>;
}
