PRAGMA foreign_keys = ON;

CREATE TABLE usuarios_crm (
  email TEXT PRIMARY KEY CHECK (email = lower(trim(email)) AND length(email) BETWEEN 5 AND 254),
  nombre TEXT NOT NULL CHECK (length(trim(nombre)) BETWEEN 2 AND 120),
  rol TEXT NOT NULL CHECK (rol IN ('admin', 'usuario')),
  activo INTEGER NOT NULL DEFAULT 1 CHECK (activo IN (0, 1)),
  fecha_creacion TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE postulaciones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre_estudiante TEXT NOT NULL CHECK (length(trim(nombre_estudiante)) BETWEEN 2 AND 120),
  edad_estudiante INTEGER NOT NULL CHECK (edad_estudiante BETWEEN 5 AND 18),
  grado TEXT NOT NULL CHECK (grado IN (
    'primaria_1', 'primaria_2', 'primaria_3', 'primaria_4', 'primaria_5', 'primaria_6',
    'secundaria_1', 'secundaria_2', 'secundaria_3', 'secundaria_4', 'secundaria_5'
  )),
  nombre_apoderado TEXT NOT NULL CHECK (length(trim(nombre_apoderado)) BETWEEN 2 AND 120),
  telefono_apoderado TEXT NOT NULL CHECK (length(trim(telefono_apoderado)) BETWEEN 7 AND 25),
  correo_apoderado TEXT NOT NULL CHECK (length(trim(correo_apoderado)) BETWEEN 5 AND 254),
  medio_contacto TEXT NOT NULL CHECK (medio_contacto IN ('telefono', 'whatsapp', 'correo')),
  idioma TEXT NOT NULL CHECK (idioma IN ('es', 'en')),
  estado TEXT NOT NULL DEFAULT 'nuevo' CHECK (estado IN (
    'nuevo', 'contactado', 'entrevista', 'evaluacion', 'documentos_pendientes',
    'aprobado', 'matriculado', 'descartado'
  )),
  origen TEXT NOT NULL DEFAULT 'web' CHECK (origen = 'web'),
  fecha_creacion TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contactos_web (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL CHECK (length(trim(nombre)) BETWEEN 2 AND 120),
  correo TEXT NOT NULL CHECK (length(trim(correo)) BETWEEN 5 AND 254),
  telefono TEXT CHECK (telefono IS NULL OR length(trim(telefono)) BETWEEN 7 AND 25),
  asunto TEXT NOT NULL CHECK (length(trim(asunto)) BETWEEN 2 AND 150),
  mensaje TEXT NOT NULL CHECK (length(trim(mensaje)) BETWEEN 5 AND 3000),
  idioma TEXT NOT NULL CHECK (idioma IN ('es', 'en')),
  estado TEXT NOT NULL DEFAULT 'nuevo' CHECK (estado IN ('nuevo', 'atendido', 'cerrado')),
  origen TEXT NOT NULL DEFAULT 'web' CHECK (origen = 'web'),
  fecha_creacion TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notas_postulacion (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  postulacion_id INTEGER NOT NULL REFERENCES postulaciones(id) ON DELETE CASCADE,
  usuario_email TEXT NOT NULL,
  contenido TEXT NOT NULL CHECK (length(trim(contenido)) BETWEEN 1 AND 3000),
  fecha_creacion TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE historial_postulacion (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  postulacion_id INTEGER NOT NULL REFERENCES postulaciones(id) ON DELETE CASCADE,
  estado_anterior TEXT,
  estado_nuevo TEXT NOT NULL CHECK (estado_nuevo IN (
    'nuevo', 'contactado', 'entrevista', 'evaluacion', 'documentos_pendientes',
    'aprobado', 'matriculado', 'descartado'
  )),
  usuario_email TEXT NOT NULL,
  fecha_creacion TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX postulaciones_estado_idx ON postulaciones(estado);
CREATE INDEX postulaciones_fecha_idx ON postulaciones(fecha_creacion DESC);
CREATE INDEX postulaciones_correo_idx ON postulaciones(correo_apoderado);
CREATE INDEX postulaciones_telefono_idx ON postulaciones(telefono_apoderado);
CREATE INDEX contactos_estado_idx ON contactos_web(estado);
CREATE INDEX contactos_fecha_idx ON contactos_web(fecha_creacion DESC);
CREATE INDEX notas_postulacion_idx ON notas_postulacion(postulacion_id, fecha_creacion DESC);
CREATE INDEX historial_postulacion_idx ON historial_postulacion(postulacion_id, fecha_creacion DESC);
