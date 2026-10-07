import { DurableObject, WorkerEntrypoint } from 'cloudflare:workers';
import type { EventoCRM } from './constantes';

export class CrmRealtimeHub extends DurableObject<Env> {
  async fetch(request: Request): Promise<Response> {
    if (request.headers.get('Upgrade')?.toLowerCase() !== 'websocket') {
      return new Response('WebSocket requerido', { status: 426 });
    }
    const par = new WebSocketPair();
    const [cliente, servidor] = Object.values(par);
    this.ctx.acceptWebSocket(servidor);
    return new Response(null, { status: 101, webSocket: cliente });
  }

  async emitirEvento(evento: EventoCRM): Promise<void> {
    const mensaje = JSON.stringify(evento);
    for (const socket of this.ctx.getWebSockets()) {
      try { socket.send(mensaje); } catch { try { socket.close(1011, 'Conexión interrumpida'); } catch { /* already closed */ } }
    }
  }

  async webSocketMessage(socket: WebSocket, mensaje: string | ArrayBuffer): Promise<void> {
    // Clients have no commands. Ignore their payload to keep the channel read-only.
    if (typeof mensaje === 'string' && mensaje === 'ping') socket.send('pong');
  }
}

export function hub(env: Env) {
  return env.REALTIME_HUB.getByName('boston-school');
}

export class CrmEventsService extends WorkerEntrypoint<Env> {
  async emitirEvento(evento: EventoCRM): Promise<void> {
    const permitidos = new Set([
      'postulacion_creada', 'postulacion_actualizada', 'nota_creada',
      'contacto_creado', 'contacto_actualizado',
    ]);
    if (!permitidos.has(evento.tipo) || !Number.isSafeInteger(evento.id) || evento.id < 1) {
      throw new Error('Evento inválido');
    }
    await hub(this.env).emitirEvento({ tipo: evento.tipo, id: evento.id, fecha: new Date().toISOString() });
  }
}
