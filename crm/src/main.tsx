import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, Privado } from './Auth';
import { configurado } from './lib/supabase';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Postulaciones } from './pages/Postulaciones';
import { DetallePostulacion } from './pages/DetallePostulacion';
import { Contactos } from './pages/Contactos';
import './styles.css';

function App() {
  if (!configurado) return <main className="centrado"><h1>CRM sin configurar</h1><p>Define VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY antes del build.</p></main>;
  return <BrowserRouter><AuthProvider><Routes>
    <Route path="/login" element={<Login />} />
    <Route element={<Privado />}>
      <Route index element={<Dashboard />} />
      <Route path="/postulaciones" element={<Postulaciones />} />
      <Route path="/postulaciones/:id" element={<DetallePostulacion />} />
      <Route path="/contactos" element={<Contactos />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></AuthProvider></BrowserRouter>;
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
