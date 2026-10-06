import { createClient } from '@supabase/supabase-js';

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NOMBRE } = process.env;
if (![SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NOMBRE].every(Boolean)) {
  console.error('Faltan SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL, ADMIN_PASSWORD o ADMIN_NOMBRE.');
  process.exitCode = 1;
} else {
  const cliente = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await cliente.auth.admin.createUser({
    email: ADMIN_EMAIL, password: ADMIN_PASSWORD, email_confirm: true,
  });
  if (error || !data.user) {
    console.error('No se pudo crear el usuario. Comprueba si el correo ya existe.');
    process.exitCode = 1;
  } else {
    const { error: errorPerfil } = await cliente.from('perfiles_crm').insert({
      id: data.user.id, nombre: ADMIN_NOMBRE, rol: 'admin', activo: true,
    });
    if (errorPerfil) {
      console.error('El usuario se creó, pero falló el perfil. Revisa el usuario en Supabase antes de reintentar.');
      process.exitCode = 1;
    } else {
      console.log('Administrador creado correctamente.');
    }
  }
}
