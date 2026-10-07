import { ESTADOS_PENDIENTES, GRADOS, SQL_PENDIENTES } from './constantes.ts';
import { fechaLima, inicioUtcLima, limiteExclusivoUtcLima, sumarDias } from './fechas.ts';

const total = (r: D1Result) => Number((r.results[0] as { total?: number } | undefined)?.total ?? 0);

export async function resumen(db: D1Database) {
  const [nuevas, pendientes, matriculadas, contactos] = await db.batch([
    db.prepare("SELECT count(*) AS total FROM postulaciones WHERE estado = 'nuevo'"),
    db.prepare(`SELECT count(*) AS total FROM postulaciones WHERE ${SQL_PENDIENTES}`),
    db.prepare("SELECT count(*) AS total FROM postulaciones WHERE estado = 'matriculado'"),
    db.prepare("SELECT count(*) AS total FROM contactos_web WHERE estado = 'nuevo'"),
  ]);
  return { nuevas: total(nuevas), pendientes: total(pendientes),
    matriculadas: total(matriculadas), contactos: total(contactos) };
}

export async function metricas(db: D1Database, ahora = new Date()) {
  const hoy = fechaLima(ahora);
  const ayer = sumarDias(hoy, -1);
  const inicio7 = sumarDias(hoy, -6);
  const [diariosP, porNivel, porGrado, porEstado, diariosC, contactosNuevos] = await db.batch([
    db.prepare(`SELECT date(fecha_creacion, '-5 hours') AS fecha, count(*) AS cantidad
      FROM postulaciones WHERE fecha_creacion >= ? AND fecha_creacion < ? GROUP BY fecha`)
      .bind(inicioUtcLima(inicio7), limiteExclusivoUtcLima(hoy)),
    db.prepare(`SELECT substr(grado, 1, instr(grado, '_') - 1) AS nivel, count(*) AS cantidad
      FROM postulaciones GROUP BY nivel`),
    db.prepare('SELECT grado, count(*) AS cantidad FROM postulaciones GROUP BY grado'),
    db.prepare('SELECT estado, count(*) AS cantidad FROM postulaciones GROUP BY estado'),
    db.prepare(`SELECT date(fecha_creacion, '-5 hours') AS fecha, count(*) AS cantidad
      FROM contactos_web WHERE fecha_creacion >= ? AND fecha_creacion < ? GROUP BY fecha`)
      .bind(inicioUtcLima(inicio7), limiteExclusivoUtcLima(hoy)),
    db.prepare("SELECT count(*) AS total FROM contactos_web WHERE estado = 'nuevo'"),
  ]);
  const mapaP = new Map((diariosP.results as Array<{ fecha: string; cantidad: number }>).map((r) => [r.fecha, Number(r.cantidad)]));
  const mapaC = new Map((diariosC.results as Array<{ fecha: string; cantidad: number }>).map((r) => [r.fecha, Number(r.cantidad)]));
  const dias = Array.from({ length: 7 }, (_, i) => sumarDias(inicio7, i));
  const hoyTotal = mapaP.get(hoy) ?? 0;
  const ayerTotal = mapaP.get(ayer) ?? 0;
  const estados = new Map((porEstado.results as Array<{ estado: string; cantidad: number }>).map((r) => [r.estado, Number(r.cantidad)]));
  const niveles = new Map((porNivel.results as Array<{ nivel: string; cantidad: number }>).map((r) => [r.nivel, Number(r.cantidad)]));
  const grados = new Map((porGrado.results as Array<{ grado: string; cantidad: number }>).map((r) => [r.grado, Number(r.cantidad)]));
  return {
    postulaciones: {
      hoy: hoyTotal, ayer: ayerTotal, diferencia: hoyTotal - ayerTotal,
      variacionPorcentual: ayerTotal ? Math.round(((hoyTotal - ayerTotal) / ayerTotal) * 100) : null,
      pendientes: ESTADOS_PENDIENTES.reduce((suma, estado) => suma + (estados.get(estado) ?? 0), 0),
      matriculadas: estados.get('matriculado') ?? 0,
      ultimos7Dias: dias.map((fecha) => ({ fecha, cantidad: mapaP.get(fecha) ?? 0 })),
      porNivel: { primaria: niveles.get('primaria') ?? 0, secundaria: niveles.get('secundaria') ?? 0 },
      porGrado: GRADOS.map((grado) => ({ grado, cantidad: grados.get(grado) ?? 0 })),
    },
    contactos: {
      nuevos: total(contactosNuevos),
      ultimos7Dias: dias.map((fecha) => ({ fecha, cantidad: mapaC.get(fecha) ?? 0 })),
    },
  };
}
