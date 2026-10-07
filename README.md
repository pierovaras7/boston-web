# Boston Bilingual School

Web Astro estática, API pública y CRM React privado, desplegados como tres Cloudflare Workers. D1 almacena los registros; Turnstile protege los formularios y Cloudflare Access protege el CRM.

| Servicio | URL |
| --- | --- |
| Web | https://boston-web.cueva-dev.workers.dev |
| API | https://boston-api.cueva-dev.workers.dev/api/salud |
| CRM | https://boston-crm.cueva-dev.workers.dev |

`src/` contiene la web; `api-worker/`, la API y las migraciones D1; `crm/`, React y su Worker privado. `legacy-supabase/` y `legacy-backend/` conservan implementaciones anteriores fuera de producción. `src/reference/` contiene demos no publicadas.

Se requiere Node 22.12 o posterior. Verificación local:

```powershell
npm ci
npm run build
cd api-worker
npm ci
npm test
npm run build
cd ../crm
npm ci
npm test
npm run build
```

Para iniciar Astro, usa `npx astro dev --background`; controla el proceso con `npx astro dev status`, `npx astro dev logs` y `npx astro dev stop`.

- [Arquitectura](docs/arquitectura.md)
- [Configuración Cloudflare](docs/configuracion-cloudflare.md)
- [Despliegue y pruebas](docs/despliegue.md)
- [CRM y usuarios](docs/crm.md)

Los dominios propios aún no están definidos. Las URLs workers.dev son las vigentes.
