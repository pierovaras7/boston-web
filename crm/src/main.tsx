import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, Privado } from './Auth';
import { Dashboard } from './pages/Dashboard';
import { Postulaciones } from './pages/Postulaciones';
import { DetallePostulacion } from './pages/DetallePostulacion';
import { Contactos } from './pages/Contactos';
const Metricas = lazy(() => import('./pages/Metricas').then((m) => ({ default: m.Metricas })));
import './styles.css';

function App() {
  return <BrowserRouter><AuthProvider><Routes>
    <Route element={<Privado />}>
      <Route index element={<Dashboard />} />
      <Route path="/postulaciones" element={<Postulaciones />} />
      <Route path="/postulaciones/:id" element={<DetallePostulacion />} />
      <Route path="/contactos" element={<Contactos />} />
      <Route path="/metricas" element={<Suspense fallback={<p>Cargando métricas…</p>}><Metricas /></Suspense>} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></AuthProvider></BrowserRouter>;
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
