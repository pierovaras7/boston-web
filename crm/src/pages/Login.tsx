import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../Auth';
import { supabase } from '../lib/supabase';

export function Login() {
  const { perfil, cargando, mensaje } = useAuth();
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  if (perfil) return <Navigate to="/" replace />;

  async function ingresar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError('');
    setEnviando(true);
    const { error } = await supabase().auth.signInWithPassword({ email: correo.trim(), password: contrasena });
    if (error) setError('Correo o contraseña incorrectos.');
    setEnviando(false);
  }

  return <main className="login-panel">
    <form onSubmit={(evento) => { void ingresar(evento); }}>
      <h1>Boston CRM</h1>
      <p>Acceso para personal autorizado</p>
      <label>Correo electrónico<input type="email" autoComplete="username" required value={correo} onChange={(e) => setCorreo(e.target.value)} /></label>
      <label>Contraseña<input type="password" autoComplete="current-password" required value={contrasena} onChange={(e) => setContrasena(e.target.value)} /></label>
      {(error || mensaje) && <p className="alerta" role="alert">{error || mensaje}</p>}
      <button disabled={enviando || cargando} type="submit">{enviando ? 'Ingresando...' : 'Ingresar'}</button>
    </form>
  </main>;
}
