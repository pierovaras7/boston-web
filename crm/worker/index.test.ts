import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { DatabaseSync } from 'node:sqlite';
import { crearManejador, type VerificarAccess } from './index.ts';

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
