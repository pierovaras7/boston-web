# Recursos Cloudflare de Boston

Cuenta `cc59789a6848596b17f242888f248698`, subdominio workers.dev `cueva-dev`:

| Recurso | Nombre/valor |
| --- | --- |
| D1 | `boston-web-db` (`50d20d93-7b59-4bd0-8d06-448fd5f61673`) |
| Workers | `boston-web`, `boston-api`, `boston-crm` |
| Turnstile | `Boston Formularios`; sitekey pública `0x4AAAAAAFP7Bqih-rAwUxPE` |
| Access | Aplicación `Boston CRM`; política `Boston CRM Administradores`; proveedor `Boston CRM One-time PIN` |

Los tres `wrangler.jsonc` contienen bindings y variables no secretas. `api-worker/wrangler.jsonc` enlaza `DB`, fija `ORIGENES_PERMITIDOS` y `TURNSTILE_HOSTNAMES`, y exige el secret `TURNSTILE_SECRET_KEY`. Para rotarlo: `cd api-worker; npx wrangler secret put TURNSTILE_SECRET_KEY` e introdúcelo de forma interactiva. Nunca pongas el secreto en Git, `PUBLIC_*`, `VITE_*` ni en argumentos de terminal. `crm/wrangler.jsonc` enlaza D1 y configura `TEAM_DOMAIN` y `POLICY_AUD` para verificar el JWT.

La web Astro necesita `PUBLIC_API_URL=https://boston-api.cueva-dev.workers.dev` y `PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAFP7Bqih-rAwUxPE` durante el build. El CRM no necesita variables del navegador para la API.

Al añadir dominios propios, asígnalos a cada Worker, agrega el hostname web al widget Turnstile, actualiza `ORIGENES_PERMITIDOS` y `TURNSTILE_HOSTNAMES` de la API, reconstruye la web con la URL API definitiva y actualiza el dominio de la aplicación Access del CRM. Conserva el issuer del equipo Access y usa el AUD de la aplicación que protege el dominio. Verifica todas las rutas y formularios tras desplegar.
