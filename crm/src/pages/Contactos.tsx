import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useRealtimeCRM } from '../Realtime';
import { estado, estadosContacto, fecha, type Contacto, type EstadoContacto } from '../types';

export function Contactos() {
  const [registros, setRegistros] = useState<Contacto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState<number | null>(null);
  const { revision } = useRealtimeCRM();

  const cargar = useCallback(async () => {
    try {
      const { contactos } = await api<{ contactos: Contacto[] }>('/api/contactos');
      setRegistros(contactos);
      setError('');
    } catch { setError('No se pudieron cargar los contactos.'); }
    setCargando(false);
  }, []);
  useEffect(() => { void cargar(); }, [cargar, revision]);

  async function cambiar(contacto: Contacto, nuevo: EstadoContacto) {
    if (nuevo === contacto.estado) return;
    setGuardando(contacto.id);
    setError('');
    try {
      await api(`/api/contactos/${contacto.id}/estado`, {
        method: 'PATCH', body: JSON.stringify({ estadoAnterior: contacto.estado, estado: nuevo }),
      });
      await cargar();
    } catch {
      await cargar();
      setError('No se guardó el estado. Otro usuario pudo haberlo cambiado; se recargó la lista.');
    }
    setGuardando(null);
  }

  return <section>
    <div className="encabezado-pagina"><div><p className="ceja">CONSULTAS</p><h1>Contactos</h1>
      <p className="subtitulo">Personas que solicitaron información al colegio.</p></div>
      <span className="contador-cabecera">{registros.length} {registros.length === 1 ? 'contacto' : 'contactos'}</span></div>
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
    </table>{registros.length === 0 && <div className="estado-vacio"><strong>Todavía no hay consultas.</strong><p>Los mensajes nuevos aparecerán aquí.</p></div>}</div>}
    <p className="ayuda">Se muestran los 500 contactos más recientes.</p>
  </section>;
}
