export const ESTADOS_POSTULACION = [
  'nuevo', 'contactado', 'entrevista', 'pendiente_evaluacion',
  'documentos_pendientes', 'aprobado', 'matriculado', 'descartado',
] as const;
export const ESTADOS_PENDIENTES = [
  'contactado', 'entrevista', 'pendiente_evaluacion', 'documentos_pendientes',
] as const;
export const GRADOS = [
  'primaria_1', 'primaria_2', 'primaria_3', 'primaria_4', 'primaria_5', 'primaria_6',
  'secundaria_1', 'secundaria_2', 'secundaria_3', 'secundaria_4', 'secundaria_5',
] as const;
export const SQL_PENDIENTES = `estado IN (${ESTADOS_PENDIENTES.map((e) => `'${e}'`).join(',')})`;

export type TipoEvento = 'postulacion_creada' | 'postulacion_actualizada' | 'nota_creada' |
  'contacto_creado' | 'contacto_actualizado';
export interface EventoCRM { tipo: TipoEvento; id: number; fecha: string }
