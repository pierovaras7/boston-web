# Despliegue y prueba

Los recursos actuales están en [configuracion-cloudflare.md](configuracion-cloudflare.md). Desde `integracion-produccion`, con Wrangler autenticado en la cuenta correcta:

```powershell
cd api-worker
npm ci
npm test
npm run build
npx wrangler d1 migrations list boston-web-db --remote
npx wrangler d1 migrations apply boston-web-db --remote
npm run deploy
cd ..
npm ci
npm run build
npx wrangler deploy
cd crm
npm ci
npm test
npm run build
npx wrangler deploy
```

Antes del build Astro, define `PUBLIC_API_URL` y `PUBLIC_TURNSTILE_SITE_KEY` según [configuración](configuracion-cloudflare.md), por ejemplo en `.env.production` ignorado por Git. Los despliegues usan Workers Static Assets. La política Access y el secret Turnstile se configuran en Cloudflare.

## Flujo de prueba

1. Abre [admisiones](https://boston-web.cueva-dev.workers.dev/es/admisiones/), completa una postulación ficticia y Turnstile. Comprueba confirmación y HTTP 201 en `POST /api/postulaciones`.
2. Abre el [CRM](https://boston-crm.cueva-dev.workers.dev), autentícate con el email permitido y el OTP recibido. Encuentra la postulación, cambia `nuevo` a `contactado`, añade una nota y recarga; estado, nota e historial deben persistir.
3. Envía una consulta ficticia desde `/es/contacto/`, comprueba 201 y su aparición en Contactos. Cambia el estado y recarga.
4. Repite un envío en `/en/admisiones/` o `/en/contacto/`; comprueba también las rutas canónicas, home, blog y enlaces principales.
5. Verifica rechazo de token ausente/inválido, email y grado inválidos, origen CORS ajeno y acceso CRM sin sesión/JWT.

Para inspeccionar D1 sin imprimir datos personales en logs compartidos, ejecuta desde `api-worker` `npx wrangler d1 execute boston-web-db --remote --command "SELECT COUNT(*) AS total FROM postulaciones"` y análogamente para `contactos_web`. Para un registro concreto, usa la consola privada Cloudflare.

Si falla el formulario, revisa las variables públicas del build, el hostname del widget, el secret, CORS y la migración. Si CRM deniega acceso tras Access, comprueba AUD y email/rol/activo en `usuarios_crm`. Usa logs privados sin publicar datos personales ni secretos.
