import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { estado, estadosContacto, fecha, type Contacto, type EstadoContacto } from '../types';

export function Contactos() {
  const [registros, setRegistros] = useState<Contacto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    const { data, error } = await supabase().from('contactos_web').select('*')
      .order('fecha_creacion', { ascending: false }).limit(500);
    if (error) setError('No se pudieron cargar los contactos.');
    else { setRegistros((data ?? []) as Contacto[]); setError(''); }
    setCargando(false);
  }, []);
  useEffect(() => { void cargar(); }, [cargar]);

  async function cambiar(contacto: Contacto, nuevo: EstadoContacto) {
    if (nuevo === contacto.estado) return;
    setGuardando(contacto.id);
    setError('');
    const { data, error } = await supabase().from('contactos_web')
      .update({ estado: nuevo }).eq('id', contacto.id).eq('estado', contacto.estado).select('id').maybeSingle();
    const conflicto = Boolean(error || !data);
    await cargar();
    if (conflicto) setError('No se guardó el estado. Otro usuario pudo haberlo cambiado; se recargó la lista.');
    setGuardando(null);
  }

  return <section>
    <h1>Contactos web</h1>
    {error && <p className="alerta" role="alert">{error}</p>}
    {cargando ? <p>Cargando...</p> : <div className="tabla-scroll"><table>
      <thead><tr><th>Nombre</th><th>Correo</th><th>Teléfono</th><th>Asunto y mensaje</th><th>Fecha</th><th>Estado</th></tr></thead>
      <tbody>{registros.map((c) => <tr key={c.id}>
        <td>{c.nombre}</td><td><a href={`mailto:${c.correo}`}>{c.correo}</a></td><td>{c.telefono || '—'}</td>
        <td><strong>{c.asunto}</strong><details><summary>Ver mensaje</summary><p>{c.mensaje}</p></details></td>
        <td>{fecha(c.fecha_creacion)}</td><td><select aria-label={`Estado de ${c.nombre}`} disabled={guardando === c.id}
          value={c.estado} onChange={(e) => { void cambiar(c, e.target.value as EstadoContacto); }}>
          {estadosContacto.map((valor) => <option key={valor} value={valor}>{estado(valor)}</option>)}
        </select></td>
      </tr>)}</tbody>
    </table>{registros.length === 0 && <p className="vacio">Todavía no hay consultas.</p>}</div>}
    <p className="ayuda">Se muestran los 500 contactos más recientes.</p>
  </section>;
}
