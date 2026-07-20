import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { loginRequest } from '../api/auth';
import type { LoginRequest, UsuarioSesion } from '../types/api';
import {
  clearSession,
  getAccessToken,
  getStoredUser,
  saveSession,
} from './session';

interface AuthContextValue {
  usuario: UsuarioSesion | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(() => getStoredUser());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!getAccessToken() || !getStoredUser()) {
      clearSession();
      setUsuario(null);
    }
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUsuario(null);
  }, []);

  useEffect(() => {
    window.addEventListener('uttof:session-expired', logout);
    return () => window.removeEventListener('uttof:session-expired', logout);
  }, [logout]);

  const login = useCallback(async (payload: LoginRequest) => {
    const response = await loginRequest(payload);
    saveSession({
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      usuario: response.usuario,
    });
    setUsuario(response.usuario);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      usuario,
      isAuthenticated: Boolean(usuario && getAccessToken()),
      isLoading,
      login,
      logout,
    }),
    [isLoading, login, logout, usuario],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
