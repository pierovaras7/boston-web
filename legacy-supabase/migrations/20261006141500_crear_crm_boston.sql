-- Boston Bilingual School: datos privados de admisiones y contacto.
create schema if not exists privado;

create table public.perfiles_crm (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null check (char_length(trim(nombre)) between 2 and 120),
  rol text not null default 'usuario' check (rol in ('admin', 'usuario')),
  activo boolean not null default true,
  fecha_creacion timestamptz not null default now()
);

create table public.postulaciones (
  id uuid primary key default gen_random_uuid(),
  nombre_estudiante text not null check (char_length(trim(nombre_estudiante)) between 2 and 120),
  edad_estudiante smallint not null check (edad_estudiante between 5 and 18),
  grado text not null check (grado in (
    'primaria_1', 'primaria_2', 'primaria_3', 'primaria_4', 'primaria_5', 'primaria_6',
    'secundaria_1', 'secundaria_2', 'secundaria_3', 'secundaria_4', 'secundaria_5'
  )),
  nombre_apoderado text not null check (char_length(trim(nombre_apoderado)) between 2 and 120),
  telefono_apoderado text not null check (char_length(trim(telefono_apoderado)) between 7 and 25),
  correo_apoderado text not null check (char_length(correo_apoderado) <= 254 and correo_apoderado ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  medio_contacto text not null check (medio_contacto in ('telefono', 'whatsapp', 'correo')),
  idioma text not null check (idioma in ('es', 'en')),
  estado text not null default 'nuevo' check (estado in (
    'nuevo', 'contactado', 'entrevista', 'evaluacion', 'documentos_pendientes',
    'aprobado', 'matriculado', 'descartado'
  )),
  origen text not null default 'web' check (origen in ('web')),
  fecha_creacion timestamptz not null default now(),
  fecha_actualizacion timestamptz not null default now()
);

create table public.contactos_web (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (char_length(trim(nombre)) between 2 and 120),
  correo text not null check (char_length(correo) <= 254 and correo ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  telefono text check (telefono is null or char_length(trim(telefono)) between 7 and 25),
  asunto text not null check (char_length(trim(asunto)) between 2 and 150),
  mensaje text not null check (char_length(trim(mensaje)) between 5 and 3000),
  idioma text not null check (idioma in ('es', 'en')),
  estado text not null default 'nuevo' check (estado in ('nuevo', 'atendido', 'cerrado')),
  origen text not null default 'web' check (origen in ('web')),
  fecha_creacion timestamptz not null default now(),
  fecha_actualizacion timestamptz not null default now()
);

create table public.notas_postulacion (
  id uuid primary key default gen_random_uuid(),
  postulacion_id uuid not null references public.postulaciones(id) on delete cascade,
  usuario_id uuid not null default auth.uid() references auth.users(id),
  contenido text not null check (char_length(trim(contenido)) between 1 and 3000),
  fecha_creacion timestamptz not null default now()
);

create table public.historial_postulacion (
  id uuid primary key default gen_random_uuid(),
  postulacion_id uuid not null references public.postulaciones(id) on delete cascade,
  estado_anterior text not null,
  estado_nuevo text not null,
  usuario_id uuid references auth.users(id) on delete set null,
  fecha_creacion timestamptz not null default now()
);

create index postulaciones_fecha_idx on public.postulaciones (fecha_creacion desc);
create index postulaciones_estado_fecha_idx on public.postulaciones (estado, fecha_creacion desc);
create index contactos_web_fecha_idx on public.contactos_web (fecha_creacion desc);
create index notas_postulacion_fecha_idx on public.notas_postulacion (postulacion_id, fecha_creacion desc);
create index historial_postulacion_fecha_idx on public.historial_postulacion (postulacion_id, fecha_creacion desc);

create function privado.usuario_crm_activo() returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce((select p.activo from public.perfiles_crm p where p.id = (select auth.uid())), false)
    and coalesce((select auth.jwt() ->> 'is_anonymous') <> 'true', true);
$$;

create function privado.actualizar_fecha() returns trigger
language plpgsql set search_path = ''
as $$
begin
  new.fecha_actualizacion := now();
  return new;
end;
$$;

create trigger postulaciones_fecha before update on public.postulaciones
for each row execute function privado.actualizar_fecha();
create trigger contactos_web_fecha before update on public.contactos_web
for each row execute function privado.actualizar_fecha();

-- El cambio de estado y el historial se confirman en una sola transacción.
create function privado.registrar_estado_postulacion() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if old.estado is distinct from new.estado then
    insert into public.historial_postulacion
      (postulacion_id, estado_anterior, estado_nuevo, usuario_id)
    values (new.id, old.estado, new.estado, (select auth.uid()));
  end if;
  return new;
end;
$$;

create trigger postulaciones_historial after update of estado on public.postulaciones
for each row execute function privado.registrar_estado_postulacion();

alter table public.perfiles_crm enable row level security;
alter table public.postulaciones enable row level security;
alter table public.contactos_web enable row level security;
alter table public.notas_postulacion enable row level security;
alter table public.historial_postulacion enable row level security;

revoke all on public.perfiles_crm, public.postulaciones, public.contactos_web,
  public.notas_postulacion, public.historial_postulacion from anon, authenticated;
grant usage on schema privado to authenticated;
revoke all on all functions in schema privado from public, anon, authenticated;
grant execute on function privado.usuario_crm_activo() to authenticated;

grant select on public.perfiles_crm, public.postulaciones, public.contactos_web,
  public.notas_postulacion, public.historial_postulacion to authenticated;
grant update (estado) on public.postulaciones, public.contactos_web to authenticated;
grant insert (postulacion_id, contenido) on public.notas_postulacion to authenticated;

create policy perfiles_leer_propio on public.perfiles_crm for select to authenticated
using (id = (select auth.uid()) and privado.usuario_crm_activo());

create policy postulaciones_leer on public.postulaciones for select to authenticated
using (privado.usuario_crm_activo());
create policy postulaciones_cambiar_estado on public.postulaciones for update to authenticated
using (privado.usuario_crm_activo()) with check (privado.usuario_crm_activo());

create policy contactos_leer on public.contactos_web for select to authenticated
using (privado.usuario_crm_activo());
create policy contactos_cambiar_estado on public.contactos_web for update to authenticated
using (privado.usuario_crm_activo()) with check (privado.usuario_crm_activo());

create policy notas_leer on public.notas_postulacion for select to authenticated
using (privado.usuario_crm_activo());
create policy notas_crear on public.notas_postulacion for insert to authenticated
with check (privado.usuario_crm_activo() and usuario_id = (select auth.uid()));

create policy historial_leer on public.historial_postulacion for select to authenticated
using (privado.usuario_crm_activo());
