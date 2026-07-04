import type { TokenResponse, UserRole, UsuarioAuth } from '@/types/api';

const ACCESS_TOKEN_KEY = 'uttof.access_token';
const REFRESH_TOKEN_KEY = 'uttof.refresh_token';
const USER_KEY = 'uttof.usuario';

const roles: UserRole[] = ['cliente', 'mesero', 'cocina', 'admin'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && roles.includes(value as UserRole);
}

function isUsuarioAuth(value: unknown): value is UsuarioAuth {
  if (!isRecord(value)) return false;

  return (
    typeof value.id_usuario === 'number' &&
    typeof value.nombre === 'string' &&
    typeof value.email === 'string' &&
    isUserRole(value.rol)
  );
}

export function getAccessToken(): string | null {
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getStoredUser(): UsuarioAuth | null {
  const rawUser = window.localStorage.getItem(USER_KEY);
  if (!rawUser) return null;

  try {
    const parsed: unknown = JSON.parse(rawUser);
    return isUsuarioAuth(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveSession(session: TokenResponse): void {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, session.access_token);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, session.refresh_token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(session.usuario));
}

export function clearSession(): void {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}
