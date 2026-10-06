export const estadosPostulacion = [
  'nuevo', 'contactado', 'entrevista', 'evaluacion', 'documentos_pendientes',
  'aprobado', 'matriculado', 'descartado',
] as const;
export type EstadoPostulacion = typeof estadosPostulacion[number];
export const estadosContacto = ['nuevo', 'atendido', 'cerrado'] as const;
export type EstadoContacto = typeof estadosContacto[number];

export interface Postulacion {
  id: string;
  nombre_estudiante: string;
  edad_estudiante: number;
  grado: string;
  nombre_apoderado: string;
  telefono_apoderado: string;
  correo_apoderado: string;
  medio_contacto: string;
  idioma: string;
  estado: EstadoPostulacion;
  origen: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface Contacto {
  id: string;
  nombre: string;
  correo: string;
  telefono: string | null;
  asunto: string;
  mensaje: string;
  idioma: string;
  estado: EstadoContacto;
  origen: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface Nota {
  id: string;
  contenido: string;
  usuario_id: string;
  fecha_creacion: string;
}

export interface Historial {
  id: string;
  estado_anterior: string;
  estado_nuevo: string;
  usuario_id: string | null;
  fecha_creacion: string;
}

export const fecha = (valor: string) => new Intl.DateTimeFormat('es-PE', {
  dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Lima',
}).format(new Date(valor));

export const grado = (valor: string) => valor.replace('_', ' ').replace(/^\w/, (letra) => letra.toUpperCase());
export const estado = (valor: string) => valor.replaceAll('_', ' ');
