# Despliegue y verificación

## Orden

1. Crea el proyecto Supabase nuevo y aplica la migración como indica [configuracion-supabase.md](configuracion-supabase.md). Crea el primer administrador.
2. Configura los secrets del Worker y despliégalo según [configuracion-cloudflare.md](configuracion-cloudflare.md). Anota su URL HTTPS.
3. Añade el origen definitivo de la web a `ORIGENES_PERMITIDOS` y vuelve a guardar ese secret. Si cambias el dominio después, actualiza la lista.
4. Construye la web con la URL del Worker. En PowerShell, desde la raíz:

```powershell
npm ci
$env:PUBLIC_API_URL='https://TU_WORKER.workers.dev'
npm run build
cd api-worker
npx wrangler pages project create boston-web
npx wrangler pages deploy ../dist --project-name boston-web
```

5. Construye y despliega el CRM. Las variables `VITE_*` se incrustan en el JavaScript público, por lo que solo deben contener URL y clave **publicable**:

```powershell
cd ../crm
npm ci
$env:VITE_SUPABASE_URL='https://TU_PROJECT_REF.supabase.co'
$env:VITE_SUPABASE_PUBLISHABLE_KEY='CLAVE_PUBLICABLE'
npm run build
cd ../api-worker
npx wrangler pages project create boston-crm
npx wrangler pages deploy ../crm/dist --project-name boston-crm
```

Los nombres de proyecto y URLs de Pages pueden variar según la cuenta. Cuando se definan dominios propios, asígnalos en Cloudflare y repite el build de la web si cambia `PUBLIC_API_URL`.

## Smoke test real

- `GET https://TU_WORKER.workers.dev/api/salud` devuelve HTTP 200 y `ok: true`.
- Abre `/es/admisiones`, `/en/admisiones` y `/admisiones`; envía una postulación de prueba y comprueba HTTP 201, fila en `postulaciones` y visibilidad inmediata en el CRM. Cambia estado, agrega nota, recarga y comprueba historial y persistencia.
- Abre `/es/contacto`, `/en/contacto` y `/contacto`; envía una consulta y comprueba HTTP 201, fila en `contactos_web` y cambio de estado tras recargar el CRM.
- Verifica rechazo de formulario vacío, email inválido, edad fuera de rango, grado inválido, payload grande, `Content-Type` incorrecto, origen CORS no permitido, ruta inexistente y Worker sin secretos.
- Sin login, comprueba que `/postulaciones` redirige a `/login` y que la clave publicable no permite leer tablas. Un usuario sin perfil activo tampoco debe acceder.
- Comprueba home, blog, artículos individuales, enlaces de header y footer, y el aviso de uso de datos. Las páginas demo permanecen en `src/reference/` y no deben publicarse.

## Diagnóstico rápido

- **Formulario indica “no configurado”**: falta `PUBLIC_API_URL` al ejecutar el build Astro; vuelve a construir y desplegar.
- **HTTP 403 CORS**: añade exactamente el origen de la web a `ORIGENES_PERMITIDOS`.
- **HTTP 503 API**: faltan secrets del Worker.
- **CRM sin acceso**: verifica usuario de Auth, fila activa en `perfiles_crm`, grants y RLS.
- **HTTP 500 API**: consulta logs privados del Worker y confirma migración, URL y secret de Supabase; no publiques la clave ni el error SQL.

Hasta ejecutar este smoke test contra el proyecto nuevo y los despliegues reales, el flujo productivo queda **pendiente de credenciales e infraestructura**, aunque los tres builds locales pasen.
