import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
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

  const cargar = useCallback(async () => {
    if (!id) return;
    const cliente = supabase();
    const [detalle, listaNotas, listaHistorial] = await Promise.all([
      cliente.from('postulaciones').select('*').eq('id', id).single(),
      cliente.from('notas_postulacion').select('id,contenido,usuario_id,fecha_creacion').eq('postulacion_id', id).order('fecha_creacion', { ascending: false }),
      cliente.from('historial_postulacion').select('id,estado_anterior,estado_nuevo,usuario_id,fecha_creacion').eq('postulacion_id', id).order('fecha_creacion', { ascending: false }),
    ]);
    if (detalle.error || listaNotas.error || listaHistorial.error) {
      setError('No se pudo cargar el detalle o no tienes acceso.');
    } else {
      setPostulacion(detalle.data as Postulacion);
      setNotas((listaNotas.data ?? []) as Nota[]);
      setHistorial((listaHistorial.data ?? []) as Historial[]);
      setError('');
    }
    setCargando(false);
  }, [id]);
  useEffect(() => { void cargar(); }, [cargar]);

  async function cambiarEstado(nuevo: EstadoPostulacion) {
    if (!postulacion || nuevo === postulacion.estado) return;
    setGuardando(true);
    setError('');
    const { data, error } = await supabase().from('postulaciones')
      .update({ estado: nuevo }).eq('id', postulacion.id).eq('estado', postulacion.estado)
      .select('id').maybeSingle();
    const conflicto = Boolean(error || !data);
    await cargar();
    if (conflicto) setError('No se cambió el estado. La postulación pudo haber sido modificada por otro usuario.');
    setGuardando(false);
  }

  async function agregarNota(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!id || !nuevaNota.trim()) return;
    setGuardando(true);
    setError('');
    const { error } = await supabase().from('notas_postulacion')
      .insert({ postulacion_id: id, contenido: nuevaNota.trim() });
    if (error) setError('No se pudo guardar la nota.');
    else { setNuevaNota(''); await cargar(); }
    setGuardando(false);
  }

  return <section>
    <p><Link to="/postulaciones">← Volver a postulaciones</Link></p>
    {cargando && <p>Cargando...</p>}
    {error && <p className="alerta" role="alert">{error}</p>}
    {postulacion && <>
      <div className="titulo-detalle"><h1>{postulacion.nombre_estudiante}</h1><label>Estado
        <select value={postulacion.estado} disabled={guardando} onChange={(e) => { void cambiarEstado(e.target.value as EstadoPostulacion); }}>
          {estadosPostulacion.map((valor) => <option key={valor} value={valor}>{estado(valor)}</option>)}
        </select></label></div>
      <div className="panel datos">
        <dl>
          <div><dt>Edad</dt><dd>{postulacion.edad_estudiante}</dd></div>
          <div><dt>Grado</dt><dd>{grado(postulacion.grado)}</dd></div>
          <div><dt>Apoderado</dt><dd>{postulacion.nombre_apoderado}</dd></div>
          <div><dt>Teléfono</dt><dd>{postulacion.telefono_apoderado}</dd></div>
          <div><dt>Correo</dt><dd><a href={`mailto:${postulacion.correo_apoderado}`}>{postulacion.correo_apoderado}</a></dd></div>
          <div><dt>Medio preferido</dt><dd>{postulacion.medio_contacto}</dd></div>
          <div><dt>Idioma</dt><dd>{postulacion.idioma}</dd></div>
          <div><dt>Origen</dt><dd>{postulacion.origen}</dd></div>
          <div><dt>Creación</dt><dd>{fecha(postulacion.fecha_creacion)}</dd></div>
          <div><dt>Última actualización</dt><dd>{fecha(postulacion.fecha_actualizacion)}</dd></div>
        </dl>
      </div>
      <div className="dos-columnas">
        <div className="panel">
          <h2>Notas</h2>
          <form onSubmit={(e) => { void agregarNota(e); }}>
            <label>Nueva nota<textarea value={nuevaNota} maxLength={3000} required onChange={(e) => setNuevaNota(e.target.value)} /></label>
            <button disabled={guardando || !nuevaNota.trim()} type="submit">Guardar nota</button>
          </form>
          {notas.length === 0 ? <p>Sin notas.</p> : <ol className="registro">{notas.map((nota) => <li key={nota.id}>
            <p>{nota.contenido}</p><small>{fecha(nota.fecha_creacion)} · Usuario {nota.usuario_id.slice(0, 8)}</small>
          </li>)}</ol>}
        </div>
        <div className="panel">
          <h2>Historial de estado</h2>
          {historial.length === 0 ? <p>Sin cambios de estado.</p> : <ol className="registro">{historial.map((cambio) => <li key={cambio.id}>
            <p>{estado(cambio.estado_anterior)} → {estado(cambio.estado_nuevo)}</p>
            <small>{fecha(cambio.fecha_creacion)} · Usuario {cambio.usuario_id?.slice(0, 8) ?? 'eliminado'}</small>
          </li>)}</ol>}
        </div>
      </div>
    </>}
  </section>;
}
