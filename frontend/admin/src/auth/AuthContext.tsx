import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { login as loginRequest, logout as logoutRequest, refresh as refreshRequest } from '@/api/auth';
import { getRefreshToken, getStoredUser } from '@/auth/session';
import type { UsuarioAuth } from '@/types/api';

interface AuthContextValue {
  user: UsuarioAuth | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<UsuarioAuth>;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [user, setUser] = useState<UsuarioAuth | null>(() => getStoredUser());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      setIsLoading(false);
      return () => {
        isActive = false;
      };
    }

    refreshRequest(refreshToken)
      .then((session) => {
        if (isActive) {
          setUser(session.usuario);
        }
      })
      .catch(() => {
        logoutRequest();
        if (isActive) {
          setUser(null);
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const handleLogin = useCallback(async (email: string, password: string): Promise<UsuarioAuth> => {
    const session = await loginRequest(email, password);
    setUser(session.usuario);
    return session.usuario;
  }, []);

  const handleLogout = useCallback(() => {
    logoutRequest();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      login: handleLogin,
      logout: handleLogout,
    }),
    [handleLogin, handleLogout, isLoading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
