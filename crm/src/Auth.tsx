import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { api } from './lib/api';

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
  const usuario = useUsuario();
  return <div className="aplicacion">
    <header className="barra">
      <Link className="marca" to="/">Boston CRM</Link>
      <nav aria-label="Principal">
        <Link to="/">Inicio</Link>
        <Link to="/postulaciones">Postulaciones</Link>
        <Link to="/contactos">Contactos</Link>
      </nav>
      <div className="usuario"><span>{usuario?.nombre}</span><a href="/cdn-cgi/access/logout">Salir</a></div>
    </header>
    <main className="contenido"><Outlet /></main>
  </div>;
}
