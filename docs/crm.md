# CRM Boston

Abre https://boston-crm.cueva-dev.workers.dev. Cloudflare Access solicita el correo autorizado y envía un código de un solo uso; después se abre el CRM. No hay contraseña propia. El primer administrador es `cueva_dev@hotmail.com`, registrado como `admin` activo en `usuarios_crm` y permitido por la política `Boston CRM Administradores`.

| Ruta | Uso |
| --- | --- |
| `/` | Totales de postulaciones nuevas, pendientes, matriculadas y contactos nuevos. |
| `/postulaciones` | Últimas 500, búsqueda y filtro por estado. |
| `/postulaciones/:id` | Datos, cambio de estado, notas e historial. |
| `/contactos` | Últimos 500 mensajes y cambio de estado. |

El Worker verifica JWT y usuario D1 activo en cada solicitud `/api/*`. Ambos roles actuales (`admin` y `usuario`) pueden trabajar con postulaciones y contactos. Cada estado se actualiza con el valor anterior como condición para detectar conflictos; el historial se escribe en el mismo batch. Las notas llevan el email autenticado del JWT verificado.

Para añadir un usuario futuro: (1) permitir su email en una política Access de Boston; (2) insertar ese mismo email, nombre, rol y `activo=1` en `usuarios_crm` mediante Wrangler/D1 o la consola privada; (3) verificar su inicio de sesión. Para revocar, retirar el email de Access y marcar `activo=0` en D1. No añadir usuarios desde el navegador.

En local, `cd crm; npm ci; npm run dev` sirve solo el frontend Vite. Para probar la API privada, construye el CRM y usa `npx wrangler dev` con D1 local; la autenticación Access real requiere el dominio protegido. La paginación más allá de 500 registros y la administración de usuarios por interfaz quedan fuera del alcance actual.
