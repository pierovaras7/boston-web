import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Link, Navigate, Outlet } from 'react-router-dom';
import { supabase } from './lib/supabase';

interface Perfil { id: string; nombre: string; rol: 'admin' | 'usuario' }
interface EstadoAuth {
  perfil: Perfil | null;
  cargando: boolean;
  mensaje: string;
  salir: () => Promise<void>;
}
const Contexto = createContext<EstadoAuth | null>(null);

export function useAuth() {
  const valor = useContext(Contexto);
  if (!valor) throw new Error('Contexto de autenticación no disponible');
  return valor;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    let montado = true;
    const cliente = supabase();
    async function verificar() {
      if (!montado) return;
      setCargando(true);
      const { data: { user }, error } = await cliente.auth.getUser();
      if (!montado) return;
      if (error || !user) {
        setPerfil(null);
        setCargando(false);
        return;
      }
      const { data, error: errorPerfil } = await cliente.from('perfiles_crm')
        .select('id,nombre,rol').eq('id', user.id).single();
      if (!montado) return;
      if (errorPerfil || !data) {
        setPerfil(null);
        setMensaje('Tu cuenta no tiene un perfil CRM activo. Consulta al administrador.');
        await cliente.auth.signOut();
      } else {
        setPerfil(data as Perfil);
        setMensaje('');
      }
      if (montado) setCargando(false);
    }
    void verificar();
    const { data: { subscription } } = cliente.auth.onAuthStateChange((evento) => {
      if (evento === 'SIGNED_OUT') {
        setPerfil(null);
        setCargando(false);
      } else {
        setTimeout(() => { void verificar(); }, 0);
      }
    });
    return () => { montado = false; subscription.unsubscribe(); };
  }, []);

  async function salir() {
    await supabase().auth.signOut();
    setPerfil(null);
  }

  return <Contexto.Provider value={{ perfil, cargando, mensaje, salir }}>{children}</Contexto.Provider>;
}

export function Privado() {
  const { perfil, cargando, salir } = useAuth();
  if (cargando) return <main className="centrado">Verificando acceso...</main>;
  if (!perfil) return <Navigate to="/login" replace />;
  return <div className="aplicacion">
    <header className="barra">
      <Link className="marca" to="/">Boston CRM</Link>
      <nav aria-label="Principal">
        <Link to="/">Inicio</Link>
        <Link to="/postulaciones">Postulaciones</Link>
        <Link to="/contactos">Contactos</Link>
      </nav>
      <div className="usuario"><span>{perfil.nombre}</span><button type="button" onClick={() => { void salir(); }}>Salir</button></div>
    </header>
    <main className="contenido"><Outlet /></main>
  </div>;
}
