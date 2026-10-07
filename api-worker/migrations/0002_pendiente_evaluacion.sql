-- D1 executes a migration in one transaction. Keep copies of both child tables
-- before replacing their parent: ON DELETE CASCADE would otherwise erase them.
PRAGMA defer_foreign_keys = ON;

CREATE TABLE _conteos_migracion AS
SELECT (SELECT count(*) FROM postulaciones) AS postulaciones,
       (SELECT count(*) FROM notas_postulacion) AS notas,
       (SELECT count(*) FROM historial_postulacion) AS historial;
CREATE TABLE _notas_migracion AS SELECT * FROM notas_postulacion;
CREATE TABLE _historial_migracion AS SELECT * FROM historial_postulacion;
DROP TABLE notas_postulacion;
DROP TABLE historial_postulacion;

CREATE TABLE postulaciones_nueva (
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
    'nuevo', 'contactado', 'entrevista', 'pendiente_evaluacion', 'documentos_pendientes',
    'aprobado', 'matriculado', 'descartado'
  )),
  origen TEXT NOT NULL DEFAULT 'web' CHECK (origen = 'web'),
  fecha_creacion TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO postulaciones_nueva (
  id, nombre_estudiante, edad_estudiante, grado, nombre_apoderado,
  telefono_apoderado, correo_apoderado, medio_contacto, idioma, estado,
  origen, fecha_creacion, fecha_actualizacion
)
SELECT id, nombre_estudiante, edad_estudiante, grado, nombre_apoderado,
       telefono_apoderado, correo_apoderado, medio_contacto, idioma,
       CASE WHEN estado = 'evaluacion' THEN 'pendiente_evaluacion' ELSE estado END,
       origen, fecha_creacion, fecha_actualizacion
FROM postulaciones;

DROP TABLE postulaciones;
ALTER TABLE postulaciones_nueva RENAME TO postulaciones;

CREATE TABLE notas_postulacion (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  postulacion_id INTEGER NOT NULL REFERENCES postulaciones(id) ON DELETE CASCADE,
  usuario_email TEXT NOT NULL,
  contenido TEXT NOT NULL CHECK (length(trim(contenido)) BETWEEN 1 AND 3000),
  fecha_creacion TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO notas_postulacion (id, postulacion_id, usuario_email, contenido, fecha_creacion)
SELECT id, postulacion_id, usuario_email, contenido, fecha_creacion FROM _notas_migracion;

CREATE TABLE historial_postulacion (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  postulacion_id INTEGER NOT NULL REFERENCES postulaciones(id) ON DELETE CASCADE,
  estado_anterior TEXT,
  estado_nuevo TEXT NOT NULL CHECK (estado_nuevo IN (
    'nuevo', 'contactado', 'entrevista', 'pendiente_evaluacion', 'documentos_pendientes',
    'aprobado', 'matriculado', 'descartado'
  )),
  usuario_email TEXT NOT NULL,
  fecha_creacion TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO historial_postulacion
  (id, postulacion_id, estado_anterior, estado_nuevo, usuario_email, fecha_creacion)
SELECT id, postulacion_id,
       CASE WHEN estado_anterior = 'evaluacion' THEN 'pendiente_evaluacion' ELSE estado_anterior END,
       CASE WHEN estado_nuevo = 'evaluacion' THEN 'pendiente_evaluacion' ELSE estado_nuevo END,
       usuario_email, fecha_creacion
FROM _historial_migracion;

CREATE INDEX postulaciones_estado_idx ON postulaciones(estado);
CREATE INDEX postulaciones_fecha_idx ON postulaciones(fecha_creacion DESC);
CREATE INDEX postulaciones_correo_idx ON postulaciones(correo_apoderado);
CREATE INDEX postulaciones_telefono_idx ON postulaciones(telefono_apoderado);
CREATE INDEX notas_postulacion_idx ON notas_postulacion(postulacion_id, fecha_creacion DESC);
CREATE INDEX historial_postulacion_idx ON historial_postulacion(postulacion_id, fecha_creacion DESC);

CREATE TABLE _verificar_conteos (
  correcto INTEGER NOT NULL CHECK (correcto = 1)
);
INSERT INTO _verificar_conteos
SELECT (postulaciones = (SELECT count(*) FROM postulaciones))
   AND (notas = (SELECT count(*) FROM notas_postulacion))
   AND (historial = (SELECT count(*) FROM historial_postulacion))
FROM _conteos_migracion;
DROP TABLE _verificar_conteos;
DROP TABLE _notas_migracion;
DROP TABLE _historial_migracion;
DROP TABLE _conteos_migracion;
