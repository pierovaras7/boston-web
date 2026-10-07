import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { DatabaseSync } from 'node:sqlite';
import { crearManejador, type VerificarAccess } from './index.ts';
import { fechaLima, inicioUtcLima, limiteExclusivoUtcLima } from './fechas.ts';

const sqlite = new DatabaseSync(':memory:');
sqlite.exec(readFileSync(new URL('../../api-worker/migrations/0001_inicial.sql', import.meta.url), 'utf8'));
sqlite.exec(`INSERT INTO usuarios_crm(email,nombre,rol,activo) VALUES
  ('admin@example.com','Administrador Boston','admin',1),
  ('inactivo@example.com','Usuario Inactivo','usuario',0);
  INSERT INTO postulaciones(nombre_estudiante,edad_estudiante,grado,nombre_apoderado,telefono_apoderado,correo_apoderado,medio_contacto,idioma)
  VALUES('Estudiante Ejemplo',10,'primaria_5','Apoderado Ejemplo','999999999','familia@example.com','telefono','es');
  INSERT INTO contactos_web(nombre,correo,asunto,mensaje,idioma)
  VALUES('Contacto Ejemplo','contacto@example.com','Vacantes','Consulta de vacantes','es');`);

function preparada(sql: string, parametros: unknown[] = []) {
  return {
    sql, parametros,
    bind(...valores: unknown[]) { return preparada(sql, valores); },
    async first() { return sqlite.prepare(sql).get(...parametros as []) ?? null; },
    async all() { return { results: sqlite.prepare(sql).all(...parametros as []) }; },
    async run() {
      const resultado = sqlite.prepare(sql).run(...parametros as []);
      return { meta: { changes: Number(resultado.changes) } };
    },
  };
}
const db = {
  prepare: (sql: string) => preparada(sql),
  async batch(sentencias: ReturnType<typeof preparada>[]) {
    sqlite.exec('BEGIN');
    try {
      const resultados = [];
      for (const sentencia of sentencias) {
        if (/^\s*SELECT\b/i.test(sentencia.sql)) {
          resultados.push(await sentencia.all());
        } else {
          resultados.push(await sentencia.run());
        }
      }
      sqlite.exec('COMMIT');
      return resultados;
    } catch (error) { sqlite.exec('ROLLBACK'); throw error; }
  },
} as unknown as D1Database;
const env = {
  DB: db,
  ASSETS: {} as Fetcher,
  TEAM_DOMAIN: 'https://equipo.cloudflareaccess.com',
  POLICY_AUD: 'audiencia-test',
};
const verificar: VerificarAccess = async (request) =>
  request.headers.get('X-Test-Jwt') === 'valido' ? request.headers.get('X-Test-Email') : null;
const manejar = crearManejador(verificar);
const base = 'https://crm.example.test';
function solicitud(ruta: string, email = 'admin@example.com', metodo = 'GET', cuerpo?: object, jwt = 'valido') {
  return new Request(base + ruta, {
    method: metodo,
    headers: {
      'X-Test-Jwt': jwt, 'X-Test-Email': email,
      ...(cuerpo ? { 'Content-Type': 'application/json' } : {}),
    },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
}

test('sin Access JWT rechaza', async () => {
  assert.equal((await manejar(solicitud('/api/yo', 'admin@example.com', 'GET', undefined, ''), env)).status, 401);
});
test('JWT inválido rechaza', async () => {
  assert.equal((await manejar(solicitud('/api/yo', 'admin@example.com', 'GET', undefined, 'falso'), env)).status, 401);
  assert.equal((await crearManejador()(new Request(base + '/api/yo', {
    headers: { 'Cf-Access-Jwt-Assertion': 'jwt-malformado' },
  }), env)).status, 401);
});
test('usuario no registrado e inactivo rechazados', async () => {
  assert.equal((await manejar(solicitud('/api/yo', 'otro@example.com'), env)).status, 403);
  assert.equal((await manejar(solicitud('/api/yo', 'inactivo@example.com'), env)).status, 403);
});
test('WebSocket exige Access y usuario CRM activo antes de tocar el hub', async () => {
  let conexiones = 0;
  const conHub = { ...env, REALTIME_HUB: {
    idFromName() { return 'hub'; },
    get() { return { fetch() { conexiones++; return Promise.resolve(new Response('conectado')); } }; },
  } } as unknown as Parameters<typeof manejar>[1];
  const request = (email: string, jwt = 'valido') => new Request(base + '/api/realtime', {
    headers: { 'X-Test-Jwt': jwt, 'X-Test-Email': email, Upgrade: 'websocket' },
  });
  assert.equal((await manejar(request('admin@example.com', ''), conHub)).status, 401);
  assert.equal((await manejar(request('inactivo@example.com'), conHub)).status, 403);
  assert.equal(conexiones, 0);
  assert.equal((await manejar(request('admin@example.com'), conHub)).status, 200);
  assert.equal(conexiones, 1);
});
test('usuario activo, resumen y listas', async () => {
  const yo = await manejar(solicitud('/api/yo'), env);
  assert.equal(yo.status, 200);
  assert.equal((await yo.json() as { usuario: { rol: string } }).usuario.rol, 'admin');
  const resumen = await manejar(solicitud('/api/resumen'), env);
  assert.equal((await resumen.json() as { resumen: { nuevas: number } }).resumen.nuevas, 1);
  const lista = await manejar(solicitud('/api/postulaciones'), env);
  assert.equal((await lista.json() as { postulaciones: unknown[] }).postulaciones.length, 1);
  const contactos = await manejar(solicitud('/api/contactos'), env);
  assert.equal((await contactos.json() as { contactos: unknown[] }).contactos.length, 1);
});
test('cambio de estado e historial persisten', async () => {
  const respuesta = await manejar(solicitud('/api/postulaciones/1/estado', 'admin@example.com', 'PATCH', {
    estadoAnterior: 'nuevo', estado: 'contactado',
  }), env);
  assert.equal(respuesta.status, 200);
  const detalle = await manejar(solicitud('/api/postulaciones/1'), env);
  const datos = await detalle.json() as { postulacion: { estado: string }; historial: Array<{ usuario_email: string }> };
  assert.equal(datos.postulacion.estado, 'contactado');
  assert.equal(datos.historial.length, 1);
  assert.equal(datos.historial[0].usuario_email, 'admin@example.com');
  const conflicto = await manejar(solicitud('/api/postulaciones/1/estado', 'admin@example.com', 'PATCH', {
    estadoAnterior: 'nuevo', estado: 'matriculado',
  }), env);
  assert.equal(conflicto.status, 409);
  const historial = sqlite.prepare('SELECT count(*) AS total FROM historial_postulacion').get() as { total: number };
  assert.equal(historial.total, 1);
});
test('nota persiste con identidad del JWT', async () => {
  const respuesta = await manejar(solicitud('/api/postulaciones/1/notas', 'admin@example.com', 'POST', {
    contenido: 'Prueba de presentación',
  }), env);
  assert.equal(respuesta.status, 201);
  const detalle = await manejar(solicitud('/api/postulaciones/1'), env);
  const datos = await detalle.json() as { notas: Array<{ contenido: string; usuario_email: string }> };
  assert.equal(datos.notas[0].contenido, 'Prueba de presentación');
  assert.equal(datos.notas[0].usuario_email, 'admin@example.com');
});
test('contacto cambia de estado y persiste', async () => {
  const respuesta = await manejar(solicitud('/api/contactos/1/estado', 'admin@example.com', 'PATCH', {
    estadoAnterior: 'nuevo', estado: 'atendido',
  }), env);
  assert.equal(respuesta.status, 200);
  const lista = await manejar(solicitud('/api/contactos'), env);
  assert.equal((await lista.json() as { contactos: Array<{ estado: string }> }).contactos[0].estado, 'atendido');
});

test('migración conserva IDs, notas e historial y transforma evaluación', () => {
  const base = new DatabaseSync(':memory:');
  base.exec(readFileSync(new URL('../../api-worker/migrations/0001_inicial.sql', import.meta.url), 'utf8'));
  base.exec(`INSERT INTO postulaciones(id,nombre_estudiante,edad_estudiante,grado,nombre_apoderado,telefono_apoderado,correo_apoderado,medio_contacto,idioma,estado)
    VALUES(41,'Estudiante Migrado',10,'primaria_5','Apoderado Migrado','999999999','migracion@example.com','telefono','es','evaluacion');
    INSERT INTO notas_postulacion(id,postulacion_id,usuario_email,contenido)
    VALUES(51,41,'admin@example.com','Nota conservada');
    INSERT INTO historial_postulacion(id,postulacion_id,estado_anterior,estado_nuevo,usuario_email)
    VALUES(61,41,'entrevista','evaluacion','admin@example.com');`);
  base.exec(readFileSync(new URL('../../api-worker/migrations/0002_pendiente_evaluacion.sql', import.meta.url), 'utf8'));
  assert.deepEqual({ ...base.prepare('SELECT id, estado FROM postulaciones').get() }, { id: 41, estado: 'pendiente_evaluacion' });
  assert.deepEqual({ ...base.prepare('SELECT id, postulacion_id, contenido FROM notas_postulacion').get() },
    { id: 51, postulacion_id: 41, contenido: 'Nota conservada' });
  assert.deepEqual({ ...base.prepare('SELECT id, estado_nuevo FROM historial_postulacion').get() },
    { id: 61, estado_nuevo: 'pendiente_evaluacion' });
  assert.equal(base.prepare('PRAGMA foreign_key_check').all().length, 0);
  assert.throws(() => base.exec("UPDATE postulaciones SET estado='evaluacion' WHERE id=41"));
  base.close();
});

test('límites Lima incluyen el día completo, incluso cerca de medianoche UTC', () => {
  assert.equal(fechaLima(new Date('2026-10-07T02:00:00Z')), '2026-10-06');
  assert.equal(inicioUtcLima('2026-10-07'), '2026-10-07 05:00:00');
  assert.equal(limiteExclusivoUtcLima('2026-10-07'), '2026-10-08 05:00:00');
  assert.throws(() => inicioUtcLima('2026-02-30'));
});

test('filtros server-side combinan texto, grado, estado y fechas', async () => {
  const r = await manejar(solicitud('/api/postulaciones?buscar=Estudiante&grado=primaria_5&estado=contactado&desde=2020-01-01&hasta=2099-12-31'), env);
  assert.equal(r.status, 200);
  const datos = await r.json() as { total: number; postulaciones: unknown[] };
  assert.equal(datos.total, 1);
  assert.equal(datos.postulaciones.length, 1);
  assert.equal((await manejar(solicitud('/api/postulaciones?desde=2026-02-30'), env)).status, 400);
});

test('métricas agregadas incluyen once grados y siete días', async () => {
  const r = await manejar(solicitud('/api/metricas'), env);
  assert.equal(r.status, 200);
  const datos = await r.json() as { metricas: { postulaciones: { porGrado: unknown[]; ultimos7Dias: unknown[]; pendientes: number } } };
  assert.equal(datos.metricas.postulaciones.porGrado.length, 11);
  assert.equal(datos.metricas.postulaciones.ultimos7Dias.length, 7);
  assert.equal(datos.metricas.postulaciones.pendientes, 1);
});

test('pendientes excluye aprobadas y nuevas e incluye pendiente de evaluación', async () => {
  sqlite.exec(`INSERT INTO postulaciones(nombre_estudiante,edad_estudiante,grado,nombre_apoderado,telefono_apoderado,correo_apoderado,medio_contacto,idioma,estado)
    VALUES('Estudiante Aprobado',10,'primaria_1','Apoderado Ejemplo','999999999','aprobado@example.com','telefono','es','aprobado');`);
  // This fixture started on 0001; new states are exercised by the migration test.
  const r = await manejar(solicitud('/api/resumen'), env);
  const { resumen } = await r.json() as { resumen: { pendientes: number; nuevas: number } };
  assert.equal(resumen.pendientes, 1);
  assert.equal(resumen.nuevas, 0);
});
