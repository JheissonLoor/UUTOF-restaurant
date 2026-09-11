import { useCallback, useMemo, useState, type ReactNode } from 'react';

import { login as loginRequest, register as registerRequest, upgradeGuest as upgradeGuestRequest } from '@/api/auth';
import { AuthContext, type AuthContextValue } from '@/auth/auth-context';
import { clearSession, getSession, saveSession } from '@/auth/session';
import type { LoginRequest, RegisterRequest, TokenResponse } from '@/types';


export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [session, setSession] = useState<TokenResponse | null>(() => {
    const stored = getSession();
    return stored?.usuario.rol === 'cliente' ? stored : null;
  });

  const acceptSession = useCallback((nextSession: TokenResponse) => {
    saveSession(nextSession);
    setSession(nextSession);
  }, []);

  const login = useCallback(async (payload: LoginRequest): Promise<TokenResponse> => {
    const nextSession = await loginRequest(payload);
    acceptSession(nextSession);
    return nextSession;
  }, [acceptSession]);

  const register = useCallback(async (payload: RegisterRequest): Promise<TokenResponse> => {
    await registerRequest(payload);
    return login({ email: payload.email, password: payload.password });
  }, [login]);

  const upgradeGuest = useCallback(async (payload: RegisterRequest): Promise<TokenResponse> => {
    const nextSession = await upgradeGuestRequest(payload);
    acceptSession(nextSession);
    return nextSession;
  }, [acceptSession]);

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    user: session?.usuario ?? null,
    isReady: true,
    error: null,
    isAuthenticated: session !== null,
    isGuest: Boolean(session?.usuario.es_invitado),
    login,
    register,
    upgradeGuest,
    acceptSession,
    logout,
  }), [acceptSession, login, logout, register, session, upgradeGuest]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
