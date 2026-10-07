import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { api } from './lib/api';
import { Icono } from './Icono';
import { RealtimeProvider, useRealtimeCRM } from './Realtime';

interface Usuario { email: string; nombre: string; rol: 'admin' | 'usuario' }
const Contexto = createContext<Usuario | null>(null);
export function useUsuario() { return useContext(Contexto); }

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    let activo = true;
    void api<{ usuario: Usuario }>('/api/yo')
      .then(({ usuario }) => { if (activo) setUsuario(usuario); })
      .catch(() => { if (activo) setError(true); })
      .finally(() => { if (activo) setCargando(false); });
    return () => { activo = false; };
  }, []);
  if (cargando) return <main className="centrado">Verificando acceso...</main>;
  if (error || !usuario) return <main className="centrado">
    <h1>Acceso no autorizado</h1>
    <p>Tu cuenta de Cloudflare Access no tiene un perfil CRM activo.</p>
    <a href="/cdn-cgi/access/logout">Cerrar sesión de Access</a>
  </main>;
  return <Contexto.Provider value={usuario}>{children}</Contexto.Provider>;
}

export function Privado() {
  return <RealtimeProvider><MarcoCRM /></RealtimeProvider>;
}

function MarcoCRM() {
  const usuario = useUsuario();
  const { conexion } = useRealtimeCRM();
  const enlaces = [
    { a: '/', nombre: 'Inicio', icono: 'inicio' },
    { a: '/postulaciones', nombre: 'Postulaciones', icono: 'postulaciones' },
    { a: '/contactos', nombre: 'Contactos', icono: 'contactos' },
    { a: '/metricas', nombre: 'Métricas', icono: 'metricas' },
  ] as const;
  return <div className="aplicacion">
    <aside className="lateral">
      <Link className="marca" to="/"><span className="marca-icono">B</span><span><strong>Boston</strong><small>Bilingual School</small></span></Link>
      <div className="lateral-etiqueta">ESPACIO DE TRABAJO</div>
      <nav aria-label="Principal">{enlaces.map((enlace) =>
        <NavLink key={enlace.a} end={enlace.a === '/'} to={enlace.a}>
          <Icono nombre={enlace.icono} /><span>{enlace.nombre}</span>
        </NavLink>)}</nav>
      <div className="lateral-pie"><span className={`punto-conexion ${conexion === 'en-vivo' ? 'activo' : ''}`} />
        {conexion === 'en-vivo' ? 'Actualización en vivo' : 'Reconectando…'}</div>
    </aside>
    <div className="area-principal">
      <header className="barra"><span className="barra-titulo">Admisiones <span>/ CRM</span></span>
        <div className="usuario"><span className="avatar">{usuario?.nombre?.charAt(0).toUpperCase()}</span>
          <span className="usuario-nombre">{usuario?.nombre}</span><a href="/cdn-cgi/access/logout">Salir</a></div></header>
      <main className="contenido"><Outlet /></main>
    </div>
  </div>;
}
