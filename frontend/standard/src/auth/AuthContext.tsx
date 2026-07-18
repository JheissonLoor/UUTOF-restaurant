import { useCallback, useMemo, useState, type ReactNode } from 'react';

import { login as loginRequest, register as registerRequest } from '@/api/auth';
import { clearSession, getSession, saveSession } from '@/auth/session';
import { AuthContext, type AuthContextType, type AuthResult } from '@/auth/auth-context';
import type { UsuarioSesion } from '@/types';

function extractError(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { status?: number; data?: { detail?: string } } }).response;
    if (response?.data?.detail) return response.data.detail;
    if (response?.status === 401) return 'Credenciales incorrectas';
    if (response?.status === 409) return 'El email ya está registrado';
  }
  return fallback;
}

function getInitialUser(): UsuarioSesion | null {
  return getSession()?.usuario ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UsuarioSesion | null>(getInitialUser);

  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    try {
      const session = await loginRequest({ email, password });
      saveSession(session);
      setUser(session.usuario);
      return { success: true, usuario: session.usuario };
    } catch (error) {
      return { success: false, error: extractError(error, 'No se pudo iniciar sesión') };
    }
  }, []);

  const register = useCallback(
    async (data: { nombre: string; email: string; telefono: string; password: string }): Promise<AuthResult> => {
      try {
        await registerRequest(data);
        const session = await loginRequest({ email: data.email, password: data.password });
        saveSession(session);
        setUser(session.usuario);
        return { success: true, usuario: session.usuario };
      } catch (error) {
        return { success: false, error: extractError(error, 'No se pudo crear la cuenta') };
      }
    },
    [],
  );

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({ user, isAuthenticated: user !== null, login, register, logout }),
    [user, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
