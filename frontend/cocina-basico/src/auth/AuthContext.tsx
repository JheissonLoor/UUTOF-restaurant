import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react';

import { loginCocina } from '@/api/auth';
import { clearSession, getSession, saveSession } from '@/auth/session';
import type { LoginRequest, TokenResponse, UsuarioSesion } from '@/types';

interface AuthContextValue {
  user: UsuarioSesion | null;
  isAuthenticated: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function canUseCocina(session: TokenResponse | null): session is TokenResponse {
  return session?.usuario.rol === 'cocina' || session?.usuario.rol === 'admin';
}

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const storedSession = getSession();
  const [session, setSession] = useState<TokenResponse | null>(canUseCocina(storedSession) ? storedSession : null);

  const login = useCallback(async (payload: LoginRequest) => {
    const nextSession = await loginCocina(payload);
    if (!canUseCocina(nextSession)) {
      throw new Error('Esta cuenta no tiene acceso al panel de cocina.');
    }
    saveSession(nextSession);
    setSession(nextSession);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.usuario ?? null,
      isAuthenticated: session !== null,
      login,
      logout,
    }),
    [login, logout, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
