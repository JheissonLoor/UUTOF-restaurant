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
  const session = getSession();
  if (session?.usuario.rol === 'cliente' || session?.usuario.rol === 'admin') {
    return session.usuario;
  }
  if (session) clearSession();
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UsuarioSesion | null>(getInitialUser);

  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    try {
      const session = await loginRequest({ email, password });
      if (session.usuario.rol !== 'cliente' && session.usuario.rol !== 'admin') {
        clearSession();
        return {
          success: false,
          error: session.usuario.rol === 'mesero'
            ? 'Usa la App del Mesero en el puerto 5174.'
            : 'Usa el Panel de Cocina en el puerto 5175.',
        };
      }
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
