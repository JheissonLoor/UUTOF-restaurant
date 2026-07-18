import { useEffect, useRef } from 'react';

import { getAccessToken } from '@/auth/session';
import type { WSEvent } from '@/types/api';

interface UseWebSocketOptions {
  onEvent: (event: WSEvent) => void;
}

function isWSEvent(value: unknown): value is WSEvent {
  if (typeof value !== 'object' || value === null || !('tipo' in value) || typeof value.tipo !== 'string') {
    return false;
  }
  return [
    'pedido.listo',
    'pedido.item_listo',
    'pedido.pagado_app',
    'pago.efectivo_pendiente',
    'pago.verificado',
    'mesa.checkin',
  ].includes(value.tipo);
}

export function useWebSocket({ onEvent }: UseWebSocketOptions): void {
  const callbackRef = useRef(onEvent);
  callbackRef.current = onEvent;

  useEffect(() => {
    const enabled = import.meta.env.VITE_WS_ENABLED !== 'false';
    if (!enabled || !getAccessToken()) return undefined;

    const wsBase = import.meta.env.VITE_WS_URL ?? 'ws://127.0.0.1:8000/ws';
    let socket: WebSocket | null = null;
    let retryTimer: number | undefined;
    let disposed = false;

    function connect(): void {
      const accessToken = getAccessToken();
      if (!accessToken || disposed) return;
      socket = new WebSocket(`${wsBase}?token=${encodeURIComponent(accessToken)}`);
      socket.addEventListener('message', (message) => {
        try {
          const payload: unknown = JSON.parse(String(message.data));
          if (isWSEvent(payload)) callbackRef.current(payload);
        } catch {
          // Eventos invalidos se ignoran sin interrumpir la sesion.
        }
      });
      socket.addEventListener('close', () => {
        if (!disposed) retryTimer = window.setTimeout(connect, 3000);
      });
    }

    connect();
    return () => {
      disposed = true;
      if (retryTimer) window.clearTimeout(retryTimer);
      socket?.close();
    };
  }, []);
}
