const formatoLima = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit',
});

export function fechaLima(instante: Date = new Date()): string {
  return formatoLima.format(instante);
}

export function fechaValida(valor: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const fecha = new Date(`${valor}T00:00:00.000Z`);
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === valor;
}

export function sumarDias(valor: string, dias: number): string {
  const fecha = new Date(`${valor}T00:00:00.000Z`);
  fecha.setUTCDate(fecha.getUTCDate() + dias);
  return fecha.toISOString().slice(0, 10);
}

// D1 CURRENT_TIMESTAMP is UTC. Lima is UTC−5 throughout the year.
export function inicioUtcLima(valor: string): string {
  if (!fechaValida(valor)) throw new Error('fecha_invalida');
  return `${valor} 05:00:00`;
}

export function limiteExclusivoUtcLima(valor: string): string {
  return inicioUtcLima(sumarDias(valor, 1));
}
