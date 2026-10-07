import { createRemoteJWKSet, jwtVerify } from 'jose';
import { z } from 'zod';
import { ESTADOS_POSTULACION, GRADOS } from './constantes.ts';
import type { EventoCRM, TipoEvento } from './constantes.ts';
import { fechaValida, inicioUtcLima, limiteExclusivoUtcLima } from './fechas.ts';
import { metricas, resumen } from './consultas.ts';

type Config = { DB: D1Database; ASSETS: Fetcher; TEAM_DOMAIN: string; POLICY_AUD: string;
  REALTIME_HUB?: DurableObjectNamespace<import('./realtime').CrmRealtimeHub> };
type Usuario = { email: string; nombre: string; rol: 'admin' | 'usuario'; activo: number };
export type VerificarAccess = (request: Request, env: Config) => Promise<string | null>;

const estadosPostulacion = z.enum(ESTADOS_POSTULACION);
const estadosContacto = z.enum(['nuevo', 'atendido', 'cerrado']);
const cambioPostulacion = z.strictObject({ estadoAnterior: estadosPostulacion, estado: estadosPostulacion });
const cambioContacto = z.strictObject({ estadoAnterior: estadosContacto, estado: estadosContacto });
const nuevaNota = z.strictObject({ contenido: z.string().trim().min(1).max(3000) });

const verificarJwt: VerificarAccess = async (request, env) => {
  const token = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!token || !env.TEAM_DOMAIN || !env.POLICY_AUD) return null;
  try {
    const dominio = new URL(env.TEAM_DOMAIN);
    if (dominio.protocol !== 'https:') return null;
    const jwks = createRemoteJWKSet(new URL('/cdn-cgi/access/certs', dominio));
    const { payload } = await jwtVerify(token, jwks, {
      issuer: dominio.origin, audience: env.POLICY_AUD,
    });
    return typeof payload.email === 'string' && payload.email.includes('@')
      ? payload.email.trim().toLowerCase() : null;
  } catch { return null; }
};

function responder(status: number, datos: object) {
  return new Response(JSON.stringify(datos), {
    status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
async function jsonLimitado(request: Request): Promise<unknown> {
  if (request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    throw new Error('tipo');
  }
  if (Number(request.headers.get('Content-Length') || 0) > 8192) throw new Error('grande');
  const cuerpo = await request.text();
  if (new TextEncoder().encode(cuerpo).byteLength > 8192) throw new Error('grande');
  try { return JSON.parse(cuerpo); } catch { throw new Error('json'); }
}
function idValido(valor: string) {
  const id = Number(valor);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}
async function emitir(env: Config, tipo: TipoEvento, id: number) {
  if (!env.REALTIME_HUB) return;
  const evento: EventoCRM = { tipo, id, fecha: new Date().toISOString() };
  try {
    const objeto = env.REALTIME_HUB.get(env.REALTIME_HUB.idFromName('boston-school'));
    await objeto.emitirEvento(evento);
  } catch { console.error('No se pudo notificar cambio CRM'); }
}

function filtrosPostulaciones(url: URL) {
  const buscar = (url.searchParams.get('buscar') ?? '').trim();
  const estado = url.searchParams.get('estado') ?? '';
  const grado = url.searchParams.get('grado') ?? '';
  const desde = url.searchParams.get('desde') ?? '';
  const hasta = url.searchParams.get('hasta') ?? '';
  if (buscar.length > 120 || (estado && !ESTADOS_POSTULACION.includes(estado as typeof ESTADOS_POSTULACION[number])) ||
      (grado && !GRADOS.includes(grado as typeof GRADOS[number])) ||
      (desde && !fechaValida(desde)) || (hasta && !fechaValida(hasta)) ||
      (desde && hasta && desde > hasta)) throw new Error('filtros');
  const condiciones: string[] = [];
  const parametros: string[] = [];
  if (buscar) {
    const patron = `%${buscar.replace(/[\\%_]/g, '\\$&')}%`;
    condiciones.push(`(nombre_estudiante LIKE ? ESCAPE '\\' OR nombre_apoderado LIKE ? ESCAPE '\\'
      OR telefono_apoderado LIKE ? ESCAPE '\\' OR correo_apoderado LIKE ? ESCAPE '\\')`);
    parametros.push(patron, patron, patron, patron);
  }
  if (estado) { condiciones.push('estado = ?'); parametros.push(estado); }
  if (grado) { condiciones.push('grado = ?'); parametros.push(grado); }
  if (desde) { condiciones.push('fecha_creacion >= ?'); parametros.push(inicioUtcLima(desde)); }
  if (hasta) { condiciones.push('fecha_creacion < ?'); parametros.push(limiteExclusivoUtcLima(hasta)); }
  return { where: condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '', parametros };
}

export function crearManejador(verificar: VerificarAccess = verificarJwt) {
  return async (request: Request, env: Config): Promise<Response> => {
    const url = new URL(request.url);
    const { pathname } = url;
    if (!pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    if (!env.DB) return responder(503, { ok: false, error: 'Servicio no disponible' });
    const email = await verificar(request, env);
    if (!email) return responder(401, { ok: false, error: 'Sesión no válida' });
    try {
      const usuario = await env.DB.prepare(
        'SELECT email, nombre, rol, activo FROM usuarios_crm WHERE email = ?',
      ).bind(email).first<Usuario>();
      if (!usuario || usuario.activo !== 1 || !['admin', 'usuario'].includes(usuario.rol)) {
        return responder(403, { ok: false, error: 'Acceso no autorizado' });
      }
      if (pathname === '/api/yo' && request.method === 'GET') {
        return responder(200, { ok: true, usuario: {
          email: usuario.email, nombre: usuario.nombre, rol: usuario.rol,
        } });
      }
      if (pathname === '/api/realtime' && request.method === 'GET') {
        if (request.headers.get('Upgrade')?.toLowerCase() !== 'websocket') {
          return responder(426, { ok: false, error: 'Se requiere WebSocket' });
        }
        if (!env.REALTIME_HUB) return responder(503, { ok: false, error: 'Tiempo real no disponible' });
        return env.REALTIME_HUB.get(env.REALTIME_HUB.idFromName('boston-school')).fetch(request);
      }
      if (pathname === '/api/resumen' && request.method === 'GET') {
        return responder(200, { ok: true, resumen: await resumen(env.DB) });
      }
      if (pathname === '/api/metricas' && request.method === 'GET') {
        return responder(200, { ok: true, metricas: await metricas(env.DB) });
      }
      if (pathname === '/api/postulaciones' && request.method === 'GET') {
        const { where, parametros } = filtrosPostulaciones(url);
        const { results } = await env.DB.prepare(
          `SELECT * FROM postulaciones ${where} ORDER BY fecha_creacion DESC, id DESC LIMIT 500`,
        ).bind(...parametros).all();
        const conteo = await env.DB.prepare(`SELECT count(*) AS total FROM postulaciones ${where}`)
          .bind(...parametros).first<{ total: number }>();
        return responder(200, { ok: true, postulaciones: results, total: conteo?.total ?? 0 });
      }
      if (pathname === '/api/contactos' && request.method === 'GET') {
        const { results } = await env.DB.prepare(
          'SELECT * FROM contactos_web ORDER BY fecha_creacion DESC, id DESC LIMIT 500',
        ).all();
        return responder(200, { ok: true, contactos: results });
      }
      const detalle = /^\/api\/postulaciones\/(\d+)$/.exec(pathname);
      if (detalle && request.method === 'GET') {
        const id = idValido(detalle[1]);
        if (!id) return responder(400, { ok: false, error: 'ID inválido' });
        const postulacion = await env.DB.prepare('SELECT * FROM postulaciones WHERE id = ?').bind(id).first();
        if (!postulacion) return responder(404, { ok: false, error: 'Postulación no encontrada' });
        const [notas, historial] = await env.DB.batch([
          env.DB.prepare('SELECT id, contenido, usuario_email, fecha_creacion FROM notas_postulacion WHERE postulacion_id = ? ORDER BY fecha_creacion DESC, id DESC').bind(id),
          env.DB.prepare('SELECT id, estado_anterior, estado_nuevo, usuario_email, fecha_creacion FROM historial_postulacion WHERE postulacion_id = ? ORDER BY fecha_creacion DESC, id DESC').bind(id),
        ]);
        return responder(200, { ok: true, postulacion, notas: notas.results, historial: historial.results });
      }
      const estadoP = /^\/api\/postulaciones\/(\d+)\/estado$/.exec(pathname);
      if (estadoP && request.method === 'PATCH') {
        const id = idValido(estadoP[1]);
        if (!id) return responder(400, { ok: false, error: 'ID inválido' });
        const validado = cambioPostulacion.safeParse(await jsonLimitado(request));
        if (!validado.success || validado.data.estado === validado.data.estadoAnterior) {
          return responder(400, { ok: false, error: 'Estado inválido' });
        }
        const { estadoAnterior, estado } = validado.data;
        const [actualizacion] = await env.DB.batch([
          env.DB.prepare('UPDATE postulaciones SET estado = ?, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = ? AND estado = ?')
            .bind(estado, id, estadoAnterior),
          env.DB.prepare('INSERT INTO historial_postulacion (postulacion_id, estado_anterior, estado_nuevo, usuario_email) SELECT ?, ?, ?, ? WHERE changes() = 1')
            .bind(id, estadoAnterior, estado, usuario.email),
        ]);
        if (actualizacion.meta.changes !== 1) return responder(409, { ok: false, error: 'El estado cambió; recarga la postulación' });
        await emitir(env, 'postulacion_actualizada', id);
        return responder(200, { ok: true });
      }
      const notasP = /^\/api\/postulaciones\/(\d+)\/notas$/.exec(pathname);
      if (notasP && request.method === 'POST') {
        const id = idValido(notasP[1]);
        if (!id) return responder(400, { ok: false, error: 'ID inválido' });
        const validado = nuevaNota.safeParse(await jsonLimitado(request));
        if (!validado.success) return responder(400, { ok: false, error: 'Nota inválida' });
        const existe = await env.DB.prepare('SELECT id FROM postulaciones WHERE id = ?').bind(id).first();
        if (!existe) return responder(404, { ok: false, error: 'Postulación no encontrada' });
        await env.DB.prepare('INSERT INTO notas_postulacion (postulacion_id, usuario_email, contenido) VALUES (?, ?, ?)')
          .bind(id, usuario.email, validado.data.contenido).run();
        await emitir(env, 'nota_creada', id);
        return responder(201, { ok: true });
      }
      const estadoC = /^\/api\/contactos\/(\d+)\/estado$/.exec(pathname);
      if (estadoC && request.method === 'PATCH') {
        const id = idValido(estadoC[1]);
        if (!id) return responder(400, { ok: false, error: 'ID inválido' });
        const validado = cambioContacto.safeParse(await jsonLimitado(request));
        if (!validado.success || validado.data.estado === validado.data.estadoAnterior) {
          return responder(400, { ok: false, error: 'Estado inválido' });
        }
        const resultado = await env.DB.prepare(
          'UPDATE contactos_web SET estado = ?, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = ? AND estado = ?',
        ).bind(validado.data.estado, id, validado.data.estadoAnterior).run();
        if (resultado.meta.changes !== 1) return responder(409, { ok: false, error: 'El estado cambió; recarga los contactos' });
        await emitir(env, 'contacto_actualizado', id);
        return responder(200, { ok: true });
      }
      return responder(404, { ok: false, error: 'Ruta no encontrada' });
    } catch (error) {
      if (error instanceof Error && ['tipo', 'grande', 'json', 'filtros'].includes(error.message)) {
        return responder(error.message === 'grande' ? 413 : 400, { ok: false, error: 'Solicitud inválida' });
      }
      console.error('Error interno CRM', error instanceof Error ? error.name : 'desconocido');
      return responder(500, { ok: false, error: 'No se pudo completar la operación' });
    }
  };
}

export default { fetch: crearManejador() } satisfies ExportedHandler<Env>;
