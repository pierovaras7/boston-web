# CRM

El CRM está en `crm/` y se publica como archivos estáticos. `public/_redirects` permite abrir directamente `/postulaciones/:id` en Cloudflare Pages.

| Ruta | Función |
| --- | --- |
| `/login` | Correo y contraseña de Supabase Auth. |
| `/` | Nuevas, pendientes, matriculadas y contactos nuevos. |
| `/postulaciones` | Últimas 500, búsqueda y filtro por estado. |
| `/postulaciones/:id` | Datos, cambio de estado, notas e historial. |
| `/contactos` | Últimos 500 mensajes y su estado. |

Las rutas privadas verifican usuario y perfil CRM activo; RLS es la barrera real. La sesión persiste en el navegador. El botón **Salir** cierra sesión. Los cambios de estado usan el estado anterior como condición para detectar actualizaciones simultáneas; la base registra el historial de forma atómica.

Para desarrollar:

```powershell
cd crm
npm ci
Copy-Item .env.example .env.local
# Rellena VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY
npm run dev
```

La clave publicable está diseñada para clientes web y debe acompañarse de RLS. La clave `service_role` solo la usa `scripts/crear-admin.mjs` en una terminal privada; no se importa en `src/`. La paginación más allá de 500 registros y una interfaz de gestión de usuarios son mejoras posteriores al MVP.
