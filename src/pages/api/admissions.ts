import type { APIRoute } from 'astro';
import mysql from 'mysql2/promise';

// Permite que este endpoint funcione en modo estático
export const prerender = false;

// Configuración de conexión MySQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'boston_bilingual',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

export const POST: APIRoute = async ({ request }) => {
  try {
    // Leer el body del request
    const text = await request.text();

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'El cuerpo del request está vacío' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = JSON.parse(text);

    // Validar datos obligatorios
    if (!data.studentName || !data.parentEmail || !data.parentPhone) {
      return new Response(
        JSON.stringify({ error: 'Faltan datos obligatorios' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Crear conexión a MySQL
    const connection = await mysql.createConnection(dbConfig);

    // Insertar datos en la BD
    const query = `
      INSERT INTO admissions_applications (
        student_name,
        student_age,
        grade,
        parent_name,
        parent_phone,
        parent_email,
        preferred_contact,
        language
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      data.studentName,
      data.studentAge || null,
      data.grade || null,
      data.parentName,
      data.parentPhone,
      data.parentEmail,
      data.preferredContact || 'phone',
      data.language || 'es',
    ];

    await connection.execute(query, values);
    await connection.end();

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Postulación guardada correctamente',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error en API de admisiones:', error);

    return new Response(
      JSON.stringify({
        error: 'Error al procesar la postulación',
        details: error instanceof Error ? error.message : 'Error desconocido',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
