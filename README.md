# Boston Bilingual School

MVP con tres aplicaciones independientes: web pública Astro estática, API de formularios en Cloudflare Workers y CRM privado en React. Los datos y la autenticación se alojan en Supabase.

## Carpetas

- `src/`: web pública.
- `api-worker/`: endpoints públicos con validación y escritura de servidor.
- `supabase/migrations/`: esquema, permisos, RLS y trazabilidad.
- `crm/`: aplicación privada y script de primer administrador.
- `legacy-backend/`: referencia del backend MySQL anterior; no se despliega.
- `src/reference/`: demos visuales fuera de las rutas públicas.

## Desarrollo y validación

Se necesita Node 22.12 o posterior y npm. Copia cada `.env.example` al archivo local indicado en [despliegue](docs/despliegue.md); nunca publiques la clave `service_role`.

```powershell
npm ci
npm run build
cd api-worker
npm ci
npm run test
npm run build
cd ../crm
npm ci
npm run build
```

Para iniciar Astro durante el desarrollo, usa `npx astro dev --background`. Administra el proceso con `npx astro dev status`, `npx astro dev logs` y `npx astro dev stop`.

## Guías

- [Arquitectura](docs/arquitectura.md)
- [Configuración de Supabase](docs/configuracion-supabase.md)
- [Configuración de Cloudflare](docs/configuracion-cloudflare.md)
- [CRM](docs/crm.md)
- [Despliegue y smoke test](docs/despliegue.md)

El código local compila sin credenciales de producción. La recepción real de formularios requiere crear el proyecto Supabase de Boston, aplicar la migración y configurar los tres despliegues.
