import assert from 'node:assert/strict';
import { test } from 'node:test';
import { crearManejador, type Guardar } from './index.ts';

const env = {
  SUPABASE_URL: 'https://ejemplo.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'solo-pruebas',
  ORIGENES_PERMITIDOS: 'http://localhost:4321',
};
const filas: Array<{ tabla: string; fila: Record<string, string | number | null> }> = [];
const guardar: Guardar = async (tabla, fila) => { filas.push({ tabla, fila }); };
const manejar = crearManejador(guardar);
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
};
const datosContacto = {
  name: 'Luis Pérez', email: 'luis@example.com', phone: '',
  subject: 'Vacantes', message: 'Quisiera información', language: 'es',
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
});

for (const [nombre, cambios] of [
  ['requerido', { studentName: '' }],
  ['email', { parentEmail: 'invalido' }],
  ['edad', { studentAge: '30' }],
  ['medio', { preferredContact: 'telegram' }],
  ['grado', { grade: '7' }],
] as const) {
  test(`postulación rechaza ${nombre}`, async () => {
    filas.length = 0;
    const r = await manejar(post('/api/postulaciones', { ...datosPostulacion, ...cambios }), env);
    assert.equal(r.status, 400);
    assert.equal(filas.length, 0);
  });
}

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
  assert.equal(r.headers.get('Access-Control-Allow-Origin'), null);
});

test('sin configuración no guarda', async () => {
  const r = await manejar(post('/api/contactos', datosContacto), { ...env, SUPABASE_URL: '' });
  assert.equal(r.status, 503);
});
