import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const grados = [
  'primaria_1', 'primaria_2', 'primaria_3', 'primaria_4', 'primaria_5', 'primaria_6',
  'secundaria_1', 'secundaria_2', 'secundaria_3', 'secundaria_4', 'secundaria_5',
] as const;

const texto = (min: number, max: number) => z.string().trim().min(min).max(max);
const correo = z.string().trim().email().max(254);
const telefono = texto(7, 25).regex(/^\+?[0-9\s()\-]{7,25}$/);

const postulacion = z.strictObject({
  studentName: texto(2, 120),
  studentAge: z.coerce.number().int().min(5).max(18),
  grade: z.enum(grados),
  parentName: texto(2, 120),
  parentPhone: telefono,
  parentEmail: correo,
  preferredContact: z.enum(['phone', 'whatsapp', 'email']),
  language: z.enum(['es', 'en']),
});

const contacto = z.strictObject({
  name: texto(2, 120),
  email: correo,
  phone: z.union([telefono, z.literal('')]).optional(),
  subject: texto(2, 150),
  message: texto(5, 3000),
  language: z.enum(['es', 'en']),
});

type EnvConfig = Pick<Env, 'SUPABASE_URL' | 'SUPABASE_SERVICE_ROLE_KEY' | 'ORIGENES_PERMITIDOS'>;
type Row = Record<string, string | number | null>;
export type Guardar = (tabla: 'postulaciones' | 'contactos_web', fila: Row, env: EnvConfig) => Promise<void>;

const guardarEnSupabase: Guardar = async (tabla, fila, env) => {
  const cliente = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await cliente.from(tabla).insert([fila]);
  if (error) throw error;
};

function respuesta(codigo: number, datos: object, cabeceras: HeadersInit = {}) {
  return new Response(JSON.stringify(datos), {
    status: codigo,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...cabeceras },
  });
}

async function leerJsonLimitado(request: Request): Promise<unknown> {
  const lector = request.body?.getReader();
  if (!lector) throw new Error('json_invalido');
  const partes: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await lector.read();
      if (done) break;
      total += value.byteLength;
      if (total > 8192) throw new Error('payload_grande');
      partes.push(value);
    }
  } finally {
    lector.releaseLock();
  }
  const bytes = new Uint8Array(total);
  let posicion = 0;
  for (const parte of partes) { bytes.set(parte, posicion); posicion += parte.byteLength; }
  try { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); }
  catch { throw new Error('json_invalido'); }
}

export function crearManejador(guardar: Guardar = guardarEnSupabase) {
  return async (request: Request, env: EnvConfig): Promise<Response> => {
    const ruta = new URL(request.url).pathname;
    const origen = request.headers.get('Origin');
    const permitidos = new Set((env.ORIGENES_PERMITIDOS || '').split(',').map((valor) => valor.trim()).filter(Boolean));
    const cors: Record<string, string> = origen && permitidos.has(origen)
      ? { 'Access-Control-Allow-Origin': origen, 'Vary': 'Origin' } : {};

    if (ruta === '/api/salud' && request.method === 'GET') {
      return respuesta(200, { ok: true, servicio: 'boston-api' }, cors);
    }
    if (ruta !== '/api/postulaciones' && ruta !== '/api/contactos') {
      return respuesta(404, { ok: false, error: 'Ruta no encontrada' }, cors);
    }
    if (origen && !permitidos.has(origen)) {
      return respuesta(403, { ok: false, error: 'Origen no permitido' });
    }
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: {
        ...cors,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '600',
        'Vary': 'Origin',
      } });
    }
    if (request.method !== 'POST') {
      return respuesta(405, { ok: false, error: 'Método no permitido' }, { ...cors, Allow: 'POST, OPTIONS' });
    }
    if (request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
      return respuesta(415, { ok: false, error: 'Se requiere JSON' }, cors);
    }
    if (Number(request.headers.get('Content-Length') || 0) > 8192) {
      return respuesta(413, { ok: false, error: 'Solicitud demasiado grande' }, cors);
    }
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      return respuesta(503, { ok: false, error: 'Servicio no disponible' }, cors);
    }

    try {
      const cuerpo = await leerJsonLimitado(request);
      if (ruta === '/api/postulaciones') {
        const validado = postulacion.safeParse(cuerpo);
        if (!validado.success) return respuesta(400, { ok: false, error: 'Datos de postulación inválidos' }, cors);
        const p = validado.data;
        await guardar('postulaciones', {
          nombre_estudiante: p.studentName, edad_estudiante: p.studentAge, grado: p.grade,
          nombre_apoderado: p.parentName, telefono_apoderado: p.parentPhone,
          correo_apoderado: p.parentEmail,
          medio_contacto: { phone: 'telefono', whatsapp: 'whatsapp', email: 'correo' }[p.preferredContact],
          idioma: p.language, origen: 'web',
        }, env);
      } else {
        const validado = contacto.safeParse(cuerpo);
        if (!validado.success) return respuesta(400, { ok: false, error: 'Datos de contacto inválidos' }, cors);
        const c = validado.data;
        await guardar('contactos_web', {
          nombre: c.name, correo: c.email, telefono: c.phone || null,
          asunto: c.subject, mensaje: c.message, idioma: c.language, origen: 'web',
        }, env);
      }
      return respuesta(201, { ok: true }, cors);
    } catch (error) {
      if (error instanceof Error && error.message === 'payload_grande') {
        return respuesta(413, { ok: false, error: 'Solicitud demasiado grande' }, cors);
      }
      if (error instanceof Error && error.message === 'json_invalido') {
        return respuesta(400, { ok: false, error: 'JSON inválido' }, cors);
      }
      console.error('Error interno al guardar formulario', error instanceof Error ? error.name : 'desconocido');
      return respuesta(500, { ok: false, error: 'No se pudo guardar la solicitud' }, cors);
    }
  };
}

export default {
  fetch: crearManejador(),
} satisfies ExportedHandler<Env>;
