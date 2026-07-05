import { useEffect, useState } from 'react';

import { WS_BASE_URL } from '@/api/client';
import { getAccessToken } from '@/auth/session';
import type { WSEvent } from '@/types';

function isWsEvent(value: unknown): value is WSEvent {
  return typeof value === 'object' && value !== null && typeof (value as { tipo?: unknown }).tipo === 'string';
}

export function useWebSocket(enabled: boolean) {
  const [lastEvent, setLastEvent] = useState<WSEvent | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!enabled || !token) return;

    const ws = new WebSocket(`${WS_BASE_URL}?token=${encodeURIComponent(token)}`);
    ws.onmessage = (event) => {
      try {
        const parsed: unknown = JSON.parse(event.data);
        if (isWsEvent(parsed)) setLastEvent(parsed);
      } catch {
        // Ignore malformed socket messages from development tools.
      }
    };
    const ping = window.setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) ws.send('ping');
    }, 25000);

    return () => {
      window.clearInterval(ping);
      ws.close();
    };
  }, [enabled]);

  return { lastEvent };
}
