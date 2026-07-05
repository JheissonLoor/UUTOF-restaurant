import { useEffect, useMemo, useState, type ReactNode } from 'react';

import { ensureClienteSession } from '@/api/auth';
import { AuthContext, type AuthContextValue } from '@/auth/auth-context';
import { getSession } from '@/auth/session';
import type { TokenResponse } from '@/types';

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const stored = getSession();
  const [session, setSession] = useState<TokenResponse | null>(stored?.usuario.rol === 'cliente' ? stored : null);
  const [isReady, setIsReady] = useState(Boolean(stored?.usuario.rol === 'cliente'));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session) return;
    let cancelled = false;
    ensureClienteSession()
      .then((nextSession) => {
        if (!cancelled) setSession(nextSession);
      })
      .catch((authError: unknown) => {
        if (!cancelled) setError(authError instanceof Error ? authError.message : 'No se pudo autenticar al cliente.');
      })
      .finally(() => {
        if (!cancelled) setIsReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [session]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.usuario ?? null,
      isReady,
      error,
    }),
    [error, isReady, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
