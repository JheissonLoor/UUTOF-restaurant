import { useCallback, useState } from 'react';

import type { MesaSession } from '@/types';

const KEY = 'uttof_cliente_mesa';

function readMesa(): MesaSession | null {
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed === 'object' && parsed !== null && typeof (parsed as MesaSession).id_mesa === 'number') {
      return parsed as MesaSession;
    }
  } catch {
    window.localStorage.removeItem(KEY);
  }
  return null;
}

export function useMesaSession() {
  const [mesa, setMesa] = useState<MesaSession | null>(() => readMesa());

  const saveMesa = useCallback((nextMesa: MesaSession) => {
    window.localStorage.setItem(KEY, JSON.stringify(nextMesa));
    setMesa(nextMesa);
  }, []);

  const clearMesa = useCallback(() => {
    window.localStorage.removeItem(KEY);
    setMesa(null);
  }, []);

  return { mesa, saveMesa, clearMesa };
}
