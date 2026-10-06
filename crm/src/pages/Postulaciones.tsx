import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { estado, estadosPostulacion, fecha, grado, type Postulacion } from '../types';

export function Postulaciones() {
  const [registros, setRegistros] = useState<Postulacion[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;
    async function cargar() {
      const { data, error } = await supabase().from('postulaciones').select('*')
        .order('fecha_creacion', { ascending: false }).limit(500);
      if (!activo) return;
      if (error) setError('No se pudieron cargar las postulaciones.');
      else setRegistros((data ?? []) as Postulacion[]);
      setCargando(false);
    }
    void cargar();
    return () => { activo = false; };
  }, []);

  const visibles = useMemo(() => registros.filter((p) => {
    const coincideEstado = filtro === 'todos' || p.estado === filtro;
    const texto = `${p.nombre_estudiante} ${p.nombre_apoderado} ${p.telefono_apoderado} ${p.correo_apoderado}`.toLocaleLowerCase('es');
    return coincideEstado && texto.includes(busqueda.trim().toLocaleLowerCase('es'));
  }), [registros, busqueda, filtro]);

  return <section>
    <h1>Postulaciones</h1>
    <div className="controles">
      <label>Buscar estudiante, apoderado, teléfono o correo<input type="search" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} /></label>
      <label>Estado<select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
        <option value="todos">Todos</option>
        {estadosPostulacion.map((valor) => <option key={valor} value={valor}>{estado(valor)}</option>)}
      </select></label>
    </div>
    {error && <p className="alerta" role="alert">{error}</p>}
    {cargando ? <p>Cargando...</p> : <div className="tabla-scroll"><table>
      <thead><tr><th>Estudiante</th><th>Grado</th><th>Apoderado</th><th>Teléfono</th><th>Fecha</th><th>Estado</th></tr></thead>
      <tbody>{visibles.map((p) => <tr key={p.id}>
        <td><Link to={`/postulaciones/${p.id}`}>{p.nombre_estudiante}</Link></td>
        <td>{grado(p.grado)}</td><td>{p.nombre_apoderado}</td><td>{p.telefono_apoderado}</td>
        <td>{fecha(p.fecha_creacion)}</td><td><span className="estado">{estado(p.estado)}</span></td>
      </tr>)}</tbody>
    </table>{visibles.length === 0 && <p className="vacio">Sin resultados.</p>}</div>}
    <p className="ayuda">Se muestran las 500 postulaciones más recientes.</p>
  </section>;
}
