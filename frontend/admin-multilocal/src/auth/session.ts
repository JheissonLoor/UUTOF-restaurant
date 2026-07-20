import type { UsuarioSesion } from '../types/api';

const ACCESS_TOKEN_KEY = 'uttof_multilocal_access_token';
const REFRESH_TOKEN_KEY = 'uttof_multilocal_refresh_token';
const USER_KEY = 'uttof_multilocal_usuario';

export interface SessionData {
  accessToken: string;
  refreshToken: string;
  usuario: UsuarioSesion;
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getStoredUser(): UsuarioSesion | null {
  const value = localStorage.getItem(USER_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as UsuarioSesion;
  } catch {
    clearSession();
    return null;
  }
}

export function saveSession(session: SessionData): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(session.usuario));
}

export function updateAccessToken(accessToken: string, refreshToken?: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function clearSession(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
