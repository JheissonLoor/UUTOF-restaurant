import { useEffect, useState } from 'react';

import { WS_BASE_URL } from '@/api/client';
import { getAccessToken } from '@/auth/session';
import type { WSEvent } from '@/types';

function isWsEvent(value: unknown): value is WSEvent {
  return typeof value === 'object' && value !== null && typeof (value as { tipo?: unknown }).tipo === 'string';
}

// Conexión WebSocket con reconexión y ping de keep-alive.
// Reemplaza el polling para el seguimiento del pedido en tiempo real.
export function useWebSocket(enabled: boolean) {
  const [lastEvent, setLastEvent] = useState<WSEvent | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    if (!enabled || !token) return;

    let ws: WebSocket | null = null;
    let ping: number | undefined;
    let reconnect: number | undefined;
    let closed = false;

    const connect = () => {
      ws = new WebSocket(`${WS_BASE_URL}?token=${encodeURIComponent(token)}`);

      ws.onopen = () => setConnected(true);
      ws.onmessage = (event) => {
        try {
          const parsed: unknown = JSON.parse(event.data);
          if (isWsEvent(parsed)) setLastEvent(parsed);
        } catch {
          // Ignoramos mensajes malformados del socket.
        }
      };
      ws.onclose = () => {
        setConnected(false);
        if (!closed) reconnect = window.setTimeout(connect, 3000);
      };

      ping = window.setInterval(() => {
        if (ws?.readyState === WebSocket.OPEN) ws.send('ping');
      }, 25000);
    };

    connect();

    return () => {
      closed = true;
      window.clearInterval(ping);
      window.clearTimeout(reconnect);
      ws?.close();
    };
  }, [enabled]);

  return { lastEvent, connected };
}
