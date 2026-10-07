import type { SVGProps } from 'react';

const trazos = {
  inicio: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  postulaciones: <><path d="M8 3h8l4 4v14H4V3h4Z"/><path d="M8 12h8M8 16h8M15 3v5h5"/></>,
  contactos: <><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M17 8h4M17 12h4M17 16h4"/></>,
  metricas: <><path d="M4 20V13M10 20V8M16 20V11M22 20V4M2 20h22"/></>,
  flecha: <><path d="M5 12h14m-6-6 6 6-6 6"/></>,
  buscar: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,
  volver: <><path d="M19 12H5m6-6-6 6 6 6"/></>,
} as const;

export function Icono({ nombre, ...props }: SVGProps<SVGSVGElement> & { nombre: keyof typeof trazos }) {
  return <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{trazos[nombre]}</svg>;
}
