# Configuración de Cloudflare

El Worker se configura en `api-worker/wrangler.jsonc`; las tres variables requeridas se guardan como **secrets**. `ORIGENES_PERMITIDOS` contiene URLs de origen completas, separadas por comas y sin `/` final. Incluye el dominio real de la web cuando exista. Para pruebas locales incluye `http://localhost:4321`.

```powershell
cd api-worker
npm ci
npx wrangler login
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put ORIGENES_PERMITIDOS
npm run build
npm run deploy
```

Wrangler pide cada valor de forma interactiva. No pegues secretos en argumentos, archivos versionados ni logs. Para desarrollo local copia `.dev.vars.example` a `.dev.vars` y rellena sus valores; el archivo real está ignorado por Git.

`GET /api/salud` devuelve `{"ok":true,"servicio":"boston-api"}`. Los POST aceptan JSON hasta 8 KiB. `OPTIONS` responde a preflight únicamente para orígenes permitidos. Configura un límite de solicitudes en Cloudflare antes de abrir el formulario al tráfico público; Turnstile puede añadirse cuando haya claves.

Para alojar la web y el CRM como proyectos Pages separados, sigue [despliegue](despliegue.md). Si prefieres integración Git en Pages, configura los comandos de build y sus variables públicas en la plataforma; [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/) no se convierte luego en integración Git dentro del mismo proyecto.
