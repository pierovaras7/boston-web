# Arquitectura

```text
Visitante → Astro estático → HTTPS → Cloudflare Worker → Supabase PostgreSQL
                                                 CRM React → Supabase Auth + RLS
```

La web solo contiene `PUBLIC_API_URL`. Envía JSON a `POST /api/postulaciones` y `POST /api/contactos`. El Worker valida método, origen, tipo, tamaño y campos, traduce el contrato HTTP a columnas españolas y escribe mediante una credencial privada. No devuelve errores internos ni datos de la solicitud en los logs.

El CRM usa únicamente la URL y la clave **publicable** de Supabase. Supabase Auth persiste la sesión; la tabla `perfiles_crm` decide si el usuario sigue activo. RLS y privilegios SQL impiden lecturas anónimas, inserciones directas desde el navegador y modificaciones fuera del CRM. Los usuarios activos pueden leer registros, actualizar solo la columna `estado` y agregar notas.

## Tablas

| Tabla | Uso |
| --- | --- |
| `perfiles_crm` | Acceso activo y rol `admin`/`usuario` asociado a `auth.users`. |
| `postulaciones` | Datos del estudiante y apoderado, grado, estado y fechas. |
| `contactos_web` | Consultas del formulario y estado de atención. |
| `notas_postulacion` | Notas múltiples con autor y fecha. |
| `historial_postulacion` | Cambios de estado con autor y fecha. |

Un trigger escribe el historial en la misma transacción del cambio de estado. Otro actualiza `fecha_actualizacion`. El esquema está en `supabase/migrations/20261006141500_crear_crm_boston.sql`.

La API es pública por diseño y CORS solo limita llamadas desde navegadores. Antes de tráfico elevado conviene activar un límite de solicitudes o Turnstile en Cloudflare.
