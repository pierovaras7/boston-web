import assert from 'node:assert/strict';
import { test } from 'node:test';
import { crearManejador, type Guardar, type Verificar } from './index.ts';

const env = {
  DB: {} as D1Database,
  TURNSTILE_SECRET_KEY: 'solo-pruebas',
  TURNSTILE_HOSTNAMES: 'localhost',
  ORIGENES_PERMITIDOS: 'http://localhost:4321',
};
const filas: Array<{ tabla: string; fila: Record<string, string | number | null> }> = [];
const guardar: Guardar = async (tabla, fila) => { filas.push({ tabla, fila }); };
const verificar: Verificar = async (token, accion) => token === 'token-valido' &&
  (accion === 'postulacion' || accion === 'contacto');
const manejar = crearManejador(guardar, verificar);
const base = 'https://api.ejemplo.test';
const origen = 'http://localhost:4321';
const post = (ruta: string, cuerpo: object, origin = origen) => new Request(base + ruta, {
  method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin },
  body: JSON.stringify(cuerpo),
});
const datosPostulacion = {
  studentName: 'Ana Pérez', studentAge: '10', grade: 'primaria_5',
  parentName: 'Luis Pérez', parentPhone: '+51 976 586 016',
  parentEmail: 'luis@example.com', preferredContact: 'whatsapp', language: 'es',
  turnstileToken: 'token-valido',
};
const datosContacto = {
  name: 'Luis Pérez', email: 'luis@example.com', phone: '',
  subject: 'Vacantes', message: 'Quisiera información', language: 'es',
  turnstileToken: 'token-valido',
};

test('salud', async () => {
  const r = await manejar(new Request(base + '/api/salud'), env);
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { ok: true, servicio: 'boston-api' });
});
test('postulación válida mapea a columnas españolas', async () => {
  filas.length = 0;
  const r = await manejar(post('/api/postulaciones', datosPostulacion), env);
  assert.equal(r.status, 201);
  assert.equal(filas[0].tabla, 'postulaciones');
  assert.equal(filas[0].fila.grado, 'primaria_5');
  assert.equal(filas[0].fila.medio_contacto, 'whatsapp');
  assert.equal('turnstileToken' in filas[0].fila, false);
});
for (const [nombre, cambios] of [
  ['requerido', { studentName: '' }],
  ['email', { parentEmail: 'invalido' }],
  ['edad', { studentAge: '30' }],
  ['medio', { preferredContact: 'telegram' }],
  ['grado', { grade: '7' }],
  ['Turnstile ausente', { turnstileToken: '' }],
] as const) {
  test(`postulación rechaza ${nombre}`, async () => {
    filas.length = 0;
    const r = await manejar(post('/api/postulaciones', { ...datosPostulacion, ...cambios }), env);
    assert.equal(r.status, 400);
    assert.equal(filas.length, 0);
  });
}
test('Turnstile inválido impide guardar', async () => {
  filas.length = 0;
  const r = await manejar(post('/api/postulaciones', { ...datosPostulacion, turnstileToken: 'falso' }), env);
  assert.equal(r.status, 403);
  assert.equal(filas.length, 0);
});
test('contacto válido', async () => {
  filas.length = 0;
  const r = await manejar(post('/api/contactos', datosContacto), env);
  assert.equal(r.status, 201);
  assert.equal(filas[0].tabla, 'contactos_web');
  assert.equal(filas[0].fila.telefono, null);
});
test('contacto inválido', async () => {
  filas.length = 0;
  const r = await manejar(post('/api/contactos', { ...datosContacto, message: 'x' }), env);
  assert.equal(r.status, 400);
  assert.equal(filas.length, 0);
});
test('contacto sin Turnstile', async () => {
  const { turnstileToken: _omitido, ...sinToken } = datosContacto;
  const r = await manejar(post('/api/contactos', sinToken), env);
  assert.equal(r.status, 400);
});
test('CORS OPTIONS permitido', async () => {
  const r = await manejar(new Request(base + '/api/contactos', {
    method: 'OPTIONS', headers: { Origin: origen },
  }), env);
  assert.equal(r.status, 204);
  assert.equal(r.headers.get('Access-Control-Allow-Origin'), origen);
});
test('CORS rechaza otro origen', async () => {
  const r = await manejar(post('/api/contactos', datosContacto, 'https://otro.example'), env);
  assert.equal(r.status, 403);
});
test('sin configuración no guarda', async () => {
  const r = await manejar(post('/api/contactos', datosContacto), { ...env, TURNSTILE_SECRET_KEY: '' });
  assert.equal(r.status, 503);
});
test('rechaza cuerpo grande y tipo incorrecto', async () => {
  const grande = await manejar(post('/api/contactos', { ...datosContacto, message: 'x'.repeat(9000) }), env);
  assert.equal(grande.status, 413);
  const tipo = await manejar(new Request(base + '/api/contactos', {
    method: 'POST', headers: { Origin: origen, 'Content-Type': 'text/plain' }, body: '{}',
  }), env);
  assert.equal(tipo.status, 415);
});
test('ruta inexistente', async () => {
  const r = await manejar(new Request(base + '/api/desconocida'), env);
  assert.equal(r.status, 404);
});
test('no expone detalles internos de D1', async () => {
  const fallo = crearManejador(async () => { throw new Error('SQL privado'); }, verificar);
  const r = await fallo(post('/api/contactos', datosContacto), env);
  assert.equal(r.status, 500);
  assert.doesNotMatch(await r.text(), /SQL privado/);
});
