import { createRemoteJWKSet, jwtVerify } from 'jose';
import { z } from 'zod';

type Config = { DB: D1Database; ASSETS: Fetcher; TEAM_DOMAIN: string; POLICY_AUD: string };
type Usuario = { email: string; nombre: string; rol: 'admin' | 'usuario'; activo: number };
export type VerificarAccess = (request: Request, env: Config) => Promise<string | null>;

const estadosPostulacion = z.enum([
  'nuevo', 'contactado', 'entrevista', 'evaluacion', 'documentos_pendientes',
  'aprobado', 'matriculado', 'descartado',
]);
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

export function crearManejador(verificar: VerificarAccess = verificarJwt) {
  return async (request: Request, env: Config): Promise<Response> => {
    const { pathname } = new URL(request.url);
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
      if (pathname === '/api/resumen' && request.method === 'GET') {
        const [nuevas, pendientes, matriculadas, contactos] = await env.DB.batch([
          env.DB.prepare("SELECT count(*) AS total FROM postulaciones WHERE estado = 'nuevo'"),
          env.DB.prepare("SELECT count(*) AS total FROM postulaciones WHERE estado IN ('contactado','entrevista','evaluacion','documentos_pendientes','aprobado')"),
          env.DB.prepare("SELECT count(*) AS total FROM postulaciones WHERE estado = 'matriculado'"),
          env.DB.prepare("SELECT count(*) AS total FROM contactos_web WHERE estado = 'nuevo'"),
        ]);
        return responder(200, { ok: true, resumen: {
          nuevas: Number((nuevas.results[0] as { total: number })?.total ?? 0),
          pendientes: Number((pendientes.results[0] as { total: number })?.total ?? 0),
          matriculadas: Number((matriculadas.results[0] as { total: number })?.total ?? 0),
          contactos: Number((contactos.results[0] as { total: number })?.total ?? 0),
        } });
      }
      if (pathname === '/api/postulaciones' && request.method === 'GET') {
        const { results } = await env.DB.prepare(
          'SELECT * FROM postulaciones ORDER BY fecha_creacion DESC, id DESC LIMIT 500',
        ).all();
        return responder(200, { ok: true, postulaciones: results });
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
        return responder(200, { ok: true });
      }
      return responder(404, { ok: false, error: 'Ruta no encontrada' });
    } catch (error) {
      if (error instanceof Error && ['tipo', 'grande', 'json'].includes(error.message)) {
        return responder(error.message === 'grande' ? 413 : 400, { ok: false, error: 'Solicitud inválida' });
      }
      console.error('Error interno CRM', error instanceof Error ? error.name : 'desconocido');
      return responder(500, { ok: false, error: 'No se pudo completar la operación' });
    }
  };
}

export default { fetch: crearManejador() } satisfies ExportedHandler<Env>;
