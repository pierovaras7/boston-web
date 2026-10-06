# Configuración de Supabase

1. Crea un proyecto **nuevo para Boston Bilingual School** en Supabase. No uses `valana-dev`. Anota el `project ref` y espera a que la base quede activa.
2. En la raíz de este repositorio instala o ejecuta el [CLI oficial](https://supabase.com/docs/guides/local-development/cli/getting-started). Inicia sesión y vincula el proyecto:

```powershell
npx supabase login
npx supabase link --project-ref TU_PROJECT_REF
npx supabase db push --dry-run
npx supabase db push
```

3. Verifica en Table Editor que existen `perfiles_crm`, `postulaciones`, `contactos_web`, `notas_postulacion` e `historial_postulacion`. Comprueba que RLS está habilitado en las cinco y ejecuta los [advisors de seguridad](https://supabase.com/docs/guides/database/database-advisors).
4. En **Project Settings → API Keys**, copia la URL y la clave **publicable** para `crm/.env.production`; copia la clave `service_role` o secret key solo para el Worker y el script administrativo. Nunca la pongas en variables `PUBLIC_*` o `VITE_*`.
5. En **Authentication**, habilita Email/Password. El CRM no tiene registro público. Crea el primer administrador con el script siguiente desde `crm/`, usando variables de entorno privadas de PowerShell:

```powershell
$env:SUPABASE_URL='https://TU_PROJECT_REF.supabase.co'
$env:ADMIN_EMAIL='admin@tu-dominio'
$env:ADMIN_NOMBRE='Nombre del administrador'
$claveServicio = Read-Host 'Service role key' -AsSecureString
$claveAdmin = Read-Host 'Contraseña del administrador' -AsSecureString
$env:SUPABASE_SERVICE_ROLE_KEY = [System.Net.NetworkCredential]::new('', $claveServicio).Password
$env:ADMIN_PASSWORD = [System.Net.NetworkCredential]::new('', $claveAdmin).Password
node scripts/crear-admin.mjs
Remove-Item Env:SUPABASE_SERVICE_ROLE_KEY, Env:ADMIN_PASSWORD
```

Después de ejecutarlo, limpia las variables sensibles de la sesión o cierra la terminal. Si el script creó el usuario pero falló el perfil, revisa `auth.users` y crea el perfil desde el SQL Editor antes de reintentar; no crees otro usuario a ciegas.

## Comprobación de permisos

Sin sesión, una consulta a `postulaciones` con clave publicable debe fallar o devolver cero filas. Con un usuario autenticado sin perfil activo también debe devolver cero. Un perfil activo debe poder leer y cambiar `estado`, pero no modificar nombres ni correos. Un cambio de estado debe generar una fila en `historial_postulacion`.

La migración se aplicó y probó en PostgreSQL 17 local con roles de Auth simulados: lectura de perfil activo, cambio de estado, nota, historial y rechazo de acceso sin perfil. Aún requiere validación en el proyecto Supabase nuevo y una prueba real de Auth + PostgREST; compilar el frontend no prueba esas integraciones.
