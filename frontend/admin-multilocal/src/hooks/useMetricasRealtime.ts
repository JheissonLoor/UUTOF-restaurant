import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getAccessToken } from '../auth/session';

interface RealtimeEvent {
  tipo?: string;
}

function parseEvent(data: string): RealtimeEvent | null {
  try {
    const parsed: unknown = JSON.parse(data);
    return typeof parsed === 'object' && parsed !== null ? (parsed as RealtimeEvent) : null;
  } catch {
    return null;
  }
}

export function useMetricasRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimer: number | null = null;
    let stopped = false;

    function connect() {
      const token = getAccessToken();
      if (!token || stopped) {
        return;
      }

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      socket = new WebSocket(`${protocol}//${window.location.host}/ws?token=${encodeURIComponent(token)}`);
      socket.onmessage = (message) => {
        const event = parseEvent(String(message.data));
        if (event?.tipo === 'metricas.tick' || event?.tipo?.startsWith('pedido.') || event?.tipo?.startsWith('pago.')) {
          void queryClient.invalidateQueries({ queryKey: ['metricas', 'consolidado'] });
        }
      };
      socket.onclose = () => {
        if (!stopped) {
          reconnectTimer = window.setTimeout(connect, 3000);
        }
      };
      socket.onerror = () => socket?.close();
    }

    connect();
    return () => {
      stopped = true;
      if (reconnectTimer !== null) {
        window.clearTimeout(reconnectTimer);
      }
      if (socket?.readyState === WebSocket.OPEN) {
        socket.close();
      } else if (socket?.readyState === WebSocket.CONNECTING) {
        const connectingSocket = socket;
        connectingSocket.onmessage = null;
        connectingSocket.onclose = null;
        connectingSocket.onerror = null;
        connectingSocket.onopen = () => connectingSocket.close();
      }
    };
  }, [queryClient]);
}
