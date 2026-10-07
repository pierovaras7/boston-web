import { z } from 'zod';

const grados = [
  'primaria_1', 'primaria_2', 'primaria_3', 'primaria_4', 'primaria_5', 'primaria_6',
  'secundaria_1', 'secundaria_2', 'secundaria_3', 'secundaria_4', 'secundaria_5',
] as const;
const texto = (min: number, max: number) => z.string().trim().min(min).max(max);
const correo = z.string().trim().email().max(254);
const telefono = texto(7, 25).regex(/^\+?[0-9\s()\-]{7,25}$/);
const token = z.string().min(1).max(2048);
const postulacion = z.strictObject({
  studentName: texto(2, 120), studentAge: z.coerce.number().int().min(5).max(18),
  grade: z.enum(grados), parentName: texto(2, 120), parentPhone: telefono,
  parentEmail: correo, preferredContact: z.enum(['phone', 'whatsapp', 'email']),
  language: z.enum(['es', 'en']), turnstileToken: token,
});
const contacto = z.strictObject({
  name: texto(2, 120), email: correo, phone: z.union([telefono, z.literal('')]).optional(),
  subject: texto(2, 150), message: texto(5, 3000),
  language: z.enum(['es', 'en']), turnstileToken: token,
});
type Evento = { tipo: 'postulacion_creada' | 'contacto_creado'; id: number; fecha: string };
type Config = { DB: D1Database; TURNSTILE_SECRET_KEY: string; ORIGENES_PERMITIDOS: string;
  TURNSTILE_HOSTNAMES: string; CRM_EVENTS?: object };
type Fila = Record<string, string | number | null>;
export type Guardar = (tabla: 'postulaciones' | 'contactos_web', fila: Fila, env: Config) => Promise<number>;
export type Verificar = (token: string, accion: string, request: Request, env: Config) => Promise<boolean>;

const guardarD1: Guardar = async (tabla, fila, env) => {
  if (tabla === 'postulaciones') {
    const resultado = await env.DB.prepare(`INSERT INTO postulaciones
      (nombre_estudiante, edad_estudiante, grado, nombre_apoderado, telefono_apoderado,
       correo_apoderado, medio_contacto, idioma, origen)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
      fila.nombre_estudiante, fila.edad_estudiante, fila.grado, fila.nombre_apoderado,
      fila.telefono_apoderado, fila.correo_apoderado, fila.medio_contacto, fila.idioma, 'web',
    ).run();
    return Number(resultado.meta.last_row_id);
  } else {
    const resultado = await env.DB.prepare(`INSERT INTO contactos_web
      (nombre, correo, telefono, asunto, mensaje, idioma, origen)
      VALUES (?, ?, ?, ?, ?, ?, ?)`).bind(
      fila.nombre, fila.correo, fila.telefono, fila.asunto, fila.mensaje, fila.idioma, 'web',
    ).run();
    return Number(resultado.meta.last_row_id);
  }
};

async function notificar(env: Config, tipo: Evento['tipo'], id: number) {
  if (!env.CRM_EVENTS || !Number.isSafeInteger(id) || id < 1) return;
  try {
    await (env.CRM_EVENTS as { emitirEvento(evento: Evento): Promise<void> })
      .emitirEvento({ tipo, id, fecha: new Date().toISOString() });
  }
  catch { console.error('Formulario guardado; aviso CRM no disponible'); }
}

const verificarTurnstile: Verificar = async (valor, accion, request, env) => {
  const hosts = new Set(env.TURNSTILE_HOSTNAMES.split(',').map((h) => h.trim().toLowerCase()).filter(Boolean));
  if (!hosts.size || !env.TURNSTILE_SECRET_KEY) return false;
  const body = new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: valor });
  const ip = request.headers.get('CF-Connecting-IP');
  if (ip) body.set('remoteip', ip);
  try {
    const respuesta = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body, signal: AbortSignal.timeout(10_000),
    });
    if (!respuesta.ok) return false;
    const resultado = await respuesta.json() as { success?: boolean; action?: string; hostname?: string };
    return resultado.success === true && resultado.action === accion &&
      typeof resultado.hostname === 'string' && hosts.has(resultado.hostname.toLowerCase());
  } catch { return false; }
};

function responder(codigo: number, datos: object, cabeceras: HeadersInit = {}) {
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
  } finally { lector.releaseLock(); }
  const bytes = new Uint8Array(total);
  let posicion = 0;
  for (const parte of partes) { bytes.set(parte, posicion); posicion += parte.byteLength; }
  try { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); }
  catch { throw new Error('json_invalido'); }
}

export function crearManejador(guardar: Guardar = guardarD1, verificar: Verificar = verificarTurnstile) {
  return async (request: Request, env: Config): Promise<Response> => {
    const ruta = new URL(request.url).pathname;
    const origen = request.headers.get('Origin');
    const permitidos = new Set((env.ORIGENES_PERMITIDOS || '').split(',').map((v) => v.trim()).filter(Boolean));
    const cors: Record<string, string> = origen && permitidos.has(origen)
      ? { 'Access-Control-Allow-Origin': origen, Vary: 'Origin' } : {};
    if (ruta === '/api/salud' && request.method === 'GET') {
      return responder(200, { ok: true, servicio: 'boston-api' }, cors);
    }
    if (ruta !== '/api/postulaciones' && ruta !== '/api/contactos') {
      return responder(404, { ok: false, error: 'Ruta no encontrada' }, cors);
    }
    if (origen && !permitidos.has(origen)) {
      return responder(403, { ok: false, error: 'Origen no permitido' });
    }
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: {
        ...cors, 'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '600', Vary: 'Origin',
      } });
    }
    if (request.method !== 'POST') {
      return responder(405, { ok: false, error: 'Método no permitido' }, { ...cors, Allow: 'POST, OPTIONS' });
    }
    if (request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
      return responder(415, { ok: false, error: 'Se requiere JSON' }, cors);
    }
    if (Number(request.headers.get('Content-Length') || 0) > 8192) {
      return responder(413, { ok: false, error: 'Solicitud demasiado grande' }, cors);
    }
    if (!env.DB || !env.TURNSTILE_SECRET_KEY || !env.TURNSTILE_HOSTNAMES) {
      return responder(503, { ok: false, error: 'Servicio no disponible' }, cors);
    }
    try {
      const cuerpo = await leerJsonLimitado(request);
      if (ruta === '/api/postulaciones') {
        const validado = postulacion.safeParse(cuerpo);
        if (!validado.success) return responder(400, { ok: false, error: 'Datos de postulación inválidos' }, cors);
        const p = validado.data;
        if (!await verificar(p.turnstileToken, 'postulacion', request, env)) {
          return responder(403, { ok: false, error: 'Verificación de seguridad fallida' }, cors);
        }
        const id = await guardar('postulaciones', {
          nombre_estudiante: p.studentName, edad_estudiante: p.studentAge, grado: p.grade,
          nombre_apoderado: p.parentName, telefono_apoderado: p.parentPhone,
          correo_apoderado: p.parentEmail,
          medio_contacto: { phone: 'telefono', whatsapp: 'whatsapp', email: 'correo' }[p.preferredContact],
          idioma: p.language, origen: 'web',
        }, env);
        await notificar(env, 'postulacion_creada', id);
      } else {
        const validado = contacto.safeParse(cuerpo);
        if (!validado.success) return responder(400, { ok: false, error: 'Datos de contacto inválidos' }, cors);
        const c = validado.data;
        if (!await verificar(c.turnstileToken, 'contacto', request, env)) {
          return responder(403, { ok: false, error: 'Verificación de seguridad fallida' }, cors);
        }
        const id = await guardar('contactos_web', {
          nombre: c.name, correo: c.email, telefono: c.phone || null,
          asunto: c.subject, mensaje: c.message, idioma: c.language, origen: 'web',
        }, env);
        await notificar(env, 'contacto_creado', id);
      }
      return responder(201, { ok: true }, cors);
    } catch (error) {
      if (error instanceof Error && error.message === 'payload_grande') {
        return responder(413, { ok: false, error: 'Solicitud demasiado grande' }, cors);
      }
      if (error instanceof Error && error.message === 'json_invalido') {
        return responder(400, { ok: false, error: 'JSON inválido' }, cors);
      }
      console.error('Error interno al guardar formulario', error instanceof Error ? error.name : 'desconocido');
      return responder(500, { ok: false, error: 'No se pudo guardar la solicitud' }, cors);
    }
  };
}

export default { fetch: crearManejador() } satisfies ExportedHandler<Env>;
