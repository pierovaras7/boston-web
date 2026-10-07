# Arquitectura

```text
Visitante → boston-web (Astro/Static Assets) → Turnstile → boston-api → D1
Personal → Cloudflare Access → boston-crm (React/Static Assets + Worker /api/*) → D1
```

La web envía JSON a `POST /api/postulaciones` y `POST /api/contactos`. La API valida origen, tipo, tamaño, campos y token Turnstile mediante Siteverify; comprueba `action` y `hostname` antes de escribir con sentencias preparadas en D1. CORS restringe navegadores; Turnstile y la validación del servidor controlan el formulario. El secreto Turnstile existe solo en el Worker.

Cloudflare Access intercepta todo el dominio CRM. Cada ruta `/api/*` verifica la firma del JWT de Access, su emisor y audiencia; luego consulta el email autenticado en `usuarios_crm`. Solo usuarios activos con rol `admin` o `usuario` ejecutan las operaciones. El navegador usa rutas `/api/*` del mismo origen y nunca accede directamente a D1.

La migración versionada `api-worker/migrations/0001_inicial.sql` crea `usuarios_crm`, `postulaciones`, `contactos_web`, `notas_postulacion` e `historial_postulacion`, con claves foráneas, restricciones e índices. El cambio de estado y su entrada de historial se ejecutan en un batch D1. La implementación anterior de Supabase está aislada en `legacy-supabase/` y no se despliega.
